'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatPHP, formatQuantity } from '@/lib/utils';
import { Download, Calendar, Award, Layers } from 'lucide-react';

export default function ReportsPage() {
  const [rangeType, setRangeType] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Query Sales & Expenses
  const allSales = useLiveQuery(async () => {
    return await db.sales.where('status').equals('completed').toArray();
  }, []) || [];

  const allExpenses = useLiveQuery(async () => {
    return await db.expenses.toArray();
  }, []) || [];

  const allMovements = useLiveQuery(async () => {
    return await db.inventoryMovements.where('type').equals('SALE_DEDUCTION').toArray();
  }, []) || [];

  // Filter by selected date range
  const todayStr = new Date().toISOString().split('T')[0];

  const getFilteredData = () => {
    let sDate = startDate;
    let eDate = endDate;

    const now = new Date();
    if (rangeType === 'today') {
      sDate = todayStr;
      eDate = todayStr;
    } else if (rangeType === 'yesterday') {
      const yDay = new Date(now);
      yDay.setDate(now.getDate() - 1);
      const yStr = yDay.toISOString().split('T')[0];
      sDate = yStr;
      eDate = yStr;
    } else if (rangeType === 'week') {
      const wAgo = new Date(now);
      wAgo.setDate(now.getDate() - 7);
      sDate = wAgo.toISOString().split('T')[0];
      eDate = todayStr;
    } else if (rangeType === 'month') {
      const mAgo = new Date(now);
      mAgo.setDate(now.getDate() - 30);
      sDate = mAgo.toISOString().split('T')[0];
      eDate = todayStr;
    }

    const filteredSales = allSales.filter(s => s.date >= sDate && s.date <= eDate);
    const filteredExpenses = allExpenses.filter(e => e.date >= sDate && e.date <= eDate);
    const filteredMovements = allMovements.filter(m => {
      const mDate = m.date.split('T')[0];
      return mDate >= sDate && mDate <= eDate;
    });

    return { filteredSales, filteredExpenses, filteredMovements, sDate, eDate };
  };

  const { filteredSales, filteredExpenses, filteredMovements, sDate, eDate } = getFilteredData();

  // Financial Calculations
  const grossSales = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const cogsTotal = filteredSales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => iSum + (item.cost * item.quantity), 0);
  }, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossSales - cogsTotal - totalExpenses;
  const profitMarginPercent = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

  // Best Selling Products Breakdown
  const productStatsMap = new Map<string, { name: string; soloCount: number; bogoCount: number; totalRevenue: number }>();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productStatsMap.get(item.productId) || {
        name: item.productName,
        soloCount: 0,
        bogoCount: 0,
        totalRevenue: 0
      };
      if (item.variant === 'bogo') {
        existing.bogoCount += item.quantity;
      } else {
        existing.soloCount += item.quantity;
      }
      existing.totalRevenue += item.subtotal;
      productStatsMap.set(item.productId, existing);
    });
  });

  const bestSellingProducts = Array.from(productStatsMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Ingredient Usage Breakdown
  const ingredientUsageMap = new Map<string, { name: string; unit: string; totalQty: number; totalCost: number }>();
  filteredMovements.forEach(m => {
    const existing = ingredientUsageMap.get(m.ingredientId) || {
      name: m.ingredientName,
      unit: m.unit,
      totalQty: 0,
      totalCost: 0
    };
    existing.totalQty += Math.abs(m.quantityChange);
    existing.totalCost += m.cost;
    ingredientUsageMap.set(m.ingredientId, existing);
  });

  const ingredientUsageList = Array.from(ingredientUsageMap.values()).sort((a, b) => b.totalCost - a.totalCost);

  // Export CSV Report Function
  const handleExportCSV = () => {
    const rows = [
      ['BIG BITE SHAWARMA - FINANCIAL REPORT'],
      [`Date Range: ${sDate} to ${eDate}`],
      [''],
      ['FINANCIAL SUMMARY'],
      ['Gross Sales (PHP)', grossSales],
      ['Cost of Goods Sold (COGS) (PHP)', cogsTotal],
      ['Total Operational Expenses (PHP)', totalExpenses],
      ['Net Profit (PHP)', netProfit],
      ['Profit Margin (%)', `${profitMarginPercent.toFixed(2)}%`],
      [''],
      ['BEST SELLING PRODUCTS'],
      ['Product Name', 'Solo Variant Qty', 'Buy 1 Take 1 Qty', 'Total Revenue (PHP)'],
      ...bestSellingProducts.map(p => [p.name, p.soloCount, p.bogoCount, p.totalRevenue]),
      [''],
      ['INGREDIENT USAGE'],
      ['Ingredient Name', 'Consumed Quantity', 'Unit', 'Estimated Cost (PHP)'],
      ...ingredientUsageList.map(i => [i.name, i.totalQty, i.unit, i.totalCost])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BigBite_Report_${sDate}_to_${eDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Financial &amp; Analytics Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Daily, weekly, &amp; monthly profit analysis, best sellers, and raw ingredient consumption
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV REPORT</span>
        </button>
      </div>

      {/* Date Range Selection Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['today', 'yesterday', 'week', 'month', 'custom'] as const).map(range => (
            <button
              key={range}
              onClick={() => setRangeType(range)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                rangeType === range
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : range}
            </button>
          ))}
        </div>

        {rangeType === 'custom' && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            />
          </div>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Gross Sales
          </span>
          <span className="text-3xl font-black text-amber-400 tracking-tight mt-1 block">
            {formatPHP(grossSales)}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold mt-2 block">
            {filteredSales.length} transactions
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Cost of Goods Sold (COGS)
          </span>
          <span className="text-3xl font-black text-slate-200 tracking-tight mt-1 block">
            {formatPHP(cogsTotal)}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold mt-2 block">
            Product recipe ingredient cost
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Operational Expenses
          </span>
          <span className="text-3xl font-black text-red-400 tracking-tight mt-1 block">
            {formatPHP(totalExpenses)}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold mt-2 block">
            {filteredExpenses.length} expense records
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Estimated Net Profit
          </span>
          <span className={`text-3xl font-black tracking-tight mt-1 block ${
            netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {formatPHP(netProfit)}
          </span>
          <span className="text-[11px] font-extrabold text-emerald-400 mt-2 block">
            {profitMarginPercent.toFixed(1)}% profit margin
          </span>
        </div>

      </div>

      {/* Best Selling Products & Ingredient Usage Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Selling Products Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-slate-100">Best-Selling Products</h3>
          </div>

          {bestSellingProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No sales recorded in this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Solo Sold</th>
                    <th className="p-3">B1T1 Sold</th>
                    <th className="p-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bestSellingProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="p-3 font-extrabold text-slate-100">{p.name}</td>
                      <td className="p-3 font-mono text-amber-400">{p.soloCount} units</td>
                      <td className="p-3 font-mono text-brand-400">{p.bogoCount} units</td>
                      <td className="p-3 font-black text-emerald-400 text-right">{formatPHP(p.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ingredient Consumption Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-brand-400" />
            <h3 className="font-extrabold text-base text-slate-100">Ingredient Usage Analytics</h3>
          </div>

          {ingredientUsageList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No ingredient consumption recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ingredient</th>
                    <th className="p-3">Consumed Qty</th>
                    <th className="p-3 text-right">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ingredientUsageList.map((ing, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="p-3 font-extrabold text-slate-100">{ing.name}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {formatQuantity(ing.totalQty, ing.unit)}
                      </td>
                      <td className="p-3 font-extrabold text-slate-200 text-right">{formatPHP(ing.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
