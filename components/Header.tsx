'use client';

import React from 'react';
import { useIP } from '@/context/IPContext';
import { Volume2, VolumeX, Network, HelpCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from '@/components/Modal';

export default function Header() {
  const { mode, setMode, soundEnabled, setSoundEnabled } = useIP();
  const [showV6Modal, setShowV6Modal] = React.useState(false);

  const handleV6Click = () => {
    setShowV6Modal(true);
  };

  return (
    <header className="no-print border-b border-slate-900 glass-panel relative z-40 px-4 md:px-8 py-4 transition-all duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo and Brand Title */}
        <div className="flex items-center gap-3.5">
          <motion.div 
            initial={{ rotate: -5, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
            id="logo-wrap"
          >
            <Network className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-l from-white via-indigo-100 to-emerald-300 bg-clip-text text-transparent tracking-tight">
              آی‌پی پلاس <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">نسخه ۲.۰ 💎</span>
            </h1>
            <p className="text-[10px] md:text-[11px] text-slate-400 mt-1">پلتفرم آموزشی و آزمایشگاه پیشرفته مفاهیم پایه و تخصصی شبکه</p>
          </div>
        </div>

        {/* Toolbar parameters */}
        <div className="flex items-center gap-3.5">
          {/* Audio synthethizer control */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-bold ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
            id="sound-trigger"
            title="قطع/وصل صداهای کمکی"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            <span>صدای بازی</span>
          </button>

          {/* IPv4 / IPv6 Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 text-xs font-bold" id="mode-badge-wrap">
            <button
              onClick={() => setMode('ipv4')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                mode === 'ipv4'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              id="mode-v4-btn"
            >
              IPv4
            </button>
            <button
              onClick={handleV6Click}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-slate-500 hover:text-slate-300`}
              id="mode-v6-btn"
            >
              <span>IPv6</span>
              <Lock className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* IPv6 Unlock Dialog details */}
      <Modal
        isOpen={showV6Modal}
        onClose={() => setShowV6Modal(false)}
        title="🚀 به زودی: پشتیبانی پیشرفته و بومی از IPv6"
        icon="school"
      >
        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed text-justify" dir="rtl">
          <p>بخش کالبدشکافی زنده، آنالیزهای شبکه‌ای، کوییزهای تعاملی و ابزارهای مربی هوشمند برای آدرس‌های نسل ششم (IPv6) در دست توسعه انقلابی و هماهنگ‌سازی قرار دارد.</p>
          <p>به زودی در آپدیت‌های آینده، تمامی بخش‌های پلتفرم به صورت کاملاً تفکیک‌شده و ۱۰۰٪ اختصاصی به معماری ۱۲۸ بیتی IPv6 مجهز خواهند شد تا مقتدرانه بر مفاهیم نسل جدید وب نیز مسلط شوید.</p>
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/10 rounded-xl text-indigo-300 font-bold">
            📢 کماکان می‌توانید از کارگاه فوق‌پیشرفته IPv4 و ابزارهای هوش مصنوعی بر روی آدرس‌های فعال استفاده فرمایید.
          </div>
        </div>
      </Modal>
    </header>
  );
}
