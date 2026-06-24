/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  Layers, 
  Coins, 
  BookOpen, 
  Smile, 
  Flame, 
  CheckSquare, 
  Settings, 
  LogOut, 
  TrendingUp, 
  ArrowUpRight, 
  Menu, 
  X,
  Compass,
  Sun,
  Moon
} from 'lucide-react';
import { Habit, Task, Project, Transaction, JournalEntry, DailyFocus, LifeOSData } from './types';
import { generateSeedData } from './mockData';
import { saveState, loadState, clearAllStorage } from './storage';

// Tabs
import DashboardTab from './components/DashboardTab';
import HabitsTab from './components/HabitsTab';
import TasksTab from './components/TasksTab';
import FinanceTab from './components/FinanceTab';
import JournalTab from './components/JournalTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [data, setData] = useState<LifeOSData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('life-os-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('life-os-dark-mode', darkMode.toString());
  }, [darkMode]);

  // Load from IndexedDB on mount with localStorage fallback
  useEffect(() => {
    async function hydrateState() {
      try {
        const stored = await loadState();
        if (stored) {
          // Fallback for missing keys in older saves
          if (!stored.habits) stored.habits = [];
          if (!stored.tasks) stored.tasks = [];
          if (!stored.projects) stored.projects = [];
          if (!stored.transactions) stored.transactions = [];
          if (!stored.journal) stored.journal = [];
          if (!stored.focus) stored.focus = { text: '', completed: false, date: '' };
          setData(stored);
        } else {
          // Automatic seeding for a beautiful initial experience!
          const seed = generateSeedData();
          setData(seed);
          await saveState(seed);
        }
      } catch (err) {
        console.error('Failed to load storage, seeding defaults.', err);
        const seed = generateSeedData();
        setData(seed);
        saveState(seed).catch(saveErr => console.error('Save fallback failed', saveErr));
      }
    }
    hydrateState();
  }, []);

  // Utility to get current browser date (YYYY-MM-DD format)
  const getCurrentDate = (): string => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const todayStr = getCurrentDate();

  // Helper to update global state and persist to storage
  const updateData = (newData: Partial<LifeOSData>) => {
    if (!data) return;
    const merged = { ...data, ...newData };
    setData(merged);
    saveState(merged).catch(err => console.error('Failed to auto-save to IndexedDB:', err));
  };

  // Completely reset databases
  const resetAllData = async () => {
    const emptyState: LifeOSData = {
      habits: [],
      tasks: [],
      projects: [],
      transactions: [],
      journal: [],
      focus: { text: '', completed: false, date: todayStr },
      apiKeys: {},
    };
    setData(emptyState);
    await clearAllStorage();
    await saveState(emptyState);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-parchment dark:bg-cocoa flex flex-col items-center justify-center p-10 transition-colors duration-500">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-sand dark:border-white/5 rounded-full animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-accent rounded-full animate-pulse opacity-50" />
          </div>
          <Compass className="absolute inset-0 m-auto w-8 h-8 text-espresso dark:text-alabaster animate-[bounce_2s_ease-in-out_infinite]" />
        </div>
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-espresso dark:text-alabaster font-black uppercase tracking-[0.5em] text-[10px]">Life OS Engine</h2>
          <p className="text-espresso/20 dark:text-alabaster/20 font-mono text-[8px] animate-pulse uppercase tracking-widest">Structural Integrity Check in Progress...</p>
        </div>
      </div>
    );
  }

  // Sidebar item configuration
  const sidebarItems = [
    { id: 'dashboard', label: 'Primary HUD', icon: Compass, badge: null },
    { id: 'habits', label: 'Habit Matrix', icon: Flame, badge: data.habits.length > 0 ? `${data.habits.filter(h => h.history[todayStr] === true).length}/${data.habits.length}` : null },
    { id: 'tasks', label: 'Action Board', icon: CheckSquare, badge: data.tasks.filter(t => !t.completed).length || null },
    { id: 'finance', label: 'Capital Log', icon: Coins, badge: null },
    { id: 'journal', label: 'Mind & Diary', icon: BookOpen, badge: null },
    { id: 'settings', label: 'OS Controls', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-parchment dark:bg-cocoa flex flex-col selection:bg-accent selection:text-white">
      
      {/* Top Banner Bar for Mobile Switchers */}
      <header className="bg-white dark:bg-espresso-surface border-b border-sand dark:border-espresso-surface-bright px-6 py-4 flex items-center justify-between lg:hidden sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-accent rounded-xl text-white dark:text-cocoa transition-all duration-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-espresso dark:text-alabaster">Life OS</span>
            <span className="text-[9px] font-bold text-espresso/40 dark:text-alabaster/40 block -mt-1 uppercase tracking-widest font-mono">WORKSPACE SHELL</span>
          </div>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster hover:bg-parchment dark:hover:bg-espresso-surface-bright transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative h-full">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 bg-white dark:bg-espresso-surface border-r border-sand dark:border-espresso-surface-bright p-5 hidden lg:flex flex-col justify-between sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-6">
            
            {/* Sidebar Logo */}
            <div className="flex items-center space-x-3 px-2">
              <div className="p-2.5 bg-accent rounded-2xl text-white dark:text-cocoa shadow-sm flex-shrink-0 soft-pulse transition-all duration-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-sm tracking-tight text-espresso dark:text-alabaster leading-tight">Life OS</h1>
                <span className="text-[10px] font-bold text-espresso/40 dark:text-alabaster/40 uppercase tracking-widest font-mono">Personal Engine</span>
              </div>
            </div>

            {/* Theme Select Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-parchment/60 dark:bg-black/20 border border-sand dark:border-white/5 group transition-all duration-300 hover:border-accent/40"
            >
              <div className="flex items-center space-x-2">
                {darkMode ? <Moon className="w-3.5 h-3.5 text-accent" /> : <Sun className="w-3.5 h-3.5 text-accent" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-espresso/40 dark:text-alabaster/40">{darkMode ? 'Night' : 'Day'} Mode</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-accent/40' : 'bg-sand'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </button>

            {/* Navigation Elements */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const active = activeTab === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 cursor-pointer group ${
                      active 
                        ? 'bg-accent text-white dark:text-cocoa shadow-lg shadow-accent/20 translate-x-1' 
                        : 'text-espresso/40 dark:text-alabaster/40 hover:bg-parchment dark:hover:bg-espresso-surface-bright hover:text-espresso dark:hover:text-alabaster hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <IconComp className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white dark:text-cocoa' : 'text-accent/40'}`} />
                      <span className="truncate leading-none">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-lg font-mono text-[9px] font-black ${
                        active ? 'bg-black/20 text-white' : 'bg-accent/10 text-accent'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Footer Version Widget */}
          <div className="border-t border-sand dark:border-espresso-surface-bright pt-4 text-center">
            <span className="text-[9px] font-mono font-bold text-espresso/30 dark:text-alabaster/30 uppercase tracking-[0.2em]">
              Life OS Workspace V1.2
            </span>
          </div>
        </aside>

        {/* Mobile Sidebar overlay Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-55 flex lg:hidden">
            <div className="fixed inset-0 bg-espresso/40 dark:bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-espresso-surface p-6 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-2 border-b border-sand dark:border-espresso-surface-bright">
                <span className="font-black text-sm tracking-tight text-accent">Life OS Navigator</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg border border-sand dark:border-espresso-surface-bright text-espresso/50 dark:text-alabaster/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Toggle for Mobile */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-3xl bg-parchment/60 dark:bg-black/20 border border-sand dark:border-white/5 active:scale-95 transition-all"
              >
                <div className="flex items-center space-x-3">
                  {darkMode ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-accent" />}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-espresso/40 dark:text-alabaster/40">{darkMode ? 'Night Mode' : 'Day Mode'}</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-accent/40' : 'bg-sand'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${darkMode ? 'left-5.5' : 'left-0.5'}`} />
                </div>
              </button>

              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const active = activeTab === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition cursor-pointer ${
                        active ? 'bg-accent text-white dark:text-cocoa shadow-lg' : 'text-espresso/40 dark:text-alabaster/40 bg-parchment/50 dark:bg-black/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <IconComp className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${
                          active ? 'bg-black/20 text-white' : 'bg-accent/10 text-accent'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-sand dark:border-espresso-surface-bright pt-4 text-center">
                <p className="text-[10px] text-espresso/40 dark:text-alabaster/40 font-mono italic uppercase tracking-widest">Life OS Web App V1.2</p>
              </div>

            </div>
          </div>
        )}

        {/* Major Working Canvas */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
          <div className="max-w-5xl mx-auto space-y-6 pb-24">
            
            {activeTab === 'dashboard' && (
              <DashboardTab 
                data={data} 
                updateData={updateData} 
                setActiveTab={setActiveTab} 
                getCurrentDate={getCurrentDate} 
              />
            )}

            {activeTab === 'habits' && (
              <HabitsTab 
                data={data} 
                updateData={updateData} 
                getCurrentDate={getCurrentDate} 
              />
            )}

            {activeTab === 'tasks' && (
              <TasksTab 
                data={data} 
                updateData={updateData} 
                getCurrentDate={getCurrentDate} 
              />
            )}

            {activeTab === 'finance' && (
              <FinanceTab 
                data={data} 
                updateData={updateData} 
                getCurrentDate={getCurrentDate} 
              />
            )}

            {activeTab === 'journal' && (
              <JournalTab 
                data={data} 
                updateData={updateData} 
                getCurrentDate={getCurrentDate} 
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                data={data} 
                updateData={updateData} 
                resetAllData={resetAllData} 
              />
            )}

          </div>
        </main>

      </div>
    </div>
  );
}
