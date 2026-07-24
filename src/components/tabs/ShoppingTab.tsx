'use client';

import React, { useState } from 'react';
import { ShoppingItem } from '@/types/trip';
import { Plus, Edit3, Link as LinkIcon, ShoppingBag } from 'lucide-react';

interface ShoppingTabProps {
  data: ShoppingItem[];
  hideDone: boolean;
  onToggleShopping: (rowIndex: number, currentStatus: boolean) => void;
  onOpenModal: (item?: ShoppingItem) => void;
  onOpenLightbox: (imageUrl: string) => void;
}

export const ShoppingTab: React.FC<ShoppingTabProps> = ({
  data,
  hideDone,
  onToggleShopping,
  onOpenModal,
  onOpenLightbox,
}) => {
  const [selectedStore, setSelectedStore] = useState<string>('全部');

  // Extract unique stores
  const storeSet = new Set<string>();
  data.forEach((item) => {
    if (item.store) {
      item.store.split(/[\n,，]+/).forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) storeSet.add(trimmed);
      });
    }
  });
  const storeList = ['全部', ...Array.from(storeSet)];

  const filteredItems = data.filter((item) => {
    if (hideDone && item.isDone) return false;
    if (selectedStore !== '全部') {
      const sTokens = item.store ? item.store.split(/[\n,，]+/).map((t) => t.trim()) : [];
      if (!sTokens.includes(selectedStore)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Store Filter Bar and Add Button */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {storeList.map((store) => {
            const isSelected = selectedStore === store;
            return (
              <button
                key={store}
                onClick={() => setSelectedStore(store)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {store}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onOpenModal()}
          className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-full cursor-pointer select-none whitespace-nowrap shadow-xs transition-all active:scale-95 flex items-center space-x-1 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增購物</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
          目前無購物清單 🛍️
        </div>
      )}

      {/* Shopping Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const sTokens = item.store ? item.store.split(/[\n,，]+/).map((t) => t.trim()) : [];
          const fTokens = item.forWhom ? item.forWhom.split(/[\n,，]+/).map((t) => t.trim()) : [];

          return (
            <div
              key={item.rowIndex}
              className={`bg-white border rounded-2xl p-4 flex justify-between items-center transition-all duration-200 ${
                item.isDone
                  ? 'border-slate-100 opacity-40 bg-slate-50'
                  : 'border-slate-100 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex-1 pr-4 min-w-0">
                <div className="flex items-start">
                  {/* Thumbnail / Image */}
                  <div className="relative flex-shrink-0 mr-3.5 select-none">
                    {item.image && item.image.startsWith('http') ? (
                      /* eslint-disable-next-next/no-img-element */
                      <img
                        src={item.image}
                        onClick={() => onOpenLightbox(item.image!)}
                        className="w-14 h-14 object-cover rounded-xl shadow-2xs cursor-zoom-in hover:scale-105 active:scale-95 transition-all"
                        alt={item.item}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100/80 flex items-center justify-center text-xl text-slate-400">
                        🛍️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {sTokens.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                          {s}
                        </span>
                      ))}

                      {fTokens.map((f) => {
                        if (!f) return null;
                        let colorClass = 'bg-slate-100 text-slate-600 border border-slate-200/50';
                        if (f === 'Jo')
                          colorClass = 'bg-indigo-50 text-indigo-600 border border-indigo-100/50';
                        else if (f === 'Will')
                          colorClass = 'bg-slate-100 text-slate-600 border border-slate-200/50';
                        else if (f === '特特')
                          colorClass = 'bg-amber-50 text-amber-700 border border-amber-200/50';
                        return (
                          <span
                            key={f}
                            className={`text-[10px] font-bold ${colorClass} px-2.5 py-0.5 rounded-full tracking-wider whitespace-nowrap`}
                          >
                            {f}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                      <h3
                        className={`text-base font-extrabold text-slate-900 leading-tight ${
                          item.isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {item.item}
                      </h3>

                      {item.quantity && item.quantity !== '1' && (
                        <span className="text-xs font-extrabold text-slate-800 bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded font-mono">
                          ×{item.quantity}
                        </span>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                          title="商品網址"
                        >
                          <LinkIcon className="w-4 h-4 ml-0.5 inline-block" />
                        </a>
                      )}
                    </div>

                    {item.note && (
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => onOpenModal(item)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-90"
                  title="編輯"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <input
                  type="checkbox"
                  checked={item.isDone}
                  onChange={(e) => onToggleShopping(item.rowIndex, !e.target.checked)}
                  className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer transition-transform active:scale-90"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
