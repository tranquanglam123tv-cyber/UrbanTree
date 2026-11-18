import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Bug,
  Database,
  Link,
  Cpu,
  Layers,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { blockchainService } from '../services/blockchainService';
import { storage } from '../db/storage';
import { RecordType, Tree, TreeHealthStatus, VerificationResult } from '../types';
import { computeRecordHash } from '../services/hashService';

export const BlockchainVerifyView: React.FC = () => {
  const [nodeOnline, setNodeOnline] = useState(true);
  const [selectedRecordType, setSelectedRecordType] = useState<RecordType>('TREE_PROFILE');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(storage.getTrees()[0]?.id || '');
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [tamperNotice, setTamperNotice] = useState<string | null>(null);

  const [isAnchoring, setIsAnchoring] = useState(false);

  const trees = storage.getTrees();
  const careRecords = storage.getCareRecords();
  const incidents = storage.getIncidents();
  const anchors = blockchainService.getAllAnchors();
  const nodeStatus = blockchainService.getNodeStatus();

  const effectiveRecordId =
    selectedRecordId ||
    (selectedRecordType === 'TREE_PROFILE'
      ? trees[0]?.id
      : selectedRecordType === 'CARE_RECORD'
      ? careRecords[0]?.id
      : incidents[0]?.id) ||
    '';

  const handleToggleNode = () => {
    const next = !nodeOnline;
    setNodeOnline(next);
    blockchainService.setNodeOnline(next);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getSelectedRecordObj = () => {
    if (selectedRecordType === 'TREE_PROFILE') {
      return storage.getTreeById(effectiveRecordId);
    }
    if (selectedRecordType === 'CARE_RECORD') {
      return storage.getCareRecords().find((c) => c.id === effectiveRecordId);
    }
    return storage.getIncidentById(effectiveRecordId);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const recordData = getSelectedRecordObj();
      if (!recordData) {
        alert('Không tìm thấy bản ghi trong cơ sở dữ liệu!');
        return;
      }

      const result = await blockchainService.verifyRecord(selectedRecordType, recordData);
      setVerifyResult(result);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAnchorNow = async () => {
    const recordData: any = getSelectedRecordObj();
    if (!recordData) return;
    const key = recordData.publicCode || String(recordData.id);
    setIsAnchoring(true);
    try {
      const res = await blockchainService.anchorExistingRecord(selectedRecordType, key);
      if (!res.success) {
        alert(res.message || 'Không thể neo bản ghi lên Sepolia');
      } else {
        await storage.syncAll();
        await handleVerify();
      }
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleTamperSelectedTree = async () => {
    const recordData: any = getSelectedRecordObj();
    if (!recordData) return;
    const key = recordData.publicCode || String(recordData.id);

    try {
      const res = await fetch('/api/blockchain/tamper-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: key, action: 'tamper' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await storage.syncAll();
        setTamperNotice(data.message);
        await handleVerify();
        return;
      }
    } catch {
      // Fallback for TREE_PROFILE without snapshot
    }

    if (selectedRecordType === 'TREE_PROFILE') {
      const tree = storage.getTreeById(effectiveRecordId);
      if (!tree) return;
      const newStatus: TreeHealthStatus = tree.healthStatus === 'GOOD' ? 'CRITICAL' : 'GOOD';
      await storage.tamperTree(tree.id, newStatus);
      setTamperNotice(
        `Đã cố tình sửa trộm dữ liệu của [${tree.publicCode}] trực tiếp trong MySQL mà không ghi giao dịch Blockchain! Hãy bấm "Kiểm tra tính toàn vẹn" để quan sát hệ thống phát hiện HASH MISMATCH với Sepolia.`
      );
      await handleVerify();
    } else {
      setTamperNotice('Hãy neo bản ghi này lên Sepolia trước khi chạy giả lập sửa lén.');
    }
  };

  const handleRestoreDefaults = async () => {
    const recordData: any = getSelectedRecordObj();
    const key = recordData?.publicCode || String(recordData?.id || '');
    if (key) {
      await fetch('/api/blockchain/tamper-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: key, action: 'restore' }),
      }).catch(() => null);
    }
    await storage.resetToDefaults();
    setTamperNotice('Đã khôi phục dữ liệu gốc trong MySQL và đồng bộ lại từ Sepolia.');
    await handleVerify();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / EVM Node Telemetry: Hiệu ứng loang màu nhẹ nhàng (ambient mesh gradient) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#103626] via-[#174B36] to-[#205a3d] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Lớp màu loang nhẹ nhàng (ambient mesh blur) */}
        <div className="pointer-events-none absolute -top-12 -left-12 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-36 rounded-full bg-teal-300/12 blur-2xl"></div>
        <div className="pointer-events-none absolute -bottom-10 right-32 w-64 h-64 rounded-full bg-emerald-300/15 blur-3xl"></div>
        <div className="pointer-events-none absolute -top-8 right-6 w-52 h-52 rounded-full bg-lime-300/15 blur-2xl"></div>

        {/* Nội dung thông tin bên trái */}
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-mono font-bold text-[#F3E8B2] uppercase tracking-wider backdrop-blur-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Smart Contract: UrbanTreeRegistry.sol</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sổ cái Hoạt động & Xác minh Tính toàn vẹn Blockchain</h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Màn hình A18/A19: Đối chiếu chuỗi băm Canonical SHA-256 hiện tại với chữ ký điện tử đã neo trên mạng EVM để chứng minh tính bất biến.
          </p>
        </div>

        {/* Node Status Card & Offline Toggle */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs space-y-2.5 shrink-0 shadow-sm min-w-[260px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-white/80 font-medium">Trạng thái Node EVM:</span>
            <span
              className={`font-mono font-bold px-2.5 py-0.5 rounded-full text-[10px] shadow-xs flex items-center gap-1.5 ${nodeOnline ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${nodeOnline ? 'bg-white animate-pulse' : 'bg-white'}`} />
              <span>{nodeOnline ? 'ONLINE (Sepolia Testnet)' : 'OFFLINE'}</span>
            </span>
          </div>

          <div className="font-mono text-[11px] text-white/90 space-y-1">
            <div>Chain ID: <strong>{nodeStatus.chainId} (Sepolia Testnet)</strong></div>
            <div className="truncate max-w-[220px]">Contract: {nodeStatus.contractAddress}</div>
            <div>Block mới nhất: <strong>#{nodeStatus.blockNumber}</strong></div>
          </div>

          <button
            onClick={handleToggleNode}
            className="w-full py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold rounded-lg text-[11px] transition-all border border-white/15 cursor-pointer"
          >
            {nodeOnline ? 'Mô phỏng ngắt kết nối Node' : 'Bật lại kết nối Node'}
          </button>
        </div>
      </div>

      {/* Main Grid: Section A19 (Verification Tool) + Tamper Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Verification Console (Section A19) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E0EBDD] shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#E0EBDD] text-[#174B36] rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#174B36]">
                  A19 — Công cụ Kiểm tra Tính toàn vẹn (Live Verifier)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Tái tạo Canonical JSON ➔ Tính SHA-256 ➔ Đọc hợp đồng ➔ Đối chiếu kết quả
                </p>
              </div>
            </div>
          </div>

          {/* Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại bản ghi:</label>
              <select
                value={selectedRecordType}
                onChange={(e) => {
                  const type = e.target.value as RecordType;
                  setSelectedRecordType(type);
                  if (type === 'TREE_PROFILE') setSelectedRecordId(trees[0]?.id || '');
                  else if (type === 'CARE_RECORD') setSelectedRecordId(careRecords[0]?.id || '');
                  else setSelectedRecordId(incidents[0]?.id || '');
                  setVerifyResult(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
              >
                <option value="TREE_PROFILE">Hồ sơ Cây xanh (TREE_PROFILE)</option>
                <option value="CARE_RECORD">Nhật ký Chăm sóc (CARE_RECORD)</option>
                <option value="INCIDENT_REPORT">Phản ánh Sự cố (INCIDENT_REPORT)</option>
                <option value="INCIDENT_RESOLUTION">Nghiệm thu Sự cố (INCIDENT_RESOLUTION)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chọn bản ghi cụ thể:</label>
              <select
                value={effectiveRecordId}
                onChange={(e) => {
                  setSelectedRecordId(e.target.value);
                  setVerifyResult(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
              >
                {selectedRecordType === 'TREE_PROFILE' &&
                  trees.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.publicCode}] {t.displayName}
                    </option>
                  ))}
                {selectedRecordType === 'CARE_RECORD' &&
                  careRecords.map((c) => {
                    const t = trees.find((x) => x.id === c.treeId);
                    return (
                      <option key={c.id} value={c.id}>
                        [{c.id}] {c.actionType} · {t?.publicCode || `Cây #${c.treeId}`} · {Number(c.serviceCost || 0).toLocaleString('vi-VN')} VNĐ
                      </option>
                    );
                  })}
                {(selectedRecordType === 'INCIDENT_REPORT' || selectedRecordType === 'INCIDENT_RESOLUTION') &&
                  incidents.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.publicCode}] {i.severity} · {i.status}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-2.5 bg-[#174B36] hover:bg-[#347A50] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Đang băm & đối soát...' : 'Kiểm tra tính toàn vẹn (Run Verification)'}</span>
          </button>

          {/* Scanning Laser Beam */}
          {isVerifying && (
            <div className="relative overflow-hidden p-6 rounded-2xl bg-slate-900 text-white text-center shadow-lg border border-emerald-500/30">
              <div className="scanner-beam-line"></div>
              <div className="flex items-center justify-center gap-2.5 font-mono text-emerald-400 text-xs font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                <span>ĐANG QUÉT MÃ BĂM SHA-256 & TRUY VẤN SMART CONTRACT ON-CHAIN...</span>
              </div>
            </div>
          )}

          {/* Verification Result Output */}
          {verifyResult && (
            <div
              className={`p-5 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${verifyResult.status === 'VALID'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : verifyResult.status === 'MISMATCH'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : verifyResult.status === 'UNAVAILABLE'
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {verifyResult.status === 'VALID' && (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>XÁC THỰC THÀNH CÔNG: VALID (HỢP LỆ)</span>
                    </>
                  )}
                  {verifyResult.status === 'MISMATCH' && (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span>PHÁT HIỆN GIAN LẬN: MISMATCH (KHÔNG KHỚP)</span>
                    </>
                  )}
                  {verifyResult.status === 'NOT_ANCHORED' && (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>CHƯA NEO LÊN SEPOLIA (NOT ANCHORED)</span>
                    </>
                  )}
                  {verifyResult.status === 'UNAVAILABLE' && (
                    <>
                      <AlertTriangle className="w-5 h-5 text-slate-600" />
                      <span>EVM NODE UNAVAILABLE (MẤT KẾT NỐI)</span>
                    </>
                  )}
                </div>

                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/10 font-bold">
                  {verifyResult.status}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed opacity-90">
                {verifyResult.status === 'VALID' &&
                  'Chuỗi băm SHA-256 từ cơ sở dữ liệu MySQL hiện thời hoàn toàn trùng khớp từng byte với bản ghi đã neo trên Smart Contract Sepolia. Không có bất kỳ sự sửa đổi nào sau khi neo.'}
                {verifyResult.status === 'MISMATCH' &&
                  'CẢNH BÁO: Dữ liệu trong cơ sở dữ liệu MySQL đã bị ai đó sửa đổi trái phép sau khi giao dịch đã được ghi nhận trên Sepolia Blockchain! Bằng chứng mã hóa bị sai lệch.'}
                {verifyResult.status === 'NOT_ANCHORED' &&
                  'Bản ghi này đang có trong MySQL nhưng chưa được ghi dấu (anchor) lên Smart Contract Sepolia. Bạn có thể bấm nút bên dưới để neo lên Sepolia ngay.'}
                {verifyResult.status === 'UNAVAILABLE' &&
                  'Không thể kết nối đến node Sepolia. Nghiệp vụ lưu trữ cơ sở dữ liệu vẫn an toàn và chuyển sang chế độ đợi đối chiếu (PENDING).'}
              </p>

              {verifyResult.status === 'NOT_ANCHORED' && (
                <button
                  onClick={handleAnchorNow}
                  disabled={isAnchoring}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>{isAnchoring ? 'Đang gửi giao dịch lên Sepolia...' : 'Neo bản ghi này lên Sepolia ngay'}</span>
                </button>
              )}

              {/* Hash comparison boxes */}
              <div className="space-y-2 pt-1">
                <div>
                  <div className="text-[10px] font-bold opacity-75 mb-0.5">Hash tính toán từ DB hiện tại (SHA-256):</div>
                  <div className="font-mono text-[10px] p-2 bg-white/80 rounded border border-black/10 flex items-center justify-between gap-2">
                    <span className="truncate">{verifyResult.currentHash}</span>
                    <button onClick={() => handleCopy(verifyResult.currentHash)} title="Sao chép">
                      {copiedHash === verifyResult.currentHash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {verifyResult.onChainHash && (
                  <div>
                    <div className="text-[10px] font-bold opacity-75 mb-0.5">Hash gốc đã neo trên Smart Contract:</div>
                    <div className="font-mono text-[10px] p-2 bg-white/80 rounded border border-black/10 flex items-center justify-between gap-2">
                      <span className="truncate">{verifyResult.onChainHash}</span>
                      <button onClick={() => handleCopy(verifyResult.onChainHash || '')} title="Sao chép">
                        {copiedHash === verifyResult.onChainHash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tóm tắt & Bảng đối chiếu chi tiết từng trường nghiệp vụ */}
              {verifyResult.currentSnapshot?.summary && (
                <div className="px-3 py-2 bg-white/90 rounded-xl border border-black/10 text-[11px] font-bold text-[#174B36]">
                  📋 {verifyResult.currentSnapshot.summary}
                </div>
              )}

              {verifyResult.comparison?.hasSnapshot && verifyResult.comparison.fields.length > 0 && (
                <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Đối chiếu từng thông tin nghiệp vụ (MySQL ↔ Sepolia)</span>
                    <span className={verifyResult.comparison.allMatched ? 'text-emerald-700' : 'text-red-600'}>
                      {verifyResult.comparison.allMatched
                        ? `Khớp ${verifyResult.comparison.fields.length}/${verifyResult.comparison.fields.length} mục`
                        : `Sai lệch ${verifyResult.comparison.changedFields.length} mục!`}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-b text-[10px] text-slate-500 uppercase">
                          <th className="py-1.5 px-2.5">Thông tin</th>
                          <th className="py-1.5 px-2.5">Gốc niêm phong</th>
                          <th className="py-1.5 px-2.5">MySQL hiện tại</th>
                          <th className="py-1.5 px-2.5 text-center">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {verifyResult.comparison.fields.map((f) => {
                          const isMismatch = f.matched === false;
                          const fmt = (v: unknown) =>
                            f.type === 'currency' ? `${Number(v || 0).toLocaleString('vi-VN')} VNĐ` : String(v ?? '');
                          return (
                            <tr key={f.key} className={isMismatch ? 'bg-red-50' : ''}>
                              <td className="py-1.5 px-2.5 font-semibold text-slate-700">{f.label}</td>
                              <td className="py-1.5 px-2.5 font-mono text-blue-800">{fmt(f.originalValue)}</td>
                              <td className={`py-1.5 px-2.5 font-mono font-bold ${isMismatch ? 'text-red-700' : 'text-emerald-800'}`}>
                                {fmt(f.currentValue)}
                              </td>
                              <td className="py-1.5 px-2.5 text-center">
                                {isMismatch ? (
                                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">SAI KHỚP</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Khớp</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detected Diffs fallback */}
              {verifyResult.diffFields && verifyResult.diffFields.length > 0 && !verifyResult.comparison?.hasSnapshot && (
                <div className="p-3 bg-red-100/80 rounded-xl border border-red-200 text-[11px] space-y-1">
                  <div className="font-bold text-red-900">Chi tiết các trường dữ liệu bị sửa đổi trái phép:</div>
                  {verifyResult.diffFields.map((d) => (
                    <div key={d.field} className="font-mono text-red-800">
                      • <strong>{d.field}</strong>: Hiện thời = <span className="bg-red-200 px-1 rounded">"{String(d.currentValue)}"</span> ➔ Gốc trên Chain = <span className="bg-emerald-200 px-1 rounded">"{String(d.anchoredValue)}"</span>
                    </div>
                  ))}
                </div>
              )}

              {verifyResult.txHash && (
                <div className="text-[10px] font-mono text-slate-600 pt-1 flex items-center justify-between gap-2 flex-wrap">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${verifyResult.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline truncate max-w-[300px]"
                  >
                    Sepolia Tx: {verifyResult.txHash}
                  </a>
                  <span>Block #{verifyResult.blockNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Tamper Simulation Lab & Payload Inspector */}
        <div className="lg:col-span-5 space-y-5 text-xs">
          {/* Tamper Demonstration Box (Roadmap item 10 defense scenario) */}
          <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <Bug className="w-5 h-5 text-amber-700" />
              <span>Phòng Thí nghiệm Giả lập Gian lận (Tamper Lab)</span>
            </div>

            <p className="text-amber-800 leading-relaxed text-[11px]">
              Kịch bản bảo vệ đồ án: Giả lập tình huống người quản trị hoặc kẻ gian thâm nhập cơ sở dữ liệu sửa trộm tình trạng sức khỏe của cây (ví dụ sửa từ Kém/Nguy cấp thành Tốt) nhằm che giấu sai sót.
            </p>

            {tamperNotice && (
              <div className="p-2.5 bg-white rounded-lg border border-amber-300 text-amber-900 font-medium text-[11px] leading-relaxed">
                {tamperNotice}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleTamperSelectedTree}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Bug className="w-4 h-4" />
                <span>1. Sửa trộm dữ liệu cây đang chọn</span>
              </button>

              <button
                onClick={handleRestoreDefaults}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                2. Khôi phục dữ liệu mẫu gốc từ Blockchain
              </button>
            </div>
          </div>

          {/* Canonical Payload Inspection Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E0EBDD] shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#174B36] text-sm">
              <FileCode className="w-4 h-4 text-[#347A50]" />
              <span>Chuẩn hóa Canonical JSON v1</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Quy tắc chuẩn hóa Section A6: sắp xếp trường cố định, Unicode NFC, ngày UTC ISO-8601, tọa độ 6 số thập phân, loại bỏ PII khỏi chuỗi băm.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-[10px] text-slate-700 overflow-x-auto border border-slate-200">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(
                  selectedRecordType === 'TREE_PROFILE'
                    ? computeRecordHash('TREE_PROFILE', trees[0] || {}).payload
                    : computeRecordHash('CARE_RECORD', careRecords[0] || {}).payload,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Section A18: Full On-Chain Blockchain Activity Log Table */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0EBDD] shadow-2xs space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#174B36] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#347A50]" />
              <span>A18 — Sổ cái Hoạt động Blockchain (On-Chain Activity Log)</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Tổng số {anchors.length} bản ghi đã neo thành công trên mạng Ethereum Sepolia Testnet.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Loại bản ghi</th>
                <th className="py-2.5 px-3">Mã ID</th>
                <th className="py-2.5 px-3">Data Hash (SHA-256)</th>
                <th className="py-2.5 px-3">Transaction Hash</th>
                <th className="py-2.5 px-3">Block</th>
                <th className="py-2.5 px-3">Thời gian neo</th>
                <th className="py-2.5 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {anchors.map((anc) => (
                <tr key={anc.txHash} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-[#174B36]">
                    {anc.recordType}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{anc.recordId}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={anc.payloadHash}>
                    {anc.payloadHash.slice(0, 16)}...{anc.payloadHash.slice(-8)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate" title={anc.txHash}>
                    {anc.txHash.slice(0, 12)}...{anc.txHash.slice(-6)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">#{anc.blockNumber}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">
                    {new Date(anc.anchoredAt).toLocaleTimeString('vi-VN')} {new Date(anc.anchoredAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-sans font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
