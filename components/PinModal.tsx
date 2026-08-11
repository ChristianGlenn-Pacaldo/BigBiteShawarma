'use client';

import React, { useState } from 'react';
import { Lock, Delete, X, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';

interface PinModalProps {
  title?: string;
  subtitle?: string;
  targetRole?: UserRole;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PinModal({
  title = 'Enter Security PIN',
  subtitle = 'Security verification required for this action',
  onSuccess,
  onClose,
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const settings = useLiveQuery(async () => {
    const list = await db.settings.toArray();
    return list[0];
  }, []);

  const ownerPin = settings?.ownerPin || '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === ownerPin) {
      onSuccess();
    } else {
      setError('Incorrect PIN. Default Owner PIN is 1234');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        {/* PIN dots display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? 'bg-amber-400 border-amber-500 scale-110 shadow-lg shadow-amber-500/50'
                  : 'border-slate-700 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-center text-xs text-red-400 font-semibold mb-4 bg-red-950/50 border border-red-800/50 p-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-xl font-bold text-slate-100 border border-slate-700/60 shadow transition active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="h-14 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-400 border border-slate-700/60 flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-xl font-bold text-slate-100 border border-slate-700/60 shadow transition active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700/60 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={pin.length === 0}
          className="w-full bg-gradient-to-r from-brand-600 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>Confirm PIN</span>
        </button>
      </div>
    </div>
  );
}
