'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Lock } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || '密碼錯誤，請再試一次');
        return;
      }
      const next = searchParams.get('next') || '/';
      router.push(next);
      router.refresh();
    } catch {
      setError('連線失敗，請再試一次');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black tracking-tight">Jo Travel Hub</h1>
          <p className="text-xs text-slate-400 font-medium">請輸入通行碼以繼續</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="通行碼"
              className="w-full bg-slate-900 border border-slate-700 text-sm text-white pl-10 pr-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? '驗證中...' : '進入旅程 Hub'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
