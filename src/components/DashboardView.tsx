import React, { useMemo } from 'react';
import {
  Trees,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Plus,
  QrCode,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../db/storage';
import { blockchainService } from '../services/blockchainService';
import { Tree } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenAddTree: () => void;
  onOpenCareModal: (treeId?: string) => void;
  onSelectTree: (tree: Tree) => void;
}

// Khối cây phát sáng trên banner hiển thị ảnh tree.png kèm hiệu ứng ánh sáng
export const GlowingSprout: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 bg-white/10 rounded-2xl border border-white/20 shadow-[0_0_20px_rgba(74,222,128,0.25)] overflow-hidden group backdrop-blur-xs shrink-0 select-none animate-breeze">
      {/* Ảnh cây xanh tree.png - Sắc nét, trong suốt, tương tác hover */}
      <img
        src="/tree.png"
        alt="UrbanTree"
        className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_10px_rgba(16,185,129,0.35)] z-10 transition-transform duration-300 group-hover:scale-110"
      />

      {/* Hiệu ứng đốm sáng chuyển động lướt qua (Shine/Sweep Effect) */}
      <div className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-[shine_3s_infinite]" />

      {/* Hiệu ứng đốm sáng tỏa ra (Glowing Orb) */}
      <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full z-0 animate-pulse pointer-events-none" />
    </div>
  );
};

// Component Thẻ "Hiện trạng Sức khỏe" - Tính toán 100% động từ dữ liệu DB trees
interface HealthChartProps {
  trees: Tree[];
  onNavigateDetail?: () => void;
  onNavigateMap?: () => void;
}

