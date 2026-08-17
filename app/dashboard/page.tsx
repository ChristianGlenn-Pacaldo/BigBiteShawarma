'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatPHP, formatDate } from '@/lib/utils';
import { DollarSign, ShoppingBag, AlertTriangle, PackageX, ArrowUpRight, Boxes, Smartphone, Banknote, Play } from 'lucide-react';
import RestockModal from '@/components/RestockModal';
import StartShiftModal from '@/components/StartShiftModal';

export default function DashboardPage() {
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [selectedRestockId, setSelectedRestockId] = useState<string | undefined>();

  // Fetch Currently Active Shift
  const activeShift = useLiveQuery(async () => {
    return await db.shifts.where('status').equals('active').first();
  }, []);

  // Fetch Active Shift Sales (If shift active, otherwise empty array -> metrics reset to 0)
  const currentShiftSales = useLiveQuery(async () => {
    if (!activeShift) return [];
    return await db.sales
      .where('timestamp')
      .aboveOrEqual(activeShift.startTime)
      .and(s => s.status === 'completed')
      .toArray();
  }, [activeShift?.startTime]) || [];

  // Fetch All Ingredients for Stock Warnings
  const ingredients = useLiveQuery(async () => {
    return await db.ingredients.toArray();
  }, []) || [];

  // Shift-Scoped Calculations
  const salesTotal = currentShiftSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const ordersCount = currentShiftSales.length;
  const itemsSoldCount = currentShiftSales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0);
  }, 0);

  const gcashSalesToday = currentShiftSales
    .filter(s => s.paymentMethod === 'gcash')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const gcashOrdersCount = currentShiftSales.filter(s => s.paymentMethod === 'gcash').length;

  const cashSalesToday = currentShiftSales
    .filter(s => s.paymentMethod === 'cash' || !s.paymentMethod)
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const cashOrdersCount = currentShiftSales.filter(s => s.paymentMethod === 'cash' || !s.paymentMethod).length;

  // Stock Warnings
  const lowStockItems = ingredients.filter(i => i.currentQuantity > 0 && i.currentQuantity <= i.minimumStock);
  const outOfStockItems = ingredients.filter(i => i.currentQuantity <= 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Store Overview Dashboard
            </h2>
            {activeShift ? (
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>SHIFT ACTIVE ({activeShift.staff})</span>
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                NO ACTIVE SHIFT
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Active shift sales, Cash &amp; GCash payments, &amp; inventory level tracking
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {activeShift ? (
            <Link
              href="/pos"
              className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>NEW POS SALE</span>
            </Link>
          ) : (
            <button
              onClick={() => setStartShiftModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <Play className="w-4 h-4 ml-0.5" />
              <span>START NEW SHIFT</span>
            </button>
          )}

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
        </div>
      </div>

      {/* No Active Shift Notice Banner */}
      {!activeShift && (
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100">No Shift Currently Active</h3>
              <p className="text-xs text-slate-400">
                Dashboard metrics reset to ₱0 after ending a shift. Start a new shift to record sales!
              </p>
            </div>
          </div>
          <button
            onClick={() => setStartShiftModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition shrink-0"
          >
            START SHIFT NOW
          </button>
        </div>
      )}

      {/* KPI Cards Grid (Reflects Active Shift Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Shift Total Sales Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Shift Total Sales
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
            <span className="text-emerald-400 font-bold">{ordersCount} orders</span> completed in shift
          </div>
        </div>

        {/* Shift Cash Sales Card */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span>Shift Cash Sales</span>
              </span>
              <span className="text-3xl font-black text-emerald-400 tracking-tight mt-1 block">
                {formatPHP(cashSalesToday)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>{cashOrdersCount} Cash {cashOrdersCount === 1 ? 'order' : 'orders'}</span>
            <span className="text-emerald-400 font-bold">Physical Cash</span>
          </div>
        </div>

        {/* Shift GCash Sales Card */}
        <div className="bg-slate-900 border border-blue-900/60 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <span>Shift GCash Sales</span>
              </span>
              <span className="text-3xl font-black text-blue-400 tracking-tight mt-1 block">
                {formatPHP(gcashSalesToday)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>{gcashOrdersCount} GCash {gcashOrdersCount === 1 ? 'order' : 'orders'}</span>
            <span className="text-blue-400 font-bold">Digital Payments</span>
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

      {/* Active Shift Transactions Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-100">
              {activeShift ? 'Active Shift Transactions' : 'Recent Transactions'}
            </h3>
            {activeShift && (
              <p className="text-[11px] text-slate-400">
                Displaying orders completed during shift #{activeShift.id} ({activeShift.staff})
              </p>
            )}
          </div>
          <Link
            href="/sales"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Sales</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {currentShiftSales.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs space-y-2">
            <p>
              {activeShift
                ? 'No sales recorded yet during this active shift.'
                : 'No active shift in progress. Start a shift to begin recording sales!'}
            </p>
            {!activeShift && (
              <button
                onClick={() => setStartShiftModalOpen(true)}
                className="bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg shadow hover:bg-amber-400 transition"
              >
                Start Shift
              </button>
            )}
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
                {currentShiftSales.slice(0, 5).map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-mono font-bold text-amber-400">{sale.id}</td>
                    <td className="p-3 text-slate-400">{formatDate(sale.timestamp)}</td>
                    <td className="p-3">
                      {sale.items.map(i => `${i.productName} (${i.variant.toUpperCase()}) x${i.quantity}`).join(', ')}
                    </td>
                    <td className="p-3 font-extrabold text-slate-100">{formatPHP(sale.totalAmount)}</td>
                    <td className="p-3">
                      {sale.paymentMethod === 'gcash' ? (
                        <div className="space-y-0.5">
                          <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            <span>GCash ({formatPHP(sale.paymentAmount)})</span>
                          </span>
                          {sale.gcashRef && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Ref: #{sale.gcashRef}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                          <Banknote className="w-3 h-3" />
                          <span>Cash ({formatPHP(sale.paymentAmount)})</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-300">{sale.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Start Shift Modal */}
      {startShiftModalOpen && (
        <StartShiftModal
          onSuccess={() => setStartShiftModalOpen(false)}
          onClose={() => setStartShiftModalOpen(false)}
        />
      )}

      {/* Restock Modal */}
      {restockModalOpen && (
        <RestockModal
          ingredients={ingredients}
          preselectedIngredientId={selectedRestockId}
          onSuccess={() => setRestockModalOpen(false)}
          onClose={() => setRestockModalOpen(false)}
          staffName="Owner"
        />
      )}

    </div>
  );
}
