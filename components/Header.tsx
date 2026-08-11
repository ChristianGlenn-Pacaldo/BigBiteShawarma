'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, UserCheck, Shield, Clock } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '@/lib/pwa';
import { UserRole } from '@/lib/types';
import PinModal from './PinModal';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  const isOnline = useOnlineStatus();
  const { isInstallable, triggerInstall } = usePWAInstall();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('OWNER');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleToggle = () => {
    if (currentRole === 'STAFF') {
      // Switching to OWNER requires PIN
      setTargetRole('OWNER');
      setIsPinModalOpen(true);
    } else {
      // Switching back to STAFF directly allowed
      onRoleChange('STAFF');
    }
  };

  const handlePinSuccess = () => {
    onRoleChange(targetRole);
    setIsPinModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 shadow-md shadow-brand-500/20 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Big Bite Shawarma"
                className="w-full h-full object-cover rounded-[10px]"
                onError={(e) => {
                  // Fallback icon if image loading
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-white via-amber-200 to-brand-400 bg-clip-text text-transparent">
                  BIG BITE SHAWARMA
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  POS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Love at First Bite • Offline-First System
              </p>
            </div>
          </div>

          {/* Center Info - Clock & Network Status */}
          <div className="flex items-center gap-3">
            {/* Online / Offline Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-amber-950/80 text-amber-400 border-amber-800/80 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">ONLINE (OFFLINE-READY)</span>
                  <span className="sm:hidden">ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>OFFLINE MODE</span>
                </>
              )}
            </div>

            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Right Controls - Install PWA & Role Switcher */}
          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={triggerInstall}
                className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* Role Switcher */}
            <button
              onClick={handleRoleToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                currentRole === 'OWNER'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {currentRole === 'OWNER' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>OWNER</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>STAFF</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Owner PIN Verification Modal */}
      {isPinModalOpen && (
        <PinModal
          title="Owner Verification Required"
          subtitle="Enter Owner PIN (Default: 1234) to switch role"
          targetRole="OWNER"
          onSuccess={handlePinSuccess}
          onClose={() => setIsPinModalOpen(false)}
        />
      )}
    </>
  );
}
