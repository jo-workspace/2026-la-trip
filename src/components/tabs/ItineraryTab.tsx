'use client';

import React, { useState } from 'react';
import { ItineraryItem } from '@/types/trip';
import { MapPin, Plus, CheckCircle2, Circle, Edit3 } from 'lucide-react';

interface ItineraryTabProps {
  data: ItineraryItem[];
  tripNote?: string;
  hideVisited: boolean;
  startDate?: string; // YYYY-MM-DD，旅程起始日
  onToggleVisited: (rowIndex: number, currentStatus: boolean) => void;
  onOpenModal: (item?: ItineraryItem) => void;
  onOpenLightbox: (imageUrl: string) => void;
}

const ICON_MAPPING: Record<string, string> = {
  '景點': '📍',
  '美食': '🍔',
  '購物': '🛒',
  '交通': '🚗',
  '住宿': '🏨',
  '球場': '⚾',
  '娛樂': '🎡',
  '機票': '✈️',
  '其他': '📌',
};

// 由 startDate (YYYY-MM-DD) + Day N 計算出日期字串，例如 "8/28 Thu"
function calcDateFromStartDate(startDateStr: string, dayLabel: string): string {
  if (!startDateStr) return '';
  const dayNum = parseInt(dayLabel.replace(/[^0-9]/g, ''), 10);
  if (isNaN(dayNum)) return '';
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return '';
  const target = new Date(start);
  target.setDate(target.getDate() + dayNum - 1);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${target.getMonth() + 1}/${target.getDate()} ${weekdays[target.getDay()]}`;
}

export const ItineraryTab: React.FC<ItineraryTabProps> = ({
  data,
  tripNote,
  hideVisited,
  startDate,
  onToggleVisited,
  onOpenModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('ALL');

  // Extract unique days
  const days = Array.from(new Set(data.map((item) => item.day))).filter(Boolean);

  // Sort days logically (Day 1, Day 2...)
  days.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 999;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 999;
    return numA - numB;
  });

  // Filter items
  const filteredItems = data.filter((item) => {
    if (hideVisited && item.isVisited) return false;
    if (selectedDay !== 'ALL' && item.day !== selectedDay) return false;
    return true;
  });

  // Group by day for display
  const groupedByDay: Record<string, ItineraryItem[]> = {};
  filteredItems.forEach((item) => {
    const dayKey = item.day || '未定日期';
    if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
    groupedByDay[dayKey].push(item);
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Trip Note Alert Banner */}
      {tripNote && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-sm border-l-4 border-amber-400">
          <div className="text-xs font-bold uppercase text-amber-400 mb-1.5 flex items-center space-x-1.5">
            <span>📢</span>
            <span>行程重要備註</span>
          </div>
          <div className="text-sm font-medium leading-relaxed font-sans text-slate-200 whitespace-pre-line">
            {tripNote.replace(/<br\s*\/?>/gi, '\n')}
          </div>
        </div>
      )}

      {/* Day Filter & Add Button Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 sticky top-[57px] md:top-0 bg-slate-50/90 backdrop-blur-md z-30">
        <button
          onClick={() => onOpenModal()}
          className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-full cursor-pointer select-none whitespace-nowrap shadow-xs transition-all active:scale-95 flex items-center space-x-1 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增行程</span>
        </button>

        <button
          onClick={() => setSelectedDay('ALL')}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
            selectedDay === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          全部天數
        </button>

        {days.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(groupedByDay).length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
          目前沒有行程資料 📍
        </div>
      )}

      {/* Itinerary Cards Grouped by Day */}
      {Object.entries(groupedByDay).map(([day, items]) => {
        // 優先使用計算出來的日期，其次用資料本身的 date 欄位
        const dateText = startDate
          ? calcDateFromStartDate(startDate, day)
          : (items[0]?.date || '');
        return (
          <div key={day} className="space-y-3">
            {/* Day Section Header */}
            <div className="flex items-center space-x-2 pt-2">
              <span className="text-xs font-extrabold bg-slate-900 text-white px-3 py-1 rounded-full select-none shadow-xs">
                {day}
              </span>
              {dateText && (
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  {dateText}
                </span>
              )}
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const emoji = ICON_MAPPING[item.type] || '📍';
                return (
                  <div
                    key={item.rowIndex}
                    className={`bg-white border rounded-2xl p-4 flex justify-between items-start transition-all duration-200 ${
                      item.isVisited
                        ? 'border-slate-100 opacity-40 bg-slate-50'
                        : 'border-slate-100/90 shadow-2xs hover:shadow-xs hover:border-slate-200'
                    }`}
                  >
                    <div className="flex-1 pr-3 min-w-0">
                      <div className="flex items-start space-x-2.5">
                        <span className="text-xl leading-none mt-0.5 select-none">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                            {item.time && (
                              <span className="text-xs font-semibold text-slate-400 font-mono">
                                {item.time}
                              </span>
                            )}
                            <h3
                              className={`text-base font-extrabold text-slate-900 leading-tight ${
                                item.isVisited ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {item.title}
                            </h3>
                            {item.links && (
                              <a
                                href={item.links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-rose-500 hover:text-rose-600 transition-transform active:scale-95"
                                title="開啟 Google 地圖"
                              >
                                <MapPin className="w-4 h-4 ml-0.5" />
                              </a>
                            )}
                          </div>
                          {item.content && (
                            <div className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium whitespace-pre-line">
                              {item.content.replace(/<br\s*\/?>/gi, '\n')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions (Toggle Done & Edit) */}
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        onClick={() => onOpenModal(item)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-90"
                        title="編輯"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleVisited(item.rowIndex, item.isVisited)}
                        className="text-slate-400 hover:text-slate-800 transition-transform active:scale-90 cursor-pointer"
                        title={item.isVisited ? '標示為未去過' : '標示為已完成'}
                      >
                        {item.isVisited ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>
                    </div>
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
