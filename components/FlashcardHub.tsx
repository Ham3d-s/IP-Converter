'use client';

import React, { useState } from 'react';
import { useIP } from '@/context/IPContext';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, Sparkles, BookOpen, Layers, Rss, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SoundFX } from '@/lib/audio';
import { Modal } from '@/components/Modal';

interface FlashcardItem {
  tag: string;
  title: string;
  desc: string;
}

const defaultFlashcards: FlashcardItem[] = [
  { tag: 'پورت شبکه', title: 'پورت ۵۳ (DNS)', desc: 'سرویس نام دامنه (DNS). آدرس‌های متنی وب (مانند google.com) را به آدرس‌های عددی آی‌پی معادل ترجمه می‌کند تا برای مسیریاب‌های شبکه قابل درک باشد.' },
  { tag: 'پورت شبکه', title: 'پورت ۲۲ (SSH)', desc: 'پورت پروتکل امن پوسته پویا (Secure Shell) برای مدیریت سرورهای لینوکسی و روترها از راه دور به صورت کاملاً رمزنگاری شده و امن.' },
  { tag: 'پورت شبکه', title: 'پورت ۸۰ و ۴۴۳', desc: 'پورت ۸۰ برای مرور صفحات وب معمولی (HTTP ناامن) و ۴۴۳ برای صفحات وب امن تحت گواهی اس‌اس‌ال رمزنگاری شده (HTTPS).' },
  { tag: 'کلاس شبکه', title: 'محدوده کلاس C', desc: 'آی‌پی‌های شروع شونده با ۱۹۲ تا ۲۲۳. سابنت ماسک پیش‌فرض آنها ۲۵۵.۲۵۵.۲۵۵.۰ است که متداول‌ترین کلاس در مودم‌های خانگی و ملموس اداری کوچک می‌باشد.' },
  { tag: 'مفهوم پایه', title: 'آدرس لوپ‌بک (Loopback)', desc: 'آدرس ۱۲۷.۰.۰.۱. برای تست سخت‌افزاری کارت شبکه و اجرای برنامه‌ها بر روی پورت محلی سیستم به بدون نیاز به اتصال شبکه خارجی استفاده می‌شود.' },
  { tag: 'فرمول محاسباتی', title: 'تعداد هاست مجاز', desc: 'فرمول محاسبه: ۲ به توان تعداد بیت‌های هاست منهای ۲. ۲ آدرس کسر شده مربوط به شناسه شبکه (Network) و شناسه پخش (Broadcast) است.' },
  { tag: 'سابنتینگ', title: 'وایلدکارت ماسک (Wildcard)', desc: 'معکوس یا وارونه سابنت ماسک است که مابین فایروال‌ها و اکسس‌لیست‌ها جهت مشخص کردن محدوده آدرس‌ها مورد فیلتر قرار می‌گیرد.' },
  { tag: 'مفهوم پایه', title: 'آدرس دروازه (Gateway)', desc: 'درگاه پیش‌فرض یا مودم که بسته‌های اطلاعاتی دستگاه‌های لوکال را برای ارسال به محیط وب تحویل می‌گیرد.' },
];

