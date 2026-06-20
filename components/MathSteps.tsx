'use client';

import React, { useState } from 'react';
import { useIP } from '@/context/IPContext';
import { calculateMathStepsForIP } from '@/lib/ip-utils';
import { Calculator, Maximize2, Minimize2, HelpCircle } from 'lucide-react';
import { SoundFX } from '@/lib/audio';
import { Modal } from '@/components/Modal';

export default function MathSteps() {
  const { ip, mode } = useIP();
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (mode !== 'ipv4') {
    return null; // Decimal to binary division is specific to IPv4
  }

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  const stepsData = calculateMathStepsForIP(ip);

  return (
    <>
      <div
        className={`${
          isMaximized
            ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-10 flex flex-col justify-start items-center shadow-2xl'
            : 'relative glass-panel p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4'
        }`}
        dir="rtl"
        id="panel-math-steps"
      >
        <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-4'}>
          {/* Header Action Row */}
          <div className="flex justify-between items-center border-b border-slate-900 pb-3 select-none">
            <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5" id="math-head-title">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>روند اجرای محاسبات ریاضی تبدیل به باینری (بزرگ و کاملاً تفصیلی)</span>
            </h4>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMaximize}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={isMaximized ? 'کوچک‌نمایی' : 'تمام‌صفحه قطعات ریاضی'}
                id="math-max-btn"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => { SoundFX.click(); setShowHelp(true); }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="آموزش محاسبات دستی ریاضی"
                id="math-help-btn"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grids containing subtraction steps */}
          <div className="space-y-4" id="math-steps-elements-wrap">
            {stepsData.map((octetRecord) => (
              <div
                key={octetRecord.octetIndex}
                className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-3 shadow-inner"
              >
                {/* Octet Subtitle info */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-900 pb-2 select-none">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>کالبدشکافی بخش {octetRecord.octetIndex + 1} (عدد ده‌دهی: </span>
                    <strong className="text-indigo-400 font-mono">{octetRecord.octetValue}</strong>)
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold font-sans">روش تفریق متوالی از قدرت‌های ۲</span>
                </div>

                {/* Sub steps columns */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono">
                  {octetRecord.steps.map((step, sIdx) => {
                    const isPassed = step.bit === 1;
                    
                    // Parse comparison expression to show evaluation on separate lines
                    let mathExpr = step.comparison;
                    let resultText = '';
                    const match = step.comparison.match(/(.*)\s*\((بله|خیر)\)/);
                    if (match) {
                      mathExpr = match[1].trim();
                      resultText = match[2].trim();
                    }

                    return (
                      <div
                        key={sIdx}
                        className={`p-2.5 py-3.5 rounded-2xl text-center flex flex-col justify-between min-h-[155px] transition-all border ${
                          isPassed
                            ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-100 shadow-[0_0_12px_rgba(99,102,241,0.06)] scale-[1.01]'
                            : 'bg-slate-950/40 border-slate-900 opacity-70 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="text-[9px] text-slate-500 font-bold font-sans">مبنای {step.power}</div>
                          
                          {/* Math Comparison rule line */}
                          <div className="text-[10.5px] font-black text-indigo-400 font-mono mt-1" dir="ltr">
                            {mathExpr}
                          </div>
                          
                          {/* Separated Evaluation line */}
                          {resultText && (
                            <div className="mt-1.5">
                              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-black ${
                                resultText === 'بله'
                                  ? 'bg-emerald-500/15 text-emerald-405 border border-emerald-500/10'
                                  : 'bg-slate-900 text-slate-500 border border-slate-850'
                              }`}>
                                {resultText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Large prominent bit representation */}
                        <div className="my-1">
                          <code className={`text-base font-black font-mono block ${
                            isPassed ? 'text-indigo-300' : 'text-slate-650'
                          }`}>
                            {step.bit}
                          </code>
                        </div>

                        {/* Remainder line */}
                        <div className="text-[9px] text-slate-450 font-sans border-t border-slate-900/60 pt-1.5">
                          باقیمانده: <span className="font-mono text-slate-350">{step.remainder}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Math steps main Help modals */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="آموزش فرآیند محاسبات تبدیل مابین ده‌دهی و باینری"
        icon="help_outline"
      >
        <div className="space-y-4 font-sans text-xs">
          <p><strong>🤔 این چیه؟</strong> نمایش قدم به قدم عملیات تفریق ریاضی برای تبدیل دهدهی به باینری.</p>
          <p><strong>🛠️ چیکار میکنه؟</strong> با جدول‌های بزرگ و خوانا نشان می‌دهد که چگونه یک عدد معمولی را در مبنای وزن‌های باینری خرد می‌کنیم.</p>
          <p><strong>💡 یعنی چی؟ (به زبان خیلی ساده):</strong> مثل پول خرد کردن است! تصور کنید اسکناس‌های درشتی با ارزش‌های ثابت ۱۲۸، ۶۴، ۳۲، ۱۶، ۸، ۴، ۲ و ۱ تومانی دارید. حالا می‌خواهید مثلاً عدد ۱۵۰ تومان را با این اسکناس‌ها بسازید. اسکناس‌ها را به ترتیب از بزرگ به کوچک در کادر قرار می‌دهید؛ اگر جا شد مقدار ۱ و اگر بزرگ‌تر بود مقدار ۰ می‌گیرد.</p>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <strong>🌟 یک مثال ساده:</strong> برای تبدیل عدد ۱۵۰، اسکناس ۱۲۸ تومانی جا می‌شود (150 ≥ 128)، پس بیت اول <code className="text-indigo-400 font-bold">1</code> می‌شود و باقی‌مانده می‌شود ۲۲. اسکناس ۶۴ تومانی در ۲۲ جا نمی‌شود، پس بیت بعدی <code className="text-rose-400 font-bold">0</code> می‌شود. این کار را تا اسکناس ۱ تومانی ادامه می‌دهیم.
          </div>
        </div>
      </Modal>
    </>
  );
}
