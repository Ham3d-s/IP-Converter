'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SoundFX } from '@/lib/audio';

export default function QuickGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    SoundFX.click();
    setIsOpen(!isOpen);
  };

  return (
    <section className="no-print" id="quick-guide-section" dir="rtl">
      <div className="glass-panel overflow-hidden rounded-3xl border border-indigo-500/10 shadow-lg transition-all duration-300">
        
        {/* Toggle Head segment */}
        <button
          onClick={toggleOpen}
          className="w-full flex justify-between items-center p-5 text-right font-extrabold text-sm text-indigo-300 select-none bg-slate-950/25 cursor-pointer hover:bg-slate-950/40 transition-colors"
          id="btn-toggle-guide"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            <span>راهنمای شروع سریع و مفاهیم بنیادی شبکه</span>
          </div>
          <div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {/* Expandable Body */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 border-t border-indigo-500/10 bg-slate-950/60 text-xs md:text-sm text-slate-300 leading-relaxed space-y-4">
                <p className="text-justify leading-relaxed">
                  آدرس آی‌پی (IP) درست مثل شماره تماس یا آدرس پستی خانه شماست تا دستگاه‌ها بتوانند در شبکه یکدیگر را پیدا کنند. این آدرس از ۴ بخش (اکتت) تشکیل شده است. با وارد کردن یک آی‌پی در کادر زیر، سیستم آن را کالبدشکافی کرده و به زبان شیرین باینری (صفر و یک) تبدیل می‌کند. سابنت ماسک نیز مشخص می‌کند کدام بخش متعلق به محله شماست (شبکه) و کدام بخش شماره خانه شماست (هاست).
                </p>
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                  <h3 className="text-indigo-400 font-bold">💡 مثال کاربردی و ملموس:</h3>
                  <p className="leading-relaxed text-justify">
                    در آدرس آی‌پی <code className="text-indigo-400 font-bold font-mono">192.168.1.50</code> با پیش‌وند <code className="text-emerald-400 font-bold font-mono">/24</code> (یا سابنت ماسک <code className="text-emerald-400 font-bold font-mono">255.255.255.0</code>), سه بخش اول یعنی <code className="text-indigo-400 font-bold font-mono">192.168.1</code> شبیه به پیش‌شماره تلفن کل شهرداری یا خیابان یکسان است که به آن <strong className="text-indigo-300">شناسه شبکه (Network ID)</strong> می‌گویند. عدد آخر یعنی <code className="text-emerald-400 font-bold font-mono">50</code> پلاک اختصاصی این سیستم است که به آن <strong className="text-emerald-300">شناسه میزبان (Host ID)</strong> می‌گویند.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
