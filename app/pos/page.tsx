'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, processSaleTransaction } from '@/lib/db';
import { Product, CartItem, ProductVariant, Sale } from '@/lib/types';
import { formatPHP } from '@/lib/utils';
import { ShoppingCart, Plus, Minus, Trash2, Banknote, Search, Sparkles } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Restore cart & multiplier from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('bbs_active_pos_cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        }
        const savedMultiplier = localStorage.getItem('bbs_pos_multiplier');
        if (savedMultiplier) {
          const multNum = parseInt(savedMultiplier, 10);
          if (multNum >= 1 && multNum <= 10) {
            setActiveMultiplier(multNum);
          }
        }
      } catch (err) {
        console.error('Failed to load active cart draft:', err);
      } finally {
        setIsHydrated(true);
      }
    }
  }, []);

  // Save cart draft to localStorage whenever cart updates
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        if (cart.length > 0) {
          localStorage.setItem('bbs_active_pos_cart', JSON.stringify(cart));
        } else {
          localStorage.removeItem('bbs_active_pos_cart');
        }
      } catch (err) {
        console.error('Failed to persist cart draft:', err);
      }
    }
  }, [cart, isHydrated]);

  // Save active multiplier setting
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem('bbs_pos_multiplier', activeMultiplier.toString());
      } catch {}
    }
  }, [activeMultiplier, isHydrated]);

  // Live query products
  const products = useLiveQuery(async () => {
    return await db.products.where('status').equals('active').toArray();
  }, []);

  const categories = ['All', 'Shawarma', 'Sides', 'Beverages'];

  // Filter products by category & search
  const filteredProducts = products?.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }) || [];

  // Cart Calculations
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add product to cart with active multiplier quantity
  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    const unitPrice = variant === 'bogo' ? product.bogoPrice : product.soloPrice;
    const itemCost = product.costPrice || 0;

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.variant === variant
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + activeMultiplier;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: newQty,
          subtotal: newQty * unitPrice
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            variant,
            unitPrice,
            quantity: activeMultiplier,
            subtotal: activeMultiplier * unitPrice,
            cost: itemCost
          }
        ];
      }
    });
  };

  // Adjust item quantity in cart
  const handleUpdateQuantity = (productId: string, variant: ProductVariant, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.productId === productId && item.variant === variant) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleClearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bbs_active_pos_cart');
    }
  };

  // Process Completed Sale
  const handleCompleteSale = async (paymentAmount: number, changeAmount: number, staffName: string) => {
    const saleData = {
      items: cart,
      totalAmount,
      paymentAmount,
      changeAmount,
      paymentMethod: 'cash' as const,
      staff: staffName || 'Staff 1',
      status: 'completed' as const
    };

    const recordedSale = await processSaleTransaction(saleData);
    setIsPaymentOpen(false);
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bbs_active_pos_cart');
    }
    setCompletedSale(recordedSale);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-100px)]">
      
      {/* LEFT / MAIN PANEL: Products & Ticket Multiplier Bar */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Quick Ticket Calculator Quantity Multiplier Bar (Inspired by Reference UI Image 2) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Ticket Multiplier:
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Selected: <strong className="text-amber-400">{activeMultiplier}x</strong> quantity per tap
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(multiplier => (
              <button
                key={multiplier}
                onClick={() => setActiveMultiplier(multiplier)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 shrink-0 ${
                  activeMultiplier === multiplier
                    ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/30 scale-105 ring-2 ring-amber-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {multiplier}x
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs & Search Bar */}
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

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-xl group relative overflow-hidden"
            >
              {/* Product Info */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-base text-slate-100 group-hover:text-amber-400 transition">
                    {product.name}
                  </h3>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Variant Add Buttons (Solo & Buy 1 Take 1) */}
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                
                {/* SOLO Variant Button */}
                <button
                  onClick={() => handleAddToCart(product, 'solo')}
                  className="bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-700 rounded-2xl p-2.5 flex flex-col items-center justify-center transition active:scale-95 group/solo"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase group-hover/solo:text-amber-300">
                    SOLO ({activeMultiplier}x)
                  </span>
                  <span className="text-base font-extrabold text-amber-400">
                    {formatPHP(product.soloPrice * activeMultiplier)}
                  </span>
                </button>

                {/* BUY 1 TAKE 1 Variant Button */}
                <button
                  onClick={() => handleAddToCart(product, 'bogo')}
                  className="bg-gradient-to-br from-brand-950/80 to-amber-950/80 hover:from-brand-900 hover:to-amber-900 border border-brand-500/40 rounded-2xl p-2.5 flex flex-col items-center justify-center transition active:scale-95 group/bogo shadow-md shadow-brand-950/50"
                >
                  <span className="text-[10px] font-bold text-brand-300 uppercase tracking-tight">
                    BUY 1 TAKE 1 ({activeMultiplier}x)
                  </span>
                  <span className="text-base font-extrabold text-brand-400">
                    {formatPHP(product.bogoPrice * activeMultiplier)}
                  </span>
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Live Order Ticket / Cart */}
      <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl shrink-0">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-100">Current Order Ticket</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="py-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
                <p className="text-sm font-semibold text-slate-400">Cart is empty</p>
                <p className="text-xs mt-1 text-slate-500">Tap product cards on the left to add items</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variant}`}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-100">{item.productName}</h4>
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded ${
                        item.variant === 'bogo'
                          ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.variant === 'bogo' ? 'B1T1' : 'SOLO'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatPHP(item.unitPrice)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.variant, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm text-amber-400 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.variant, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right pl-2">
                    <span className="font-extrabold text-sm text-slate-100 block">
                      {formatPHP(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Footer & Payment Triggers */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1 font-medium">
              <span>Subtotal:</span>
              <span>{formatPHP(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                GRAND TOTAL
              </span>
              <span className="text-3xl font-black text-amber-400 tracking-tight">
                {formatPHP(totalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsPaymentOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-r from-brand-600 via-amber-500 to-amber-600 text-white font-extrabold text-lg py-4 rounded-2xl shadow-xl shadow-brand-600/30 hover:brightness-110 active:scale-98 transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <Banknote className="w-6 h-6" />
            <span>CASH PAYMENT</span>
          </button>
        </div>

      </div>

      {/* Payment Drawer Modal */}
      {isPaymentOpen && (
        <PaymentModal
          cart={cart}
          totalAmount={totalAmount}
          onCompleteSale={handleCompleteSale}
          onClose={() => setIsPaymentOpen(false)}
        />
      )}

      {/* Thermal Printable Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          onNewSale={() => setCompletedSale(null)}
          onClose={() => setCompletedSale(null)}
        />
      )}

    </div>
  );
}
