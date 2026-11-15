import React from 'react';
import {
  Trees,
  QrCode,
  RotateCcw,
  ChevronDown,
  Check
} from 'lucide-react';
import { Role, User } from '../types';
import { storage } from '../db/storage';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenQrScanner: () => void;
  onResetSeed: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  onOpenQrScanner,
  onResetSeed,
}) => {
  const users = storage.getUsers();

  const handleRoleSelect = (role: Role) => {
    if (role === 'CITIZEN') {
      onUserChange({
        id: 'citizen-guest',
        username: 'nguoidan',
        fullName: 'Người dân (Công cộng)',
        role: 'CITIZEN',
        isActive: true,
      });
      setActiveTab('incidents');
    } else {
      const match = users.find((u) => u.role === role);
      if (match) {
        onUserChange(match);
      }
    }
  };

  const userInitial = currentUser.fullName ? currentUser.fullName.trim().charAt(0).toUpperCase() : 'U';

  const navItems = [
    ...(currentUser.role !== 'CITIZEN'
      ? [
        { id: 'dashboard', label: 'Tổng quan' },
        { id: 'trees', label: 'Hồ sơ cây' },
        { id: 'map', label: 'Bản đồ số' },
        { id: 'care', label: 'Nhật ký chăm sóc' },
      ]
      : []),
    { id: 'incidents', label: 'Sự cố & Phản ánh' },
    ...(currentUser.role === 'ADMIN'
      ? [{ id: 'blockchain', label: 'Blockchain EVM' }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Cụm Trái: Brand / Logo */}
          <div className="flex items-center shrink-0 pr-8 border-r border-gray-200 h-10">
            <button
              onClick={() => setActiveTab(currentUser.role === 'CITIZEN' ? 'incidents' : 'dashboard')}
              className="flex items-center focus:outline-none cursor-pointer group"
              title="UrbanTree - Về trang chủ"
            >
              <img
                src="/LOGO.png"
                alt="UrbanTree Logo"
                className="h-[52px] w-auto max-w-[180px] object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
              />
            </button>
          </div>

          {/* Cụm Giữa: Menu Điều hướng (In hoa, In đậm, Không xuống dòng) */}
          <nav className="hidden lg:flex items-center h-[68px] flex-1 px-8 gap-7 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`h-full inline-flex items-center text-[13px] uppercase font-bold whitespace-nowrap transition-colors border-b-[3px] cursor-pointer ${isActive
                    ? 'border-[#174B36] text-[#174B36]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Cụm Phải: Các nút hành động & Người dùng */}
          <div className="flex items-center gap-4 shrink-0 pl-4">

            <button
              onClick={onOpenQrScanner}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <QrCode className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Quét QR</span>
            </button>

            {/* Vách ngăn mỏng */}
            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

            {/* User Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2.5 py-1 rounded-md cursor-pointer text-left focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[11px] uppercase text-gray-500 font-medium leading-tight mt-0.5">
                    {currentUser.role === 'CITIZEN' ? 'Người dân' : currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-1" />
              </button>

              {/* Menu Dropdown */}
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-sm py-1.5 hidden group-hover:block group-focus-within:block z-50">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Đổi vai trò hệ thống
                  </p>
                </div>

                {[
                  { role: 'ADMIN', name: 'Đặng Thế Thuận', desc: 'Quản trị viên' },
                  { role: 'STAFF', name: 'Trần Quang Lâm', desc: 'Kỹ thuật viên' },
                  { role: 'CITIZEN', name: 'Tài khoản công cộng', desc: 'Người dân' }
                ].map((persona) => (
                  <button
                    key={persona.role}
                    onClick={() => handleRoleSelect(persona.role as Role)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className={`font-semibold ${currentUser.role === persona.role ? 'text-[#174B36]' : 'text-gray-900'}`}>
                        {persona.name}
                      </div>
                      <div className="text-[11px] text-gray-500 uppercase mt-0.5">{persona.desc}</div>
                    </div>
                    {currentUser.role === persona.role && (
                      <Check className="w-4 h-4 text-[#174B36]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Nút Reset */}
            <button
              onClick={onResetSeed}
              title="Khôi phục dữ liệu gốc"
              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer ml-1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};