'use client';

import React, { useState } from 'react';
import { Package, X, Plus, Trash2, Check } from 'lucide-react';
import { Product, RecipeItem, Ingredient } from '@/lib/types';
import { db } from '@/lib/db';

interface ProductModalProps {
  product?: Product | null;
  ingredients: Ingredient[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function ProductModal({ product, ingredients, onSuccess, onClose }: ProductModalProps) {
  const [name, setName] = useState<string>(product?.name || '');
  const [category, setCategory] = useState<string>(product?.category || 'Shawarma');
  const [soloPrice, setSoloPrice] = useState<string>(product?.soloPrice ? product.soloPrice.toString() : '');
  const [bogoPrice, setBogoPrice] = useState<string>(product?.bogoPrice ? product.bogoPrice.toString() : '');
  const [costPrice, setCostPrice] = useState<string>(product?.costPrice ? product.costPrice.toString() : '');
  const [status, setStatus] = useState<'active' | 'disabled'>(product?.status || 'active');
  const [recipe, setRecipe] = useState<RecipeItem[]>(product?.recipe || []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const categories = ['Shawarma', 'Sides', 'Beverages', 'Combos'];

  const handleAddRecipeItem = () => {
    if (ingredients.length === 0) return;
    const firstIng = ingredients[0];
    setRecipe(prev => [
      ...prev,
      {
        ingredientId: firstIng.id,
        ingredientName: firstIng.name,
        quantitySolo: 1,
        quantityBogo: 2,
        unit: firstIng.unit
      }
    ]);
  };

  const handleRemoveRecipeItem = (index: number) => {
    setRecipe(prev => prev.filter((_, i) => i !== index));
  };

  const handleRecipeChange = (index: number, field: keyof RecipeItem, value: any) => {
    setRecipe(prev => {
      const copy = [...prev];
      if (field === 'ingredientId') {
        const found = ingredients.find(ing => ing.id === value);
        if (found) {
          copy[index] = {
            ...copy[index],
            ingredientId: found.id,
            ingredientName: found.name,
            unit: found.unit
          };
        }
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const solo = parseFloat(soloPrice);
    const bogo = parseFloat(bogoPrice);
    const cost = parseFloat(costPrice) || 0;

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    if (isNaN(solo) || solo <= 0) {
      setError('Enter a valid Solo price');
      return;
    }
    if (isNaN(bogo) || bogo <= 0) {
      setError('Enter a valid Buy 1 Take 1 price');
      return;
    }

    try {
      setIsSubmitting(true);
      const prodId = product?.id || `prod-${Date.now()}`;
      
      const newProduct: Product = {
        id: prodId,
        name: name.trim(),
        category,
        soloPrice: solo,
        bogoPrice: bogo,
        costPrice: cost,
        lowStockThreshold: 10,
        status,
        recipe
      };

      if (product) {
        await db.products.put(newProduct);
      } else {
        await db.products.add(newProduct);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">
              {product ? 'Edit Product & Recipe' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-400">Configure prices and ingredient deduction bill of materials</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* General Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Shawarma Wrap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Solo Price (₱) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="75"
                value={soloPrice}
                onChange={(e) => setSoloPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
                B1T1 Price (₱) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="130"
                value={bogoPrice}
                onChange={(e) => setBogoPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cost Price (₱)
              </label>
              <input
                type="number"
                step="any"
                placeholder="35"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="accent-amber-500"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                <input
                  type="radio"
                  name="status"
                  value="disabled"
                  checked={status === 'disabled'}
                  onChange={() => setStatus('disabled')}
                  className="accent-red-500"
                />
                <span>Disabled (Hidden from POS)</span>
              </label>
            </div>
          </div>

          {/* Recipe Builder BOM */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-amber-300">Recipe / BOM Ingredients</h3>
                <p className="text-[11px] text-slate-400">Ingredients automatically deducted on each sale</p>
              </div>
              <button
                type="button"
                onClick={handleAddRecipeItem}
                className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ingredient</span>
              </button>
            </div>

            {recipe.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                No ingredients attached to this product yet. Click "+ Add Ingredient" above.
              </div>
            ) : (
              <div className="space-y-2">
                {recipe.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
                    
                    {/* Ingredient Select */}
                    <div className="col-span-5">
                      <select
                        value={item.ingredientId}
                        onChange={(e) => handleRecipeChange(idx, 'ingredientId', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 font-medium"
                      >
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Solo Qty */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="any"
                        placeholder="Solo Qty"
                        value={item.quantitySolo}
                        onChange={(e) => handleRecipeChange(idx, 'quantitySolo', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-amber-300 font-bold"
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-0.5">Solo ({item.unit})</span>
                    </div>

                    {/* Bogo Qty */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="any"
                        placeholder="B1T1 Qty"
                        value={item.quantityBogo}
                        onChange={(e) => handleRecipeChange(idx, 'quantityBogo', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-brand-300 font-bold"
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-0.5">B1T1 ({item.unit})</span>
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipeItem(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-brand-600 via-amber-500 to-amber-600 text-white font-extrabold py-3.5 rounded-2xl shadow-xl hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>SAVE PRODUCT & RECIPE</span>
          </button>
        </form>
      </div>
    </div>
  );
}
