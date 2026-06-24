/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Quote, Sparkles } from 'lucide-react';

interface DailyAffirmationProps {
  todayStr: string;
}

const AFFIRMATIONS = [
  {
    text: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock"
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    text: "Focus is a muscle, and you build it by choosing what to ignore.",
    author: "System Core"
  },
  {
    text: "Great things are done by a series of small things brought together.",
    author: "Vincent van Gogh"
  },
  {
    text: "Simplicity is the ultimate sophistication of execution.",
    author: "Leonardo da Vinci"
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear"
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    text: "Quiet minds build lasting kingdoms of focus.",
    author: "Zen Philosophy"
  },
  {
    text: "Energy flows where attention goes. Direct yours with intent.",
    author: "Mental Edge"
  },
  {
    text: "Consistency is the quiet edge of greatness.",
    author: "Life OS Protocols"
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "Action is the foundational key to all operational success.",
    author: "Pablo Picasso"
  },
  {
    text: "Do not seek to follow in the footsteps of the wise. Seek what they sought.",
    author: "Matsuo Bashō"
  },
  {
    text: "Be silent, or say something better than silence.",
    author: "Pythagoras"
  },
  {
    text: "Make each day your ultimate masterpiece of execution.",
    author: "John Wooden"
  }
];

export default function DailyAffirmation({ todayStr }: DailyAffirmationProps) {
  // Deterministic quote index based on the date string hash
  const getDeterministicIndex = (dateStr: string, total: number) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % total;
  };

  const index = getDeterministicIndex(todayStr, AFFIRMATIONS.length);
  const currentAffirmation = AFFIRMATIONS[index];

  return (
    <div className="clay-card p-6 border border-sand dark:border-white/5 bg-parchment/60 dark:bg-espresso-surface/40 shadow-sm relative overflow-hidden transition-all duration-300 group hover:border-accent/30">
      {/* Background visual flair */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote className="w-32 h-32 text-accent rotate-12" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-accent/10 text-accent flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.25em] flex items-center gap-1.5">
              <span>DAILY STRATEGIC ALIGNMENT</span>
              <span className="w-1 h-1 rounded-full bg-accent/40" />
              <span>24H CYCLE ACTIVE</span>
            </span>
            <p className="text-sm md:text-base font-extrabold text-espresso dark:text-alabaster italic leading-relaxed font-sans max-w-2xl">
              "{currentAffirmation.text}"
            </p>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-[1px] bg-accent/40" />
              <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">
                {currentAffirmation.author}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end md:self-center bg-sand/15 dark:bg-black/20 border border-sand/40 dark:border-white/5 rounded-xl px-4 py-2 font-mono text-[9px] font-bold text-espresso/50 dark:text-alabaster/50 uppercase tracking-widest whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>Next quote in 24h</span>
        </div>
      </div>
    </div>
  );
}
