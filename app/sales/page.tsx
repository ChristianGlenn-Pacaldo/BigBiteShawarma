'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Sale } from '@/lib/types';
import { formatPHP, formatDate } from '@/lib/utils';
import { Receipt, Search, Printer, RotateCcw, CheckCircle, AlertOctagon } from 'lucide-react';
import ReceiptModal from '@/components/ReceiptModal';
import VoidModal from '@/components/VoidModal';

export default function SalesHistoryPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'voided'>('all');
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);
  const [selectedVoidSale, setSelectedVoidSale] = useState<Sale | null>(null);

  const sales = useLiveQuery(async () => {
    return await db.sales.orderBy('timestamp').reverse().toArray();
  }, []) || [];

  const filteredSales = sales.filter(s => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch = 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Sales & Transaction History Log
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Search completed orders, reprint receipts, or void transactions with automatic inventory reversal
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
          {(['all', 'completed', 'voided'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status} Sales
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search order ID or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
            <p className="text-sm font-semibold text-slate-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Items Purchased</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Cash / Change</th>
                  <th className="p-3">Staff</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">{sale.id}</td>
                    <td className="p-3 text-slate-400">{formatDate(sale.timestamp)}</td>
                    <td className="p-3">
                      {sale.items.map((i, idx) => (
                        <div key={idx} className="text-slate-200 font-medium">
                          {i.productName} ({i.variant.toUpperCase()}) x{i.quantity} @ {formatPHP(i.unitPrice)}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 font-extrabold text-slate-100 text-sm">{formatPHP(sale.totalAmount)}</td>
                    <td className="p-3 text-slate-400">
                      Paid: {formatPHP(sale.paymentAmount)} <br />
                      <span className="text-[10px] text-slate-500">Change: {formatPHP(sale.changeAmount)}</span>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">{sale.staff}</td>
                    <td className="p-3">
                      {sale.status === 'completed' ? (
                        <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="bg-red-950/80 text-red-400 border border-red-800/80 text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                          <AlertOctagon className="w-3 h-3" />
                          <span>Voided ({sale.voidReason || 'Cancelled'})</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReceiptSale(sale)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 p-2 rounded-xl border border-slate-700 transition"
                          title="View / Reprint Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {sale.status === 'completed' && (
                          <button
                            onClick={() => setSelectedVoidSale(sale)}
                            className="bg-slate-800 hover:bg-red-950 hover:border-red-800 text-slate-400 hover:text-red-400 p-2 rounded-xl border border-slate-700 transition"
                            title="Void / Refund Sale"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceiptSale && (
        <ReceiptModal
          sale={selectedReceiptSale}
          onNewSale={() => setSelectedReceiptSale(null)}
          onClose={() => setSelectedReceiptSale(null)}
        />
      )}

      {/* Void Modal */}
      {selectedVoidSale && (
        <VoidModal
          sale={selectedVoidSale}
          staffName="Owner"
          onSuccess={() => setSelectedVoidSale(null)}
          onClose={() => setSelectedVoidSale(null)}
        />
      )}

    </div>
  );
}
