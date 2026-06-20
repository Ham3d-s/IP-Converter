'use client';

import React, { useState } from 'react';
import { useIP } from '@/context/IPContext';
import { calculateSubnetDetails, validateIPv4 } from '@/lib/ip-utils';
import {
  Layers,
  Shield,
  Grid3X3,
  Network,
  Radio,
  Users2,
  HardDrive,
  Maximize2,
  Minimize2,
  Printer,
  ChevronLeft,
  HelpCircle,
} from 'lucide-react';
import { SoundFX } from '@/lib/audio';
import { Modal } from '@/components/Modal';
import DOMPurify from 'isomorphic-dompurify';

interface AnalysisItem {
  id: string;
  label: string;
  val: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  helpTitle: string;
  helpBody: string;
}

export default function NetworkAnalysis() {
  const { ip, cidr, mode } = useIP();
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<AnalysisItem | null>(null);

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  const details = calculateSubnetDetails(ip, cidr);

  // Trigger specialized reporting window printout
  const handlePrintReport = () => {
    SoundFX.click();
    if (mode === 'ipv4' && !validateIPv4(ip)) {
      alert('آدرس وارد شده برای چاپ گزارش معتبر نیست.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      alert('مرورگر از باز کردن پنجره چاپ ممانعت کرد. لطفاً دسترسی پاپ‌آپ را باز کنید.');
      return;
    }

    let reportBodyHTML = '';

    if (mode === 'ipv4') {
      reportBodyHTML = `
        <div class="header-banner">
          <div class="banner-title">گزارش آنالیز فنی و کالبدشکافی آدرس شبکه (IPv4)</div>
          <div class="banner-meta">
            آدرس منبع: <strong class="font-mono font-bold">${ip}/${cidr}</strong><br>
            تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}<br>
            پلتفرم: آی‌پی پلاس ۲.۰
          </div>
        </div>
        
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 35%;">ویژگی فنی</th>
              <th>مقدار اختصاصی و وضعیت</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>کلاس آدرس (IP Class)</td>
              <td class="font-bold text-dark">کلاس ${details.class}</td>
            </tr>
            <tr>
              <td>نوع مالکیت و رنج حاکمیتی</td>
              <td>${details.type}</td>
            </tr>
            <tr>
              <td>سابنت ماسک (Subnet Mask)</td>
              <td class="font-mono text-indigo font-bold">${details.subnetMask}</td>
            </tr>
            <tr>
              <td>وایلدکارت ماسک فایروال</td>
              <td class="font-mono text-slate font-bold">${details.wildcard}</td>
            </tr>
            <tr>
              <td>شناسه شبکه (Network ID)</td>
              <td class="font-mono font-bold text-indigo">${details.networkID}</td>
            </tr>
            <tr>
              <td>آدرس پخش همگانی (Broadcast)</td>
              <td class="font-mono font-bold text-emerald">${details.broadcast}</td>
            </tr>
            <tr>
              <td>تعداد کل میزبان‌های مجاز</td>
              <td class="font-bold text-indigo">${details.hostsCount} دستگاه فعال</td>
            </tr>
            <tr>
              <td>محدوده آدرس‌دهی قابل استقرار (Host Range)</td>
              <td class="font-mono text-emerald font-bold">${details.hostRange}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      reportBodyHTML = `
        <div class="header-banner">
          <div class="banner-title">گزارش آنالیز فنی آدرس نسل ششم شبکه (IPv6)</div>
          <div class="banner-meta">
            آدرس منبع: <strong class="font-mono font-bold">${ip}</strong><br>
            تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}
          </div>
        </div>
        
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 35%;">ویژگی فنی</th>
              <th>مقدار اختصاصی و وضعیت</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>نوع ساختار آدرس‌دهی</td>
              <td class="font-bold text-dark">آدرس یونیکست جهانی (Global Unicast Address)</td>
            </tr>
            <tr>
              <td>اندازه فضای آدرس</td>
              <td>۱۲۸ بیت پیوسته (مبنای هگزادسیمال)</td>
            </tr>
            <tr>
              <td>وضعیت فشرده‌سازی صفرها</td>
              <td>فشرده‌سازی با علامت دو نقطه‌ دوتایی (::) فعال</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <title>گزارش آنالیز زیرشبکه | آی‌پی پلاس نسخه ۲.۰</title>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
            background: #ffffff;
            color: #1e293b;
            padding: 45px;
            margin: 0;
            line-height: 1.7;
          }
          .header-banner {
            border-bottom: 4px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .banner-title {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
          }
          .banner-meta {
            font-size: 11px;
            color: #64748b;
            text-align: left;
            line-height: 1.5;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .report-table th, .report-table td {
            border: 1px solid #e2e8f0;
            padding: 14px 18px;
            text-align: right;
            font-size: 13px;
          }
          .report-table th {
            background-color: #f8fafc;
            color: #334155;
            font-weight: 800;
          }
          .report-table td {
            color: #334155;
          }
          .font-mono {
            font-family: monospace, sans-serif;
            letter-spacing: 0.05em;
          }
          .font-bold {
            font-weight: 700;
          }
          .text-indigo {
            color: #4f46e5;
          }
          .text-emerald {
            color: #059669;
          }
          .text-dark {
            color: #0f172a;
          }
          .footer {
            border-top: 1px solid #e2e8f0;
            margin-top: 60px;
            padding-top: 20px;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        </style>
      </head>
      <body>
        ${reportBodyHTML}
        
        <div class="footer">
          <span>گزارش رسمی استخراج شده از آزمایشگاه تعاملی آموزش شبکه آی‌پی پلاس ۲.۰</span>
          <span>صفحه ۱ از ۱</span>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto initiate print dialog and self dismiss
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  // Structured help details mapping
  const items: AnalysisItem[] = [
    {
      id: 'class',
      label: 'کلاس آدرس IP',
      val: details.class,
      icon: <Layers className="w-5 h-5" />,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/10',
      desc: `کلاس کنونی آدرس شما برابر با "${details.class}" است. کلاس‌های شبکه مثل حروف الفبا مشخص می‌کنند که محدوده حجم آدرس شما چقدر بزرگ است.`,
      helpTitle: '🔍 کلاس آدرس IP یعنی چه؟',
      helpBody: `<p class="leading-relaxed text-xs">در زمان‌های گذشته، برای سازماندهی راحت‌تر، آدرس‌های IP را به کلاس‌های مختلف دسته‌بندی کردند:</p>
                <ul class="list-disc list-inside space-y-1.5 text-xs text-slate-300 pt-2">
                  <li><strong>کلاس A (محدوده ۱ تا ۱۲۶):</strong> برای شبکه‌های فوق‌العاده غول‌آسا (مثل شرکت‌های مخابراتی بزرگ جهانی) که میلیاردها دستگاه دارند.</li>
                  <li><strong>کلاس B (محدوده ۱۲۸ تا ۱۹۱):</strong> برای شبکه‌های متوسط مانند دانشگاه‌های بزرگ یا سازمان‌های دولتی بزرگ.</li>
                  <li><strong>کلاس C (محدوده ۱۹۲ تا ۲۲۳):</strong> برای شبکه‌های کوچک مثل مودم‌های خانگی شما یا دفاتر کاری کوچک.</li>
                </ul>`,
    },
    {
      id: 'type',
      label: 'نوع مالکیت آدرس',
      val: details.type,
      icon: <Shield className="w-5 h-5" />,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/10',
      desc: `آدرس شما یک آدرس "${details.type}" است. آی‌پی‌های خصوصی داخل مودم خانه استفاده می‌شوند، در حالی که آی‌پی‌های عمومی در اینترنت آزاد کار می‌کنند.`,
      helpTitle: '🛡️ نوع مالکیت عمومی و خصوصی یعنی چه؟',
      helpBody: `<p class="leading-relaxed text-xs">آدرس‌های آی‌پی به دو دسته مهم تقسیم می‌شوند:</p>
                <ul class="list-disc list-inside space-y-1.5 text-xs text-slate-300 pt-2">
                  <li><strong>آی‌پی‌های خصوصی (Private):</strong> آدرس‌های رایگانی هستند که مودم شما به گوشی و لپ‌تاپ‌های داخل خانه شما می‌دهد (مثل آدرس‌های 192.168). این آدرس‌ها در اینترنت جهانی کار نمی‌کنند و فقط مخصوص شبکه محلی شما هستند.</li>
                  <li><strong>آی‌پی‌های عمومی (Public):</strong> آدرس‌های یکتا و جهانی هستند که شرکت ارائه‌دهنده اینترنت شما اختصاص می‌دهد تا بتوانید به شبکه جهانی اینترنت متصل شوید.</li>
                </ul>`,
    },
    {
      id: 'mask',
      label: 'سابنت ماسک (Subnet)',
      val: details.subnetMask,
      icon: <Grid3X3 className="w-5 h-5" />,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
      desc: `سابنت ماسک شبکه شما برابر با "${details.subnetMask}" است. این آدرس مثل یک خط‌کش مرزبندی عمل کرده و مشخص می‌کند کدام قسمت آی‌پی مربوط به آدرس محله است.`,
      helpTitle: '🏁 سابنت ماسک یعنی چه؟',
      helpBody: `<p class="leading-relaxed text-xs"><strong>به زبان ساده:</strong> سابنت ماسک (توری شبکه) مثل یک فیلتر یا خط‌کش برای جداسازی است. 
                این آدرس مشخص می‌کند کجای آی‌پی شما مربوط به کد کلی شهر و خیابان (شبکه) است و کجای آن آدرس اختصاصی خانه شما (میزبان) است. 
                هر کجا در سابنت ماسک عدد <code class="text-indigo-400 font-bold">255</code> باشد یعنی آن بخش از آدرس IP قفل‌شده و مربوط به آدرس کل شبکه است.</p>`,
    },
    {
      id: 'netid',
      label: 'شناسه شبکه (Network ID)',
      val: details.networkID,
      icon: <Network className="w-5 h-5" />,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/10',
      desc: `شناسه اصلی شبکه شما برابر با "${details.networkID}" است. این آدرس حکم نام خانوادگی مشترک همه دستگاه‌های متصل به این محله را دارد.`,
      helpTitle: '🌐 شناسه شبکه (Network ID) یعنی چه؟',
      helpBody: `<p class="leading-relaxed text-xs"><strong>به زبان ساده:</strong> شناسه شبکه مثل نام خانوادگی اعضای یک خانه یا پیش‌شماره تلفن یک شهر است. 
                این آدرس همیشه اولین آدرس در زیرشبکه شماست (بخش هاست آن کاملاً صفر است) و به هیچ دستگاهی اختصاص داده نمی‌شود، چون هویت کل شبکه را معرفی می‌کند.</p>`,
    },
    {
      id: 'broadcast',
      label: 'پخش همگانی (Broadcast)',
      val: details.broadcast,
      icon: <Radio className="w-5 h-5" />,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/10',
      desc: `آدرس پخش همگانی شبکه شما برابر با "${details.broadcast}" است. این آدرس حکم بلندگوی محله را دارد؛ اگر پیامی به آن فرستاده شود، همه دریافت می‌کنند.`,
      helpTitle: '📢 آدرس پخش همگانی (Broadcast) یعنی چه؟',
      helpBody: `<p class="leading-relaxed text-xs"><strong>به زبان ساده:</strong> آدرس پخش همگانی مثل یک بلندگوی بزرگ در وسط میدان محله شماست! 
                این آدرس همیشه آخرین آدرس در زیرشبکه شماست (بخش هاست آن کاملاً یک یا ۲۵۵ است). اگر یک سیستم بسته‌ای را به این آدرس بفرستد، مودم یا روتر آن پیام را برای تک‌تک دستگاه‌های داخل شبکه ارسال می‌کند.</p>`,
    },
    {
      id: 'hosts',
      label: 'میزبان‌های مجاز (Hosts)',
      val: details.hostsCount,
      icon: <Users2 className="w-5 h-5" />,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/10',
      desc: `تعداد "${details.hostsCount}" دستگاه مختلف (مثل لپ‌تاپ یا موبایل) می‌توانند به صورت همزمان در این محدوده آی‌پی دریافت و ارتباط برقرار کنند.`,
      helpTitle: '👥 تعداد میزبان‌های مجاز یعنی چه؟',
      helpBody: `<p class="leading-relaxed text-xs"><strong>به زبان ساده:</strong> این مقدار نشان می‌دهد چند دستگاه (مثل موبایل، تبلت، کامپیوتر یا دوربین مداربسته) می‌توانند در این محدوده شبکه وارد شده و همزمان با هم کار کنند. 
                در فرمول‌های شبکه همیشه ۲ آدرس از تعداد کل ظرفیت کم می‌شود؛ یکی برای معرفی کل شبکه (Network ID) و دیگری برای معرفی بلندگوی شبکه (Broadcast) که برای دستگاه‌های معمولی غیرقابل استفاده ملموس‌اند.</p>`,
    },
    {
      id: 'range',
      label: 'محدوده هاست‌های مجاز',
      val: details.hostRange,
      icon: <HardDrive className="w-5 h-5" />,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/10',
      desc: `محدوده آدرس‌های واقعی قابل پاسخگوئی به کاربران مابین "${details.hostRange}" است که فاقد مرزهای شبکه/پخش است.`,
      helpTitle: '💾 محدوده آی‌پی هاست‌ها یعنی چه؟',
      helpBody: `<p class="leading-relaxed text-xs"><strong>به زبان ساده:</strong> این محدوده از اولین آی‌پی قابل اختصاص به سیستم‌ها تا آخرین آنها را شامل می‌شود. آی‌پی‌های قبل و بعد از این بازه مربوط به شناسه شبکه (Network ID) و شناسه پخش (Broadcast) هستند که طبق مقررات شبکه نباید به سیستم معمولی داده شوند.</p>`,
    },
  ];

  const renderItemValue = (item: AnalysisItem) => {
    if (item.id === 'range') {
      const rangeStr = String(item.val);
      const parts = rangeStr.includes('تا') ? rangeStr.split('تا') : rangeStr.split('to');
      if (parts.length === 2) {
        const startIP = parts[0].trim();
        const endIP = parts[1].trim();
        return (
          <div className="flex flex-col gap-2 w-full select-all mt-1.5" dir="rtl">
            {/* Start IP Box */}
            <div className="w-full bg-slate-900/90 border border-emerald-500/20 p-2.5 rounded-xl text-center hover:border-emerald-500/40 transition-all shadow-inner">
              <span className="block text-[10px] text-emerald-400 font-extrabold mb-1 select-none text-center">شروع محدوده آی‌پی</span>
              <span className="font-mono text-xs sm:text-sm font-black text-emerald-300 tracking-wider block text-center" dir="ltr">{startIP}</span>
            </div>
            
            {/* Connector indicator with visual feedback */}
            <div className="flex justify-center items-center text-indigo-400/80 font-black text-[11px] my-0.5 select-none animate-pulse">
              ▼
            </div>

            {/* End IP Box */}
            <div className="w-full bg-slate-900/90 border border-cyan-500/20 p-2.5 rounded-xl text-center hover:border-cyan-500/45 transition-all shadow-inner">
              <span className="block text-[10px] text-cyan-400 font-extrabold mb-1 select-none text-center">پایان محدوده آی‌پی</span>
              <span className="font-mono text-xs sm:text-sm font-black text-cyan-300 tracking-wider block text-center" dir="ltr">{endIP}</span>
            </div>
          </div>
        );
      }
    }

    // Fallback / standard formatting
    return (
      <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-center transition-all hover:bg-slate-900 hover:border-indigo-500/20 mt-1.5 shadow-inner">
        <span 
          className="font-mono font-black select-all tracking-wider text-xs sm:text-sm md:text-base block text-center break-all text-indigo-300"
          dir="ltr"
        >
          {item.val}
        </span>
      </div>
    );
  };

  return (
    <>
      <div
        className={`${
          isMaximized
            ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-4 sm:p-10 flex flex-col justify-start items-center shadow-2xl'
            : 'relative glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4'
        }`}
        dir="rtl"
        id="panel-networking-analysis"
      >
        <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-4'}>
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3 select-none">
            <h3 className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>کالبدشکافی زنده و تحلیلگر پیشرفته سابنتینگ</span>
            </h3>

            <div className="flex items-center gap-1.5 shrink-0 justify-end sm:justify-end">
              <button
                onClick={handlePrintReport}
                className="text-xs bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/15 hover:border-indigo-500/35 px-3 py-1.5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="چاپ یا ذخیره گزارش متنی"
                id="print-analysis-btn"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>چاپ گزارش فنی</span>
              </button>

              <button
                onClick={handleToggleMaximize}
                className="p-1.5 rounded-xl hover:bg-slate-850 text-slate-400 hover:text-white transition-colors border border-slate-850 cursor-pointer shrink-0"
                title={isMaximized ? 'کوچک‌نمایی' : 'تمام‌صفحه تحلیلگر'}
                id="analysis-max-btn"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${isMaximized ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-4`}
            id="analysis-cards-grid"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-900 p-4 sm:p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 shadow-md group relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Card Header row with icon, label and NO squeeze button */}
                  <div className="flex items-center gap-2.5 border-b border-slate-900 pb-2.5 mb-1 select-none">
                    <div
                      className={`p-2 rounded-lg border ${item.color} group-hover:scale-105 transition-all duration-350 shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-xs sm:text-[13px] text-slate-300 font-extrabold">{item.label}</span>
                  </div>

                  {/* Centered Value box */}
                  <div className="py-1">
                    {renderItemValue(item)}
                  </div>

                  {/* Helpful link block button positioned beautifully below value */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        SoundFX.click();
                        setSelectedTutorial(item);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/25 text-[10px] text-indigo-400 font-extrabold transition-all select-none flex items-center justify-center gap-1 cursor-pointer active:scale-97"
                      title={`توضیح ملموس ${item.label}`}
                      id={`help-link-${item.id}`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                      <span>یعنی چی؟</span>
                    </button>
                  </div>
                </div>

                {/* Description footer */}
                <p className="text-[10px] md:text-xs text-slate-400 mt-4 pt-2.5 border-t border-slate-900 leading-relaxed font-semibold text-justify select-none">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tutorial Local Modals */}
      {selectedTutorial && (
        <Modal
          isOpen={!!selectedTutorial}
          onClose={() => setSelectedTutorial(null)}
          title={selectedTutorial.helpTitle}
          icon="help_outline"
        >
          <div
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTutorial.helpBody) }}
            className="space-y-3"
            id="html-modal-content-inject"
          />
        </Modal>
      )}
    </>
  );
}
