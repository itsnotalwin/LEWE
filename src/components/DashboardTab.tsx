/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flame, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Sparkles, 
  CheckSquare, 
  Coins, 
  Smile, 
  Calendar,
  FolderGit2,
  Target
} from 'lucide-react';
import { Habit, Task, Transaction, DailyFocus, LifeOSData } from '../types';
import DailyAffirmation from './DailyAffirmation';

interface DashboardTabProps {
  data: LifeOSData;
  updateData: (newData: Partial<LifeOSData>) => void;
  setActiveTab: (tab: string) => void;
  getCurrentDate: () => string;
}

export default function DashboardTab({ data, updateData, setActiveTab, getCurrentDate }: DashboardTabProps) {
  const [time, setTime] = useState(new Date());
  const [newFocusInput, setNewFocusInput] = useState('');
  const [isEditingFocus, setIsEditingFocus] = useState(!data.focus?.text);

  // Keep digital clock updating smoothly
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getCurrentDate();

  // Compute greeting based on hours
  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 5) return 'Good Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculations
  const habitsToday = data.habits || [];
  const completedHabitsCount = habitsToday.filter(h => h.history[todayStr] === true).length;
  const totalHabitsCount = habitsToday.length;
  const habitCompletionRate = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  const incompleteTasks = (data.tasks || []).filter(t => !t.completed);
  const urgentTasks = incompleteTasks
    .filter(t => t.priority === 'high')
    .slice(0, 3);
  const remainingTasksCount = incompleteTasks.length;

  const thisMonthExpenses = (data.transactions || [])
    .filter(t => {
      const parts = t.date.split('-');
      const todayParts = todayStr.split('-');
      return t.type === 'expense' && parts[0] === todayParts[0] && parts[1] === todayParts[1];
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const budgetLimit = 1200; // static demo limit
  const budgetPercentage = Math.min(Math.round((thisMonthExpenses / budgetLimit) * 100), 100);

  // Handle focus edit/complete
  const handleSaveFocus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFocusInput.trim()) return;
    updateData({
      focus: {
        text: newFocusInput.trim(),
        completed: false,
        date: todayStr,
      },
    });
    setIsEditingFocus(false);
  };

  const handleToggleFocus = () => {
    if (!data.focus) return;
    updateData({
      focus: {
        ...data.focus,
        completed: !data.focus.completed,
      },
    });
  };

  const handleClearFocus = () => {
    setNewFocusInput('');
    updateData({
      focus: {
        text: '',
        completed: false,
        date: todayStr,
      },
    });
    setIsEditingFocus(true);
  };

  // Quick toggle habit today
  const toggleHabit = (id: string) => {
    const updatedHabits = data.habits.map(h => {
      if (h.id === id) {
        const isCompletedNow = !h.history[todayStr];
        const newHistory = { ...h.history, [todayStr]: isCompletedNow };
        
        // Simple streak recalculator
        let currentStreak = h.streak;
        if (isCompletedNow) {
          currentStreak += 1;
        } else {
          currentStreak = Math.max(0, currentStreak - 1);
        }
        const maxStreak = Math.max(h.maxStreak, currentStreak);

        return { ...h, history: newHistory, streak: currentStreak, maxStreak };
      }
      return h;
    });
    updateData({ habits: updatedHabits });
  };

  // Formatting date nicely
  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-12">
      {/* Prime Header & Timebox HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-6">
        <div className="max-w-2xl">
          <p className="text-espresso/40 dark:text-alabaster/40 font-mono text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            {formatDateFull(time)} • {formatClock(time)}
          </p>
          <h1 className="text-5xl md:text-7xl font-sans text-espresso dark:text-alabaster tracking-tight font-medium" style={{ letterSpacing: '-0.04em' }}>
            {getGreeting()}.
          </h1>
          <p className="text-espresso/60 dark:text-alabaster/60 text-lg md:text-xl mt-4 max-w-lg leading-relaxed font-light">
            Your personal workspace is ready. Today is a clean canvas to optimize habits, execute actions, and capture creative logs.
          </p>
        </div>

        {/* Dynamic Daily Focus HUD */}
        <div className="md:w-96">
          <div className="p-6 bg-white/50 dark:bg-espresso-surface/50 backdrop-blur-md rounded-[2.5rem] border border-sand dark:border-white/5">
            <div className="text-[10px] text-espresso/50 dark:text-alabaster/50 font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Target className="w-3 h-3 text-accent" />
              Primary Objective
            </div>
            {isEditingFocus ? (
              <form onSubmit={handleSaveFocus} className="flex gap-2">
                <input
                  type="text"
                  value={newFocusInput}
                  onChange={(e) => setNewFocusInput(e.target.value)}
                  placeholder="Set your absolute #1 priority..."
                  className="flex-1 bg-parchment/50 dark:bg-black/20 border border-sand dark:border-white/10 text-espresso dark:text-alabaster rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/30 dark:placeholder:text-alabaster/30"
                  required
                />
                <button
                  type="submit"
                  className="bg-accent text-white dark:text-cocoa hover:bg-accent-hover font-black text-xs h-[52px] w-[76.1562px] rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg shadow-accent/20 active:scale-95"
                >
                  <Plus className="w-4 h-4 flex-shrink-0 ml-[-10px]" />
                  <span className="pl-[-5px] ml-0">Lock In</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleToggleFocus}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${
                      data.focus?.completed 
                        ? 'bg-accent border-accent text-white dark:text-cocoa' 
                        : 'border-sand dark:border-white/20 text-transparent hover:border-accent/50'
                    }`}
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>
                  <span className={`text-lg font-medium transition-all ${data.focus?.completed ? 'line-through text-espresso/40 dark:text-alabaster/40' : 'text-espresso dark:text-alabaster'}`}>
                    {data.focus?.text}
                  </span>
                </div>
                <button 
                  onClick={handleClearFocus}
                  className="text-xs text-espresso/40 dark:text-alabaster/40 hover:text-accent underline decoration-espresso/20 dark:decoration-alabaster/20 underline-offset-4 cursor-pointer transition-colors w-fit"
                >
                  Clear Objective
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Affirmation */}
      <DailyAffirmation todayStr={todayStr} />

      {/* Bento Board Overview Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Habit Completion Card */}
        <div className="clay-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Habit Integrity</h3>
            <Flame className="w-5 h-5 text-accent transition-transform group-hover:scale-110" />
          </div>
          <div className="flex items-center space-x-5">
            <div className="relative flex items-center justify-center">
              {/* Custom SVG Radial Ring */}
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-sand/20 dark:text-espresso-surface-bright" />
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - habitCompletionRate / 100)}`}
                  className="text-accent transition-all duration-700 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-espresso dark:text-alabaster font-mono">
                {habitCompletionRate}%
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-black text-espresso dark:text-alabaster font-mono tracking-tighter">
                {completedHabitsCount}<span className="text-xs text-espresso/30 mx-0.5">/</span>{totalHabitsCount}
              </div>
              <p className="text-[10px] font-bold text-espresso/50 dark:text-alabaster/50 mt-1 leading-tight">
                Consecutive daily routine actions.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('habits')}
            className="mt-6 w-full bg-parchment dark:bg-espresso-surface-bright hover:bg-sand dark:hover:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-accent font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-95"
          >
            <span>Open Habit Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Task Priorities Card */}
        <div className="clay-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Action Pipeline</h3>
            <Layers className="w-5 h-5 text-accent transition-transform group-hover:translate-y-[-2px]" />
          </div>
          <div>
            <div className="text-2xl font-black text-espresso dark:text-alabaster font-mono tracking-tighter">
              {remainingTasksCount}
            </div>
            <p className="text-[10px] font-bold text-espresso/50 dark:text-alabaster/50 mt-1">
              Outstanding tasks remaining in cycle.
            </p>
            {urgentTasks.length > 0 ? (
              <div className="mt-4 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-accent/10 text-accent px-2.5 py-1 rounded-full">
                  High Priority
                </span>
                <div className="space-y-1.5 mt-2 text-[11px] font-bold text-espresso/80 dark:text-alabaster/80">
                  {urgentTasks.map(t => (
                    <div key={t.id} className="flex items-center space-x-2 bg-parchment/50 dark:bg-espresso-surface-bright/30 p-1.5 rounded-lg border border-sand/30 dark:border-white/5">
                      <CheckCircle2 className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-wider border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Inbox Zero Status</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setActiveTab('tasks')}
            className="mt-6 w-full bg-parchment dark:bg-espresso-surface-bright hover:bg-sand dark:hover:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-accent font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-95"
          >
            <span>Manage Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expense Wallet Card */}
        <div className="clay-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Monthly Budget</h3>
            <Coins className="w-5 h-5 text-accent transition-transform group-hover:rotate-12" />
          </div>
          <div>
            <div className="text-2xl font-black text-espresso dark:text-alabaster font-mono tracking-tighter">
              R{thisMonthExpenses.toFixed(2)}
            </div>
            <div className="text-[10px] font-bold text-espresso/50 dark:text-alabaster/50 mt-1 flex justify-between">
              <span>Spend Velocity</span>
              <span className="font-black text-accent">R{budgetLimit} LIMIT</span>
            </div>
            {/* Custom Visual Bar */}
            <div className="w-full bg-sand/20 dark:bg-espresso-surface-bright h-2.5 rounded-full overflow-hidden mt-4 border border-sand/30 dark:border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  budgetPercentage > 85 ? 'bg-red-500' : 'bg-accent'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('finance')}
            className="mt-6 w-full bg-parchment dark:bg-espresso-surface-bright hover:bg-sand dark:hover:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-accent font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-95"
          >
            <span>Audit Wallet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project Execution Hub */}
      <div className="clay-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-xl">
              <FolderGit2 className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base font-black text-espresso dark:text-alabaster uppercase tracking-tight">Project Execution Hub</h2>
              <p className="text-[10px] text-espresso/40 dark:text-alabaster/40 font-bold">Track circular completion rates across active system initiatives</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-[10px] font-black text-accent hover:text-accent-hover uppercase tracking-widest flex items-center space-x-1 transition-all"
          >
            <span>View Initiatives</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.projects && data.projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.projects.map((project) => {
              const projectTasks = (data.tasks || []).filter(t => t.projectId === project.id);
              const totalTasks = projectTasks.length;
              const completedTasks = projectTasks.filter(t => t.completed).length;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              
              const radius = 22;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (progress / 100) * circumference;

              return (
                <div 
                  key={project.id}
                  onClick={() => setActiveTab('tasks')}
                  className="p-5 flex items-center justify-between border border-sand dark:border-white/5 bg-parchment/30 dark:bg-espresso-surface/30 hover:border-accent/30 dark:hover:border-white/15 transition-all duration-300 group rounded-2xl cursor-pointer active:scale-[0.98] hover:shadow-sm"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    {/* Circular SVG Progress Ring with centered percentage text */}
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <svg className="w-14 h-14 transform -rotate-90 flex-shrink-0">
                        {/* Background track circle */}
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-sand/20 dark:text-espresso-surface-bright"
                        />
                        {/* Animated foreground progress circle */}
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke={project.color || '#8b5e3c'}
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black font-mono text-espresso dark:text-alabaster">
                        {progress}%
                      </span>
                    </div>

                    {/* Project Metadata */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: project.color || '#8b5e3c' }} 
                        />
                        <h4 className="text-sm font-black text-espresso dark:text-alabaster truncate group-hover:text-accent transition-colors">
                          {project.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-espresso/50 dark:text-alabaster/50 mt-1 truncate max-w-[150px] font-medium">
                        {project.description || 'System initiative pipeline'}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[9px] font-mono font-bold text-espresso/40 dark:text-alabaster/40 uppercase tracking-widest bg-sand/20 dark:bg-black/20 px-1.5 py-0.5 rounded">
                          {project.category}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-accent">
                          {completedTasks}/{totalTasks} tasks
                        </span>
                      </div>
                    </div>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-espresso/30 dark:text-alabaster/30 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 ml-2" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-espresso/30 dark:text-alabaster/30 text-xs font-mono font-bold uppercase tracking-widest italic border border-dashed border-sand dark:border-white/5 rounded-2xl">
            No active projects inside local database.
          </div>
        )}
      </div>

      {/* Main Bottom Section: Daily Habits checkoff & Quick Tasks list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rapid Habit Toggle Matrix */}
        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <Smile className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-base font-black text-espresso dark:text-alabaster uppercase tracking-tight">Active Matrix</h2>
            </div>
            <span className="text-[10px] font-black text-espresso/40 dark:text-alabaster/40 font-mono tracking-widest">TODAY</span>
          </div>
          
          {habitsToday.length > 0 ? (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {habitsToday.map((habit) => {
                const isCompletedToday = !!habit.history[todayStr];
                return (
                  <div 
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                      isCompletedToday 
                        ? 'bg-accent/5 border-accent/20 dark:bg-accent/10' 
                        : 'bg-parchment/50 dark:bg-espresso-surface-bright/50 border-sand dark:border-espresso-surface-bright/50 hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompletedToday 
                          ? 'bg-accent border-accent text-white dark:text-cocoa scale-110 shadow-sm' 
                          : 'border-sand dark:border-espresso-surface-bright text-transparent bg-white dark:bg-espresso-surface'
                      }`}>
                        {isCompletedToday && <CheckSquare className="w-4 h-4" />}
                      </div>
                      <span className={`text-sm font-bold truncate transition-all duration-300 ${
                        isCompletedToday ? 'text-espresso/40 dark:text-alabaster/40 line-through' : 'text-espresso dark:text-alabaster'
                      }`}>
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-espresso/40 dark:text-alabaster/40 bg-sand/20 dark:bg-black/20 px-2 py-1 rounded-md">
                        {habit.category}
                      </span>
                      <div className="flex items-center space-x-1 text-accent">
                        <Flame className="w-4 h-4 fill-accent" />
                        <span className="text-xs font-black font-mono">{habit.streak}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-espresso/30 dark:text-alabaster/30 text-xs font-mono font-bold uppercase tracking-widest italic">
              No active matrices.
            </div>
          )}
        </div>

        {/* High Leverage Focus list */}
        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <CheckSquare className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-base font-black text-espresso dark:text-alabaster uppercase tracking-tight">Active Pipeline</h2>
            </div>
            <span className="text-[10px] font-black text-accent font-mono tracking-widest uppercase">{incompleteTasks.length} PENDING</span>
          </div>

          {incompleteTasks.length > 0 ? (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {incompleteTasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-parchment/30 dark:bg-espresso-surface-bright/20 rounded-2xl border border-sand dark:border-white/5 hover:border-accent/40 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                      task.priority === 'high' ? 'bg-red-500 animate-pulse' : task.priority === 'medium' ? 'bg-accent' : 'bg-sand'
                    }`} />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-espresso dark:text-alabaster truncate">{task.title}</h4>
                      {task.dueDate && (
                        <p className="text-[9px] text-espresso/40 dark:text-alabaster/40 font-mono font-black mt-1 uppercase tracking-widest">Due: {task.dueDate}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] uppercase tracking-widest font-black bg-accent/10 text-accent px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
                    {task.category}
                  </span>
                </div>
              ))}
              {incompleteTasks.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="text-[10px] font-black text-accent hover:text-accent-hover uppercase tracking-widest underline decoration-accent/20 underline-offset-4 cursor-pointer transition-all"
                  >
                    View all {incompleteTasks.length} pipeline items
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-espresso/30 dark:text-alabaster/30 text-xs font-mono font-bold uppercase tracking-widest italic">
              Pipeline Zero achieved.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
