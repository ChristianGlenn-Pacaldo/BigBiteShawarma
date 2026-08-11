'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, adjustIngredientStock } from '@/lib/db';
import { Ingredient, MovementType } from '@/lib/types';
import { formatPHP, formatDate, formatQuantity } from '@/lib/utils';
import { Boxes, PackagePlus, AlertTriangle, Search, History, Sliders, X, Check } from 'lucide-react';
import RestockModal from '@/components/RestockModal';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [restockModalOpen, setRestockModalOpen] = useState<boolean>(false);
  const [selectedIngId, setSelectedIngId] = useState<string | undefined>();

  // Adjustment Modal State
  const [adjustingIng, setAdjustingIng] = useState<Ingredient | null>(null);
  const [adjChange, setAdjChange] = useState<string>('');
  const [adjType, setAdjType] = useState<MovementType>('WASTE');
  const [adjReason, setAdjReason] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  const ingredients = useLiveQuery(async () => {
    return await db.ingredients.toArray();
  }, []) || [];

  const movements = useLiveQuery(async () => {
    return await db.inventoryMovements.orderBy('date').reverse().toArray();
  }, []) || [];

  const categories = ['All', 'Meat', 'Produce', 'Dry Goods', 'Sauces', 'Packaging'];

  const filteredIngredients = ingredients.filter(i => {
    const matchesCat = selectedCategory === 'All' || i.category === selectedCategory;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingIng) return;
    const num = parseFloat(adjChange);
    if (isNaN(num) || num === 0) return;

    try {
      setIsAdjusting(true);
      await adjustIngredientStock(
        adjustingIng.id,
        num,
        adjType,
        adjReason || `Manual ${adjType} adjustment`,
        'Owner'
      );
      setAdjustingIng(null);
      setAdjChange('');
      setAdjReason('');
      setIsAdjusting(false);
    } catch (err) {
      console.error('Adjustment error:', err);
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Inventory & Ingredient Management
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Monitor raw ingredients, restock supplies, record waste, and trace stock movement history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedIngId(undefined);
              setRestockModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-brand-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
          >
            <PackagePlus className="w-4 h-4" />
            <span>RESTOCK INVENTORY</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'stock'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Levels ({ingredients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock Movement Audit Trail ({movements.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STOCK LEVELS */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          
          {/* Category Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ingredient Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current Quantity</th>
                    <th className="p-3">Min. Threshold</th>
                    <th className="p-3">Unit Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredIngredients.map(ing => {
                    const isOut = ing.currentQuantity <= 0;
                    const isLow = !isOut && ing.currentQuantity <= ing.minimumStock;

                    return (
                      <tr key={ing.id} className="hover:bg-slate-850/50 transition">
                        <td className="p-3 font-extrabold text-slate-100">{ing.name}</td>
                        <td className="p-3">
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                            {ing.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-extrabold text-sm">
                          <span className={isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                            {formatQuantity(ing.currentQuantity, ing.unit)}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {formatQuantity(ing.minimumStock, ing.unit)}
                        </td>
                        <td className="p-3 text-slate-300 font-bold">
                          {formatPHP(ing.costPerUnit)} / {ing.unit}
                        </td>
                        <td className="p-3">
                          {isOut ? (
                            <span className="bg-red-950/80 text-red-400 border border-red-800/80 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                              🔴 OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-950/80 text-amber-400 border border-amber-800/80 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                              🟡 LOW STOCK
                            </span>
                          ) : (
                            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                              🟢 IN STOCK
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">{ing.supplier}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedIngId(ing.id);
                                setRestockModalOpen(true);
                              }}
                              className="bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500 text-amber-300 font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 text-[11px] transition"
                            >
                              Restock
                            </button>
                            <button
                              onClick={() => setAdjustingIng(ing)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-xl border border-slate-700 transition"
                              title="Adjust stock"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: STOCK MOVEMENT AUDIT TRAIL LOG */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <h3 className="font-extrabold text-base text-slate-100 mb-4">Stock Movement Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Ingredient</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Quantity Change</th>
                  <th className="p-3">Estimated Cost</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {movements.map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-3 text-slate-400">{formatDate(mov.date)}</td>
                    <td className="p-3 font-extrabold text-slate-100">{mov.ingredientName}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        mov.type === 'RESTOCK'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : mov.type === 'SALE_DEDUCTION'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : mov.type === 'VOID_REVERSAL'
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : 'bg-red-950 text-red-400 border-red-800'
                      }`}>
                        {mov.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={mov.quantityChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {mov.quantityChange >= 0 ? `+${mov.quantityChange}` : mov.quantityChange} {mov.unit}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-bold">{formatPHP(mov.cost)}</td>
                    <td className="p-3 text-slate-400">{mov.reason}</td>
                    <td className="p-3 text-slate-300 font-medium">{mov.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModalOpen && (
        <RestockModal
          ingredients={ingredients}
          preselectedIngredientId={selectedIngId}
          onSuccess={() => setRestockModalOpen(false)}
          onClose={() => setRestockModalOpen(false)}
          staffName="Owner"
        />
      )}

      {/* Manual Adjustment Modal */}
      {adjustingIng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setAdjustingIng(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-100 mb-1">
              Adjust Inventory Stock: {adjustingIng.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current stock: <strong>{adjustingIng.currentQuantity} {adjustingIng.unit}</strong>
            </p>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as MovementType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-medium"
                >
                  <option value="WASTE">Waste (-)</option>
                  <option value="EXPIRED">Expired (-)</option>
                  <option value="DAMAGED">Damaged (-)</option>
                  <option value="MANUAL_ADJUSTMENT">Manual Correction (+/-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Quantity Change ({adjustingIng.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. -0.5 or +2"
                  value={adjChange}
                  onChange={(e) => setAdjChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-bold"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Use negative numbers to reduce stock, positive to add.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Reason / Notes *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spilled sauce during prep"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full bg-gradient-to-r from-amber-500 to-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>SAVE ADJUSTMENT</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