export default function FlashcardHub() {
  const {
    fcTab,
    setFcTab,
    customCheatSheetItems,
    addCustomCheatSheetItems,
    aiConfig,
  } = useIP();

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(defaultFlashcards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIConfirm, setShowAIConfirm] = useState(false);
  const [showAISuccess, setShowAISuccess] = useState(false);

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  const handleFlip = () => {
    SoundFX.bitToggle();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    SoundFX.click();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    SoundFX.click();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  // Connect client to Server Gemini proxy to enrich cards and cheat sheets
  const triggerAIExtension = async () => {
    SoundFX.click();
    setShowAIConfirm(false);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': aiConfig.provider,
          'x-ai-api-key': aiConfig.apiKey,
          'x-ai-base-url': aiConfig.baseUrl,
          'x-ai-model-name': aiConfig.modelName,
        },
        body: JSON.stringify({
          action: 'generateAIFlashcards',
          payload: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Connection failed');
      }

      const data = await response.json();
      
      // Inject AI Flashcards
      if (data.newFlashcards && data.newFlashcards.length > 0) {
        const enriched: FlashcardItem[] = data.newFlashcards.map((cf: any) => ({
          tag: cf.tag || 'آموزش AI',
          title: cf.title,
          desc: cf.desc,
        }));
        setFlashcards((prev) => [...prev, ...enriched]);
      }

      // Inject Cheat sheet items
      if (data.newCheatSheetItems && data.newCheatSheetItems.length > 0) {
        addCustomCheatSheetItems(data.newCheatSheetItems);
      }

      setShowAISuccess(true);
      SoundFX.quizSuccess();
    } catch (e) {
      alert('ارتباط با سرور هوش مصنوعی ناموفق بود.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeCard = flashcards[currentIdx] || defaultFlashcards[0];

  return (
    <>
      <div
        className={`${
          isMaximized
            ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-10 flex flex-col justify-start items-center shadow-2xl'
            : 'relative glass-panel p-6 rounded-3xl border border-indigo-500/10 shadow-xl space-y-6'
        }`}
        dir="rtl"
        id="panel-flashcards"
      >
        <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-6'}>
          {/* Header segment */}
          <div className="flex flex-col gap-4 border-b border-slate-900 pb-4 select-none lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0" id="fc-decor-a">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-indigo-300">📚 کیت فلش‌کارت و جزوه حفظی شبکه</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">پورت‌ها، کلاس‌ها و رنج‌های کاربردی شبکه را به خاطر بسپارید.</p>
              </div>
            </div>

            {/* Action Buttons and Switch Tabs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap w-full lg:w-auto">
              {/* Tab options switcher - placed foremost for prominent control */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 text-[10.5px] font-black w-full sm:w-auto select-none shrink-0">
                <button
                  onClick={() => setFcTab('cards')}
                  className={`flex-grow sm:flex-grow-0 px-3.5 py-1.5 rounded-lg font-bold transition-all text-center whitespace-nowrap ${
                    fcTab === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  id="tab-fc-cards"
                >
                  فلش‌کارت متحرک
                </button>
                <button
                  onClick={() => setFcTab('cheat')}
                  className={`flex-grow sm:flex-grow-0 px-3.5 py-1.5 rounded-lg font-bold transition-all text-center whitespace-nowrap ${
                    fcTab === 'cheat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  id="tab-fc-cheat"
                >
                  جزوه حفظی سریع
                </button>
              </div>

              {/* Dynamic AI enrichment button */}
              <button
                onClick={() => { SoundFX.click(); setShowAIConfirm(true); }}
                disabled={isGenerating}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all disabled:opacity-50 flex-grow sm:flex-grow-0 shrink-0 select-none whitespace-nowrap"
                title="ارتقا اطلاعات جزوه و فلش‌کارت‌ها با هوش مصنوعی"
                id="ai-fc-enrich-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{isGenerating ? 'در حال محاسبات...' : 'ارتقا جزوه با AI'}</span>
              </button>

              <button
                onClick={handleToggleMaximize}
                className="p-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                title="تمام‌صفحه کیت"
                id="fc-max-btn"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Cards Tab content */}
          {fcTab === 'cards' ? (
            <div className="space-y-6" id="fc-cards-content-body">
              <div className="flex justify-center py-4 select-none">
                {/* 3D Animated card container */}
                <div
                  onClick={handleFlip}
                  className="w-80 h-48 cursor-pointer relative group"
                  style={{ perspective: '1000px' }}
                  id="flipper-container"
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    id="flipper-inner-body"
                  >
                    {/* Front Face of card */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                          {activeCard.tag}
                        </span>
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-lg font-extrabold text-white text-center py-2">
                        {activeCard.title}
                      </div>
                      <p className="text-[9px] text-slate-500 text-center font-medium">برای مشاهده پاسخ، روی کارت ضربه بزنید</p>
                    </div>

                    {/* Back Face of card */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-emerald-950/90 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          توضیح و تحلیل
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed font-semibold text-center mt-2 overflow-y-auto max-h-24">
                        {activeCard.desc}
                      </div>
                      <p className="text-[9px] text-slate-500 text-center font-medium">بازگشت</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-center items-center gap-4 text-xs font-bold select-none">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-all"
                  id="fc-prev-btn"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>برگشت</span>
                </button>
                
                <span className="text-slate-500 font-mono">
                  {currentIdx + 1} از {flashcards.length}
                </span>

                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-all"
                  id="fc-next-btn"
                >
                  <span>بعدی</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // Cheat Sheet Tab Content Segment
            <div className="space-y-6" id="fc-cheat-content-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Classes */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20 border border-slate-800/80 hover:border-indigo-500/30 p-5 rounded-2xl space-y-3 transition-all duration-300 shadow-md">
                  <h4 className="text-sm font-black text-indigo-400 flex items-center gap-2 border-b border-slate-900 pb-2 select-none">
                    <Layers className="w-4 h-4" />
                    <span>کلاس‌های IPv4 (محدوده اکتت اول)</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed font-medium text-justify">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span><strong>کلاس A:</strong> محدوده ۱ تا ۱۲۶ <span className="text-slate-500 font-mono text-[9px]">(سابنت ماسک: 255.0.0.0)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span><strong>کلاس B:</strong> محدوده ۱۲۸ تا ۱۹۱ <span className="text-slate-500 font-mono text-[9px]">(سابنت ماسک: 255.255.0.0)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span><strong>کلاس C:</strong> محدوده ۱۹۲ تا ۲۲۳ <span className="text-slate-500 font-mono text-[9px]">(سابنت ماسک: 255.255.255.0)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span><strong>کلاس D:</strong> محدوده ۲۲۴ تا ۲۳۹ <span className="text-slate-500 text-[9px]">(مخصوص مالتی‌کست و مسیریابی چندگانه)</span></span>
                    </li>
                  </ul>
                </div>

                {/* 2. Ports */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 border border-slate-800/80 hover:border-emerald-500/30 p-5 rounded-2xl space-y-3 transition-all duration-300 shadow-md">
                  <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2 border-b border-slate-900 pb-2 select-none">
                    <BookOpen className="w-4 h-4" />
                    <span>پورت‌های حیاتی و پرکاربرد شبکه</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-350 font-medium">
                    <div className="p-2 bg-slate-900/60 border border-slate-850 hover:bg-slate-900 rounded-xl transition-all flex items-center justify-between">
                      <span className="font-sans">پورت ۲۱</span>
                      <span className="text-indigo-400 font-sans">FTP (فایل)</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 border border-slate-850 hover:bg-slate-900 rounded-xl transition-all flex items-center justify-between">
                      <span className="font-sans">پورت ۲۲</span>
                      <span className="text-indigo-400 font-sans">SSH (امن)</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 border border-slate-850 hover:bg-slate-900 rounded-xl transition-all flex items-center justify-between">
                      <span className="font-sans">پورت ۵۳</span>
                      <span className="text-indigo-400 font-sans">DNS (نام)</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 border border-slate-850 hover:bg-slate-900 rounded-xl transition-all flex items-center justify-between">
                      <span className="font-sans">پورت ۸۰</span>
                      <span className="text-indigo-400 font-sans">HTTP (وب)</span>
                    </div>
                  </div>
                </div>

                {/* 3. RFC Private Ranges */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/20 border border-slate-800/80 hover:border-amber-500/30 p-5 rounded-2xl space-y-3 transition-all duration-300 shadow-md">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-900 pb-2 select-none">
                    <BookOpen className="w-4 h-4" />
                    <span>رنج‌های آی‌پی خصوصی رایگان (RFC 1918)</span>
                  </h4>
                  <ul className="text-xs text-slate-350 space-y-2 leading-relaxed text-justify font-sans">
                    <li><strong>کلاس A لوکل:</strong> ۱۰.۰.۰.۰ الی ۱۰.۲۵۵.۲۵۵.۲۵۵</li>
                    <li><strong>کلاس B لوکل:</strong> ۱۷۲.۱۶.۰.۰ الی ۱۷۲.۳۱.255.255</li>
                    <li><strong>کلاس C لوپبند:</strong> ۱۹۲.۱۶۸.۰.۰ الی ۱۹۲.168.255.255</li>
                  </ul>
                </div>

                {/* 4. Formulas */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-rose-950/20 border border-slate-800/80 hover:border-rose-500/30 p-5 rounded-2xl space-y-3 transition-all duration-300 shadow-md">
                  <h4 className="text-sm font-black text-rose-400 flex items-center gap-2 border-b border-slate-900 pb-2 select-none">
                    <Rss className="w-4 h-4" />
                    <span>فرمول‌های اصلی محاسبات زیرشبکه‌سازی</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2.5 font-sans leading-relaxed text-justify">
                    <li><strong>تعداد سابنت‌های ایجاد شده:</strong> ۲ به توان S <p className="text-[10px] text-slate-500">(که S تعداد بیت‌های شبکه قرض گرفته شده است)</p></li>
                    <li><strong>آدرس‌های مجاز هر سابنت:</strong> ۲ به توان H منهای ۲ <p className="text-[10px] text-slate-500">(که H تعداد خانه بیت‌های هاست است. ۲ آدرس صرف نت‌آی‌دی و پخش همگانی می‌شود)</p></li>
                  </ul>
                </div>
              </div>

              {/* Rendering AI Custom items with exact styling match */}
              {customCheatSheetItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-900" id="custom-ai-items-grid">
                  {customCheatSheetItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 border border-slate-800 p-5 rounded-2xl space-y-3 transition-all duration-300 shadow-md"
                    >
                      <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2 border-b border-slate-900 pb-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>{item.title}</span>
                        <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-500 font-bold mr-auto">افزوده شده با AI</span>
                      </h4>
                      <p className="text-xs text-slate-350 leading-relaxed text-justify">
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirms AI Enrichment prompt */}
      <Modal
        isOpen={showAIConfirm}
        onClose={() => setShowAIConfirm(false)}
        title="🤖 ارتقای هوشمند جزوه و فلش‌کارت‌ها"
        icon="auto_awesome"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs leading-relaxed text-slate-300 text-justify">
            آیا مایلید هوش مصنوعی با تمرکز بر روی مفاهیم کاربردی شبکه، ۳ فلش‌کارت متحرک کاملاً جدید تولید کرده و ۴ مفهوم تخصصی و پیشرفته شبکه را به صورت زیباترین کارت‌های واکنش‌گرا به جزوه حفظی سریع شما اضافه کند؟
          </p>
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-xl text-[10px] text-slate-400 leading-normal text-justify">
            ⚠️ توجه: تمامی کارت‌های جدید با هماهنگی ۱۰۰ درصدی با طراحی و ساختار لوکس برنامه اضافه خواهند شد و هیچ‌گونه بهم‌ریختگی ظاهری ایجاد نخواهد شد.
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
            <button
              onClick={() => setShowAIConfirm(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition-all"
              id="confirm-cancel-gen"
            >
              انصراف
            </button>
            <button
              onClick={triggerAIExtension}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all"
              id="confirm-gen-fc-btn"
            >
              بله، ارتقا بده
            </button>
          </div>
        </div>
      </Modal>

      {/* Success AI loading result */}
      <Modal
        isOpen={showAISuccess}
        onClose={() => setShowAISuccess(false)}
        title="🎉 ارتقای علمی موفقیت‌آمیز"
        icon="celebration"
      >
        <div className="space-y-3 text-xs leading-relaxed text-slate-350 text-justify">
          <p>بخش کیت فلش‌کارت و جزوه حفظی سریع شما به کمک هوش مصنوعی با موفقیت بروزرسانی شد!</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 font-sans">
            <li>افزوده شدن ۳ فلش‌کارت تعاملی جدید به مخزن یادگیری</li>
            <li>نگارش ۴ یادداشت فشرده گرید علمی جدید در جزوه سریع</li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
