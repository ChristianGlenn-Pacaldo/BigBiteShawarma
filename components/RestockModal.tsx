'use client';

import React, { useState } from 'react';
import { PlusCircle, X, PackagePlus } from 'lucide-react';
import { Ingredient } from '@/lib/types';
import { restockIngredient } from '@/lib/db';

interface RestockModalProps {
  ingredients: Ingredient[];
  preselectedIngredientId?: string;
  onSuccess: () => void;
  onClose: () => void;
  staffName: string;
}

export default function RestockModal({
  ingredients,
  preselectedIngredientId,
  onSuccess,
  onClose,
  staffName,
}: RestockModalProps) {
  const [ingredientId, setIngredientId] = useState<string>(
    preselectedIngredientId || (ingredients[0]?.id ?? '')
  );
  const [quantity, setQuantity] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const selectedIng = ingredients.find(i => i.id === ingredientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantity);
    const costNum = parseFloat(cost) || 0;

    if (!ingredientId) {
      setError('Please select an ingredient');
      return;
    }
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await restockIngredient(
        ingredientId,
        qtyNum,
        costNum,
        supplier || selectedIng?.supplier || '',
        staffName
      );
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to restock ingredient';
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
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Restock Inventory</h2>
            <p className="text-xs text-slate-400">Add stock and record purchasing cost</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ingredient Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Ingredient *
            </label>
            <select
              value={ingredientId}
              onChange={(e) => {
                setIngredientId(e.target.value);
                const found = ingredients.find(i => i.id === e.target.value);
                if (found) setSupplier(found.supplier || '');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
            >
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} (Current: {ing.currentQuantity} {ing.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Added Quantity & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Added Quantity *
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-amber-400 font-bold text-center">
                {selectedIng?.unit || 'unit'}
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Total Restock Cost (₱)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 1500"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Supplier Name
            </label>
            <input
              type="text"
              placeholder="e.g. ABC Supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
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
            className="w-full bg-gradient-to-r from-amber-500 to-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>SAVE RESTOCK ENTRY</span>
          </button>
        </form>
      </div>
    </div>
  );
}
