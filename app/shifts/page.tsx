'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Shift } from '@/lib/types';
import { formatPHP, formatDate } from '@/lib/utils';
import { Flag, Search, Printer, Play, Smartphone, Banknote } from 'lucide-react';
import StartShiftModal from '@/components/StartShiftModal';
import EndShiftModal from '@/components/EndShiftModal';

export default function ShiftsLogPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [selectedShiftForPrint, setSelectedShiftForPrint] = useState<Shift | null>(null);
  
  const [startShiftModalOpen, setStartShiftModalOpen] = useState<boolean>(false);
  const [endShiftModalOpen, setEndShiftModalOpen] = useState<boolean>(false);

  // Live Query Shifts
  const shifts = useLiveQuery(async () => {
    return await db.shifts.orderBy('startTime').reverse().toArray();
  }, []) || [];

  const activeShift = shifts.find(s => s.status === 'active');

  const filteredShifts = shifts.filter(s => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staff.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handlePrintZReport = (shift: Shift) => {
    setSelectedShiftForPrint(shift);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Work Shifts &amp; Z-Report Audit Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Track daily store shifts, opening cash floats, Cash vs GCash revenue, cash drawer audits, &amp; Z-Reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeShift ? (
            <button
              onClick={() => setEndShiftModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-brand-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <Flag className="w-4 h-4" />
              <span>END ACTIVE SHIFT (Z-REPORT)</span>
            </button>
          ) : (
            <button
              onClick={() => setStartShiftModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <Play className="w-4 h-4 ml-0.5" />
              <span>START NEW SHIFT</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
          {(['all', 'active', 'closed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status} Shifts
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Shift ID or Staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        {filteredShifts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Flag className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
            <p className="text-sm font-semibold text-slate-400">No shifts recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-3">Shift ID</th>
                  <th className="p-3">Cashier / Staff</th>
                  <th className="p-3">Start Time</th>
                  <th className="p-3">End Time</th>
                  <th className="p-3">Opening Float</th>
                  <th className="p-3">Cash Sales</th>
                  <th className="p-3">GCash Sales</th>
                  <th className="p-3">Total Sales</th>
                  <th className="p-3">Drawer Audit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Z-Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredShifts.map(shift => {
                  const isClosed = shift.status === 'closed';

                  return (
                    <tr key={shift.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-3 font-mono font-bold text-amber-400">{shift.id}</td>
                      <td className="p-3 font-extrabold text-slate-100">{shift.staff}</td>
                      <td className="p-3 text-slate-400">{formatDate(shift.startTime)}</td>
                      <td className="p-3 text-slate-400">
                        {shift.endTime ? formatDate(shift.endTime) : '-'}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200">{formatPHP(shift.startingCash)}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">
                        <div className="flex items-center gap-1">
                          <Banknote className="w-3 h-3" />
                          <span>{formatPHP(shift.cashSales)}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-blue-400 font-bold">
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          <span>{formatPHP(shift.gcashSales)}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-black text-amber-400 text-sm">{formatPHP(shift.totalSales)}</td>
                      <td className="p-3">
                        {isClosed && shift.discrepancy !== undefined ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            shift.discrepancy === 0
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : shift.discrepancy > 0
                              ? 'bg-blue-950 text-blue-400 border-blue-800'
                              : 'bg-red-950 text-red-400 border-red-800'
                          }`}>
                            {shift.discrepancy === 0
                              ? 'Exact'
                              : shift.discrepancy > 0
                              ? `+${formatPHP(shift.discrepancy)} Over`
                              : `${formatPHP(shift.discrepancy)} Short`}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] italic">In Progress</span>
                        )}
                      </td>
                      <td className="p-3">
                        {shift.status === 'active' ? (
                          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase w-fit block">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handlePrintZReport(shift)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 p-2 rounded-xl border border-slate-700 transition"
                          title="Print Z-Report Ticket"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* End Shift Modal */}
      {endShiftModalOpen && activeShift && (
        <EndShiftModal
          shift={activeShift}
          onSuccess={() => setEndShiftModalOpen(false)}
          onClose={() => setEndShiftModalOpen(false)}
        />
      )}

      {/* Hidden Z-Report Print Area for past shift reprint */}
      {selectedShiftForPrint && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-5 font-mono text-xs">
          <div className="text-center pb-2 border-b border-dashed border-gray-400">
            <h2 className="font-extrabold text-base tracking-wider uppercase">BIG BITE SHAWARMA</h2>
            <p className="text-[11px] text-gray-700 font-bold uppercase mt-0.5">*** DAILY Z-REPORT ***</p>
          </div>

          <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Shift ID:</span>
              <span>{selectedShiftForPrint.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{selectedShiftForPrint.staff}</span>
            </div>
            <div className="flex justify-between">
              <span>Start Time:</span>
              <span>{formatDate(selectedShiftForPrint.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>End Time:</span>
              <span>{selectedShiftForPrint.endTime ? formatDate(selectedShiftForPrint.endTime) : '-'}</span>
            </div>
          </div>

          <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>OPENING FLOAT:</span>
              <span>{formatPHP(selectedShiftForPrint.startingCash)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>CASH SALES:</span>
              <span>{formatPHP(selectedShiftForPrint.cashSales)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>GCASH SALES:</span>
              <span>{formatPHP(selectedShiftForPrint.gcashSales)}</span>
            </div>
            <div className="flex justify-between">
              <span>EXPENSES:</span>
              <span>-{formatPHP(selectedShiftForPrint.totalExpenses)}</span>
            </div>
          </div>

          <div className="py-2 border-b border-dashed border-gray-400 space-y-1 font-bold">
            <div className="flex justify-between text-sm">
              <span>GROSS SALES:</span>
              <span>{formatPHP(selectedShiftForPrint.totalSales)}</span>
            </div>
            {selectedShiftForPrint.expectedCash !== undefined && (
              <div className="flex justify-between">
                <span>EXPECTED CASH:</span>
                <span>{formatPHP(selectedShiftForPrint.expectedCash)}</span>
              </div>
            )}
            {selectedShiftForPrint.endingCashActual !== undefined && (
              <div className="flex justify-between">
                <span>ACTUAL CASH:</span>
                <span>{formatPHP(selectedShiftForPrint.endingCashActual)}</span>
              </div>
            )}
            {selectedShiftForPrint.discrepancy !== undefined && (
              <div className="flex justify-between">
                <span>DISCREPANCY:</span>
                <span>
                  {selectedShiftForPrint.discrepancy >= 0
                    ? `+${formatPHP(selectedShiftForPrint.discrepancy)}`
                    : formatPHP(selectedShiftForPrint.discrepancy)}
                </span>
              </div>
            )}
          </div>

          <div className="text-center pt-2 text-[10px] text-gray-600">
            <p>Z-REPORT HISTORICAL AUDIT COPY</p>
          </div>
        </div>
      )}

    </div>
  );
}
