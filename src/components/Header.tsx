'use client';

import React from 'react';
import { RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  hideVisited: boolean;
  onToggleHideVisited: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hideVisited,
  onToggleHideVisited,
  onRefresh,
  onOpenSettings,
  isLoading = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm select-none">
            LA
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-none">
              2026 LA Trip
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-none mt-0.5">
              洛杉磯隨身助理
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 md:space-x-2">
          {/* Hide Visited / Done Toggle */}
          <button
            onClick={onToggleHideVisited}
            className={`p-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
              hideVisited
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={hideVisited ? '顯示已完成項目' : '隱藏已完成項目'}
          >
            {hideVisited ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="重新讀取 Google Sheet"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-slate-800' : ''}`} />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
            title="API 設定 (Token / URL)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
