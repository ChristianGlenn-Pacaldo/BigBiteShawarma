'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Boxes, Package, Receipt, TrendingUp, DollarSign, Settings, AlertTriangle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';

interface NavigationProps {
  currentRole: UserRole;
}

export default function Navigation({ currentRole }: NavigationProps) {
  const pathname = usePathname();

  // Count low stock items for badge alert
  const lowStockCount = useLiveQuery(async () => {
    const ingredients = await db.ingredients.toArray();
    return ingredients.filter(i => i.currentQuantity <= i.minimumStock).length;
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'POS', href: '/pos', icon: ShoppingBag },
    { name: 'Products', href: '/products', icon: Package },
    { 
      name: 'Inventory', 
      href: '/inventory', 
      icon: Boxes, 
      badge: lowStockCount && lowStockCount > 0 ? lowStockCount : null 
    },
    { name: 'Sales Log', href: '/sales', icon: Receipt },
    { name: 'Expenses', href: '/expenses', icon: DollarSign },
    { name: 'Reports', href: '/reports', icon: TrendingUp, ownerOnly: true },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

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
          {navItems.slice(0, 5).map((item) => {
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
          
          {/* More Settings for Mobile */}
          <Link
            href="/settings"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              pathname === '/settings' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">More</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