export const HealthStatusCard: React.FC<HealthChartProps> = ({
  trees,
  onNavigateDetail,
  onNavigateMap,
}) => {
  // Tính toán dữ liệu động từ mảng trees bằng filter và reduce (KHÔNG hardcode)
  const stats = useMemo(() => {
    const total = trees.length;
    const safeTotal = total > 0 ? total : 1; // Tránh chia cho 0

    const counts = {
      GOOD: trees.filter((t) => t.healthStatus === 'GOOD' || (t as any).health === 'GOOD').length,
      NORMAL: trees.filter(
        (t) =>
          t.healthStatus === 'FAIR' ||
          (t as any).healthStatus === 'NORMAL' ||
          (t as any).health === 'NORMAL' ||
          (t as any).health === 'FAIR'
      ).length,
      POOR: trees.filter((t) => t.healthStatus === 'POOR' || (t as any).health === 'POOR').length,
      CRITICAL: trees.filter((t) => t.healthStatus === 'CRITICAL' || (t as any).health === 'CRITICAL').length,
    };

    return [
      { id: 'GOOD', label: 'Tốt', count: counts.GOOD, percent: total > 0 ? (counts.GOOD / safeTotal) * 100 : 0, color: 'bg-[#00B67A]' },
      { id: 'NORMAL', label: 'Bình thường', count: counts.NORMAL, percent: total > 0 ? (counts.NORMAL / safeTotal) * 100 : 0, color: 'bg-slate-400' },
      { id: 'POOR', label: 'Kém', count: counts.POOR, percent: total > 0 ? (counts.POOR / safeTotal) * 100 : 0, color: 'bg-amber-500' },
      { id: 'CRITICAL', label: 'Nguy cấp', count: counts.CRITICAL, percent: total > 0 ? (counts.CRITICAL / safeTotal) * 100 : 0, color: 'bg-rose-500' },
    ];
  }, [trees]);

  const totalTrees = trees.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Hiện trạng Sức khỏe</h3>
            <p className="text-xs text-gray-500 mt-0.5">Phân loại theo tiêu chuẩn kiểm định</p>
          </div>
          {onNavigateDetail && (
            <button
              onClick={onNavigateDetail}
              className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <span>Chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}
        </div>

        {/* Biểu đồ danh sách trạng thái với thanh tiến trình động */}
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.id} className="relative">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-sm text-gray-700 font-medium">{stat.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-sm font-bold tabular-nums ${stat.count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {stat.count} cây
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">({Math.round(stat.percent)}%)</span>
                </div>
              </div>
              {/* Thanh Progress bar: Nếu 0 cây (0%) thì ẩn đi để UI không bị vỡ */}
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                {stat.count > 0 ? (
                  <div
                    className={`h-full rounded-full ${stat.color} transition-all duration-700 ease-out`}
                    style={{ width: `${stat.percent}%` }}
                  />
                ) : (
                  <div className="h-full w-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {totalTrees > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span className="font-medium text-gray-600">QĐ 1999/QĐ-UBND</span>
          {onNavigateMap && (
            <button
              onClick={onNavigateMap}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xem trên bản đồ</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddTree,
  onOpenCareModal,
  onSelectTree,
}) => {
  const stats = storage.getDashboardStats();
  const trees = storage.getTrees();
  const incidents = storage.getIncidents();
  const anchors = blockchainService.getAllAnchors().slice(0, 5);

  const healthyPercent = stats.totalTrees > 0 ? Math.round((stats.healthyTrees / stats.totalTrees) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Phần Banner Header: Màu loang nhẹ nhàng, hình ảnh trực quan mầm cây & chuyển động nhẹ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#113827] via-[#194c36] to-[#235f41] rounded-2xl px-6 py-4.5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Hiệu ứng màu loang nhẹ nhàng (ambient mesh blur) */}
        <div className="pointer-events-none absolute -top-10 -left-10 w-52 h-52 rounded-full bg-emerald-400/20 blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-32 rounded-full bg-teal-300/12 blur-2xl"></div>
        <div className="pointer-events-none absolute -bottom-10 right-28 w-56 h-56 rounded-full bg-emerald-300/15 blur-3xl"></div>
        <div className="pointer-events-none absolute -top-8 right-6 w-44 h-44 rounded-full bg-lime-300/15 blur-2xl"></div>

        {/* Nội dung chữ bên trái */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-200 font-medium mb-1.5 backdrop-blur-xs border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hạ tầng Cây xanh TP.HCM · Đô thị thông minh</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Hệ thống Giám sát & Quản lý Cây xanh</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-0.5 max-w-xl leading-relaxed">
            Định danh mã QR, số hóa nhật ký chăm sóc và bảo chứng toàn vẹn dữ liệu bằng Blockchain EVM.
          </p>
        </div>

        {/* Cụm hình ảnh trực quan + nút bấm bên phải */}
        <div className="relative z-10 flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0">
          {/* Mầm cây phát sáng GlowingSprout phóng to vừa vặn với banner */}
          <GlowingSprout />

          {/* Các nút bấm thao tác */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={onOpenAddTree}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/40 text-xs font-medium rounded-lg transition-all backdrop-blur-xs active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm cây mới</span>
            </button>
            <button
              onClick={() => onOpenCareModal()}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-white/10 text-white/90 hover:text-white border border-white/20 hover:border-white/30 text-xs font-medium rounded-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Ghi chăm sóc</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Khối Thống kê: Một khung nền trắng duy nhất, phân cách mờ, con số nổi bật, subtext text-gray-500 */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/80">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-0 lg:divide-x lg:divide-slate-100">
          {/* Tổng cây xanh */}
          <div className="lg:px-5 first:lg:pl-0">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500">Tổng cây xanh</span>
              <Trees className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {stats.totalTrees}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Đã cấp mã định danh QR</div>
          </div>

          {/* Tỷ lệ xanh tốt */}
          <div className="lg:px-5">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500">Tỷ lệ xanh tốt</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 tracking-tight tabular-nums">
              {healthyPercent}%
            </div>
            <div className="text-[11px] text-gray-500 mt-1">{stats.healthyTrees} cây sinh trưởng tốt</div>
          </div>

          {/* Cây cần chăm sóc */}
          <div className="lg:px-5">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500">Cây cần chăm sóc</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 tracking-tight tabular-nums">
              {stats.atRiskTrees}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Kém hoặc nguy cấp</div>
          </div>

          {/* Sự cố đang xử lý */}
          <div className="lg:px-5">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500">Sự cố đang xử lý</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600 tracking-tight tabular-nums">
              {stats.activeIncidents}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Từ phản ánh người dân</div>
          </div>

          {/* Bản ghi Blockchain */}
          <div className="col-span-2 sm:col-span-1 lg:px-5 last:lg:pr-0">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500">Bản ghi Blockchain</span>
              <ShieldCheck className="w-4 h-4 text-[#347A50]" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {stats.totalAnchors}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>100% SHA-256</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 4. Middle Row: Hiện trạng Sức khỏe (Bên trái) & Sự cố / Phản ánh (Bên phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Khối Hiện trạng Sức khỏe: Tính toán dữ liệu 100% ĐỘNG từ DB trees */}
        <HealthStatusCard
          trees={trees}
          onNavigateDetail={() => onNavigate('trees')}
          onNavigateMap={() => onNavigate('map')}
        />

        {/* Khối Sự cố & Phản ánh: Tối giản, chỉ giữ thông tin chính, gọn gàng và đẹp mắt */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-xs border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 leading-tight">Sự cố & Phản ánh</h2>
                <p className="text-xs text-gray-500 mt-0.5">Tiếp nhận qua quét mã QR công cộng</p>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Tất cả sự cố</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {incidents.slice(0, 3).map((incident) => {
                const tree = incident.treeId ? trees.find((t) => t.id === incident.treeId) : null;
                const isCritical = incident.severity === 'CRITICAL';
                const isHigh = incident.severity === 'HIGH';

                return (
                  <div
                    key={incident.id}
                    onClick={() => onNavigate('incidents')}
                    className="group py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 -mx-2 px-2.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Chấm màu biểu thị mức độ nghiêm trọng */}
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          isCritical
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                            : isHigh
                            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                            : 'bg-emerald-500'
                        }`}
                      />

                      {/* Nội dung chính */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700'
                                : isHigh
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {incident.severity}
                          </span>
                          <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#174B36] transition-colors">
                            {incident.description}
                          </p>
                        </div>

                        {/* Thông tin vị trí & Cây liên quan */}
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 truncate">
                          <span className="truncate">{incident.address || 'Khu vực nội ô'}</span>
                          {tree && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="font-mono text-slate-500 font-medium shrink-0">
                                {tree.publicCode}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trạng thái xử lý nhẹ nhàng + Mũi tên chuyển trang */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="hidden sm:inline-block text-[11px] text-gray-400 font-medium">
                        {incident.status === 'IN_PROGRESS'
                          ? 'Đang xử lý'
                          : incident.status === 'RESOLVED'
                          ? 'Đã xử lý'
                          : 'Mới gửi'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Cây xanh nổi bật & Nhật ký Blockchain (Tối giản đồng bộ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trees List - Thiết kế trực quan, hình ảnh thực tế, thông số và badge tiếng Việt */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 leading-tight">Cây Xanh Đô Thị Nổi Bật</h2>
                <p className="text-xs text-gray-500 mt-0.5">Danh mục cây đã cấp mã QR định danh</p>
              </div>
              <button
                onClick={() => onNavigate('trees')}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Xem danh sách</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {trees.slice(0, 4).map((tree) => {
                const healthMap: Record<string, { label: string; dot: string; badge: string }> = {
                  GOOD: {
                    label: 'Xanh tốt',
                    dot: 'bg-emerald-500',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                  },
                  FAIR: {
                    label: 'Bình thường',
                    dot: 'bg-slate-400',
                    badge: 'bg-slate-50 text-slate-700 border-slate-200/60',
                  },
                  POOR: {
                    label: 'Cần chăm sóc',
                    dot: 'bg-amber-500',
                    badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
                  },
                  CRITICAL: {
                    label: 'Nguy cấp',
                    dot: 'bg-rose-500',
                    badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
                  },
                };
                const health = healthMap[tree.healthStatus] || healthMap.GOOD;

                return (
                  <div
                    key={tree.id}
                    onClick={() => onSelectTree(tree)}
                    className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between gap-3 group border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Ảnh thực tế của cây chụp hiện trường */}
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-emerald-50 shrink-0 border border-gray-100 shadow-2xs">
                        {tree.imageUrl ? (
                          <img
                            src={tree.imageUrl}
                            alt={tree.displayName}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#174B36]">
                            <Trees className="w-5 h-5" />
                          </div>
                        )}
                        {/* Mini QR badge ở góc ảnh */}
                        <div className="absolute bottom-0 right-0 p-0.5 bg-black/60 backdrop-blur-xs rounded-tl text-white">
                          <QrCode className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {/* Thông tin định danh & Vị trí */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#174B36] bg-[#174B36]/10 px-1.5 py-0.2 rounded shrink-0">
                            {tree.publicCode}
                          </span>
                          <h3 className="text-xs font-semibold text-gray-900 group-hover:text-[#174B36] transition-colors truncate">
                            {tree.displayName}
                          </h3>
                        </div>

                        {/* Địa chỉ & Kích thước */}
                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 truncate">
                          <span className="truncate">{tree.address}</span>
                          {tree.heightM && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-500 font-medium shrink-0">Cao {tree.heightM}m</span>
                            </>
                          )}
                          {tree.diameterCm && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-500 font-medium shrink-0">Ø {tree.diameterCm}cm</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge trạng thái sức khỏe tiếng Việt trực quan */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${health.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                        <span>{health.label}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Blockchain Anchors Feed */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-800">Nhật ký Blockchain</h2>
                <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 font-medium rounded-full">
                  Sepolia Testnet
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Neo băm SHA-256 xác thực Smart Contract</p>
            </div>
            <button
              onClick={() => onNavigate('blockchain')}
              className="text-xs font-medium text-slate-400 hover:text-[#174B36] flex items-center gap-1 transition-colors"
            >
              <span>Sổ cái</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {anchors.map((anchor) => (
              <div key={anchor.txHash} className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-100/60 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">{anchor.recordType}</span>
                  <span className="font-mono text-[10px] text-slate-400">Block #{anchor.blockNumber}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 truncate mb-1">
                  Hash: {anchor.payloadHash}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="truncate max-w-[200px]">Tx: {anchor.txHash}</span>
                  <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    CONFIRMED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};