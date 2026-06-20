'use client';

import React, { useState } from 'react';
import { useIP } from '@/context/IPContext';
import { Maximize2, Minimize2, HelpCircle, Settings2 } from 'lucide-react';
import { SoundFX } from '@/lib/audio';
import { Modal } from '@/components/Modal';

export default function BitFlipperCard() {
  const {
    bits,
    cidr,
    setCIDR,
    toggleBit,
    mode,
    ip,
  } = useIP();

  const [isMaximized, setIsMaximized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCidrHelp, setShowCidrHelp] = useState(false);

  if (mode !== 'ipv4') {
    return null; // Bit flipper is IPv4 specific
  }

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCIDR(val);
  };

  // Split bits into 4 octets
  const octets = [
    bits.slice(0, 8),
    bits.slice(8, 16),
    bits.slice(16, 24),
    bits.slice(24, 32),
  ];

  return (
    <>
      <div
        className={`${
          isMaximized
            ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-10 flex flex-col justify-start items-center shadow-2xl'
            : 'relative glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6'
        }`}
        dir="rtl"
        id="panel-bit-flipper"
      >
        <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-6'}>
          {/* Top Panel Actions Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-4 select-none">
            <div>
              <h3 className="text-sm font-black flex items-center gap-2 text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                کیت تعاملی فلیپ بیت‌ها (برعکس کردن دستی صفر و یک‌ها)
              </h3>
              <p className="text-[10px] md:text-xs text-slate-400 mt-1">با کلیک روی دکمه‌های زیر، تک‌تک بیت‌ها را خاموش و روشن کنید و تغییر زنده آدرس ده‌دهی را در بالا ببینید.</p>
            </div>
            
            <div className="flex gap-3 items-center shrink-0">
              <button
                onClick={handleToggleMaximize}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={isMaximized ? 'کوچک‌نمایی' : 'تمام‌صفحه کیت بیت‌ها'}
                id="flipper-max-btn"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => { SoundFX.click(); setShowHelp(true); }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="آموزش صفر و یک"
                id="flipper-help-btn"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Color legend */}
              <div className="flex gap-3 text-xs font-bold" id="flipper-color-legend">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500"></span> شبکه</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span> هاست</span>
              </div>
            </div>
          </div>

          {/* Subnet Slider control */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-900" id="cidr-slider-sec">
            <div className="flex justify-between items-center text-xs font-bold select-none">
              <span className="text-slate-300 flex items-center gap-1">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <span>تنظیم دستی مرز شبکه با اسلایدر CIDR:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { SoundFX.click(); setShowCidrHelp(true); }}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="مفهوم پیش‌وند CIDR"
                  id="cidr-help-icon"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 font-mono text-sm leading-tight">
                  /{cidr}
                </span>
              </div>
            </div>
            
            <input
              type="range"
              min="0"
              max="32"
              value={cidr}
              onChange={handleSliderChange}
              className="w-full accent-indigo-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
              id="cidr-slider"
            />
            
            <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed pt-1 font-medium select-none">
              اسلایدر بالا تعداد بیت‌های قفل‌شده برای بخش «شبکه» را تغییر می‌دهد. با حرکت دادن آن، رنگ بیت‌ها در پایین فوراً بروزرسانی می‌شود.
            </p>
          </div>

          {/* 32 Bits Grid Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="bits-octets-grid">
            {octets.map((octetBits, oIdx) => {
              // Calculate decimal value of current octet
              const octValue = parseInt(octetBits.join(''), 2);

              return (
                <div key={oIdx} className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2 select-none">
                    <span className="text-[10px] text-slate-500 font-extrabold font-sans">بخش {oIdx + 1}</span>
                    <span className="text-xs font-black font-mono text-indigo-400">({octValue})</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {octetBits.map((bit, bIdx) => {
                      const globalIdx = oIdx * 8 + bIdx;
                      const weight = Math.pow(2, 7 - bIdx);
                      const isNetworkBit = globalIdx < cidr;

                      const activeColor = isNetworkBit
                        ? 'bg-indigo-600 border-indigo-450 text-white shadow-md shadow-indigo-500/15'
                        : 'bg-emerald-600 border-emerald-450 text-white shadow-md shadow-emerald-500/15';

                      const inactiveColor = isNetworkBit
                        ? 'bg-slate-900/50 border-indigo-500/15 text-indigo-400 hover:border-indigo-400/70'
                        : 'bg-slate-900/50 border-emerald-500/15 text-emerald-400 hover:border-emerald-400/70';

                      return (
                        <button
                          key={bIdx}
                          onClick={() => toggleBit(globalIdx)}
                          className={`bit-node p-2 text-center rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-between h-14 ${
                            bit === 1 ? activeColor : inactiveColor
                          }`}
                          id={`bit-toggle-${globalIdx}`}
                        >
                          <span className="text-sm tracking-tighter">{bit}</span>
                          <span className="text-[9px] opacity-65 tracking-tighter">{weight}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bit flipper main Help */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="کیت کلیدهای بیت فلیپر"
        icon="help_outline"
      >
        <div className="space-y-4 font-sans text-xs">
          <p><strong>🤔 این چیه؟</strong> ۳۲ کلید روشن و خاموش (صفر و یک) که آدرس آی‌پی شما را تولید می‌کنند.</p>
          <p><strong>🛠️ چیکار میکنه؟</strong> به شما اجازه می‌دهد هر کدام از بیت‌ها را به صورت دستی ۱ (روشن) یا ۰ (خاموش) کنید و فوراً نتیجه تغییر عددی را روی آدرس IP در کادر بالا ببینید.</p>
          <p><strong>💡 یعنی چی؟ (به زبان خیلی ساده):</strong> پردازنده‌ها و کابل‌های شبکه زبان آدمیزاد را نمی‌فهمند. برای آن‌ها اینترنت فقط پر از جریان برق است! جریان برق یا برقرار است (۱) یا قطع است (۰). این دکمه‌ها جریان برق کلیدهای مینیاتوری داخل شبکه را شبیه‌سازی می‌کنند.</p>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <strong>🌟 یک مثال ساده:</strong> اگر در بخش اول، بیت‌های مربوط به وزن‌های <code className="text-indigo-400 font-bold">128</code> و <code className="text-indigo-400 font-bold">64</code> را روشن کنید و بقیه خاموش باشند، مقدار بخش اول شما می‌شود: <code className="text-indigo-300 font-mono">128 + 64 = 192</code>.
          </div>
        </div>
      </Modal>

      {/* CIDR prefix slider help */}
      <Modal
        isOpen={showCidrHelp}
        onClose={() => setShowCidrHelp(false)}
        title="توضیح پیش‌وند سابنتینگ (CIDR)"
        icon="help_outline"
      >
        <div className="space-y-4 font-sans text-xs">
          <p><strong>🤔 این چیه؟</strong> یک پیش‌وند یا خط‌کش فرضی که با علامت اسلش (مثلاً /24) نمایش داده می‌شود.</p>
          <p><strong>🛠️ چیکار میکنه؟</strong> این اسلایدر مشخص می‌کند چند بیت از ۳۲ بیت کل آدرس، متعلق به «آدرس خیابان/شبکه مشترک» است و مابقی مربوط به «پلاک خانه‌ها/هاست» است.</p>
          <p><strong>💡 یعنی چی؟ (به زبان خیلی ساده):</strong> تلفن‌های ثابت قدیمی را یادتان هست؟ شماره‌ها یک پیش‌شماره ثابت شهر (مثل 021) داشتند و بقیه پلاک خانه بود. اسلایدر CIDR مشخص می‌کند که این خط مرز پیش‌شماره دقیقاً کجای شماره قرار بگیرد.</p>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <strong>🌟 یک مثال ساده:</strong> پیش‌وند <code className="text-indigo-400 font-bold font-mono">/24</code> یعنی ۲۴ بیت اول (۳ اکتت اول آی‌پی) کاملاً قفل و متعلق به آدرس خیابان مشترک است و فقط ۸ بیت آخر برای شماره‌گذاری کامپیوترها آزاد است.
          </div>
        </div>
      </Modal>
    </>
  );
}
