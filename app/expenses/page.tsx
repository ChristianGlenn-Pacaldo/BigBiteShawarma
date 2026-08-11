'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatPHP, formatDateOnly } from '@/lib/utils';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import ExpenseModal from '@/components/ExpenseModal';

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const expenses = useLiveQuery(async () => {
    return await db.expenses.orderBy('date').reverse().toArray();
  }, []) || [];

  const categories = ['All', 'Electricity', 'Water', 'Rent', 'Packaging', 'Transportation', 'Salaries', 'Ingredients', 'Other'];

  const filteredExpenses = expenses.filter(e => selectedCategory === 'All' || e.category === selectedCategory);
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDeleteExpense = async (id: string, title: string) => {
    if (confirm(`Delete expense record "${title}"?`)) {
      await db.expenses.delete(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Store Expense Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Record utilities, rent, supplies, wages, &amp; operational costs for profit calculation
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EXPENSE RECORD</span>
        </button>
      </div>

      {/* Expense KPI Banner & Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Recorded Expenses
            </span>
            <span className="text-3xl font-black text-emerald-400 tracking-tight mt-1 block">
              {formatPHP(totalExpensesAmount)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center overflow-x-auto">
          <div className="flex items-center gap-1.5 w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-400" />
            <p className="text-sm font-semibold text-slate-400">No expenses recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Expense Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-3 text-slate-400 font-medium">{formatDateOnly(exp.date)}</td>
                    <td className="p-3 font-extrabold text-slate-100">{exp.title}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-emerald-400 text-sm">{formatPHP(exp.amount)}</td>
                    <td className="p-3 text-slate-400">{exp.notes || '-'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        className="bg-slate-800 hover:bg-red-950 hover:border-red-800 text-slate-400 hover:text-red-400 p-2 rounded-xl border border-slate-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <ExpenseModal
          onSuccess={() => setIsModalOpen(false)}
          onClose={() => setIsModalOpen(false)}
        />
      )}

    </div>
  );
}
