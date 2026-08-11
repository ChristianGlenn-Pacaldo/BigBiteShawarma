'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Product } from '@/lib/types';
import { formatPHP } from '@/lib/utils';
import { Package, Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import ProductModal from '@/components/ProductModal';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const products = useLiveQuery(async () => {
    return await db.products.toArray();
  }, []) || [];

  const ingredients = useLiveQuery(async () => {
    return await db.ingredients.toArray();
  }, []) || [];

  const categories = ['All', 'Shawarma', 'Sides', 'Beverages', 'Combos'];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      await db.products.delete(id);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'disabled' : 'active';
    await db.products.update(product.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Product & Price Management
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Manage products, Solo/B1T1 prices, cost estimates, and recipe ingredient deductions
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-amber-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Filter & Search */}
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
            placeholder="Search product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
            <p className="text-sm font-semibold text-slate-400">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Solo Price</th>
                  <th className="p-3">Buy 1 Take 1 Price</th>
                  <th className="p-3">Cost Price</th>
                  <th className="p-3">Recipe Items</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-3 font-extrabold text-slate-100">{prod.name}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-amber-400">{formatPHP(prod.soloPrice)}</td>
                    <td className="p-3 font-extrabold text-brand-400">{formatPHP(prod.bogoPrice)}</td>
                    <td className="p-3 text-slate-400">{formatPHP(prod.costPrice || 0)}</td>
                    <td className="p-3 text-slate-400">
                      {prod.recipe && prod.recipe.length > 0 ? (
                        <span className="text-emerald-400 font-semibold">{prod.recipe.length} ingredients attached</span>
                      ) : (
                        <span className="text-slate-500 italic">No recipe attached</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(prod)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                          prod.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {prod.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsModalOpen(true);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 p-2 rounded-xl border border-slate-700 transition"
                          title="Edit product and recipe"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="bg-slate-800 hover:bg-red-950 hover:border-red-800 text-slate-400 hover:text-red-400 p-2 rounded-xl border border-slate-700 transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          ingredients={ingredients}
          onSuccess={() => setIsModalOpen(false)}
          onClose={() => setIsModalOpen(false)}
        />
      )}

    </div>
  );
}
