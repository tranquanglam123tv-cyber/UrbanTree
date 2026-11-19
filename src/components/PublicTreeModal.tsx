import React from 'react';
import {
  X,
  Trees,
  MapPin,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Leaf,
  Info,
} from 'lucide-react';
import { Tree } from '../types';
import { storage } from '../db/storage';
import { anchorStatusLabel, careActionLabel, incidentStatusLabel } from '../services/apiMapper';

interface PublicTreeModalProps {
  tree: Tree | null;
  onClose: () => void;
  onReportIncident: (tree: Tree) => void;
}

export const PublicTreeModal: React.FC<PublicTreeModalProps> = ({
  tree,
  onClose,
  onReportIncident,
}) => {
  if (!tree) return null;

  const treeType = storage.getTreeTypeById(tree.treeTypeId);
  const treeIncidents = storage
    .getIncidents()
    .filter((i) => i.treeId === tree.id)
    .slice(0, 5);
  const treeCares = storage.getCareRecords(tree.id).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] shadow-2xl flex flex-col border border-[#E0EBDD] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#174B36] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg text-[#F3E8B2]">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-white/70 tracking-wider uppercase font-semibold">
                Cổng Tra cứu Cây xanh Công cộng
              </div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>{tree.displayName}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/20 text-[#F3E8B2]">
                  {tree.publicCode}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Hero Image */}
          <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
            <img
              src={tree.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'}
              alt={tree.displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-[#174B36] shadow-sm backdrop-blur-xs flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{treeType?.name}</span>
              </span>
            </div>
          </div>

          {/* Location & Botanical Details */}
          <div className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E0EBDD] space-y-2.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#174B36] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">{tree.address}</span>
                <div className="text-slate-400 font-mono text-[10px]">
                  Tọa độ WGS84: {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E0EBDD]/60 text-center">
              <div className="p-2 bg-white rounded-lg border border-[#E0EBDD]/50">
                <span className="text-[10px] text-slate-400 block">Năm trồng</span>
                <span className="font-bold text-[#174B36] font-mono text-xs">{tree.plantedAt}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#E0EBDD]/50">
                <span className="text-[10px] text-slate-400 block">Đường kính</span>
                <span className="font-bold text-[#174B36] font-mono text-xs">{tree.diameterCm || 30} cm</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#E0EBDD]/50">
                <span className="text-[10px] text-slate-400 block">Chiều cao</span>
                <span className="font-bold text-[#174B36] font-mono text-xs">{tree.heightM || 8} m</span>
              </div>
            </div>
          </div>

          {/* Botanical description */}
          {treeType && (
            <div className="space-y-1.5">
              <span className="font-bold text-[#174B36] text-xs">Thông tin loài cây:</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 leading-relaxed space-y-1">
                <div>
                  <strong>Tên khoa học:</strong> <em>{treeType.scientificName}</em>
                </div>
                <p>{treeType.description}</p>
              </div>
            </div>
          )}

          {/* Incident Reports & Care History for this tree (no code needed!) */}
          <div className="space-y-2">
            <span className="font-bold text-[#174B36] text-xs">
              Phản ánh sự cố & Tiến độ xử lý của cây này ({treeIncidents.length}):
            </span>
            {treeIncidents.length === 0 ? (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                Hiện chưa có phản ánh sự cố nào cho cây này.
              </div>
            ) : (
              <div className="space-y-1.5">
                {treeIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-[#174B36]">{inc.publicCode}</span>
                        <span className="text-[10px] text-slate-400">
                          · {new Date(inc.reportedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-0.5 line-clamp-2">{inc.description}</p>
                      {Number(inc.serviceCost || 0) > 0 && (
                        <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">
                          Chi phí xử lý: {Number(inc.serviceCost).toLocaleString('vi-VN')} VNĐ
                        </div>
                      )}
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {incidentStatusLabel(inc.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {treeCares.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-[#174B36] text-xs">
                Nhật ký chăm sóc / cắt tỉa gần đây:
              </span>
              <div className="space-y-1.5">
                {treeCares.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-[#174B36]">{careActionLabel(c.actionType)}</span>
                      <span className="text-slate-500 ml-1.5">
                        · {new Date(c.performedAt).toLocaleDateString('vi-VN')}
                      </span>
                      <div className="text-slate-600 truncate">{c.notes}</div>
                    </div>
                    <span className="shrink-0 font-mono font-bold text-emerald-800">
                      {Number(c.serviceCost || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockchain Integrity Seal */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Bảo chứng Toàn vẹn Blockchain</div>
                <div className="text-[10px] text-emerald-700 font-mono truncate max-w-[220px]">
                  Hash: {tree.payloadHash ? `${tree.payloadHash.slice(0, 24)}...` : 'Chưa neo'}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-800 font-bold text-[10px]">
              {anchorStatusLabel(tree.anchorStatus)}
            </span>
          </div>
        </div>

        {/* Footer Prominent CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            onClick={() => {
              onReportIncident(tree);
              onClose();
            }}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Báo cáo sự cố hoặc hư hại về cây này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
