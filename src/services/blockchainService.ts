/**
 * UrbanTree - Blockchain Service
 * Browser mode: connects directly to Backend API (/api/blockchain/*) -> Sepolia Testnet & MySQL.
 * Node test mode: falls back to deterministic in-memory simulation for unit tests.
 */

import {
  AnchorStatus,
  BlockchainAnchor,
  CareRecord,
  Incident,
  RecordType,
  Tree,
  VerificationResult,
} from '../types';
import { computeRecordHash, sha256Hex } from './hashService';
import type { DbAuditRow } from './apiMapper';

const DEFAULT_CONTRACT_ADDRESS = '0x5E18EdFb8a30B647853dA6171B32Be9C5f98573C';
const DEFAULT_CHAIN_ID = 11155111; // Ethereum Sepolia Testnet

export interface OnChainRecord {
  recordType: RecordType;
  recordId: string;
  payloadVersion: number;
  payloadHash: string;
  canonicalJson: string;
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  anchoredAt: string;
}

function mapDbRecordType(dbType: string): RecordType {
  if (dbType === 'CARE_LOG') return 'CARE_RECORD';
  if (dbType === 'INCIDENT_REPORT') return 'INCIDENT_REPORT';
  return 'TREE_PROFILE';
}

class BlockchainService {
  private anchors: Map<string, OnChainRecord> = new Map();
  private audits: DbAuditRow[] = [];
  private currentBlockNumber: number = 0;
  private contractAddress: string = DEFAULT_CONTRACT_ADDRESS;
  private chainId: number = DEFAULT_CHAIN_ID;
  private isNodeOnline: boolean = true;
  private simulatedOffline: boolean = false;

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof fetch === 'function';
  }

  private getKey(recordType: RecordType, recordId: string): string {
    return `${recordType}::${recordId}`;
  }

  public getAudits(): DbAuditRow[] {
    return this.audits;
  }

  /**
   * Syncs live Sepolia node status, on-chain explorer records, and MySQL audits from Backend.
   */
  public async syncFromBackend(): Promise<void> {
    if (!this.isBrowser()) return;

    try {
      const [statusRes, explorerRes, auditsRes] = await Promise.all([
        fetch('/api/blockchain/status').then((r) => r.json()).catch(() => null),
        fetch('/api/blockchain/explorer').then((r) => r.json()).catch(() => null),
        fetch('/api/blockchain/audits').then((r) => r.json()).catch(() => null),
      ]);

      if (statusRes?.success && statusRes.network) {
        const net = statusRes.network;
        this.isNodeOnline = net.status === 'CONNECTED';
        this.chainId = Number(net.chainId || DEFAULT_CHAIN_ID);
        this.contractAddress = net.contractAddress || DEFAULT_CONTRACT_ADDRESS;
        if (net.blockNumber) {
          this.currentBlockNumber = Number(net.blockNumber);
        }
      } else {
        this.isNodeOnline = false;
      }

      const auditRows: DbAuditRow[] = Array.isArray(auditsRes?.data) ? auditsRes.data : [];
      this.audits = auditRows;

      const nextAnchors = new Map<string, OnChainRecord>();

      // Merge on-chain explorer records with MySQL audit metadata (tx_hash, block_number)
      if (explorerRes?.success && Array.isArray(explorerRes.records)) {
        for (const rec of explorerRes.records) {
          const rType = mapDbRecordType(rec.recordType);
          const matchingAudit = auditRows.find(
            (a) => a.record_id === rec.recordId && a.status === 'CONFIRMED'
          );
          const item: OnChainRecord = {
            recordType: rType,
            recordId: rec.recordId,
            payloadVersion: 1,
            payloadHash: rec.dataHash || '',
            canonicalJson: '',
            txHash: matchingAudit?.tx_hash || '',
            blockNumber: matchingAudit?.block_number || 0,
            contractAddress: matchingAudit?.contract_address || this.contractAddress,
            anchoredAt: rec.dateFormatted || matchingAudit?.confirmed_at || new Date().toISOString(),
          };
          nextAnchors.set(this.getKey(rType, rec.recordId), item);
        }
      }

      // Include confirmed DB audits not yet picked up by explorer if any
      for (const a of auditRows) {
        if (a.status !== 'CONFIRMED') continue;
        const rType = mapDbRecordType(a.record_type);
        const key = this.getKey(rType, a.record_id);
        if (!nextAnchors.has(key)) {
          nextAnchors.set(key, {
            recordType: rType,
            recordId: a.record_id,
            payloadVersion: 1,
            payloadHash: a.data_hash,
            canonicalJson: '',
            txHash: a.tx_hash || '',
            blockNumber: a.block_number || 0,
            contractAddress: a.contract_address || this.contractAddress,
            anchoredAt: a.confirmed_at || a.created_at || new Date().toISOString(),
          });
        }
      }

      this.anchors = nextAnchors;
    } catch {
      this.isNodeOnline = false;
    }
  }

  public setNodeOnline(online: boolean) {
    this.simulatedOffline = !online;
    this.isNodeOnline = online;
  }

  public getNodeStatus(): { isOnline: boolean; chainId: number; contractAddress: string; blockNumber: number } {
    return {
      isOnline: this.simulatedOffline ? false : this.isNodeOnline,
      chainId: this.chainId,
      contractAddress: this.contractAddress,
      blockNumber: this.currentBlockNumber,
    };
  }

  private generateTxHash(recordType: string, recordId: string, blockNum: number): string {
    const raw = `${recordType}:${recordId}:${blockNum}:${Date.now()}`;
    return '0x' + sha256Hex(raw);
  }

  /**
   * Anchors a record hash to the Smart Contract.
   */
  public async anchorRecord(params: {
    recordType: RecordType;
    recordId: string;
    payloadVersion?: number;
    hash: string;
    canonicalJson?: string;
  }): Promise<{
    status: AnchorStatus;
    txHash?: string;
    blockNumber?: number;
    contractAddress?: string;
    error?: string;
  }> {
    if (this.simulatedOffline || !this.isNodeOnline) {
      return {
        status: 'UNAVAILABLE',
        error: 'Ethereum Sepolia Testnet RPC is currently unreachable',
      };
    }

    if (this.isBrowser()) {
      const dbType =
        params.recordType === 'CARE_RECORD'
          ? 'CARE_LOG'
          : params.recordType === 'INCIDENT_REPORT' || params.recordType === 'INCIDENT_RESOLUTION'
          ? 'INCIDENT_REPORT'
          : 'TREE_PROFILE';

      const res = await fetch('/api/blockchain/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: params.recordId,
          recordType: dbType,
          dataHash: params.hash,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { status: 'FAILED', error: data.message || 'Anchor failed' };
      }
      await this.syncFromBackend();
      return {
        status: 'CONFIRMED',
        txHash: data.txHash,
        blockNumber: data.blockNumber,
        contractAddress: this.contractAddress,
      };
    }

    // Node unit test fallback
    const { recordType, recordId, payloadVersion = 1, hash, canonicalJson = '' } = params;
    const key = this.getKey(recordType, recordId);
    this.currentBlockNumber += 1;
    const blockNumber = this.currentBlockNumber;
    const txHash = this.generateTxHash(recordType, recordId, blockNumber);

    this.anchors.set(key, {
      recordType,
      recordId,
      payloadVersion,
      payloadHash: hash.toLowerCase(),
      canonicalJson,
      txHash,
      blockNumber,
      contractAddress: this.contractAddress,
      anchoredAt: new Date().toISOString(),
    });

    return {
      status: 'CONFIRMED',
      txHash,
      blockNumber,
      contractAddress: this.contractAddress,
    };
  }

  /**
   * Anchors an existing MySQL record onto Sepolia using Backend canonical hash.
   */
  public async anchorExistingRecord(recordType: RecordType, recordId: string): Promise<{
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    message?: string;
  }> {
    if (!this.isBrowser()) return { success: false, message: 'Not in browser' };
    const res = await fetch('/api/blockchain/anchor-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordType, recordId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      await this.syncFromBackend();
      return { success: true, txHash: data.txHash, blockNumber: data.blockNumber };
    }
    return { success: false, message: data.message || 'Lỗi neo bản ghi lên Sepolia' };
  }

  /**
   * Verifies an on-chain record against current MySQL database state (or in-memory in Node tests).
   */
  public async verifyRecord(
    recordType: RecordType,
    recordData: Partial<Tree> | Partial<CareRecord> | Partial<Incident>
  ): Promise<VerificationResult> {
    const publicOrId =
      ('publicCode' in recordData && recordData.publicCode) || String(recordData.id || '');

    if (this.simulatedOffline) {
      return {
        status: 'UNAVAILABLE',
        recordType,
        recordId: publicOrId,
        currentHash: '',
      };
    }

    if (this.isBrowser()) {
      try {
        const res = await fetch('/api/blockchain/verify-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordType,
            recordId: publicOrId,
          }),
        });
        const data = await res.json();
        return {
          status: data.status || 'UNAVAILABLE',
          recordType,
          recordId: data.recordId || publicOrId,
          currentHash: data.currentHash || '',
          onChainHash: data.onChainHash || undefined,
          txHash: data.txHash || undefined,
          blockNumber: data.blockNumber || undefined,
          contractAddress: data.contractAddress || this.contractAddress,
          anchoredAt: data.anchoredAt || undefined,
          diffFields:
            data.status === 'MISMATCH'
              ? [
                  {
                    field: 'MySQL Record vs Sepolia On-chain Hash',
                    currentValue: data.currentHash,
                    anchoredValue: data.onChainHash,
                  },
                ]
              : undefined,
        };
      } catch {
        return {
          status: 'UNAVAILABLE',
          recordType,
          recordId: publicOrId,
          currentHash: '',
        };
      }
    }

    // Node unit test fallback
    const recordId = String(recordData.id || '');
    const { canonicalJson, hash } = computeRecordHash(recordType, recordData);
    if (!this.isNodeOnline) {
      return {
        status: 'UNAVAILABLE',
        recordType,
        recordId,
        currentHash: hash,
        canonicalJson,
      };
    }

    const key = this.getKey(recordType, recordId);
    const anchored = this.anchors.get(key);
    if (!anchored) {
      return {
        status: 'NOT_ANCHORED',
        recordType,
        recordId,
        currentHash: hash,
        canonicalJson,
      };
    }

    const isMatch = anchored.payloadHash.toLowerCase() === hash.toLowerCase();
    let diffFields: VerificationResult['diffFields'] = undefined;
    if (!isMatch && anchored.canonicalJson) {
      try {
        const anchoredPayload = JSON.parse(anchored.canonicalJson);
        const currentPayload = JSON.parse(canonicalJson);
        diffFields = [];
        const allKeys = Array.from(new Set([...Object.keys(anchoredPayload), ...Object.keys(currentPayload)]));
        for (const k of allKeys) {
          if (JSON.stringify(anchoredPayload[k]) !== JSON.stringify(currentPayload[k])) {
            diffFields.push({
              field: k,
              currentValue: currentPayload[k],
              anchoredValue: anchoredPayload[k],
            });
          }
        }
      } catch {
        // Fallback
      }
    }

    return {
      status: isMatch ? 'VALID' : 'MISMATCH',
      recordType,
      recordId,
      currentHash: hash,
      onChainHash: anchored.payloadHash,
      txHash: anchored.txHash,
      blockNumber: anchored.blockNumber,
      contractAddress: anchored.contractAddress,
      anchoredAt: anchored.anchoredAt,
      canonicalJson,
      diffFields,
    };
  }

  public getAnchor(recordType: RecordType, recordId: string): BlockchainAnchor | null {
    const key = this.getKey(recordType, recordId);
    const rec = this.anchors.get(key);
    if (!rec) return null;

    return {
      id: `anchor-${rec.recordType}-${rec.recordId}`,
      recordType: rec.recordType,
      recordId: rec.recordId,
      payloadVersion: rec.payloadVersion,
      payloadHash: rec.payloadHash,
      txHash: rec.txHash,
      blockNumber: rec.blockNumber,
      contractAddress: rec.contractAddress,
      status: 'CONFIRMED',
      retryCount: 0,
      createdAt: rec.anchoredAt,
      confirmedAt: rec.anchoredAt,
    };
  }

  public getAllAnchors(): OnChainRecord[] {
    return Array.from(this.anchors.values()).sort(
      (a, b) => new Date(b.anchoredAt).getTime() - new Date(a.anchoredAt).getTime()
    );
  }

  public clearLedger() {
    this.anchors.clear();
  }
}

export const blockchainService = new BlockchainService();
