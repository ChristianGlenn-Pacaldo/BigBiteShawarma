'use client';

import React, { useState } from 'react';
import { Banknote, X, Delete, ArrowRight, User, Smartphone, Plus } from 'lucide-react';
import { formatPHP } from '@/lib/utils';
import { CartItem } from '@/lib/types';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  cart?: CartItem[];
  totalAmount: number;
  initialMethod?: 'cash' | 'gcash';
  onCompleteSale: (
    paymentAmount: number,
    changeAmount: number,
    staffName: string,
    paymentMethod: 'cash' | 'gcash',
    gcashRef?: string
  ) => Promise<void>;
  onClose: () => void;
}

export default function PaymentModal({
  totalAmount,
  initialMethod = 'cash',
  onCompleteSale,
  onClose,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>(initialMethod);
  const [paymentStr, setPaymentStr] = useState<string>(
    initialMethod === 'gcash' ? totalAmount.toString() : ''
  );
  const [gcashRef, setGcashRef] = useState<string>('');
  const [staffName, setStaffName] = useState<string>('Staff 1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const paymentNum = parseFloat(paymentStr) || 0;
  const changeNum = Math.max(0, paymentNum - totalAmount);
  const isEnough = paymentNum >= totalAmount;

  const presetBills = [100, 200, 500, 1000, totalAmount];

  const handleNumpadPress = (val: string) => {
    setError('');
    if (val === '.') {
      if (!paymentStr.includes('.')) {
        setPaymentStr(prev => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      setPaymentStr(prev => prev + val);
    }
  };

  const handlePresetSelect = (amount: number) => {
    setError('');
    setPaymentStr(amount.toString());
  };

  const handleBackspace = () => {
    setError('');
    setPaymentStr(prev => prev.slice(0, -1));
  };

  const handleMethodSwitch = (method: 'cash' | 'gcash') => {
    setPaymentMethod(method);
    setError('');
    if (method === 'gcash' && (!paymentStr || parseFloat(paymentStr) === 0)) {
      setPaymentStr(totalAmount.toString());
    }
  };

  const handleFormSubmit = async () => {
    if (!isEnough) {
      setError(`Payment amount is short by ${formatPHP(totalAmount - paymentNum)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      await onCompleteSale(paymentNum, changeNum, staffName, paymentMethod, gcashRef.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete sale transaction';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  const isGcash = paymentMethod === 'gcash';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors ${
            isGcash
              ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
              : 'bg-brand-500/20 text-brand-400 border-brand-500/30'
          }`}>
            {isGcash ? <Smartphone className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>{isGcash ? 'GCash Mobile Payment' : 'Cash Payment'}</span>
              {isGcash && (
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  GCash
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">Complete sale &amp; record payment transaction</p>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleMethodSwitch('cash')}
            className={`py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
              !isGcash
                ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>💵 CASH PAYMENT</span>
          </button>

          <button
            type="button"
            onClick={() => handleMethodSwitch('gcash')}
            className={`py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
              isGcash
                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>💙 GCASH PAYMENT</span>
          </button>
        </div>

        {/* Amount Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Due
            </span>
            <span className="text-2xl font-black text-white">{formatPHP(totalAmount)}</span>
          </div>

          <div className={`p-4 rounded-2xl border transition ${
            isEnough 
              ? isGcash
                ? 'bg-blue-950/40 border-blue-800/80 text-blue-400'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400' 
              : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
          }`}>
            <span className="text-xs font-semibold uppercase tracking-wider block mb-1">
              {isGcash ? 'Change / Overpay' : 'Change'}
            </span>
            <span className="text-2xl font-black">{formatPHP(changeNum)}</span>
          </div>
        </div>

        {/* GCash Reference Number Input (If GCash active) */}
        {isGcash && (
          <div className="mb-4 bg-blue-950/40 border border-blue-800/50 p-3.5 rounded-2xl">
            <label className="block text-xs font-extrabold text-blue-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-400" />
                GCash Reference / Txn No. (Optional):
              </span>
              <span className="text-[10px] text-blue-400 font-medium">e.g. 10092384729</span>
            </label>
            <input
              type="text"
              placeholder="Enter GCash Ref No. / Txn ID"
              value={gcashRef}
              onChange={(e) => setGcashRef(e.target.value)}
              className="w-full bg-slate-900 border border-blue-700/60 rounded-xl py-2 px-3 text-xs text-blue-100 font-mono font-bold focus:outline-none focus:border-blue-400 placeholder:text-slate-600"
            />
          </div>
        )}

        {/* Staff Selector */}
        <div className="flex items-center gap-2 mb-4 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
          <User className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-400">Cashier / Staff:</span>
          <input
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500 flex-1"
          />
        </div>

        {/* Quick Amount Preset Buttons */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400">Quick Amount Presets:</span>
            <button
              type="button"
              onClick={() => handlePresetSelect(totalAmount)}
              className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
            >
              <Plus className="w-3 h-3" />
              <span>Exact Amount ({formatPHP(totalAmount)})</span>
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {presetBills.map((bill, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(bill)}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 border ${
                  isGcash
                    ? 'bg-slate-800 hover:bg-blue-600/20 hover:border-blue-500/50 text-blue-300 border-slate-700'
                    : 'bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/50 text-amber-300 border-slate-700'
                }`}
              >
                {bill === totalAmount ? 'Exact' : `₱${bill}`}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Keypad */}
        <div className="mb-6">
          <div className="relative mb-3">
            <input
              type="text"
              readOnly
              placeholder="₱0.00"
              value={paymentStr ? formatPHP(paymentNum) : ''}
              className={`w-full bg-slate-950 border-2 rounded-2xl py-3 px-4 text-right text-2xl font-black tracking-wider focus:outline-none ${
                isGcash
                  ? 'border-blue-500/60 text-blue-400'
                  : 'border-brand-500/40 text-amber-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                onClick={() => handleNumpadPress(num)}
                className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-xl font-bold text-slate-100 border border-slate-700/60 shadow active:scale-95 transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumpadPress('.')}
              className="h-12 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-lg font-bold text-slate-300 border border-slate-700/60"
            >
              .
            </button>
            <button
              onClick={() => handleNumpadPress('0')}
              className="h-12 bg-slate-800 hover:bg-slate-700 rounded-xl text-xl font-bold text-slate-100 border border-slate-700/60"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-12 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700/60 flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="text-center text-xs font-semibold text-red-400 mb-4 bg-red-950/60 border border-red-800/60 p-2.5 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleFormSubmit}
          disabled={!isEnough || isSubmitting}
          className={`w-full text-white font-extrabold text-lg py-4 rounded-2xl shadow-xl transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 ${
            isGcash
              ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 shadow-blue-600/30 hover:brightness-110'
              : 'bg-gradient-to-r from-brand-600 via-amber-500 to-amber-600 shadow-brand-600/30 hover:brightness-110'
          }`}
        >
          {isSubmitting ? (
            <span>Processing {isGcash ? 'GCash' : 'Cash'} Sale...</span>
          ) : (
            <>
              <span>COMPLETE {isGcash ? 'GCASH' : 'CASH'} SALE</span>
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
