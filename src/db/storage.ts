/**
 * UrbanTree - Storage Engine & API Client
 * Connects React Frontend directly to Backend Express + MySQL (Aiven) + Sepolia Smart Contract.
 */

import {
  CareRecord,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentUpdate,
  Tree,
  TreeHealthStatus,
  TreeType,
  User,
} from '../types';
import { blockchainService } from '../services/blockchainService';
import {
  careActionToDb,
  DbAuditRow,
  healthToDb,
  incidentStatusToDb,
  mapCareFromDb,
  mapIncidentFromDb,
  mapIncidentUpdateFromDb,
  mapTreeFromDb,
  mapTreeTypeFromDb,
  mapUserFromDb,
  severityToDb,
} from '../services/apiMapper';

const ACTIVE_USER_KEY = 'urbantree_active_user';

const FALLBACK_USER: User = {
  id: '1',
  username: 'admin',
  fullName: 'Đặng Thế Thuận (Admin)',
  role: 'ADMIN',
  isActive: true,
};

type Listener = () => void;

class StorageService {
  private users: User[] = [FALLBACK_USER];
  private treeTypes: TreeType[] = [];
  private trees: Tree[] = [];
  private careRecords: CareRecord[] = [];
  private incidents: Incident[] = [];
  private incidentUpdates: IncidentUpdate[] = [];
  private activeUser: User = FALLBACK_USER;
  private listeners: Set<Listener> = new Set();
  private syncedOnce: boolean = false;
  private loading: boolean = false;
  private syncError: string | null = null;
  private tamperBackups: Map<string, { displayName: string; healthStatus: TreeHealthStatus }> = new Map();

  constructor() {
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(ACTIVE_USER_KEY);
        if (stored) {
          this.activeUser = JSON.parse(stored);
        }
      } catch {
        this.activeUser = FALLBACK_USER;
      }
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public isSynced(): boolean {
    return this.syncedOnce;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public getSyncError(): string | null {
    return this.syncError;
  }

  /**
   * Fetches all live data from MySQL + Sepolia via Backend API (/api/*).
   */
  public async syncAll(): Promise<void> {
    if (!this.isBrowser()) return;
    this.loading = true;
    this.syncError = null;
    this.notify();

    try {
      await blockchainService.syncFromBackend();
      const audits: DbAuditRow[] = blockchainService.getAudits();

      const [usersRes, typesRes, treesRes, careRes, incRes, updRes] = await Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/tree-types').then((r) => r.json()),
        fetch('/api/trees?limit=100').then((r) => r.json()),
        fetch('/api/care-records?limit=100').then((r) => r.json()),
        fetch('/api/incidents?limit=100').then((r) => r.json()),
        fetch('/api/incident-updates').then((r) => r.json()),
      ]);

      if (Array.isArray(usersRes?.data)) {
        this.users = usersRes.data.map(mapUserFromDb);
        // Ensure activeUser ID matches MySQL user ID if not CITIZEN
        if (this.activeUser.role !== 'CITIZEN') {
          const matched =
            this.users.find((u) => u.username === this.activeUser.username) ||
            this.users.find((u) => u.role === this.activeUser.role) ||
            this.users[0];
          if (matched) {
            this.activeUser = matched;
            localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(matched));
          }
        }
      }

      if (Array.isArray(typesRes?.data)) {
        this.treeTypes = typesRes.data.map(mapTreeTypeFromDb);
      }

      if (Array.isArray(treesRes?.data)) {
        this.trees = treesRes.data.map((row: any) => mapTreeFromDb(row, audits));
      }

      if (Array.isArray(careRes?.data)) {
        this.careRecords = careRes.data.map((row: any) => mapCareFromDb(row, audits));
      }

      if (Array.isArray(incRes?.data)) {
        this.incidents = incRes.data.map((row: any) => {
          const mapped = mapIncidentFromDb(row, audits);
          if (mapped.assignedToUserId) {
            const staff = this.users.find((u) => u.id === mapped.assignedToUserId);
            if (staff) mapped.assignedToName = staff.fullName;
          }
          return mapped;
        });
      }

      if (Array.isArray(updRes?.data)) {
        this.incidentUpdates = updRes.data.map(mapIncidentUpdateFromDb);
      }

