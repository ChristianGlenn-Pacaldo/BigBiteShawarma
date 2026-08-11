'use client';

import React, { useState } from 'react';
import { DollarSign, X, Check } from 'lucide-react';
import { ExpenseCategory } from '@/lib/types';
import { db } from '@/lib/db';

interface ExpenseModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function ExpenseModal({ onSuccess, onClose }: ExpenseModalProps) {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const categories: ExpenseCategory[] = [
    'Electricity',
    'Water',
    'Rent',
    'Packaging',
    'Transportation',
    'Salaries',
    'Ingredients',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);

    if (!title.trim()) {
      setError('Expense title is required');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await db.expenses.add({
        id: `exp-${Date.now()}`,
        title: title.trim(),
        category,
        amount: amountNum,
        date,
        notes: notes.trim()
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save expense';
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
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Add Store Expense</h2>
            <p className="text-xs text-slate-400">Track utilities, rent, supplies, &amp; wages</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Expense Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Electricity Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount (₱) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Expense Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via Meralco online"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>SAVE EXPENSE RECORD</span>
          </button>
        </form>
      </div>
    </div>
  );
}
