/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  PlusCircle, 
  Coins, 
  Calendar, 
  Tag, 
  Trash2, 
  CreditCard,
  PieChart
} from 'lucide-react';
import { Transaction, LifeOSData } from '../types';

interface FinanceTabProps {
  data: LifeOSData;
  updateData: (newData: Partial<LifeOSData>) => void;
  getCurrentDate: () => string;
}

export default function FinanceTab({ data, updateData, getCurrentDate }: FinanceTabProps) {
  // Logger states
  const [descInput, setDescInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [typeInput, setTypeInput] = useState<'income' | 'expense'>('expense');
  const [categoryInput, setCategoryInput] = useState('Food');
  const [dateInput, setDateInput] = useState(getCurrentDate());
  const [showAddForm, setShowAddForm] = useState(false);

  const todayStr = getCurrentDate();
  const currentMonth = todayStr.substring(0, 7); // YYYY-MM

  // Process numbers & calculations
  const transactions = data.transactions || [];

  // Filter relative to current month for budget HUDs
  const monthlyTransactions = transactions.filter(t => t.date.substring(0, 7) === currentMonth);

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyBalance = totalIncome - totalExpenses;

  // Life OS Capital Net Balance (All transactions)
  const netBalance = transactions.length === 0 ? 0 : transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? Math.abs(t.amount) : -Math.abs(t.amount));
  }, 1500); // Startup seeding envelope of R1500 bank seed

  // Expense distribution per Category for Custom Vector Chart!
  const categoryChartData = () => {
    const expenses = monthlyTransactions.filter(t => t.type === 'expense');
    const totals: Record<string, number> = {};
    let totalAll = 0;

    expenses.forEach(e => {
      const amt = Math.abs(e.amount);
      totals[e.category] = (totals[e.category] || 0) + amt;
      totalAll += amt;
    });

    return Object.entries(totals).map(([cat, val]) => ({
      name: cat,
      value: val,
      percent: totalAll > 0 ? Math.round((val / totalAll) * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  };

  const categoriesDist = categoryChartData();

  // Color map for Category display bars
  const categoryColorMap: Record<string, string> = {
    Food: 'bg-accent',
    Leisure: 'bg-amber-600',
    Subscriptions: 'bg-black dark:bg-alabaster',
    Health: 'bg-rose-500',
    Education: 'bg-espresso dark:bg-sand',
    Uncategorized: 'bg-sand dark:bg-espresso-surface-bright',
  };

  // Log Income / Expense
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amountInput);
    if (!descInput.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newTransaction: Transaction = {
      id: `trans_${Date.now()}`,
      desc: descInput.trim(),
      amount: typeInput === 'expense' ? -amountNum : amountNum,
      category: categoryInput,
      date: dateInput || todayStr,
      type: typeInput,
    };

    updateData({
      transactions: [newTransaction, ...data.transactions],
    });

    // Reset inputs
    setDescInput('');
    setAmountInput('');
    setShowAddForm(false);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = data.transactions.filter((t) => t.id !== id);
    updateData({ transactions: updated });
  };

  const budgetLimit = 1200; // static demo limit
  const percentBurnt = Math.min(Math.round((totalExpenses / budgetLimit) * 100), 100);

  return (
    <div className="space-y-6">
      
      {/* 4-Column Metric Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Envelope */}
        <div className="clay-card p-6 flex items-center space-x-4 group hover:translate-y-[-2px] transition-all">
          <div className="p-4 rounded-2xl bg-accent/10 text-accent flex-shrink-0">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-espresso/40 dark:text-alabaster/40">Total Net Balance</span>
            <h3 className="text-2xl font-black text-espresso dark:text-alabaster font-mono tracking-tighter leading-none mt-2">
              R{netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="clay-card p-6 flex items-center space-x-4 group hover:translate-y-[-2px] transition-all">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-espresso/40 dark:text-alabaster/40">Monthly Income</span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tighter leading-none mt-2">
              +R{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="clay-card p-6 flex items-center space-x-4 group hover:translate-y-[-2px] transition-all">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex-shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-espresso/40 dark:text-alabaster/40">Monthly Outflow</span>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tighter leading-none mt-2">
              -R{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Month Balance Remainder */}
        <div className="clay-card p-6 flex items-center space-x-4 group hover:translate-y-[-2px] transition-all">
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/10 text-espresso dark:text-alabaster flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-espresso/40 dark:text-alabaster/40">Net Savings</span>
            <h3 className={`text-2xl font-black font-mono tracking-tighter leading-none mt-2 ${monthlyBalance < 0 ? 'text-rose-600' : 'text-espresso dark:text-alabaster'}`}>
              {monthlyBalance < 0 ? '-' : ''}R{Math.abs(monthlyBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>


      {/* Grid: Spend Chart vs Transaction ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Category distribution visualizer */}
        <div className="lg:col-span-2 clay-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Sector Budget</h2>
            <PieChart className="w-4 h-4 text-accent" />
          </div>

          {/* Cumulative Budget percentage tracker */}
          <div className="bg-accent/5 p-5 rounded-2xl border border-accent/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mb-3">
              <span className="text-accent/60">Total Burn Status</span>
              <span className="text-accent font-mono">{percentBurnt}%</span>
            </div>
            <div className="w-full bg-accent/10 h-3 rounded-full overflow-hidden border border-accent/20">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  percentBurnt > 85 ? 'bg-red-500 animate-pulse' : 'bg-accent'
                }`}
                style={{ width: `${percentBurnt}%` }}
              />
            </div>
            <p className="text-[9px] text-accent/40 mt-3 font-bold uppercase tracking-widest leading-relaxed">
              Target limit: R{budgetLimit} monthly total. Keep leisure velocity low.
            </p>
          </div>

          {/* Render category list bars */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em] font-mono">Allocation Matrix</h3>
            
            {categoriesDist.length > 0 ? (
              categoriesDist.map((item) => {
                const colorClass = categoryColorMap[item.name] || 'bg-sand';
                return (
                  <div key={item.name} className="space-y-2 group">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest transition-all">
                      <span className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colorClass} border border-black/10`} />
                        <span className="text-espresso dark:text-alabaster">{item.name}</span>
                      </span>
                      <span className="font-mono text-accent">R{item.value.toFixed(2)} ({item.percent}%)</span>
                    </div>
                    {/* Progress indicator */}
                    <div className="w-full bg-sand/20 dark:bg-espresso-surface-bright h-2 rounded-full overflow-hidden border border-sand dark:border-white/5">
                      <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-[10px] font-black text-espresso/20 dark:text-alabaster/20 uppercase tracking-[0.2em] italic">
                Awaiting Liquid Data...
              </div>
            )}
          </div>
        </div>


        {/* Ledger & Logger Tab */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Row */}
          <div className="clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-black text-espresso dark:text-alabaster tracking-tight uppercase">Liquid Ledger</h2>
              <p className="text-xs text-espresso/40 dark:text-alabaster/40 mt-1 font-bold">Monitor capital velocity. Maintain absolute asset integrity.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-accent hover:bg-accent-hover text-white dark:text-cocoa font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-accent/20 flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Entry</span>
            </button>
          </div>

          {/* Add Logger Form inline */}
          {showAddForm && (
            <form onSubmit={handleAddTransaction} className="clay-card p-8 border-accent/20 bg-accent/5 space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between border-b border-accent/10 pb-4">
                <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Transaction Portal</h3>
                <span className="text-[9px] font-mono text-accent/50 font-black uppercase tracking-widest">Liquid Log</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Description / Payee</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Local Coffee Store, Client Deposit Payment..."
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/20 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Amount (ZAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="24.50"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-black rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/20 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Log Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTypeInput('expense');
                        setCategoryInput('Food');
                      }}
                      className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm ${
                        typeInput === 'expense' 
                          ? 'bg-rose-500 text-white border-rose-500 shadow-rose-200' 
                          : 'bg-white dark:bg-espresso-surface border-sand dark:border-espresso-surface-bright text-espresso/40 dark:text-alabaster/40 hover:bg-parchment'
                      }`}
                    >
                      Cost
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTypeInput('income');
                        setCategoryInput('Income');
                      }}
                      className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm ${
                        typeInput === 'income' 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' 
                          : 'bg-white dark:bg-espresso-surface border-sand dark:border-espresso-surface-bright text-espresso/40 dark:text-alabaster/40 hover:bg-parchment'
                      }`}
                    >
                      Asset
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Sector Envelope</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[11px] font-black uppercase tracking-widest rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm cursor-pointer"
                  >
                    {typeInput === 'expense' ? (
                      <>
                        <option value="Food">🍔 Food / Eating Out</option>
                        <option value="Leisure">🎬 Entertainment & Leisure</option>
                        <option value="Subscriptions">⚡ Hosting & Subscriptions</option>
                        <option value="Health">⚕️ Health / Gym</option>
                        <option value="Education">📚 Education & Mentoring</option>
                        <option value="Uncategorized">📦 Miscellaneous</option>
                      </>
                    ) : (
                      <>
                        <option value="Income">💰 Salary & Dividends</option>
                        <option value="Bonus">✨ Bonus & Gifts</option>
                        <option value="Project">💼 Client Projects</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Billing Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/20" />
                    <input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-white dark:bg-espresso-surface text-espresso/40 dark:text-alabaster/40 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border border-sand dark:border-espresso-surface-bright hover:bg-parchment transition shadow-sm"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white dark:text-cocoa px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition shadow-lg shadow-accent/20 cursor-pointer active:scale-95"
                >
                  Commit Flow
                </button>
              </div>
            </form>
          )}

          {/* Past Ledger Records list */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {transactions.length > 0 ? (
              transactions.map((t) => {
                const isExpense = t.type === 'expense';
                return (
                  <div 
                    key={t.id}
                    className="clay-card p-5 group flex items-center justify-between gap-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      {/* Icon */}
                      <div className={`p-4 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isExpense ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isExpense ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-espresso dark:text-alabaster truncate tracking-tight">{t.desc}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black bg-parchment dark:bg-black/20 border border-sand dark:border-white/5 uppercase tracking-widest text-espresso/40 dark:text-alabaster/40 px-2.5 py-1 rounded-full">
                            {t.category}
                          </span>
                          <div className="text-[9px] text-espresso/30 dark:text-alabaster/30 font-black uppercase tracking-[0.15em] flex items-center space-x-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>{t.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-5">
                      <span className={`text-[15px] font-black font-mono tracking-tighter ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isExpense ? '-' : '+'}R{Math.abs(t.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Permanently erase transaction?')) {
                            handleDeleteTransaction(t.id);
                          }
                        }}
                        className="text-espresso/10 dark:text-alabaster/10 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-red-500/10 p-2.5 transition-all duration-200 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Erase item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="clay-card p-20 text-center border-dashed">
                <Coins className="w-12 h-12 text-espresso/10 dark:text-alabaster/10 mx-auto mb-6 soft-pulse" />
                <h4 className="text-[11px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Liquid Silence</h4>
                <p className="text-[10px] text-espresso/30 dark:text-alabaster/30 mt-2 max-w-sm mx-auto font-bold font-mono tracking-widest uppercase">No verified transactions detected.</p>
              </div>
            )}
          </div>

        </div>


      </div>

    </div>
  );
}
