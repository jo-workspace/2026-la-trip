'use client';

import React from 'react';
import Link from 'next/link';
import { TRIPS } from '@/config/trips';
import { Compass, ArrowRight, Plus, MapPin } from 'lucide-react';

export default function HomePage() {
  const tripList = Object.values(TRIPS);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-amber-400 selection:text-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">
                Travel Hub
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Trip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tripList.map((trip) => (
            <Link
              key={trip.id}
              href={`/trip/${trip.id}`}
              className="group bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 transition-all duration-300 hover:border-amber-400/80 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900/90 text-amber-400 border border-amber-400/20 font-mono">
                    {trip.dates || '2026'}
                  </span>
                  <span className="text-xs font-bold text-slate-300 bg-slate-700/60 px-2.5 py-0.5 rounded-full">
                    {trip.badgeText}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>{trip.title}</span>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  {trip.description && (
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700/50 mt-6 flex items-center justify-between text-xs text-slate-400 font-semibold relative z-10">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>進入專屬助理</span>
                </span>
                <span className="text-amber-400 font-extrabold group-hover:underline">
                  開啟網頁 →
                </span>
              </div>
            </Link>
          ))}

          {/* Card 3: Create New Trip Guide */}
          <div className="bg-slate-900/40 border border-dashed border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-500 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Plus className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-lg font-extrabold text-white">建立新旅程</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                隨時複製這套範本，在設定檔加一行即可輕鬆上線下一個旅程！
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-medium">
        Travel Hub &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
