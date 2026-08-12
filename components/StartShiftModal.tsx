'use client';

import React, { useState } from 'react';
import { Play, X, User, Banknote } from 'lucide-react';
import { startNewShift } from '@/lib/db';
import { formatPHP } from '@/lib/utils';

interface StartShiftModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function StartShiftModal({ onSuccess, onClose }: StartShiftModalProps) {
  const [staffName, setStaffName] = useState<string>('Staff 1');
  const [startingCashStr, setStartingCashStr] = useState<string>('500');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const startingCashNum = parseFloat(startingCashStr) || 0;
  const floatPresets = [0, 300, 500, 1000];

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      setError('Staff / Cashier name is required');
      return;
    }
    if (isNaN(startingCashNum) || startingCashNum < 0) {
      setError('Enter a valid starting cash float (0 or greater)');
      return;
    }

    try {
      setIsSubmitting(true);
      await startNewShift(staffName.trim(), startingCashNum);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start shift';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Play className="w-6 h-6 ml-0.5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Start New Work Shift</h2>
            <p className="text-xs text-slate-400">Open register &amp; record opening cash float</p>
          </div>
        </div>

        <form onSubmit={handleStartShift} className="space-y-4">
          {/* Staff / Cashier Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Cashier / Staff Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Staff 1"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Opening Cash Float */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Opening Cash Float / Petty Cash (₱) *</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="500"
              value={startingCashStr}
              onChange={(e) => setStartingCashStr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-3 text-xl font-mono font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Starting cash change provided in the cash drawer at start of shift.
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400">Presets:</span>
            {floatPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setStartingCashStr(preset.toString())}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-bold border border-slate-700 transition"
              >
                {formatPHP(preset)}
              </button>
            ))}
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-extrabold text-base py-3.5 rounded-2xl shadow-xl hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 mt-4"
          >
            <Play className="w-5 h-5 ml-0.5" />
            <span>START SHIFT NOW</span>
          </button>
        </form>
      </div>
    </div>
  );
}
