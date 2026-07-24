'use client';

import React, { useState } from 'react';
import { PackingItem } from '@/types/trip';
import { Plus, Edit3 } from 'lucide-react';

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

  // Group by category
  const groupedByCategory: Record<string, PackingItem[]> = {};
  data.forEach((item) => {
    if (hidePacked && item.isPacked) return;

    if (selectedPerson !== '全部') {
      const pTokens = item.person ? item.person.split(/[\n,，]+/).map((t) => t.trim()) : [];
      if (!pTokens.includes(selectedPerson)) return;
    }

    const cat = item.category || '其他';
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(item);
  });

  const categories = Object.keys(groupedByCategory).sort((a, b) =>
    a.localeCompare(b, 'zh-Hant')
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Filter and Add Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {personList.map((person) => {
            const isSelected = selectedPerson === person;
            return (
              <button
                key={person}
                onClick={() => setSelectedPerson(person)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {person}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onOpenModal()}
          className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-full cursor-pointer select-none whitespace-nowrap shadow-xs transition-all active:scale-95 flex items-center space-x-1 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增打包項</span>
        </button>
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
          所有行李皆已打包完成！🧳✨
        </div>
      )}

      {/* Category Cards */}
      {categories.map((cat) => {
        const items = groupedByCategory[cat];
        items.sort((a, b) => a.rowIndex - b.rowIndex);
        const allItemsPacked = items.every((i) => i.isPacked);

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
            className={`border rounded-2xl p-4.5 transition-all ${
              allItemsPacked
                ? 'bg-slate-50 border-slate-100 opacity-80'
                : 'bg-white border-slate-100 shadow-2xs'
            }`}
          >
            {/* Category Card Header */}
            <div className="border-b border-slate-100 pb-2 mb-3 flex justify-between items-center select-none">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {allItemsPacked && <span className="text-emerald-500 mr-1.5 font-bold">✓</span>}
                {emoji} {cat}
              </span>
              {allItemsPacked && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ALL PACKED
                </span>
              )}
            </div>

            {/* List of items in category */}
            <div className="divide-y divide-slate-100/70">
              {items.map((item) => {
                const pTokens = item.person ? item.person.split(/[\n,，]+/).map((t) => t.trim()) : [];
                return (
                  <div
                    key={item.rowIndex}
                    className={`flex items-center justify-between py-2.5 transition-all ${
                      item.isPacked ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                      <input
                        type="checkbox"
                        checked={item.isPacked}
                        onChange={(e) => onTogglePacking(item.rowIndex, !e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer flex-shrink-0 transition-transform active:scale-90"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-y-0.5">
                          <span
                            className={`text-sm font-semibold text-slate-800 leading-tight ${
                              item.isPacked ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {item.item}
                          </span>

                          {selectedPerson === '全部' &&
                            pTokens.map((p) => {
                              if (!p) return null;
                              let colorClass = 'bg-slate-100 text-slate-600 border border-slate-200/50';
                              if (p === 'Jo')
                                colorClass = 'bg-indigo-50 text-indigo-600 border border-indigo-100/50';
                              else if (p === 'Will')
                                colorClass = 'bg-slate-100 text-slate-600 border border-slate-200/50';
                              return (
                                <span
                                  key={p}
                                  className={`inline-block ${colorClass} tracking-wider px-1.5 py-0.5 rounded text-[9px] font-bold ml-1.5`}
                                >
                                  {p}
                                </span>
                              );
                            })}
                        </div>
                        {item.note && (
                          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed whitespace-pre-line">
                            {item.note.replace(/<br\s*\/?>/gi, '\n')}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenModal(item)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-90 flex-shrink-0"
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
  );
};
