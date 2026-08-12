'use client';

import React, { useState } from 'react';
import { Flag, X, Printer, Check, Smartphone, Banknote } from 'lucide-react';
import { Shift } from '@/lib/types';
import { endActiveShift, db } from '@/lib/db';
import { formatPHP, formatDate } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';

interface EndShiftModalProps {
  shift: Shift;
  onSuccess: () => void;
  onClose: () => void;
}

export default function EndShiftModal({ shift, onSuccess, onClose }: EndShiftModalProps) {
  const [actualCashStr, setActualCashStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const settings = useLiveQuery(async () => {
    const list = await db.settings.toArray();
    return list[0];
  }, []);

  const storeName = settings?.storeName || 'BIG BITE SHAWARMA';

  // Live Query Sales during shift
  const shiftSales = useLiveQuery(async () => {
    return await db.sales
      .where('timestamp')
      .aboveOrEqual(shift.startTime)
      .and(s => s.status === 'completed')
      .toArray();
  }, [shift.startTime]) || [];

  // Live Query Expenses during shift
  const shiftExpenses = useLiveQuery(async () => {
    return await db.expenses
      .where('date')
      .aboveOrEqual(shift.startTime.split('T')[0])
      .toArray();
  }, [shift.startTime]) || [];

  // Calculations
  const cashSales = shiftSales
    .filter(s => s.paymentMethod === 'cash' || !s.paymentMethod)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const gcashSales = shiftSales
    .filter(s => s.paymentMethod === 'gcash')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const grossSales = cashSales + gcashSales;

  const totalExpenses = shiftExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expectedCashInDrawer = shift.startingCash + cashSales - totalExpenses;

  const actualCashNum = parseFloat(actualCashStr) || 0;
  const discrepancy = actualCashNum - expectedCashInDrawer;

  const itemsSold = shiftSales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0);
  }, 0);

  const handlePrintZReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleEndShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualCashStr) {
      setError('Please enter the actual physical cash counted in drawer');
      return;
    }
    if (isNaN(actualCashNum) || actualCashNum < 0) {
      setError('Enter a valid physical cash count');
      return;
    }

    try {
      setIsSubmitting(true);
      await endActiveShift(shift.id, actualCashNum, notes.trim());
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to end shift';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[95vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">End Work Shift &amp; Z-Report</h2>
            <p className="text-xs text-slate-400">
              Shift #{shift.id} • Cashier: <strong className="text-amber-400">{shift.staff}</strong>
            </p>
          </div>
        </div>

        {/* Scrollable Summary & Z-Report Content */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          
          {/* Shift Financial Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opening Float</span>
              <span className="text-lg font-black text-slate-100 block">{formatPHP(shift.startingCash)}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                <Banknote className="w-3 h-3" /> Cash Sales
              </span>
              <span className="text-lg font-black text-emerald-400 block">{formatPHP(cashSales)}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> GCash Sales
              </span>
              <span className="text-lg font-black text-blue-400 block">{formatPHP(gcashSales)}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Gross Sales</span>
              <span className="text-lg font-black text-amber-400 block">{formatPHP(grossSales)}</span>
            </div>
          </div>

          {/* Expected Cash vs Cash Count Audit */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold">Expected Cash in Drawer:</span>
              <span className="font-extrabold text-slate-100 font-mono text-sm">{formatPHP(expectedCashInDrawer)}</span>
            </div>

            <form onSubmit={handleEndShiftSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Actual Cash Counted in Drawer (₱) *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter counted physical cash..."
                  value={actualCashStr}
                  onChange={(e) => setActualCashStr(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-amber-500/50 rounded-xl py-2.5 px-3 text-lg font-mono font-black text-amber-300 focus:outline-none"
                  required
                />
              </div>

              {/* Live Discrepancy Status */}
              {actualCashStr !== '' && (
                <div className={`p-2.5 rounded-xl border text-xs font-bold flex justify-between items-center ${
                  discrepancy === 0
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                    : discrepancy > 0
                    ? 'bg-blue-950/60 text-blue-400 border-blue-800/80'
                    : 'bg-red-950/60 text-red-400 border-red-800/80'
                }`}>
                  <span>Cash Drawer Audit:</span>
                  <span>
                    {discrepancy === 0
                      ? '✓ Exact (No Discrepancy)'
                      : discrepancy > 0
                      ? `+${formatPHP(discrepancy)} OVER`
                      : `${formatPHP(discrepancy)} SHORTAGE`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Shift Notes / Store Closing Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. All products sold out! Store closed."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-200"
                />
              </div>

              {error && (
                <div className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 p-2.5 rounded-xl">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintZReport}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-3 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT Z-REPORT</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-red-600 to-brand-600 text-white font-extrabold py-3 rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>COMPLETE &amp; END SHIFT</span>
                </button>
              </div>
            </form>
          </div>

          {/* Printable Thermal Z-Report Ticket (Hidden on Screen, Visible on Print) */}
          <div className="pt-2">
            <span className="text-[11px] font-extrabold text-slate-400 block mb-2">Printable Z-Report Preview:</span>
            <div
              id="printable-zreport"
              className="bg-white text-black p-5 rounded-2xl font-mono text-xs shadow-inner mx-auto max-w-[320px] leading-relaxed"
            >
              <div className="text-center pb-2 border-b border-dashed border-gray-400">
                <h2 className="font-extrabold text-base tracking-wider uppercase">{storeName}</h2>
                <p className="text-[11px] text-gray-700 font-bold uppercase mt-0.5">*** DAILY Z-REPORT ***</p>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Shift ID:</span>
                  <span>{shift.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{shift.staff}</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Time:</span>
                  <span>{formatDate(shift.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>End Time:</span>
                  <span>{formatDate(new Date().toISOString())}</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>OPENING FLOAT:</span>
                  <span>{formatPHP(shift.startingCash)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>CASH SALES:</span>
                  <span>{formatPHP(cashSales)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>GCASH SALES:</span>
                  <span>{formatPHP(gcashSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EXPENSES:</span>
                  <span>-{formatPHP(totalExpenses)}</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 font-bold">
                <div className="flex justify-between text-sm">
                  <span>GROSS SALES:</span>
                  <span>{formatPHP(grossSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EXPECTED CASH:</span>
                  <span>{formatPHP(expectedCashInDrawer)}</span>
                </div>
                {actualCashStr !== '' && (
                  <>
                    <div className="flex justify-between">
                      <span>ACTUAL CASH:</span>
                      <span>{formatPHP(actualCashNum)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DISCREPANCY:</span>
                      <span>{discrepancy >= 0 ? `+${formatPHP(discrepancy)}` : formatPHP(discrepancy)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-[11px] text-gray-700">
                  <span>ITEMS SOLD:</span>
                  <span>{itemsSold} units</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-gray-600">
                <p>Z-REPORT CLOSE SUMMARY</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
