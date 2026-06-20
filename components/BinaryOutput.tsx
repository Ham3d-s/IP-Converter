'use client';

import React, { useState } from 'react';
import { useIP } from '@/context/IPContext';
import { Code, Maximize2, Minimize2, HelpCircle } from 'lucide-react';
import { SoundFX } from '@/lib/audio';
import { Modal } from '@/components/Modal';

export default function BinaryOutput() {
  const { mode, ip, bits, cidr } = useIP();
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  // Convert IPv4 segments
  const octets = ip.split('.').map(Number);

  return (
    <>
      <div
        className={`${
          isMaximized
            ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-10 flex flex-col justify-start items-center shadow-2xl'
            : 'relative glass-panel p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4'
        }`}
        dir="rtl"
        id="panel-binary-out"
      >
        <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-4'}>
          {/* Header Action Row */}
          <div className="flex justify-between items-center select-none">
            <h4 className="text-xs font-extrabold text-slate-400 flex items-center gap-1.5" id="bin-head-title">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>نمایش نهایی باینری (مبنای ۲)</span>
            </h4>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMaximize}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={isMaximized ? 'کوچک‌نمایی' : 'تمام‌صفحه خروجی باینری'}
                id="bin-max-btn"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => { SoundFX.click(); setShowHelp(true); }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="درباره زبان باینری"
                id="bin-help-btn"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <span className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-md text-slate-400 font-bold font-mono">
                {mode === 'ipv4' ? '32 Bits' : '128 Bits'}
              </span>
            </div>
          </div>

          {/* Interactive Binary Render Segment */}
          <div
            className="p-4 bg-slate-950/80 border border-slate-900 rounded-3xl text-center transition-all duration-300 w-full"
            id="binary-output-container"
          >
            {mode === 'ipv4' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-right" dir="rtl">
                {[0, 1, 2, 3].map((oIdx) => {
                  const startIdx = oIdx * 8;
                  const endIdx = startIdx + 8;
                  const octetBits = bits.slice(startIdx, endIdx);

                  return (
                    <div 
                      key={oIdx} 
                      className="octet-block flex flex-col items-center bg-slate-900/30 border border-slate-900/80 p-4 rounded-2xl w-full transition-all hover:border-indigo-500/20 hover:bg-slate-900/50 shadow-md"
                    >
                      {/* Monospace individual bit boxes render */}
                      <div className="flex gap-1 justify-center w-full" dir="ltr">
                        {octetBits.map((bit, bIdx) => {
                          const globalIdx = startIdx + bIdx;
                          const isNet = globalIdx < cidr;

                          return (
                            <div
                              key={bIdx}
                              className={`flex-grow h-9 flex items-center justify-center rounded-lg border font-mono font-black text-xs md:text-sm transition-all duration-200 ${
                                bit === 1
                                  ? isNet
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                                    : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                                  : isNet
                                    ? 'bg-slate-950 text-indigo-500/50 border-indigo-500/5'
                                    : 'bg-slate-950 text-emerald-500/50 border-emerald-500/5'
                              }`}
                              title={`بیت ${globalIdx + 1} (${isNet ? 'بخش شبکه' : 'بخش هاست'})`}
                            >
                              {bit}
                            </div>
                          );
                        })}
                      </div>

                      {/* Descriptive Label footer */}
                      <div className="flex justify-between items-center w-full mt-3.5 pt-2 border-t border-slate-905 text-[10px] md:text-xs text-slate-500 font-extrabold select-none">
                        <span>اکتت {oIdx + 1}</span>
                        <span className="text-indigo-400 font-mono text-xs font-black bg-indigo-500/5 px-2 py-0.5 rounded-md">
                          {octets[oIdx] !== undefined ? octets[oIdx] : 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Enhanced hex chunks representation for IPv6 mode
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 w-full text-right" dir="rtl">
                {ip.split(':').map((part, index) => {
                  if (!part && index > 0) return null;
                  const val = parseInt(part || '0', 16);
                  const binStr = (isNaN(val) ? 0 : val).toString(2).padStart(16, '0');

                  return (
                    <div
                      key={index}
                      className="octet-block flex flex-col items-center bg-slate-900/30 border border-slate-900/80 p-3 rounded-2xl w-full transition-all hover:border-indigo-500/20 hover:bg-slate-900/50 shadow-md"
                    >
                      <div className="font-mono font-bold text-[9px] tracking-tight text-indigo-400 leading-normal break-all">
                        {binStr.slice(0, 8)}
                        <span className="text-slate-600 block sm:inline sm:mx-0.5">-</span>
                        {binStr.slice(8)}
                      </div>
                      <div className="flex justify-between items-center w-full mt-2.5 pt-1.5 border-t border-slate-905 text-[9px] text-slate-500 font-extrabold select-none">
                        <span>بخش {index + 1}</span>
                        <span className="font-mono text-emerald-400 font-black">{part || '0000'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Binary Help dialog */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="رشته نهایی باینری ۳۲ بیتی"
        icon="help_outline"
      >
        <div className="space-y-4 font-sans text-xs">
          <p><strong>🤔 این چیه؟</strong> نمایش آدرس آی‌پی شما به شکل محض صفر و یک.</p>
          <p><strong>🛠️ چیکار میکنه؟</strong> نمایشی تفکیک‌شده ارائه می‌دهد تا بفهمید مودم‌ها و روترها در پشت صحنه آدرس‌های ما را چگونه می‌خوانند.</p>
          <p><strong>💡 یعنی چی؟ (به زبان خیلی ساده):</strong> درسی مثل ترجمه کردن یک جمله فارسی به مورس یا برعکس است. کامپیوترها اعدادی مثل «۱۹۲» را به زبان مادری خود یعنی همین قطار باینری می‌خوانند.</p>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <strong>🌟 یک مثال ساده:</strong> آدرس معمولی «192.168.1.1» به زبان کامپیوتر تبدیل می‌شود به: <code className="text-emerald-400 font-bold font-mono">11000000.10101000.00000001.00000001</code>.
          </div>
        </div>
      </Modal>
    </>
  );
}
