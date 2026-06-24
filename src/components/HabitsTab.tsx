/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Flame, 
  Trash2, 
  Award, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Grid 
} from 'lucide-react';
import { Habit, LifeOSData } from '../types';
import { getRelativeDateString } from '../mockData';

interface HabitsTabProps {
  data: LifeOSData;
  updateData: (newData: Partial<LifeOSData>) => void;
  getCurrentDate: () => string;
}

export default function HabitsTab({ data, updateData, getCurrentDate }: HabitsTabProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Growth');
  const [showAddForm, setShowAddForm] = useState(false);

  const todayStr = getCurrentDate();

  // Create a 7-day list of dates relative to today for backfilling / logging
  const daysOfTracker = [
    { label: 'Mon', dateStr: getRelativeDateString(-6) },
    { label: 'Tue', dateStr: getRelativeDateString(-5) },
    { label: 'Wed', dateStr: getRelativeDateString(-4) },
    { label: 'Thu', dateStr: getRelativeDateString(-3) },
    { label: 'Fri', dateStr: getRelativeDateString(-2) },
    { label: 'Sat', dateStr: getRelativeDateString(-1) },
    { label: 'Sun', dateStr: getRelativeDateString(0) }, // Today
  ];

  // Map the correct weekday label relative to the current real date!
  // To avoid hardcoding Mon-Sun statically if today is not Sunday, we can dynamically build the last 7 days!
  // Let's generate the actual weekday name dynamically for each offset so it corresponds exactly to real calendar names!
  const buildLast7Days = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const weekdayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      list.push({ weekdayLabel, dayNum, dateStr });
    }
    return list;
  };

  const interactiveDays = buildLast7Days();

  // Calculate Streak helper
  const computeStreaks = (history: Record<string, boolean>) => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Scan backwards from today or scan chronological order to count streaks!
    // Let's scan from 60 days ago to today chronologically to compute current and max streak.
    const sortedDates: string[] = [];
    for (let i = 60; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      sortedDates.push(d.toISOString().split('T')[0]);
    }

    sortedDates.forEach((dStr) => {
      if (history[dStr] === true) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Current streak is continuous completed days up to today (allowing yesterday or today to count)
    let current = 0;
    let checkDate = new Date();
    // If today is completed, start counting from today; otherwise start checking from yesterday
    let checkStr = checkDate.toISOString().split('T')[0];
    if (history[checkStr] !== true) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
    }

    while (history[checkStr] === true) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
    }

    return { current, max: Math.max(maxStreak, current) };
  };

  // Calculate top streaks for summary
  const habitStreaks = data.habits.map(h => {
    const s = computeStreaks(h.history);
    return { ...h, streak: s.current };
  }).sort((a, b) => b.streak - a.streak);

  // Toggle checklist for specific date
  const toggleHabitDate = (habitId: string, dateStr: string) => {
    const updatedHabits = data.habits.map((h) => {
      if (h.id === habitId) {
        const newHistory = { ...h.history, [dateStr]: !h.history[dateStr] };
        const streaks = computeStreaks(newHistory);
        return {
          ...h,
          history: newHistory,
          streak: streaks.current,
          maxStreak: streaks.max,
        };
      }
      return h;
    });
    updateData({ habits: updatedHabits });
  };

  // Add Habit
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `hb_${Date.now()}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      streak: 0,
      maxStreak: 0,
      history: {},
      createdAt: todayStr,
    };

    updateData({
      habits: [...data.habits, newHabit],
    });

    setNewHabitName('');
    setShowAddForm(false);
  };

  // Delete Habit
  const handleDeleteHabit = (id: string) => {
    const updatedHabits = data.habits.filter((h) => h.id !== id);
    updateData({ habits: updatedHabits });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="clay-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-espresso dark:text-alabaster tracking-tight uppercase">Habit Integrity Matrix</h1>
          <p className="text-xs text-espresso/50 dark:text-alabaster/50 mt-1 font-bold">
            Build unshakeable consistency. Click the calendar grids below to backfill or toggle your habits.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent hover:bg-accent-hover text-white font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all duration-200 shadow-sm flex items-center space-x-2 cursor-pointer active:scale-95"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Close Drawer' : 'New Habit'}</span>
        </button>
      </div>

      {/* Streak Summary Widget */}
      {data.habits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          {habitStreaks.map((h) => (
            <div 
              key={h.id} 
              className={`clay-card p-4 flex flex-col items-center justify-center text-center space-y-2 group transition-all duration-300 ${
                h.streak > 0 ? 'bg-accent/5 border-accent/20' : 'opacity-60'
              }`}
            >
              <div className="relative">
                <Flame className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${h.streak > 0 ? 'text-accent fill-accent animate-pulse' : 'text-espresso/10 dark:text-alabaster/10'}`} />
                {h.streak >= 7 && (
                  <Award className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
                )}
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest text-espresso/40 dark:text-alabaster/40 leading-tight line-clamp-1 w-full px-1">
                {h.name}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className={`text-xl font-black font-mono leading-none ${h.streak > 0 ? 'text-espresso dark:text-alabaster' : 'text-espresso/20 dark:text-alabaster/20'}`}>{h.streak}</span>
                <span className="text-[7px] font-black text-accent uppercase tracking-tighter">DAYS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Habit Drawer Form */}
      {showAddForm && (
        <div className="clay-card p-6 border-accent/20 bg-accent/5 transition-all">
          <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-5">Establish New Commitment</h3>
          <form onSubmit={handleAddHabit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Habit Label</label>
              <input
                type="text"
                placeholder="e.g. Read Philosophy Books"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Focus Sector</label>
              <select
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value)}
                className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
              >
                <option value="Health">⚕ Health / Fitness</option>
                <option value="Growth">📚 Personal Growth</option>
                <option value="Work">💼 Work / Projects</option>
                <option value="Finance">💰 Budget Management</option>
                <option value="Personal">🧘 Lifestyle / Mindset</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-black dark:bg-alabaster text-white dark:text-espresso font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:bg-espresso dark:hover:bg-white active:scale-95"
              >
                Instantiate Habit
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Habits List Grid View */}
      {data.habits.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {data.habits.map((habit) => (
            <div 
              key={habit.id}
              className="clay-card p-6 shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group"
            >
              {/* Left Side: Meta & Streaks */}
              <div className="lg:w-1/3 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-black uppercase bg-parchment dark:bg-black/20 border border-sand dark:border-espresso-surface-bright px-3 py-1 rounded-full text-accent tracking-[0.1em]">
                    {habit.category}
                  </span>
                </div>
                <h3 className="text-lg font-black text-espresso dark:text-alabaster leading-tight tracking-tight">
                  {habit.name}
                </h3>
                
                {/* Stats row */}
                <div className="flex items-center space-x-6 pt-1">
                  <div className="flex items-center space-x-2 text-accent" title="Current streak">
                    <Flame className="w-4 h-4 fill-accent" />
                    <span className="text-xs font-mono font-black">{habit.streak} DAY STREAK</span>
                  </div>
                  <div className="flex items-center space-x-2 text-espresso/40 dark:text-alabaster/40" title="All-time high streak">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-mono font-black uppercase tracking-widest">Max: {habit.maxStreak}</span>
                  </div>
                </div>
              </div>

              {/* Today's Registration Action Toggler */}
              <div className="flex flex-col items-stretch lg:items-center justify-center min-w-[130px]">
                <span className="text-[9px] font-black text-espresso/30 dark:text-alabaster/30 uppercase tracking-[0.25em] mb-2 font-mono text-center lg:block hidden">
                  Today's Habit
                </span>
                <button
                  onClick={() => toggleHabitDate(habit.id, todayStr)}
                  className={`relative flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 w-full group/btn cursor-pointer ${
                    habit.history[todayStr]
                      ? 'bg-accent text-white dark:text-cocoa shadow-lg shadow-accent/20 border border-accent'
                      : 'bg-white dark:bg-espresso-surface border border-sand dark:border-white/10 text-espresso dark:text-alabaster shadow-sm hover:border-accent/40 hover:text-accent transform hover:-translate-y-0.5'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${habit.history[todayStr] ? 'text-white dark:text-cocoa' : 'text-accent'}`} />
                  <span>{habit.history[todayStr] ? 'Complete' : 'Record Done'}</span>
                </button>
              </div>

              {/* Center: Weekly interactive status logs */}
              <div className="flex-1">
                <div className="block lg:hidden text-[9px] font-black text-espresso/30 dark:text-alabaster/30 uppercase tracking-[0.25em] mb-3">
                  Log Index
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {interactiveDays.map((day) => {
                    const isChecked = !!habit.history[day.dateStr];
                    const isTodayLocal = day.dateStr === todayStr;

                    return (
                      <div 
                        key={day.dateStr}
                        onClick={() => toggleHabitDate(habit.id, day.dateStr)}
                        className={`flex flex-col items-center py-4 px-2 rounded-2xl border transition-all duration-200 cursor-pointer select-none relative group/day ${
                          isChecked 
                            ? 'bg-accent text-white dark:text-cocoa border-accent shadow-accent/20 shadow-md' 
                            : 'bg-parchment/60 dark:bg-espresso-surface-bright text-espresso dark:text-alabaster border-sand dark:border-white/5 hover:border-accent/40'
                        }`}
                      >
                        <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-2 ${isChecked ? 'text-white/60 dark:text-cocoa/60' : 'text-espresso/30 dark:text-alabaster/30'}`}>
                          {day.weekdayLabel}
                        </span>
                        <span className="text-sm font-black font-mono leading-none">
                          {day.dayNum}
                        </span>
                        
                        {/* Status marker */}
                        <div className={`w-1.5 h-1.5 rounded-full mt-3 transition-all duration-300 ${
                          isChecked ? 'bg-white scale-125 shadow-sm' : isTodayLocal ? 'bg-accent soft-pulse' : 'bg-transparent'
                        }`} />

                        {/* Visual guide for Today */}
                        {isTodayLocal && (
                          <span className={`absolute -top-1.5 text-[7px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full shadow-sm ${
                            isChecked ? 'bg-black text-white' : 'bg-accent text-white dark:text-cocoa'
                          }`}>
                            NOW
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Deletion controls */}
              <div className="lg:w-16 flex justify-end">
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-3 text-espresso/20 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Abandon Habit"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="clay-card p-16 text-center border-dashed">
          <Grid className="w-12 h-12 text-espresso/10 dark:text-alabaster/10 mx-auto mb-4" />
          <p className="text-espresso/40 dark:text-alabaster/40 text-sm font-bold font-mono tracking-wide">No active commitments initialized.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-6 text-[10px] font-black text-accent hover:text-accent-hover uppercase tracking-widest underline underline-offset-4 decoration-accent/20 cursor-pointer"
          >
            Instantiate your first habit matrix
          </button>
        </div>
      )}


    </div>
  );
}
