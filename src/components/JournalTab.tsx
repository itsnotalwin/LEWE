/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Trash2, 
  Smile, 
  Heart, 
  Lightbulb, 
  Calendar, 
  Plus, 
  Check, 
  BookMarked,
  Eye,
  X
} from 'lucide-react';
import { JournalEntry, LifeOSData } from '../types';

interface JournalTabProps {
  data: LifeOSData;
  updateData: (newData: Partial<LifeOSData>) => void;
  getCurrentDate: () => string;
}

export default function JournalTab({ data, updateData, getCurrentDate }: JournalTabProps) {
  // Creator states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<'happy' | 'calm' | 'energetic' | 'tired' | 'productive' | 'neutral'>('neutral');
  const [newGratitude, setNewGratitude] = useState('');
  const [newImprovements, setNewImprovements] = useState('');
  const [newFocusRating, setNewFocusRating] = useState(4);
  const [showAddForm, setShowAddForm] = useState(false);

  // Selected entry modal reader state
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  const todayStr = getCurrentDate();

  // Mood configuration mapping
  const moodMap = {
    happy: { label: 'Happy', emoji: '😊', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    calm: { label: 'Calm / Zen', emoji: '🧘', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    energetic: { label: 'Fired Up', emoji: '⚡', color: 'bg-orange-100 text-orange-850 border-orange-200' },
    tired: { label: 'Resting', emoji: '😴', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    productive: { label: 'Deep Focus', emoji: '✍️', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    neutral: { label: 'Neutral', emoji: '😐', color: 'bg-sand/20 text-espresso dark:text-alabaster border-sand/40 dark:border-white/10' },
    anxious: { label: 'Mindful care', emoji: '🌪️', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  };

  // Add diary entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    // Check if user already logged under todayStr. If so, replace or prevent duplicate
    const filteredJournal = data.journal.filter(j => j.date !== todayStr);

    const newEntry: JournalEntry = {
      id: `journ_${Date.now()}`,
      date: todayStr,
      mood: newMood,
      title: newTitle.trim() || 'Daily Review Notes',
      content: newContent.trim(),
      reflections: {
        gratitude: newGratitude.trim() || 'Steady growth intervals',
        improvements: newImprovements.trim() || 'Opt for screen detachment early',
        focusRating: newFocusRating,
      },
    };

    updateData({
      journal: [newEntry, ...filteredJournal],
    });

    // Reset fields
    setNewTitle('');
    setNewContent('');
    setNewMood('neutral');
    setNewGratitude('');
    setNewImprovements('');
    setNewFocusRating(4);
    setShowAddForm(false);
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // halt clicking card modal
    const updated = data.journal.filter(j => j.id !== id);
    updateData({ journal: updated });
    if (viewingEntry?.id === id) setViewingEntry(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Upper Title HUD */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-black text-espresso dark:text-alabaster tracking-tight uppercase">Liquid Thoughts & Vibe Log</h1>
          <p className="text-xs text-espresso/40 dark:text-alabaster/40 mt-1 font-bold">Capture daily lessons, express micro-gratitudes, and evaluate cognitive efficiency.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent hover:bg-accent-hover text-white dark:text-cocoa font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-accent/20 flex items-center space-x-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'View Matrix' : 'Record Entry'}</span>
        </button>
      </div>

      {/* New Journal entry form */}
      {showAddForm ? (
        <form onSubmit={handleSaveEntry} className="clay-card p-8 border-accent/20 bg-accent/5 space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-accent/10 pb-6">
            <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Temporal Log Archive ({todayStr})</h3>
            <span className="text-accent/50 text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-accent/10 rounded-lg">
              SYSTEM OVERWRITE ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Input Text Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Headline of Reflection</label>
                <input
                  type="text"
                  placeholder="e.g. Balanced Morning & Career Momentum..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/20 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Narrative Thread</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Decode your daily experiences into structural narratives..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/20 shadow-sm resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Right: Mood selectors, ratings, and gratitudes */}
            <div className="space-y-6 bg-white dark:bg-espresso-surface-bright/20 p-6 rounded-[2rem] border border-sand dark:border-white/5 shadow-inner">
              
              {/* Mood picker */}
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Operational Vibe</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(moodMap) as Array<keyof typeof moodMap>).slice(0, 6).map((mKey) => {
                    const active = newMood === mKey;
                    const item = moodMap[mKey];
                    return (
                      <button
                        key={mKey}
                        type="button"
                        onClick={() => setNewMood(mKey)}
                        className={`py-4 px-2 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          active 
                            ? 'bg-black dark:bg-alabaster border-black dark:border-alabaster text-white dark:text-espresso scale-105 z-10' 
                            : 'bg-white dark:bg-espresso-surface border-sand dark:border-espresso-surface-bright text-espresso/40 dark:text-alabaster/40 hover:bg-parchment'
                        }`}
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest truncate w-full text-center">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus Rating slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">
                  <span>Focus Index</span>
                  <span className="text-accent text-[11px] font-mono font-black">{newFocusRating} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={newFocusRating}
                  onChange={(e) => setNewFocusRating(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              {/* Specific gratitudes */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Micro Gratitude</label>
                <input
                  type="text"
                  placeholder="Primary win unit..."
                  value={newGratitude}
                  onChange={(e) => setNewGratitude(e.target.value)}
                  className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[11px] font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Optimization Unit</label>
                <input
                  type="text"
                  placeholder="Next-day target..."
                  value={newImprovements}
                  onChange={(e) => setNewImprovements(e.target.value)}
                  className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[11px] font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                />
              </div>

            </div>

          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-accent/10">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-white dark:bg-espresso-surface text-espresso/40 dark:text-alabaster/40 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border border-sand dark:border-espresso-surface-bright hover:bg-parchment transition shadow-sm"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white dark:text-cocoa px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition shadow-lg shadow-accent/20 cursor-pointer active:scale-95"
            >
              Archive Entry
            </button>
          </div>
        </form>
      ) : (
        /* Timeline log */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.journal.length > 0 ? (
            data.journal.map((entry) => {
              const currentMoodObj = moodMap[entry.mood as keyof typeof moodMap] || moodMap.neutral;
              return (
                <div 
                  key={entry.id}
                  onClick={() => setViewingEntry(entry)}
                  className="clay-card p-6 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl cursor-pointer space-y-6 animate-in fade-in zoom-in-95"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-espresso/30 dark:text-alabaster/30">
                      <div className="flex items-center space-x-2 bg-parchment dark:bg-black/10 px-3 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span className="font-mono">{entry.date}</span>
                      </div>
                      
                      {/* Mood label */}
                      <span className={`px-3 py-1 rounded-lg border text-[9px] font-black shadow-sm flex items-center gap-1.5 ${currentMoodObj.color.replace('bg-amber-100', 'bg-amber-500/10').replace('bg-indigo-100', 'bg-accent/10').replace('bg-orange-100', 'bg-orange-500/10').replace('bg-blue-100', 'bg-blue-500/10').replace('bg-emerald-100', 'bg-emerald-500/10').replace('bg-slate-100', 'bg-sand/20').replace('bg-rose-100', 'bg-rose-500/10')}`}>
                        <span>{currentMoodObj.emoji}</span>
                        <span>{currentMoodObj.label}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-espresso dark:text-alabaster line-clamp-1 tracking-tight leading-none">
                      {entry.title || 'Temporal Review'}
                    </h3>

                    <p className="text-espresso/60 dark:text-alabaster/60 text-xs line-clamp-3 leading-relaxed font-bold bg-sand/10 dark:bg-black/20 p-5 rounded-2xl border border-sand/30 dark:border-white/5 shadow-inner">
                      {entry.content}
                    </p>
                  </div>

                  {/* Tiny metadata footers */}
                  <div className="flex items-center justify-between pt-4 border-t border-sand dark:border-white/5">
                    <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em] flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span>{entry.reflections?.gratitude ? 'Memory Unit Encoded' : 'Content Purified'}</span>
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleDeleteEntry(entry.id, e)}
                        className="text-espresso/10 dark:text-alabaster/10 hover:text-red-500 transition-all cursor-pointer p-2 hover:bg-rose-50 dark:hover:bg-red-500/10 rounded-xl"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 clay-card p-24 text-center border-dashed">
              <BookMarked className="w-12 h-12 text-espresso/10 dark:text-alabaster/10 mx-auto mb-6 soft-pulse" />
              <h4 className="text-[11px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Archive Empty</h4>
              <p className="text-[10px] text-espresso/30 dark:text-alabaster/30 mt-2 max-w-sm mx-auto font-bold font-mono tracking-widest uppercase">Record today's structural narrative to initialize logs.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-8 bg-accent hover:bg-accent-hover text-white dark:text-cocoa font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl transition shadow-lg shadow-accent/20"
              >
                Create Initial Log
              </button>
            </div>
          )}
        </div>
      )}

      {/* Entry viewer Modal overlay popup */}
      {viewingEntry && (
        <div className="fixed inset-0 z-50 bg-espresso/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="clay-card max-w-3xl w-full border-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-espresso-surface animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand dark:border-white/5 bg-parchment/20 dark:bg-black/20">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white dark:bg-espresso-surface border border-sand dark:border-white/5 rounded-[1.5rem] shadow-sm text-3xl">
                  {(moodMap[viewingEntry.mood as keyof typeof moodMap] || moodMap.neutral).emoji}
                </div>
                <div>
                  <h3 className="font-black text-espresso dark:text-alabaster text-sm uppercase tracking-widest">Narrative Recall</h3>
                  <div className="text-[10px] text-espresso/40 dark:text-alabaster/40 font-mono font-bold flex items-center space-x-2 mt-1 uppercase tracking-widest">
                    <Calendar className="w-3 h-3 text-accent" />
                    <span>{viewingEntry.date} • Vibe: {(moodMap[viewingEntry.mood as keyof typeof moodMap] || moodMap.neutral).label}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingEntry(null)}
                className="p-3 text-espresso/40 dark:text-alabaster/40 hover:text-espresso dark:hover:text-alabaster rounded-2xl bg-white dark:bg-espresso-surface/50 border border-sand dark:border-white/5 transition-all shadow-sm active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 overflow-y-auto">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-espresso dark:text-alabaster tracking-tight leading-none uppercase">
                  {viewingEntry.title || 'Untitled Archive'}
                </h2>
                <div className="text-[13px] text-espresso/70 dark:text-alabaster/70 leading-relaxed font-medium bg-parchment/30 dark:bg-black/10 p-8 rounded-[2.5rem] border border-sand dark:border-white/5 shadow-inner italic">
                  "{viewingEntry.content}"
                </div>
              </div>

              {/* Gratitudes Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-accent/5 p-6 rounded-[2rem] border border-accent/10 space-y-3 group hover:bg-accent/10 transition-colors">
                  <h4 className="text-[9px] font-black text-accent uppercase tracking-[0.2em] flex items-center space-x-2 font-mono">
                    <Heart className="w-3.5 h-3.5 fill-accent opacity-50" />
                    <span>Positive Anchor</span>
                  </h4>
                  <p className="text-[11px] font-bold text-espresso dark:text-alabaster leading-relaxed">
                    {viewingEntry.reflections?.gratitude || 'No structural memory detected.'}
                  </p>
                </div>

                <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10 space-y-3 group hover:bg-emerald-500/10 transition-colors">
                  <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center space-x-2 font-mono">
                    <Lightbulb className="w-3.5 h-3.5 opacity-50" />
                    <span>Expansion Target</span>
                  </h4>
                  <p className="text-[11px] font-bold text-espresso dark:text-alabaster leading-relaxed">
                    {viewingEntry.reflections?.improvements || 'No optimization protocol logged.'}
                  </p>
                </div>
              </div>

              {/* Focus score gauge */}
              <div className="flex items-center justify-between text-[9px] font-black text-espresso/40 dark:text-alabaster/40 bg-sand/10 dark:bg-black/20 p-5 rounded-2xl border border-sand dark:border-white/5 uppercase tracking-[0.2em]">
                <span>Operational Efficiency Profile</span>
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full border transition-all ${i < (viewingEntry.reflections?.focusRating || 4) ? 'bg-accent border-accent scale-110' : 'bg-transparent border-sand dark:border-white/10'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
