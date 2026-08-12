'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, UserCheck, Shield, Clock, Play, Flag } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '@/lib/pwa';
import { UserRole } from '@/lib/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PinModal from './PinModal';
import StartShiftModal from './StartShiftModal';
import EndShiftModal from './EndShiftModal';

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

  const [startShiftModalOpen, setStartShiftModalOpen] = useState<boolean>(false);
  const [endShiftModalOpen, setEndShiftModalOpen] = useState<boolean>(false);

  // Live Query Active Shift
  const activeShift = useLiveQuery(async () => {
    return await db.shifts.where('status').equals('active').first();
  }, []);

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
      setTargetRole('OWNER');
      setIsPinModalOpen(true);
    } else {
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 shadow-md shadow-brand-500/20 flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Big Bite Shawarma"
                width={40}
                height={40}
                style={{ maxWidth: '40px', maxHeight: '40px' }}
                className="w-10 h-10 object-contain rounded-[10px]"
                onError={(e) => {
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

          {/* Center Info - Clock, Network Status, & Shift Controls */}
          <div className="flex items-center gap-2">
            
            {/* Shift Status Indicator & Control Button */}
            {activeShift ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>SHIFT ACTIVE ({activeShift.staff})</span>
                </div>
                <button
                  onClick={() => setEndShiftModalOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-brand-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow hover:brightness-110 active:scale-95 transition"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>END SHIFT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>NO ACTIVE SHIFT</span>
                </div>
                <button
                  onClick={() => setStartShiftModalOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow hover:brightness-110 active:scale-95 transition"
                >
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                  <span>START SHIFT</span>
                </button>
              </div>
            )}

            {/* Online / Offline Status Badge */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-amber-950/80 text-amber-400 border-amber-800/80 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>OFFLINE</span>
                </>
              )}
            </div>

            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
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

      {/* Start Shift Modal */}
      {startShiftModalOpen && (
        <StartShiftModal
          onSuccess={() => setStartShiftModalOpen(false)}
          onClose={() => setStartShiftModalOpen(false)}
        />
      )}

      {/* End Shift Modal */}
      {endShiftModalOpen && activeShift && (
        <EndShiftModal
          shift={activeShift}
          onSuccess={() => setEndShiftModalOpen(false)}
          onClose={() => setEndShiftModalOpen(false)}
        />
      )}

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
