'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, exportDatabaseBackup, importDatabaseBackup, resetDatabaseToSeed } from '@/lib/db';
import { StoreSettings } from '@/lib/types';
import { Settings, Save, Download, Upload, RotateCcw, Shield, AlertTriangle } from 'lucide-react';
import PinModal from '@/components/PinModal';

export default function SettingsPage() {
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pinAction, setPinAction] = useState<'restore' | 'reset' | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const settingsList = useLiveQuery(async () => {
    return await db.settings.toArray();
  }, []);

  const settings = settingsList?.[0] || {
    storeName: 'BIG BITE SHAWARMA',
    storeAddress: 'Main St. Branch, Food Park',
    contactNumber: '0917-123-4567',
    currency: '₱',
    receiptFooter: 'Thank you for dining with us! Love at First Bite',
    ownerPin: '1234',
    staffPin: '0000',
    theme: 'dark' as const,
    lowStockGlobalThreshold: 5
  };

  const [formState, setFormState] = useState<StoreSettings>(settings);

  // Sync state when DB loads
  React.useEffect(() => {
    if (settingsList && settingsList.length > 0) {
      setFormState(settingsList[0]);
    }
  }, [settingsList]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.settings.clear();
      await db.settings.add(formState);
      setStatusMessage({ text: 'Store settings saved successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      setStatusMessage({ text: msg, isError: true });
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportDatabaseBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BigBite_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage({ text: 'Database backup downloaded successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setStatusMessage({ text: 'Export failed: ' + msg, isError: true });
    }
  };

  // Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setPinAction('restore');
      setPinModalOpen(true);
    }
  };

  const executeImport = async () => {
    if (!pendingFile) return;
    try {
      const text = await pendingFile.text();
      await importDatabaseBackup(text);
      setPendingFile(null);
      setStatusMessage({ text: 'Database restored successfully from backup file!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setStatusMessage({ text: 'Import failed: ' + msg, isError: true });
    }
  };

  const executeReset = async () => {
    try {
      await resetDatabaseToSeed();
      setStatusMessage({ text: 'Database reset to initial sample seed data!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setStatusMessage({ text: 'Reset failed: ' + msg, isError: true });
    }
  };

  const handlePinSuccess = () => {
    setPinModalOpen(false);
    if (pinAction === 'restore') {
      executeImport();
    } else if (pinAction === 'reset') {
      executeReset();
    }
    setPinAction(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Store &amp; System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Customize receipt branding, security PINs, offline database backups, &amp; restore tools
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold ${
          statusMessage.isError
            ? 'bg-red-950/80 text-red-400 border-red-800'
            : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Store Profile Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-extrabold text-slate-100 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>Store Information &amp; Receipt Branding</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={formState.storeName || ''}
                onChange={(e) => setFormState({ ...formState, storeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={formState.contactNumber || ''}
                onChange={(e) => setFormState({ ...formState, contactNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Store Address
            </label>
            <input
              type="text"
              value={formState.storeAddress || ''}
              onChange={(e) => setFormState({ ...formState, storeAddress: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Receipt Footer Tagline
            </label>
            <input
              type="text"
              value={formState.receiptFooter || ''}
              onChange={(e) => setFormState({ ...formState, receiptFooter: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Security PIN Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                Owner Security PIN (Default: 1234)
              </label>
              <input
                type="password"
                maxLength={6}
                value={formState.ownerPin || ''}
                onChange={(e) => setFormState({ ...formState, ownerPin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-amber-400 font-extrabold tracking-widest focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff PIN (Default: 0000)
              </label>
              <input
                type="password"
                maxLength={6}
                value={formState.staffPin || ''}
                onChange={(e) => setFormState({ ...formState, staffPin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 font-bold tracking-widest focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-600 via-amber-500 to-amber-600 text-white font-extrabold py-3.5 rounded-2xl shadow-xl hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-5 h-5" />
            <span>SAVE STORE SETTINGS</span>
          </button>
        </form>
      </div>

      {/* Database Backup & Security Operations */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Offline Data Backup &amp; Disaster Recovery</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Export JSON Backup */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Data Backup</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Save complete sales, products, inventory, and expense records to a downloadable JSON file.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold text-xs py-3 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD BACKUP FILE</span>
            </button>
          </div>

          {/* Import JSON Backup */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Restore Backup File</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Restore store database from a previously exported JSON backup file (Owner PIN required).
              </p>
            </div>
            <label className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs py-3 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>SELECT BACKUP FILE (.JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Reset Database to Seed */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-sm text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Reset Database to Initial Sample Data</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Clears current data and re-seeds standard Big Bite Shawarma products and ingredients.
            </p>
          </div>
          <button
            onClick={() => {
              setPinAction('reset');
              setPinModalOpen(true);
            }}
            className="bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 font-extrabold text-xs px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET DATABASE</span>
          </button>
        </div>

      </div>

      {/* Security PIN Modal */}
      {pinModalOpen && (
        <PinModal
          title="Owner Authorization Required"
          subtitle="Enter Owner PIN (Default: 1234) to perform database operation"
          onSuccess={handlePinSuccess}
          onClose={() => {
            setPinModalOpen(false);
            setPendingFile(null);
            setPinAction(null);
          }}
        />
      )}

    </div>
  );
}
