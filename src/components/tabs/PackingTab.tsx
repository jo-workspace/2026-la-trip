'use client';

import React, { useState } from 'react';
import { PackingItem } from '@/types/trip';
import { Plus, Edit3, Briefcase, User, Layers } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

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

  // Group by category for count statistics
  const categoryStats: Record<string, { total: number; packed: number }> = {};
  data.forEach((item) => {
    const cat = item.category || '其他';
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, packed: 0 };
    categoryStats[cat].total += 1;
    if (item.isPacked) categoryStats[cat].packed += 1;
  });

  // Group items by category after filters
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

    // Category filter
    const cat = item.category || '其他';
    if (selectedCategory !== '全部' && cat !== selectedCategory) return;

    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(item);
  });

  const categories = Object.keys(groupedByCategory).sort((a, b) =>
    a.localeCompare(b, 'zh-Hant')
  );

  const allCategoryNames = Object.keys(categoryStats).sort((a, b) =>
    a.localeCompare(b, 'zh-Hant')
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Top Controls Bar: Person & Location Filters + Inline Add Button */}
      <div className="bg-white/90 backdrop-blur-xs p-2.5 md:p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        {/* Person & Location Filter Chips */}
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
          <span>新增</span>
        </button>
      </div>

      {/* Main Content Layout: Soft Tone Background Left Panel (Desktop) + Clean Items Right Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-start">

        {/* 做法 2: 微背景色塊區隔 (Soft Tone Panel) - Desktop Side Index / Mobile Top Horizontal Scroll */}
        <div className="w-full md:w-56 lg:w-64 flex-shrink-0 bg-slate-50/70 p-3 rounded-2xl border border-slate-100/80 space-y-1">
          <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-slate-200/60 text-slate-400 text-xs font-extrabold select-none">
            <div className="flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>分類導覽</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">{allCategoryNames.length} 個類別</span>
          </div>

          <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-1">
            {/* "All" Category Chip */}
            <button
              onClick={() => setSelectedCategory('全部')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap text-left ${
                selectedCategory === '全部'
                  ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <span>全部類別</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  selectedCategory === '全部' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {data.length}
              </span>
            </button>

            {/* List of Categories */}
            {allCategoryNames.map((cat) => {
              const isSelected = selectedCategory === cat;
              const stats = categoryStats[cat];
              let emoji = '📦';
              const lowerCat = cat.toLowerCase();
              for (const [key, val] of Object.entries(PACKING_EMOJIS)) {
                if (lowerCat.includes(key.toLowerCase())) {
                  emoji = val;
                  break;
                }
              }

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap text-left ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  <span className="truncate">
                    {emoji} {cat}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold flex-shrink-0 ml-1.5 ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {stats.packed}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Panel: Pure White Background, Borderless Clean Item Rows */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-slate-100 p-4 shadow-2xs space-y-6">
          {categories.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              所有行李皆已打包完成！🧳✨
            </div>
          )}

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
              <div key={cat} className="space-y-1.5">
                {/* Borderless Minimalist Category Header */}
                <div className="flex items-center justify-between px-1 py-1 select-none border-b border-slate-100 pb-1.5 mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-slate-900 tracking-wide">
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
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const pTokens = item.person ? item.person.split(/[\n,，]+/).map((t) => t.trim()) : [];
                    return (
                      <div
                        key={item.rowIndex}
                        className={`group flex items-start justify-between px-2.5 py-1.5 rounded-xl transition-all hover:bg-slate-50 ${
                          item.isPacked ? 'opacity-40' : ''
                        }`}
                      >
                        {/* Checkbox & Item Content */}
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1 pr-2">
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
                                className={`text-sm font-semibold text-slate-800 leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${
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
                                      className={`inline-block ${colorClass} px-1.5 py-0.5 rounded text-[10px] font-extrabold ml-1`}
                                    >
                                      {p}
                                    </span>
                                  );
                                })}

                              {/* Location Badge */}
                              {item.location && (
                                <span className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200/60 px-1.5 py-0.5 rounded text-[10px] font-extrabold ml-1">
                                  {item.location}
                                </span>
                              )}
                            </div>

                            {/* Note */}
                            {item.note && (
                              <div className="text-xs text-slate-400 mt-0.5 leading-normal whitespace-pre-line">
                                {item.note.replace(/<br\s*\/?>/gi, '\n')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit Button: Always accessible on mobile (opacity-80), hover on desktop (md:opacity-0 md:group-hover:opacity-100) */}
                        <button
                          onClick={() => onOpenModal(item)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-all flex items-center justify-center cursor-pointer active:scale-90 flex-shrink-0 opacity-80 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
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
    </div>
  );
};
