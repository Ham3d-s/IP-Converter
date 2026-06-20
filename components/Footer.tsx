'use client';

import React from 'react';
import { Sparkles, Send, Github } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  return (
    <footer className="no-print border-t border-slate-900 glass-panel bg-slate-950/80 py-6 mt-12 transition-all duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 select-none">
        
        {/* Right segment: Developer and Telegram handle */}
        <div className="flex items-center gap-2 font-bold text-center sm:text-right">
          <span>طراحی و توسعه برای تفریح و آموزش توسط </span>
          <a
            href="https://t.me/Ham3d_Note"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors flex items-center gap-1 group font-sans font-bold"
            id="telegram-link"
          >
            <span>Ham3ds</span>
            <Send className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Left segment: GitHub link button */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Ham3d-s/ip-converter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-800 text-slate-350 hover:text-white transition-all duration-300 group shadow-md"
            title="مشاهده کدهای منبع در گیت‌هاب"
            id="github-link-btn"
          >
            <Github className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-sans text-[11px] font-bold">مخزن گیت‌هاب</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
