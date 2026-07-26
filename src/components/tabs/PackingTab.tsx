'use client';

import React, { useState } from 'react';
import { PackingItem } from '@/types/trip';
import { Plus, Edit3, Briefcase, User } from 'lucide-react';

interface PackingTabProps {
  data: PackingItem[];
  hidePacked: boolean;
  onTogglePacking: (rowIndex: number, currentStatus: boolean) => void;
  onOpenModal: (item?: PackingItem) => void;
}

const PACKING_EMOJIS: Record<string, string> = {
  衣物: '👕',
  '3C': '📱',
  美妝盥洗: '🧴',
  隨身: '👜',
  行李: '🧳',
  藥品: '💊',
  重要證件: '🪪',
  特特行李: '🐕‍🦺',
  球場裝備: '⚾',
  車用: '🚗',
  文件: '🪪',
};

export const PackingTab: React.FC<PackingTabProps> = ({
  data,
  hidePacked,
  onTogglePacking,
  onOpenModal,
}) => {
  const [selectedPerson, setSelectedPerson] = useState<string>('全部');
  const [selectedLocation, setSelectedLocation] = useState<string>('全部');

  // Extract unique persons
  const personSet = new Set<string>();
  data.forEach((item) => {
    if (item.person) {
      item.person.split(/[\n,，]+/).forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) personSet.add(trimmed);
      });
    }
  });
  const personList = ['全部', ...Array.from(personSet)];

  // Extract unique locations
  const locationSet = new Set<string>();
  data.forEach((item) => {
    if (item.location) {
      const trimmed = item.location.trim();
      if (trimmed) locationSet.add(trimmed);
    }
  });
  const locationList = ['全部', ...Array.from(locationSet)];

  // Group by category
  const groupedByCategory: Record<string, PackingItem[]> = {};
  data.forEach((item) => {
    if (hidePacked && item.isPacked) return;

    // Person filter
    if (selectedPerson !== '全部') {
      const pTokens = item.person ? item.person.split(/[\n,，]+/).map((t) => t.trim()) : [];
      if (!pTokens.includes(selectedPerson)) return;
    }

    // Location filter
    if (selectedLocation !== '全部') {
      if ((item.location || '').trim() !== selectedLocation) return;
    }

    const cat = item.category || '其他';
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(item);
  });

  const categories = Object.keys(groupedByCategory).sort((a, b) =>
    a.localeCompare(b, 'zh-Hant')
  );

  return (
    <div className="space-y-5 pb-20">
      {/* Compact Header Filter & Add Bar */}
      <div className="bg-white/90 backdrop-blur-xs p-2.5 md:p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        {/* Left Filter Chips */}
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar flex-1 min-w-0">
          {/* Person Filter */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center space-x-1">
              {personList.map((person) => {
                const isSelected = selectedPerson === person;
                return (
                  <button
                    key={person}
                    onClick={() => setSelectedPerson(person)}
                    className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {person}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Filter */}
          {locationList.length > 1 && (
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200/80 flex-shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center space-x-1">
                {locationList.map((loc) => {
                  const isSelected = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Inline Add Button (+ 新增) */}
        <button
          onClick={() => onOpenModal()}
          className="px-3 py-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl cursor-pointer select-none whitespace-nowrap shadow-2xs transition-all active:scale-95 flex items-center space-x-1 flex-shrink-0 ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新增打包項</span>
          <span className="sm:hidden">新增</span>
        </button>
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
          所有行李皆已打包完成！🧳✨
        </div>
      )}

      {/* Responsive Multi-column Grid Layout (1 col mobile, 2 cols tablet, 3 cols desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {categories.map((cat) => {
          const items = groupedByCategory[cat];
          items.sort((a, b) => a.rowIndex - b.rowIndex);
          const packedCount = items.filter((i) => i.isPacked).length;
          const allItemsPacked = items.length > 0 && packedCount === items.length;

          let emoji = '📦';
          const lowerCat = cat.toLowerCase();
          for (const [key, val] of Object.entries(PACKING_EMOJIS)) {
            if (lowerCat.includes(key.toLowerCase())) {
              emoji = val;
              break;
            }
          }

          return (
            <div
              key={cat}
              className="bg-white rounded-2xl border border-slate-200/70 p-3.5 shadow-2xs space-y-2"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 select-none">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-slate-800 tracking-wide">
                    {emoji} {cat}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {packedCount}/{items.length}
                  </span>
                </div>
                {allItemsPacked && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ✓ COMPLETED
                  </span>
                )}
              </div>

              {/* Items List - Borderless Clean Layout */}
              <div className="space-y-1">
                {items.map((item) => {
                  const pTokens = item.person ? item.person.split(/[\n,，]+/).map((t) => t.trim()) : [];
                  return (
                    <div
                      key={item.rowIndex}
                      className={`group flex items-start justify-between p-2 rounded-xl transition-colors hover:bg-slate-50 ${
                        item.isPacked ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Checkbox & Item Info */}
                      <div className="flex items-start space-x-2.5 min-w-0 flex-1 pr-1.5">
                        <input
                          type="checkbox"
                          checked={item.isPacked}
                          onChange={() => onTogglePacking(item.rowIndex, item.isPacked)}
                          className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer flex-shrink-0 transition-transform active:scale-90"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-1">
                            <span
                              onClick={() => onOpenModal(item)}
                              className={`text-sm font-bold text-slate-800 leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${
                                item.isPacked ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {item.item}
                            </span>

                            {/* Person Badges */}
                            {selectedPerson === '全部' &&
                              pTokens.map((p) => {
                                if (!p) return null;
                                let colorClass = 'bg-slate-100 text-slate-600';
                                if (p === 'Jo')
                                  colorClass = 'bg-indigo-50 text-indigo-600';
                                else if (p === 'Will')
                                  colorClass = 'bg-amber-50 text-amber-700';
                                return (
                                  <span
                                    key={p}
                                    className={`inline-block ${colorClass} px-1.5 py-0.5 rounded text-[9px] font-black leading-none`}
                                  >
                                    {p}
                                  </span>
                                );
                              })}

                            {/* Location Badge */}
                            {item.location && (
                              <span className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200/60 px-1.5 py-0.5 rounded text-[9px] font-black leading-none">
                                {item.location}
                              </span>
                            )}
                          </div>

                          {/* Note */}
                          {item.note && (
                            <div className="text-xs text-slate-400 mt-0.5 leading-snug whitespace-pre-line">
                              {item.note.replace(/<br\s*\/?>/gi, '\n')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit Button: Visible on mobile touch devices (opacity-80), hover-fade on desktop (md:opacity-0 md:group-hover:opacity-100) */}
                      <button
                        onClick={() => onOpenModal(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-all flex items-center justify-center cursor-pointer active:scale-90 flex-shrink-0 opacity-80 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                        title="編輯"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