      this.syncedOnce = true;
    } catch (err: any) {
      this.syncError = err?.message || 'Không thể kết nối Backend API (http://localhost:5001)';
    } finally {
      this.loading = false;
      this.notify();
    }
  }

  public async resetToDefaults(): Promise<void> {
    // Restore any locally tampered trees first, then re-sync from MySQL + Sepolia
    for (const [treeId, orig] of this.tamperBackups.entries()) {
      await fetch(`/api/trees/${treeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species: orig.displayName,
          health_status: healthToDb(orig.healthStatus),
        }),
      }).catch(() => null);
    }
    this.tamperBackups.clear();
    await this.syncAll();
  }

  // Active User / Persona
  public getActiveUser(): User {
    return this.activeUser;
  }

  public setActiveUser(user: User) {
    this.activeUser = user;
    if (this.isBrowser()) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    }
    this.notify();
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  // Tree Types
  public getTreeTypes(): TreeType[] {
    return [...this.treeTypes];
  }

  public getTreeTypeById(id: string): TreeType | undefined {
    return this.treeTypes.find((t) => t.id === id);
  }

  // Trees
  public getTrees(): Tree[] {
    return [...this.trees];
  }

  public getTreeById(id: string): Tree | undefined {
    return this.trees.find((t) => t.id === id);
  }

  public getTreeByPublicCode(code: string): Tree | undefined {
    const clean = code.trim().toUpperCase();
    return this.trees.find((t) => t.publicCode.toUpperCase() === clean);
  }

  public async createTree(data: Omit<Tree, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tree> {
    const res = await fetch('/api/trees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tree_code: data.publicCode,
        tree_type_id: Number(data.treeTypeId) || 1,
        species: data.displayName,
        location_name: data.address,
        address: data.address,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        planted_date: data.plantedAt,
        height_meter: data.heightM ?? null,
        diameter_cm: data.diameterCm ?? null,
        health_status: healthToDb(data.healthStatus),
        image_url: data.imageUrl || null,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi tạo cây xanh trên server');
    }

    await this.syncAll();
    const created = this.getTreeByPublicCode(data.publicCode) || this.trees[0];
    return created;
  }

  public async updateTree(id: string, updates: Partial<Tree>): Promise<Tree> {
    const body: Record<string, unknown> = {};
    if (updates.displayName !== undefined) body.species = updates.displayName;
    if (updates.treeTypeId !== undefined) body.tree_type_id = Number(updates.treeTypeId) || null;
    if (updates.address !== undefined) {
      body.address = updates.address;
      body.location_name = updates.address;
    }
    if (updates.latitude !== undefined) body.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined) body.longitude = Number(updates.longitude);
    if (updates.plantedAt !== undefined) body.planted_date = updates.plantedAt;
    if (updates.heightM !== undefined) body.height_meter = updates.heightM;
    if (updates.diameterCm !== undefined) body.diameter_cm = updates.diameterCm;
    if (updates.healthStatus !== undefined) body.health_status = healthToDb(updates.healthStatus);
    if (updates.imageUrl !== undefined) body.image_url = updates.imageUrl;

    const res = await fetch(`/api/trees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi cập nhật cây xanh');
    }

    await this.syncAll();
    const updated = this.getTreeById(id);
    if (!updated) throw new Error(`Tree ${id} not found`);
    return updated;
  }

  /**
   * Tamper Simulation Tool:
   * Modifies the tree's species & health_status in MySQL WITHOUT touching the Sepolia Smart Contract
   * so live cryptographic verification immediately detects HASH MISMATCH.
   */
  public async tamperTree(id: string, tamperedHealthStatus: TreeHealthStatus): Promise<Tree> {
    const existing = this.getTreeById(id);
    if (!existing) throw new Error('Tree not found');

    if (!this.tamperBackups.has(id)) {
      this.tamperBackups.set(id, {
        displayName: existing.displayName,
        healthStatus: existing.healthStatus,
      });
    }

    const tamperedName = existing.displayName.includes('[ĐÃ BỊ SỬA LÉN]')
      ? existing.displayName
      : `${existing.displayName} [ĐÃ BỊ SỬA LÉN]`;

    const res = await fetch(`/api/trees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        species: tamperedName,
        health_status: healthToDb(tamperedHealthStatus),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi giả lập sửa dữ liệu MySQL');
    }

    await this.syncAll();
    return this.getTreeById(id)!;
  }

  // Care Records
  public getCareRecords(treeId?: string): CareRecord[] {
    if (treeId) {
      return this.careRecords.filter((c) => c.treeId === treeId);
    }
    return [...this.careRecords];
  }

  public async createCareRecord(data: Omit<CareRecord, 'id' | 'createdAt'>): Promise<CareRecord> {
    const staffNumericId = Number.isInteger(Number(data.staffUserId)) ? Number(data.staffUserId) : null;
    const res = await fetch('/api/care-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tree_id: Number(data.treeId),
        staff_id: staffNumericId,
        caretaker_name: data.staffName || this.activeUser.fullName,
        action_type: careActionToDb(data.actionType),
        health_before: healthToDb(data.healthBefore),
        health_after: healthToDb(data.healthAfter),
        notes: data.notes,
        image_after_url: data.imageUrl || null,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi lưu nhật ký chăm sóc');
    }

    await this.syncAll();
    return this.careRecords[0];
  }

  // Incidents
  public getIncidents(): Incident[] {
    return [...this.incidents];
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.id === id);
  }

  public getIncidentByPublicCode(code: string): Incident | undefined {
    const clean = code.trim().toUpperCase();
    return this.incidents.find((i) => i.publicCode.toUpperCase() === clean);
  }

  public async createIncident(data: {
    treeId?: string | null;
    reporterName?: string;
    reporterPhone?: string;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    severity?: IncidentSeverity;
    imageUrl?: string;
  }): Promise<Incident> {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tree_id: data.treeId ? Number(data.treeId) : null,
        reporter_name: data.reporterName || 'Người dân ẩn danh',
        reporter_phone: data.reporterPhone || '0900000000',
        description: data.description,
        address: data.address || '',
        latitude: data.latitude,
        longitude: data.longitude,
        severity: severityToDb(data.severity),
        image_url: data.imageUrl || '',
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi gửi phản ánh sự cố');
    }

    await this.syncAll();
    const created = this.getIncidentById(String(json.incident_id)) || this.incidents[0];
    return created;
  }

  public async updateIncidentStatus(params: {
    incidentId: string;
    newStatus: IncidentStatus;
    actorUserId: string;
    actorName: string;
    note: string;
    assignedToUserId?: string | null;
  }): Promise<Incident> {
    const actorNumericId = Number.isInteger(Number(params.actorUserId)) ? Number(params.actorUserId) : null;
    const assignedNumericId =
      params.assignedToUserId && Number.isInteger(Number(params.assignedToUserId))
        ? Number(params.assignedToUserId)
        : null;

    const res = await fetch(`/api/incidents/${params.incidentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: incidentStatusToDb(params.newStatus),
        assigned_staff_id: assignedNumericId,
        actor_id: actorNumericId,
        note: params.note,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi cập nhật trạng thái sự cố');
    }

    await this.syncAll();
    const updated = this.getIncidentById(params.incidentId);
    if (!updated) throw new Error('Incident not found after update');
    return updated;
  }

  public getIncidentUpdates(incidentId: string): IncidentUpdate[] {
    return this.incidentUpdates
      .filter((u) => u.incidentId === incidentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Dashboard Aggregates
  public getDashboardStats() {
    const totalTrees = this.trees.length;
    const healthyTrees = this.trees.filter((t) => t.healthStatus === 'GOOD').length;
    const atRiskTrees = this.trees.filter((t) => ['POOR', 'CRITICAL'].includes(t.healthStatus)).length;
    const activeIncidents = this.incidents.filter((i) =>
      ['RECEIVED', 'ASSIGNED', 'IN_PROGRESS'].includes(i.status)
    ).length;
    const totalCareRecords = this.careRecords.length;
    const totalAnchors = blockchainService.getAllAnchors().length;

    const healthBreakdown = {
      GOOD: this.trees.filter((t) => t.healthStatus === 'GOOD').length,
      FAIR: this.trees.filter((t) => t.healthStatus === 'FAIR').length,
      POOR: this.trees.filter((t) => t.healthStatus === 'POOR').length,
      CRITICAL: this.trees.filter((t) => t.healthStatus === 'CRITICAL').length,
      DEAD: this.trees.filter((t) => t.healthStatus === 'DEAD').length,
    };

    const incidentBreakdown = {
      RECEIVED: this.incidents.filter((i) => i.status === 'RECEIVED').length,
      ASSIGNED: this.incidents.filter((i) => i.status === 'ASSIGNED').length,
      IN_PROGRESS: this.incidents.filter((i) => i.status === 'IN_PROGRESS').length,
      RESOLVED: this.incidents.filter((i) => i.status === 'RESOLVED').length,
      REJECTED: this.incidents.filter((i) => i.status === 'REJECTED').length,
    };

    return {
      totalTrees,
      healthyTrees,
      atRiskTrees,
      activeIncidents,
      totalCareRecords,
      totalAnchors,
      healthBreakdown,
      incidentBreakdown,
    };
  }
}

export const storage = new StorageService();
