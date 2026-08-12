'use client';

import React from 'react';
import { Printer, CheckCircle, PlusCircle, X } from 'lucide-react';
import { Sale } from '@/lib/types';
import { formatPHP, formatDate } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface ReceiptModalProps {
  sale: Sale;
  onNewSale: () => void;
  onClose: () => void;
}

export default function ReceiptModal({ sale, onNewSale, onClose }: ReceiptModalProps) {
  const settings = useLiveQuery(async () => {
    const list = await db.settings.toArray();
    return list[0];
  }, []);

  const storeName = settings?.storeName || 'BIG BITE SHAWARMA';
  const storeAddress = settings?.storeAddress || 'Main St. Branch, Food Park';
  const contactNumber = settings?.contactNumber || '0917-123-4567';
  const receiptFooter = settings?.receiptFooter || 'Thank you! Love at First Bite';

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const isGcash = sale.paymentMethod === 'gcash';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[95vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Sale Completed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Receipt Content */}
        <div className="py-4 overflow-y-auto flex-1">
          <div
            id="printable-receipt"
            className="bg-white text-black p-5 rounded-2xl font-mono text-xs shadow-inner mx-auto max-w-[320px] leading-relaxed"
          >
            {/* Store Branding Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="font-extrabold text-base tracking-wider uppercase">{storeName}</h2>
              <p className="text-[11px] text-gray-700">{storeAddress}</p>
              <p className="text-[11px] text-gray-700">Tel: {contactNumber}</p>
            </div>

            {/* Meta info */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold">Transaction #:</span>
                <span>{sale.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Date &amp; Time:</span>
                <span>{formatDate(sale.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Staff:</span>
                <span>{sale.staff}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Payment:</span>
                <span className="uppercase font-black">{isGcash ? '💙 GCASH' : '💵 CASH'}</span>
              </div>
              {isGcash && sale.gcashRef && (
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold">GCash Ref #:</span>
                  <span className="font-mono font-bold">{sale.gcashRef}</span>
                </div>
              )}
            </div>

            {/* Itemized List */}
            <div className="py-3 border-b border-dashed border-gray-400 space-y-2">
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.productName} ({item.variant.toUpperCase()})
                    </span>
                    <span>{formatPHP(item.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-600 pl-2">
                    <span>
                      {item.quantity}x @ {formatPHP(item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="py-3 space-y-1.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between text-sm font-extrabold">
                <span>TOTAL:</span>
                <span>{formatPHP(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{isGcash ? 'GCASH PAID:' : 'CASH PAID:'}</span>
                <span>{formatPHP(sale.paymentAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>CHANGE:</span>
                <span>{formatPHP(sale.changeAmount)}</span>
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="text-center pt-3 text-[11px] text-gray-700 italic">
              <p>{receiptFooter}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 rounded-xl border border-slate-700 transition active:scale-95 text-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>PRINT RECEIPT</span>
          </button>

          <button
            onClick={onNewSale}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-amber-500 hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-95 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>NEW SALE</span>
          </button>
        </div>

      </div>
    </div>
  );
}
