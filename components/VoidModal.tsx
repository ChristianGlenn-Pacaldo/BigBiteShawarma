'use client';

import React, { useState } from 'react';
import { AlertOctagon, X, RotateCcw } from 'lucide-react';
import { Sale } from '@/lib/types';
import { voidSaleTransaction } from '@/lib/db';
import { formatPHP } from '@/lib/utils';

interface VoidModalProps {
  sale: Sale;
  staffName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function VoidModal({ sale, staffName, onSuccess, onClose }: VoidModalProps) {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for voiding this transaction');
      return;
    }

    try {
      setIsSubmitting(true);
      await voidSaleTransaction(sale.id, reason.trim(), staffName);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to void transaction');
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
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Void / Refund Sale</h2>
            <p className="text-xs text-slate-400">Order {sale.id} • {formatPHP(sale.totalAmount)}</p>
          </div>
        </div>

        <div className="bg-amber-950/40 border border-amber-800/40 p-3.5 rounded-2xl mb-4 text-xs text-amber-300 leading-relaxed">
          ⚠ <strong>Automatic Inventory Restoration:</strong> Voiding this sale will revert the transaction and automatically return deducted ingredients back to current stock.
        </div>

        <form onSubmit={handleVoid} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Reason for Voiding *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Customer changed mind, wrong item selected"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-red-500 font-medium"
              required
            />
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Confirm Void</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
