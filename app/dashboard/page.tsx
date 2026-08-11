'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatPHP, formatDate } from '@/lib/utils';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, PackageX, ArrowUpRight, Boxes } from 'lucide-react';
import RestockModal from '@/components/RestockModal';
import ExpenseModal from '@/components/ExpenseModal';

export default function DashboardPage() {
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedRestockId, setSelectedRestockId] = useState<string | undefined>();

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch Today's Sales
  const todaySales = useLiveQuery(async () => {
    return await db.sales.where('date').equals(todayStr).and(s => s.status === 'completed').toArray();
  }, [todayStr]) || [];

  // Fetch Today's Expenses
  const todayExpenses = useLiveQuery(async () => {
    return await db.expenses.where('date').equals(todayStr).toArray();
  }, [todayStr]) || [];

  // Fetch All Ingredients
  const ingredients = useLiveQuery(async () => {
    return await db.ingredients.toArray();
  }, []) || [];

  // Calculations
  const salesTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const ordersCount = todaySales.length;
  const itemsSoldCount = todaySales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0);
  }, 0);

  const cogsTotal = todaySales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => iSum + (item.cost * item.quantity), 0);
  }, 0);

  const expensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedProfit = salesTotal - cogsTotal - expensesTotal;

  // Stock Warnings
  const lowStockItems = ingredients.filter(i => i.currentQuantity > 0 && i.currentQuantity <= i.minimumStock);
  const outOfStockItems = ingredients.filter(i => i.currentQuantity <= 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Store Overview Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Real-time daily sales, inventory levels, &amp; profit calculations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/pos"
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>NEW POS SALE</span>
          </Link>
          <button
            onClick={() => {
              setSelectedRestockId(undefined);
              setRestockModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition"
          >
            <Boxes className="w-4 h-4" />
            <span>RESTOCK</span>
          </button>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition"
          >
            <DollarSign className="w-4 h-4" />
            <span>ADD EXPENSE</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Today&apos;s Sales
              </span>
              <span className="text-3xl font-black text-amber-400 tracking-tight mt-1 block">
                {formatPHP(salesTotal)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{ordersCount} orders</span> completed today
          </div>
        </div>

        {/* Orders & Items Sold */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Items Sold
              </span>
              <span className="text-3xl font-black text-slate-100 tracking-tight mt-1 block">
                {itemsSoldCount} <span className="text-sm font-bold text-slate-400">units</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            Across {ordersCount} completed tickets
          </div>
        </div>

        {/* Estimated Net Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Estimated Net Profit
              </span>
              <span className={`text-3xl font-black tracking-tight mt-1 block ${
                estimatedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatPHP(estimatedProfit)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">
            Sales - COGS ({formatPHP(cogsTotal)}) - Expenses ({formatPHP(expensesTotal)})
          </div>
        </div>

        {/* Expenses & Low Stock Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Stock Alerts
              </span>
              <span className="text-3xl font-black text-amber-400 tracking-tight mt-1 block">
                {lowStockItems.length + outOfStockItems.length} <span className="text-sm font-bold text-slate-400">items</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">
            {outOfStockItems.length} out of stock, {lowStockItems.length} low stock
          </div>
        </div>

      </div>

      {/* Stock Warnings Banner & Widgets */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Out of Stock Card */}
          {outOfStockItems.length > 0 && (
            <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm mb-3">
                <PackageX className="w-5 h-5" />
                <span>🔴 OUT OF STOCK ({outOfStockItems.length})</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {outOfStockItems.map(ing => (
                  <div key={ing.id} className="bg-slate-900/80 p-2.5 rounded-xl border border-red-900/50 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-100">{ing.name}</span>
                      <span className="text-slate-400 block text-[10px]">Supplier: {ing.supplier}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRestockId(ing.id);
                        setRestockModalOpen(true);
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Warning Card */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span>⚠ LOW STOCK WARNING ({lowStockItems.length})</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {lowStockItems.map(ing => (
                  <div key={ing.id} className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-900/50 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-100">{ing.name}</span>
                      <span className="text-amber-400 font-extrabold block text-[10px]">
                        Only {ing.currentQuantity} {ing.unit} remaining (Min: {ing.minimumStock} {ing.unit})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRestockId(ing.id);
                        setRestockModalOpen(true);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Today's Transactions Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base text-slate-100">Today&apos;s Transactions</h3>
          <Link
            href="/sales"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Sales</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {todaySales.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No sales recorded yet today. Click &quot;NEW POS SALE&quot; to make a sale!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Items Purchased</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {todaySales.slice(0, 5).map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-mono font-bold text-amber-400">{sale.id}</td>
                    <td className="p-3 text-slate-400">{formatDate(sale.timestamp)}</td>
                    <td className="p-3">
                      {sale.items.map(i => `${i.productName} (${i.variant.toUpperCase()}) x${i.quantity}`).join(', ')}
                    </td>
                    <td className="p-3 font-extrabold text-slate-100">{formatPHP(sale.totalAmount)}</td>
                    <td className="p-3 text-slate-400">{formatPHP(sale.paymentAmount)} (Change {formatPHP(sale.changeAmount)})</td>
                    <td className="p-3 font-medium text-slate-300">{sale.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock & Expense Modals */}
      {restockModalOpen && (
        <RestockModal
          ingredients={ingredients}
          preselectedIngredientId={selectedRestockId}
          onSuccess={() => setRestockModalOpen(false)}
          onClose={() => setRestockModalOpen(false)}
          staffName="Owner"
        />
      )}

      {expenseModalOpen && (
        <ExpenseModal
          onSuccess={() => setExpenseModalOpen(false)}
          onClose={() => setExpenseModalOpen(false)}
        />
      )}

    </div>
  );
}
