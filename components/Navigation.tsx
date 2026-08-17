'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Boxes, Package, Receipt, TrendingUp, Settings, AlertTriangle, Flag, Menu, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';

interface NavigationProps {
  currentRole: UserRole;
}

export default function Navigation({ currentRole }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count low stock items for badge alert
  const lowStockCount = useLiveQuery(async () => {
    const ingredients = await db.ingredients.toArray();
    return ingredients.filter(i => i.currentQuantity <= i.minimumStock).length;
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'POS', href: '/pos', icon: ShoppingBag },
    { name: 'Shifts Log', href: '/shifts', icon: Flag },
    { name: 'Sales Log', href: '/sales', icon: Receipt },
    { name: 'Products', href: '/products', icon: Package },
    { 
      name: 'Inventory', 
      href: '/inventory', 
      icon: Boxes, 
      badge: lowStockCount && lowStockCount > 0 ? lowStockCount : null 
    },
    { name: 'Reports', href: '/reports', icon: TrendingUp, ownerOnly: true },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Mobile Bottom Bar items (Top 4 most used + Menu toggle)
  const mobileBarItems = navItems.slice(0, 4);

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0 justify-between min-h-[calc(100vh-57px)]">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu Navigation
          </div>
          {navItems.map((item) => {
            if (item.ownerOnly && currentRole !== 'OWNER') return null;

            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white font-semibold shadow-lg shadow-brand-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer info card */}
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-400">
          <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
            <span>Offline POS v1.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p>Local IndexedDB Storage Active</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around">
          {mobileBarItems.map((item) => {
            if (item.ownerOnly && currentRole !== 'OWNER') return null;

            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight">{item.name}</span>

                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-0.5 right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Menu Drawer Trigger button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              mobileMenuOpen ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Slide-out Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 flex justify-end">
          <div className="w-4/5 max-w-xs bg-slate-900 border-l border-slate-800 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 flex items-center justify-center">
                    <img src="/logo.png" alt="Big Bite Shawarma" width={32} height={32} className="w-full h-full object-cover rounded-md" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-100">Big Bite Navigation</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[70vh]">
                {navItems.map((item) => {
                  if (item.ownerOnly && currentRole !== 'OWNER') return null;

                  const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>

                      {item.badge !== null && item.badge !== undefined && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 text-[11px] text-slate-400 text-center">
              <span className="font-bold text-slate-200 block">BIG BITE SHAWARMA POS</span>
              <span>Role: {currentRole}</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
