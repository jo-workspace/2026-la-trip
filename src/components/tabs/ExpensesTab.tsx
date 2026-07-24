'use client';

import React, { useState } from 'react';
import { ExpenseItem } from '@/types/trip';
import { Plus, Trash2, Banknote, DollarSign } from 'lucide-react';

interface ExpensesTabProps {
  data: ExpenseItem[];
  fxRate: number;
  onAddExpense: (formData: any) => Promise<void>;
  onDeleteExpense: (rowIndex: number) => Promise<void>;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  '🍔': '美食',
  '✈️': '機票',
  '🛒': '購物',
  '🚗': '交通',
  '⚾': '球場',
  '🏨': '住宿',
  '❔': '其他',
};

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  data,
  fxRate = 32.5,
  onAddExpense,
  onDeleteExpense,
}) => {
  // Format fxRate to max 4 decimal places
  const displayFxRate = Number(parseFloat(Number(fxRate || 32.5).toFixed(4)));

  // Quick form state
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'TWD'>('USD');
  const [category, setCategory] = useState('🍔');
  const [paidBy, setPaidBy] = useState<'Jo' | 'Will'>('Jo');
  const [split, setSplit] = useState<'Both' | 'Jo' | 'Will'>('Both');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  let totalTWD = 0;
  let joPaidTWD = 0;
  let willPaidTWD = 0;
  let joShareTWD = 0;
  let willShareTWD = 0;
  let settlementOffsetTWD = 0;

  data.forEach((exp) => {
    let amt = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
    let amtTWD = exp.currency === 'USD' ? amt * fxRate : amt;

    if (exp.item && exp.item.includes('系統結清')) {
      if (exp.paidBy === 'Jo') settlementOffsetTWD += amtTWD;
      else if (exp.paidBy === 'Will') settlementOffsetTWD -= amtTWD;
      return;
    }

    totalTWD += amtTWD;
    if (exp.paidBy === 'Jo') joPaidTWD += amtTWD;
    if (exp.paidBy === 'Will') willPaidTWD += amtTWD;

    if (exp.split === 'Jo') {
      joShareTWD += amtTWD;
    } else if (exp.split === 'Will') {
      willShareTWD += amtTWD;
    } else {
      joShareTWD += amtTWD / 2;
      willShareTWD += amtTWD / 2;
    }
  });

  const joOverage = joPaidTWD - joShareTWD + settlementOffsetTWD;
  const roundedOverage = Math.round(joOverage);

  let settlementText = '兩不相欠';
  if (Math.abs(roundedOverage) > 1) {
    if (roundedOverage > 0) {
      settlementText = `Will 應給 Jo $${roundedOverage.toLocaleString()}`;
    } else {
      settlementText = `Jo 應給 Will $${Math.abs(roundedOverage).toLocaleString()}`;
    }
  }

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || !amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddExpense({
        category,
        item: item.trim(),
        currency,
        amount: parseFloat(amount),
        paidBy,
        split: split === 'Both' ? '均分' : split,
        note: note.trim(),
      });
      setItem('');
      setAmount('');
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSettlement = async () => {
    if (Math.abs(roundedOverage) <= 1) return;
    const amountVal = Math.round(Math.abs(joOverage));
    const payer = joOverage > 0 ? 'Will' : 'Jo';
    const payee = joOverage > 0 ? 'Jo' : 'Will';

    if (!confirm(`確認進行結清清算？將新增一筆 ${payer} 給 ${payee} $${amountVal} TWD 的系統紀錄。`)) return;

    setIsSubmitting(true);
    try {
      await onAddExpense({
        category: '💵',
        item: `系統結清: ${payer} 支付 ${payee}`,
        currency: 'TWD',
        amount: amountVal,
        paidBy: payer,
        split: payee,
        note: '點擊系統結清產生的對沖紀錄',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const liveTwdEst = currency === 'USD' ? Math.round(parsedAmount * fxRate) : parsedAmount;

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Settlement Dashboard & Quick Input Form */}
        <div className="md:col-span-5 space-y-4">
          {/* Settlement Banner */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-700/50 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              分帳結算 (匯率 1:{displayFxRate})
            </span>
            <div className="text-xl font-extrabold text-amber-400 tracking-tight">
              {settlementText}
            </div>

            {Math.abs(roundedOverage) > 1 && (
              <button
                onClick={handleClearSettlement}
                disabled={isSubmitting}
                className="mt-3 px-4 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs inline-flex items-center space-x-1"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>一鍵點擊結清</span>
              </button>
            )}
          </div>

          {/* User Spend Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Jo 應負擔總額
              </span>
              <span className="text-base font-mono font-black text-slate-900 mt-1 block">
                ${Math.round(joShareTWD).toLocaleString()} TWD
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Will 應負擔總額
              </span>
              <span className="text-base font-mono font-black text-slate-900 mt-1 block">
                ${Math.round(willShareTWD).toLocaleString()} TWD
              </span>
            </div>
          </div>

          {/* Quick Expense Form */}
          <form
            onSubmit={handleQuickSubmit}
            className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4 border border-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-amber-400 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4" />
                <span>新增記帳項目</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">1 USD ≈ {displayFxRate} TWD</span>
            </div>

            {/* Item Title & Amount */}
            <div className="grid grid-cols-5 gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="品項名稱 (如: 麥當勞)"
                required
                className="col-span-3 bg-slate-800 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 transition-all border border-slate-700 placeholder:text-slate-500"
              />
              <div className="col-span-2 relative flex items-center">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="金額"
                  required
                  className="w-full bg-slate-800 text-white text-sm font-bold pl-3 pr-11 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 transition-all border border-slate-700 placeholder:text-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setCurrency(currency === 'USD' ? 'TWD' : 'USD')}
                  className="absolute right-1 text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-1 rounded-lg cursor-pointer select-none active:scale-95 transition-all"
                >
                  {currency}
                </button>
              </div>
            </div>

            {/* Live FX Calculation Preview */}
            {parsedAmount > 0 && (
              <div className="text-[11px] font-bold text-amber-300 px-1 font-mono">
                ≈ 約合 TWD ${liveTwdEst.toLocaleString()}
              </div>
            )}

            {/* Category Emoji Selector */}
            <div className="bg-slate-800/80 p-1.5 rounded-xl grid grid-cols-7 gap-1">
              {Object.keys(CATEGORY_EMOJIS).map((catEmoji) => {
                const isSelected = category === catEmoji;
                return (
                  <button
                    key={catEmoji}
                    type="button"
                    onClick={() => setCategory(catEmoji)}
                    className={`h-9 flex items-center justify-center text-base rounded-lg transition-all cursor-pointer ${
                      isSelected ? 'bg-amber-400 scale-105 shadow-xs' : 'hover:bg-slate-700/60'
                    }`}
                    title={CATEGORY_EMOJIS[catEmoji]}
                  >
                    {catEmoji}
                  </button>
                );
              })}
            </div>

            {/* PaidBy & Split Selector */}
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              {/* Paid By */}
              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">付款人</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaidBy('Jo')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paidBy === 'Jo' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Jo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidBy('Will')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paidBy === 'Will' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Will
                  </button>
                </div>
              </div>

              {/* Split */}
              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">分攤對象</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSplit('Both')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      split === 'Both' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    均分
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplit('Jo')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      split === 'Jo' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Jo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplit('Will')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      split === 'Will' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Will
                  </button>
                </div>
              </div>
            </div>

            {/* Note */}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="相關備註 (選填)..."
              className="w-full bg-slate-800 text-white text-xs px-3.5 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 transition-all border border-slate-700 placeholder:text-slate-500"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 rounded-xl transition-all active:scale-98 cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? '處理中...' : '送出記帳'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Expense History List */}
        <div className="md:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center justify-between">
            <span>費用明細 (共 {data.length} 筆)</span>
            <span className="font-mono text-slate-600">總計: ${Math.round(totalTWD).toLocaleString()} TWD</span>
          </h3>

          {data.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
              目前無記帳紀錄 💵
            </div>
          )}

          <div className="space-y-2">
            {data.map((exp) => {
              const isSettlement = exp.item && exp.item.includes('系統結清');
              const amt = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
              const amtTWD = exp.currency === 'USD' ? Math.round(amt * fxRate) : amt;

              return (
                <div
                  key={exp.rowIndex}
                  className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    isSettlement
                      ? 'bg-amber-50/60 border-amber-200/80'
                      : 'bg-white border-slate-100 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                    <span className="text-2xl select-none flex-shrink-0">
                      {exp.category || '🍔'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-x-2">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {exp.item}
                        </h4>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {exp.paidBy || 'Jo'} 付 ({exp.split === 'Both' || exp.split === '均分' ? '均分' : `${exp.split} 分擔`})
                        </span>
                      </div>
                      {exp.note && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{exp.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Amount & Delete */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-slate-900">
                        {exp.currency === 'USD' ? `$${amt} USD` : `$${amt} TWD`}
                      </div>
                      {exp.currency === 'USD' && (
                        <div className="text-[10px] font-bold font-mono text-slate-400">
                          ≈ ${amtTWD.toLocaleString()} TWD
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`確定要刪除「${exp.item}」這筆記帳嗎？`)) {
                          onDeleteExpense(exp.rowIndex);
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all cursor-pointer active:scale-90"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
