/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Database, 
  Trash2, 
  FileJson, 
  Upload, 
  HelpCircle, 
  Key, 
  Check, 
  Eye, 
  EyeOff, 
  Globe, 
  BookOpen, 
  Terminal,
  Activity,
  Download,
  AlertTriangle,
  X,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { LifeOSData } from '../types';
import { generateSeedData } from '../mockData';

interface SettingsTabProps {
  data: LifeOSData;
  updateData: (newData: Partial<LifeOSData>) => void;
  resetAllData: () => void;
}

export default function SettingsTab({ data, updateData, resetAllData }: SettingsTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom toast notification state
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    isDestructive: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ isOpen: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
    }, 3500);
  };

  const triggerConfirm = (title: string, message: string, action: () => void, isDestructive = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      action,
      isDestructive,
    });
  };

  // Run mock seed
  const handleSeeding = () => {
    triggerConfirm(
      'Initialize Analytical Seed Dataset',
      'This will load preset Mock Datasets (Curriculum, Capital Ledger activity, and Journals) over your existing metrics. Do you wish to continue?',
      () => {
        const seeded = generateSeedData();
        updateData(seeded);
        showToast('Sample dataset injected successfully.', 'success');
      },
      false
    );
  };

  // Export JSON file
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `life_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      showToast('Life OS archive exported successfully.', 'success');
    } catch (err: any) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  // Import JSON file parser & validator
  const handleJSONImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid JSON shape.');
        }

        const restoredData: Partial<LifeOSData> = {};
        if (Array.isArray(parsed.habits)) restoredData.habits = parsed.habits;
        if (Array.isArray(parsed.tasks)) restoredData.tasks = parsed.tasks;
        if (Array.isArray(parsed.projects)) restoredData.projects = parsed.projects;
        if (Array.isArray(parsed.transactions)) restoredData.transactions = parsed.transactions;
        if (Array.isArray(parsed.journal)) restoredData.journal = parsed.journal;
        if (parsed.focus) restoredData.focus = parsed.focus;
        if (parsed.apiKeys) restoredData.apiKeys = parsed.apiKeys;

        updateData(restoredData);
        showToast('System archive successfully restored and hydrated.', 'success');
      } catch (err: any) {
        showToast(`Hydration failed: ${err.message || 'Malformed file structure.'}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleJSONImport(file);
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/json') {
      handleJSONImport(file);
    } else {
      showToast('Please drop a valid JSON configuration archive.', 'error');
    }
  };

  const handleWipeData = () => {
    triggerConfirm(
      'OS Master Reset Protocol',
      '⚠️ WARNING: This will permanently flush all current local commitments, actions, logs, and ledger items. This master process is completely irreversible.',
      () => {
        resetAllData();
        showToast('All local storage databases cleared.', 'success');
      },
      true
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Left Side: System settings */}
        <div className="lg:col-span-2 space-y-8">

          {/* Database Operations */}
          <div className="clay-card p-8 space-y-6">
            <div className="flex items-center space-x-3 text-espresso dark:text-alabaster">
              <Database className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">Storage Core & Utilities</h2>
            </div>
            
            <p className="text-[11px] text-espresso/50 dark:text-alabaster/50 font-bold leading-relaxed">
              Synchronize your Life OS across instances by manipulating the underlying JSON data streams.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Seed / Clean */}
              <div className="p-6 rounded-[2rem] bg-parchment/50 dark:bg-black/20 border border-sand dark:border-white/5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-espresso/30 dark:text-alabaster/30 block">Virtual Environment</span>
                <p className="text-[10px] text-espresso/50 dark:text-alabaster/50 font-bold leading-relaxed px-1">
                  Inject high-fidelity sample datasets (Curriculum, Capital, Narrative) to visualize the OS potential.
                </p>
                <button
                  onClick={handleSeeding}
                  className="w-full bg-white dark:bg-espresso-surface-bright text-espresso dark:text-alabaster font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl transition border border-sand dark:border-white/10 shadow-sm hover:bg-parchment active:scale-95 cursor-pointer"
                >
                  Load Seed Prototype
                </button>
              </div>

              {/* Reset Database */}
              <div className="p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500/50 block">Hazard Protocol</span>
                <p className="text-[10px] text-rose-600/60 dark:text-rose-400/60 font-bold leading-relaxed px-1">
                  Permanently purge all behavioral logs, capital ledgers, and structural narratives. Irreversible.
                </p>
                <button
                  onClick={handleWipeData}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl transition shadow-lg shadow-rose-500/20 cursor-pointer flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Flush Local Grid</span>
                </button>
              </div>

            </div>

            {/* Drag & Drop Import File Upload Box */}
            <div className="pt-4 border-t border-sand dark:border-white/5">
              <span className="block text-[9px] font-black text-espresso/30 dark:text-alabaster/30 uppercase tracking-[0.3em] mb-4 font-mono">Data Migration Sandbox</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleExportData}
                  className="bg-white dark:bg-espresso-surface border border-sand dark:border-white/10 text-espresso dark:text-alabaster font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition flex items-center justify-center space-x-3 shadow-sm hover:bg-parchment active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-accent" />
                  <span>Export Archive</span>
                </button>

                {/* Drag and Drop Container */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center group ${
                    isDragging 
                      ? 'border-accent bg-accent/5' 
                      : 'border-sand dark:border-white/5 bg-parchment/30 dark:bg-black/10 hover:border-accent/40'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/json"
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 text-espresso/40 dark:text-alabaster/40 group-hover:text-accent transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Restore Archive</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Deployment & Longevity Guide */}
        <div className="clay-card bg-espresso dark:bg-cocoa text-alabaster p-8 border border-espresso-surface dark:border-white/5 shadow-2xl flex flex-col justify-between group">
          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-accent">
              <Globe className="w-5 h-5 animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">System Longevity Manifest</h2>
            </div>

            <p className="text-[11px] text-alabaster/50 leading-relaxed font-bold italic border-l-2 border-accent pl-4">
              "Ensuring your Life OS remains functional and private for decades."
            </p>

            <div className="space-y-6 pt-4">
              {/* Longevity 1 */}
              <div className="flex items-start space-x-4 group/step">
                <span className="bg-white/5 text-accent font-mono font-black text-[10px] w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10 group-hover/step:bg-accent group-hover/step:text-espresso transition-colors">
                  01
                </span>
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-black text-[12px] text-alabaster tracking-tight uppercase">Permanent Storage</h4>
                  <p className="text-[9px] text-alabaster/40 leading-relaxed font-bold uppercase tracking-widest">
                    Your data is stored strictly in your browser's Local Storage. Export your Archive (JSON) weekly to ensure safety across device wipes.
                  </p>
                </div>
              </div>

              {/* Longevity 2 */}
              <div className="flex items-start space-x-4 group/step">
                <span className="bg-white/5 text-accent font-mono font-black text-[10px] w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10 group-hover/step:bg-accent group-hover/step:text-white transition-colors">
                  02
                </span>
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-black text-[12px] text-alabaster tracking-tight uppercase">PWA Architecture</h4>
                  <p className="text-[9px] text-alabaster/40 leading-relaxed font-bold uppercase tracking-widest">
                    Install as a standalone app. Life OS uses Service Workers to remain functional even without an internet connection.
                  </p>
                </div>
              </div>

              {/* Longevity 3 */}
              <div className="flex items-start space-x-4 group/step">
                <span className="bg-white/5 text-accent font-mono font-black text-[10px] w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10 group-hover/step:bg-accent group-hover/step:text-white transition-colors">
                  03
                </span>
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-black text-[12px] text-alabaster tracking-tight uppercase">Open Logic</h4>
                  <p className="text-[9px] text-alabaster/40 leading-relaxed font-bold uppercase tracking-widest">
                    The JSON export format is human-readable and standard, meaning you will always own your data and can migrate to any future system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/5">
            <div className="flex items-center space-x-3 text-[9px] text-alabaster/20 font-mono font-black uppercase tracking-[0.3em]">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>OS Environment Stable</span>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/40 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="clay-card max-w-md w-full p-6 space-y-6 shadow-2xl bg-parchment dark:bg-espresso-surface border border-sand dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-2xl ${confirmModal.isDestructive ? 'bg-rose-500/10 text-rose-500' : 'bg-accent/10 text-accent'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-espresso dark:text-alabaster leading-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-[11px] text-espresso/60 dark:text-alabaster/60 font-bold leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-sand dark:border-white/10 text-espresso/40 dark:text-alabaster/40 font-black text-[9px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel Process
              </button>
              <button
                onClick={() => {
                  confirmModal.action();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md transition active:scale-95 cursor-pointer ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/10'
                    : 'bg-accent hover:bg-accent-hover text-white shadow-accent/10'
                }`}
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Banner */}
      {toast.isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-4 duration-300 bg-white dark:bg-espresso-surface-bright border-sand dark:border-white/10">
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-500" />}
          {toast.type === 'info' && <Clock className="w-5 h-5 text-accent" />}
          <span className="text-[10px] font-black uppercase tracking-wider text-espresso dark:text-alabaster">
            {toast.message}
          </span>
          <button
            onClick={() => setToast(prev => ({ ...prev, isOpen: false }))}
            className="p-1 pl-2 text-espresso/20 dark:text-alabaster/20 hover:text-espresso dark:hover:text-alabaster cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
