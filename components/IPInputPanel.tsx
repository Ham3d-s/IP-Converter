'use client';

import React, { useState } from 'react';
import { useIP } from '@/context/IPContext';
import { Edit2, Maximize2, Minimize2, HelpCircle, Star, Shuffle, RotateCcw, ShieldCheck } from 'lucide-react';
import { SoundFX } from '@/lib/audio';
import { Modal } from '@/components/Modal';
import { validateIPv4 } from '@/lib/ip-utils';

export default function IPInputPanel() {
  const {
    ip,
    mode,
    favorites,
    toggleFavorite,
    handleIPInput,
    generateRandom,
    resetAll,
  } = useIP();

  const [isMaximized, setIsMaximized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isValidForDisplay = mode === 'ipv4' ? validateIPv4(ip) : true;
  const isStarred = favorites.includes(ip);

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  const handleResetClick = () => {
    SoundFX.click();
    resetAll();
  };

  return (
    <>
      <div
        className={`${
          isMaximized
            ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-10 flex flex-col justify-start items-center shadow-2xl'
            : 'relative glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl overflow-hidden group'
        }`}
        dir="rtl"
        id="panel-ip-input"
      >
        <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-4'}>
          {/* Header Action Row */}
          <div className="flex justify-between items-center mb-1 select-none">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5" id="input-label-field">
              <Edit2 className="w-4 h-4 text-indigo-400" />
              <span>یک آدرس IPv4 برای کالبدشکافی بنویسید:</span>
            </label>
            
            <div className="flex items-center gap-2">
              {/* Maximize Toggle button */}
              <button
                onClick={handleToggleMaximize}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={isMaximized ? 'کوچک‌نمایی' : 'تمام‌صفحه'}
                id="maximize-ip-panel"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Help popup */}
              <button
                onClick={() => { SoundFX.click(); setShowHelp(true); }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="راهنمای کادر ورودی"
                id="help-ip-panel"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Bookmark status star */}
              <button
                onClick={toggleFavorite}
                className={`p-1.5 rounded-lg hover:bg-slate-800 transition-all ${
                  isStarred ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
                title={isStarred ? 'حذف از نشانک‌ها' : 'افزودن به نشانک‌ها'}
                id="star-ip-panel"
              >
                <Star className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Form and CTA Actions row */}
          <div className="flex flex-col sm:flex-row gap-4" id="input-form-elements">
            <div className="relative flex-grow">
              <input
                type="text"
                value={ip}
                onChange={(e) => handleIPInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-2xl px-5 py-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-700"
                placeholder={mode === 'ipv4' ? '192.168.1.1' : '2001:db8::1'}
                id="ip-text-input"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={generateRandom}
                className="px-5 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl font-bold transition-all duration-200 flex items-center gap-2 text-sm text-slate-200 shadow-sm"
                title="تولید آی‌پی تصادفی جهت آموزش"
                id="random-ip-btn"
              >
                <Shuffle className="w-4 h-4 text-emerald-400" />
                <span>تصادفی</span>
              </button>
              
              <button
                onClick={handleResetClick}
                className="px-5 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-2xl font-bold transition-all flex items-center gap-2 text-sm"
                title="پر کردن اطلاعات با مقادیر اولیه"
                id="reset-ip-btn"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ریست</span>
              </button>
            </div>
          </div>

          {/* Verification feedback footer text */}
          <div className="text-xs pt-1 select-none" id="ip-feedback-msg-wrap">
            {isValidForDisplay ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 font-sans">
                <ShieldCheck className="w-4 h-4" />
                آدرس وارد شده کاملاً معتبر است.
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-1.5 font-sans">
                ⚠️ آدرس وارد شده نامعتبر است. فرمت ۴ غلتک مابین اعدادی از ۰ تا ۲۵۵ بنویسید.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal wrapper */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="کادر ورودی آدرس آی‌پی (IP)"
        icon="help_outline"
      >
        <div className="space-y-4 font-sans text-xs">
          <p><strong>🤔 این چیه؟</strong> کادر ورودی یا تولید آدرس آی‌پی (IP Address).</p>
          <p><strong>🛠️ چیکار میکنه؟</strong> آدرس شبکه شما را می‌گیرد تا بقیه قطعات آن را به صفر و یک تبدیل و آنالیز کنند.</p>
          <p><strong>💡 یعنی چی؟ (به زبان خیلی ساده):</strong> آدرس آی‌پی مثل کد پستی خانه شماست. همان‌طور که در تمام دنیا کدهای پستی برای شناسایی خانه‌ها و ارسال نامه‌ها با هم فرق دارند، در شبکه اینترنت هم هر لپ‌تاپ یا موبایل یک آی‌پی منحصربه‌فرد دارد تا بقیه آن را پیدا کنند.</p>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <strong>🌟 یک مثال ساده:</strong> آدرس <code className="text-indigo-400 font-bold font-mono">192.168.1.1</code> آدرس پیش‌فرضی است که مودم خانگی شما دارد تا بتوانید وارد تنظیمات وای‌فای خود شوید.
          </div>
        </div>
      </Modal>
    </>
  );
}
