/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Webhook, LogOut } from 'lucide-react';

interface NavbarProps {
  currentMenuTitle: string;
  onQuickCreate?: () => void;
  pendingReviewCount: number;
  onOpenGoogleSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMenuTitle,
  onQuickCreate,
  pendingReviewCount,
  onOpenGoogleSettings,
}) => {
  return (
    <header className="h-16 bg-white border-b border-rose-100/70 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-20 print:hidden no-print">
      {/* Zone 1: Context Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-amber-500">OPTIMA.DOK</span>
        <span className="text-stone-300">/</span>
        <span className="font-semibold text-rose-950">{currentMenuTitle}</span>
        <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-[#701524] bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
          Perpres 12/2021 PBJ
        </span>
      </div>

      {/* Zone 2: Google Webhook Control & Logout Button */}
      <div className="flex items-center gap-2.5">
        {/* Google Sheet & Drive Webhook Settings Trigger */}
        <button
          onClick={onOpenGoogleSettings}
          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#701524] border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
          title="Buka Pengaturan Integrasi Google Sheet, Drive & Webhook"
        >
          <Webhook className="w-3.5 h-3.5 text-[#701524]" />
          <span className="hidden md:inline">Google Sheet & Drive</span>
        </button>

        {pendingReviewCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200/80 rounded-xl text-[11px] text-[#701524] font-medium">
            <Bell className="w-3.5 h-3.5 text-[#701524]" />
            <span><strong className="font-bold tabular-nums">{pendingReviewCount}</strong> tertunda</span>
          </div>
        )}

        {/* Tombol Logout Pengganti Nama */}
        <a
          href="/__logout"
          className="px-3.5 py-1.5 bg-[#701524] hover:bg-rose-900 active:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-rose-800 hover:scale-105 active:scale-95"
          title="Keluar / Logout dari Aplikasi SIPELANG"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-200" />
          <span>Logout</span>
        </a>
      </div>
    </header>
  );
};
