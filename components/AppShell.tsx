'use client';

import React, { useEffect, useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { initializeDatabase } from '@/lib/db';
import { registerServiceWorker } from '@/lib/pwa';
import { UserRole } from '@/lib/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('OWNER');
  const [isDbReady, setIsDbReady] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initialize IndexedDB seed data if first launch
    initializeDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error('Database initialization error:', err);
        setIsDbReady(true);
      });

    // 2. Register PWA Service Worker
    registerServiceWorker();
  }, []);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 p-1 animate-pulse flex items-center justify-center shadow-xl mb-4 shrink-0">
          <img
            src="/logo.png"
            alt="Big Bite Shawarma"
            width={64}
            height={64}
            style={{ maxWidth: '64px', maxHeight: '64px' }}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <h2 className="text-xl font-bold tracking-wide">BIG BITE SHAWARMA</h2>
        <p className="text-xs text-amber-400 font-semibold mt-1">Initializing Offline Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
        <Navigation currentRole={currentRole} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
