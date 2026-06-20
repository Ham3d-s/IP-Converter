'use client';

import React, { useState, useEffect } from 'react';
import { useIP } from '@/context/IPContext';
import {
  Maximize2,
  Minimize2,
  Settings,
  Shield,
  Cpu,
  Copy,
  FileText,
  Printer,
  Trash2,
  AlertTriangle,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { SoundFX } from '@/lib/audio';

// Detailed descriptions and link hubs for each provider
interface ProviderHelpItem {
  title: string;
  desc: string;
  url: string;
  urlLabel: string;
  defaultModel?: string;
  defaultUrl?: string;
}

const PROVIDER_HELP: Record<string, ProviderHelpItem> = {
  default_gemini: {
    title: 'موتور پیش‌فرض پلتفرم (پخش زنده)',
    desc: 'از زیرساخت ابری و درونی سیستم (مدل Gemini 3.5 Flash) بدون سرنشین استفاده می‌کند. کاملاً رایگان و خودکار بوده و نیاز به تهیه‌ی هیچ‌گونه کلیدی ندارد.',
    url: '',
    urlLabel: '',
  },
  openai: {
    title: 'سرویس OpenAI (اپن ای آی)',
    desc: 'بزرگترین موتور هوش مصنوعی دنیا که سازنده مدل‌های پیشگام GPT است. مدل gpt-4o-mini برای سناریوها و محاسبات سابنتینگ فوق‌العاده سریع، دقیق و مقرون‌به‌صرفه پیشنهاد می‌شود.',
    url: 'https://platform.openai.com/api-keys',
    urlLabel: 'دریافت کلید API از پنل OpenAI',
    defaultModel: 'gpt-4o-mini',
    defaultUrl: 'https://api.openai.com/v1',
  },
  deepseek: {
    title: 'سرویس DeepSeek (دیپ سیک)',
    desc: 'موتوری با توان استدلال علمی شگفت‌انگیز و هزینه ناچیز. مدل deepseek-chat برای خروجی‌های فارسی روان، ساختاریافته و کدهای مهندسی شبکه عملکرد بی‌نقصی دارد.',
    url: 'https://platform.deepseek.com/api_keys',
    urlLabel: 'دریافت کلید API از پنل DeepSeek',
    defaultModel: 'deepseek-chat',
    defaultUrl: 'https://api.deepseek.com',
  },
  gemini: {
    title: 'سرویس Google Gemini / AI Studio (جمنی اختصاصی)',
    desc: 'بستر رسمی توسعه‌دهندگان گوگل (Google AI Studio) به شما امکان می‌دهد کلید شخصی و مستقلی برای دسترسی رایگان و پرقدرت به مدل‌های Gemini 3.5 Flash بسازید.',
    url: 'https://aistudio.google.com/',
    urlLabel: 'دریافت کلید API از Google AI Studio',
    defaultModel: 'gemini-3.5-flash',
    defaultUrl: '',
  },
  openrouter: {
    title: 'سرویس OpenRouter (اپن روتر)',
    desc: 'یک هاب جامع که امکان دسترسی به صدها مدل متنوع هوش مصنوعی (رایگان و پرداختی) را تنها با یک کلید یکپارچه فراهم می‌سازد. مدل‌های پرسرعت Llama 3 به شکل رایگان در دسترس هستند.',
    url: 'https://openrouter.ai/keys',
    urlLabel: 'دریافت کلید API از پنل OpenRouter',
    defaultModel: 'google/gemini-2.5-flash:free',
    defaultUrl: 'https://openrouter.ai/api/v1',
  },
  local: {
    title: 'مدل‌های محلی Ollama (آفلاین و رایگان)',
    desc: 'محاسبه لوکال، ۱۰۰٪ رایگان و بدون نیاز به اینترنت! اگر برنامه اولاما (Ollama) را روی پی‌سی خود اجرا کرده‌اید، می‌توانید مدل‌ها (مانند llama3 یا mistral) را مستقیم فراخوانی کنید.',
    url: 'https://ollama.com/',
    urlLabel: 'دانلود و نصب نرم‌افزار Ollama',
    defaultModel: 'llama3',
    defaultUrl: 'http://localhost:11434/v1',
  },
};

export default function AIAssistant() {
  const {
    ip,
    cidr,
    subnetDetails,
    aiConfig,
    saveAIConfig,
  } = useIP();

  const [isMaximized, setIsMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scenarioInput, setScenarioInput] = useState('');
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Settings inputs
  const [provider, setProvider] = useState(aiConfig.provider);
  const [apiKeyInput, setApiKeyInput] = useState(aiConfig.apiKey);
  const [baseUrlInput, setBaseUrlInput] = useState(aiConfig.baseUrl);
  const [modelInput, setModelInput] = useState(aiConfig.modelName);

  // Diagnostics & Connectivity Detection states
  const [aiWorking, setAiWorking] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [diagLogs, setDiagLogs] = useState<string[]>([]);
  const [showDiagLogs, setShowDiagLogs] = useState(false);

  // Perform a fast, silent health check soon after mount to confirm AI connectivity
  useEffect(() => {
    const performInitialHealthCheck = async () => {
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
            action: 'checkStatus',
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            setAiWorking(true);
            return;
          }
        }
        setAiWorking(false);
      } catch (_) {
        setAiWorking(false);
      }
    };

    const timer = setTimeout(() => {
      performInitialHealthCheck();
    }, 1500);

    return () => clearTimeout(timer);
  }, [aiConfig]);

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  const handleToggleSettings = () => {
    SoundFX.click();
    if (!showSettings) {
      setProvider(aiConfig.provider);
      setApiKeyInput(aiConfig.apiKey);
      setBaseUrlInput(aiConfig.baseUrl);
      setModelInput(aiConfig.modelName);
    }
    setShowSettings(!showSettings);
  };

  const handleSaveConfig = () => {
    SoundFX.click();
    saveAIConfig({
      provider,
      apiKey: apiKeyInput,
      baseUrl: baseUrlInput,
      modelName: modelInput,
    });
    // Triggers direct re-check with newly set settings
    setAiWorking(true);
    setShowSettings(false);
  };

  // Safe Provider Selection switch updating suggested fields
  const handleProviderSelection = (newProv: string) => {
    SoundFX.click();
    setProvider(newProv);
    const helpObj = PROVIDER_HELP[newProv as keyof typeof PROVIDER_HELP];
    if (helpObj) {
      if (helpObj.defaultModel) {
        setModelInput(helpObj.defaultModel);
      } else {
        setModelInput('gemini-3.5-flash');
      }
      if (helpObj.defaultUrl) {
        setBaseUrlInput(helpObj.defaultUrl);
      } else {
        setBaseUrlInput('');
      }
    }
  };

  // Run comprehensive connection diagnostic with full live terminal logging output
  const runLiveConnectionDiagnostics = async () => {
    SoundFX.click();
    setIsTesting(true);
    setShowDiagLogs(true);
    setDiagLogs(['[SYSTEM] استارت خودکار سیستم ارزیابی فنی و مانیتورینگ اتصال...']);

    const appendLog = (line: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setDiagLogs((prev) => [...prev, line]);
          resolve();
        }, delay);
      });
    };

    const currentHelp = PROVIDER_HELP[provider as keyof typeof PROVIDER_HELP];
    await appendLog(`[INFO] بررسی بستر اتصال به: ${currentHelp?.title || provider}`, 150);
    
    if (provider !== 'default_gemini' && provider !== 'local' && !apiKeyInput) {
      await appendLog('[ERROR] خطا: فیلد کلید API خالی ثبت شده است!', 100);
      await appendLog('[ERROR] عملیات عیب‌یابی متوقف شد. کلید خود را در بالا ست کنید.', 100);
      setIsTesting(false);
      setAiWorking(false);
      return;
    }

    await appendLog(`[INFO] آدرس هدف سرویس: ${baseUrlInput || 'مستقیم به ابر ارائه‌دهنده'}`, 150);
    await appendLog(`[INFO] مدل محاسباتی تحت مأموریت: ${modelInput || 'پیش‌فرض'}`, 150);
    await appendLog('[REQUEST] ارسال سیگنال لرزه‌نگاری پینگ و درخواست رمز گشایی به وب‌سرویس...', 250);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': provider,
          'x-ai-api-key': apiKeyInput,
          'x-ai-base-url': baseUrlInput,
          'x-ai-model-name': modelInput,
        },
        body: JSON.stringify({
          action: 'checkStatus',
        }),
      });

      if (!response.ok) {
        throw new Error(`سرویس‌دهنده کدهای خطای شبکه بازگرداند: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'ok') {
        await appendLog(`[SUCCESS] تایید هویت با سرور نهایی تایید شد. سیگنال بازگشتی: "${data.text}"`, 200);
        await appendLog('[SUCCESS] وضعیت اتصال با موفقیت ارزیابی شد! هوش مصنوعی فعال و پاسخ‌گو است. 🟢', 100);
        setAiWorking(true);
      } else {
        throw new Error(data.error || 'پاسخ نامعتبری عاید شد.');
      }
    } catch (err: any) {
      await appendLog(`[ERROR] قطع ارتباط با مشکل فنی زیر مواجه شد: \n→ ${err.message}`, 200);
      await appendLog('[ERROR] عملیات عیب‌یابی با شکست خاتمه یافت. 🔴', 150);
      
      await appendLog('[🛡️ بخش خطایابی پیشرفته و راهنمای رفع مشکل سناریو]:', 100);
      if (provider === 'local') {
        await appendLog('۱) از نصب و اجرای برنامه Ollama بر روی همین سیستم مطلع شوید.', 80);
        await appendLog('۲) اولاما به صورت پیش‌فرض دسترسی‌های درخواست مرورگر (CORS) را مهار می‌کند.', 80);
        await appendLog('برای رفع این مشکل در ویندوز ابتدا ترمینال را بسته و اولاما را با پارامتر زیر باز کنید:', 80);
        await appendLog('   set OLLAMA_ORIGINS=* && ollama run llama3', 80);
      } else if (provider === 'default_gemini') {
        await appendLog('۱) کلید پیش‌فرض پلتفرم موقتاً با ترافیک بالا مواجه است.', 80);
        await appendLog('۲) پیشنهاد می‌شود کلید اختصاصی Google Gemini خود را به رایگان ایجاد و درج کنید.', 80);
      } else {
        await appendLog('۱) مطمئن شوید کلید API خود را دقیق کپی کرده‌اید و فاصله اضافی ندارد.', 80);
        await appendLog('۲) حساب ارائه‌دهنده را در وب‌سایت آن بررسی کنید که دارای موجودی یا شارژ فعال باشد.', 80);
        await appendLog('۳) به علت تحریم یا محدودیت‌های شبکه، گاهاً اتصال مستقیم بدون فیلترشکن مسدود است.', 80);
      }
      setAiWorking(false);
    } finally {
      setIsTesting(false);
    }
  };

  // Perform Security IP Audit using dynamically configured AI API values
  const handleAnalyzeIP = async () => {
    SoundFX.click();
    setIsLoading(true);
    setAiResult('در حال پردازش و استقرار تحلیل‌های فنی شبکه...');

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
          action: 'analyseIp',
          payload: {
            ip,
            subnetDetails,
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `ناموفق با کد ارتباطی ${response.status}`);
      }

      const data = await response.json();
      setAiResult(data.text || 'پاسخ دریافتی نامعتبر است.');
      setAiWorking(true);
      SoundFX.quizSuccess();
    } catch (e: any) {
      setAiResult(`❌ خطای ارتباط با هوش مصنوعی: ${e.message}\n\nجهت برطرف نمودن این وقفه، لطفاً از چرخ‌دنده بالای منو وارد "تنظیمات اتصال به هوش مصنوعی" شده و راستی‌آزمایی پینگ نمایید.`);
      setAiWorking(false);
      SoundFX.quizFail();
    } finally {
      setIsLoading(false);
    }
  };

  // Design Subnets VLSM using dynamically configured AI API values
  const handleDesignSubnets = async () => {
    SoundFX.click();
    if (!scenarioInput.trim()) {
      alert('لطفاً نیازهای فنی شبکه خود را تایپ نمایید.');
      return;
    }
    
    setIsLoading(true);
    setAiResult('در حال مهندسی و تحلیل سابنت‌های بهینه با الگوها...');

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
          action: 'designSubnets',
          payload: {
            scenario: scenarioInput,
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `ناموفق با کد ارتباطی ${response.status}`);
      }

      const data = await response.json();
      setAiResult(data.text || 'پاسخ دریافتی نامعتبر است.');
      setAiWorking(true);
      SoundFX.quizSuccess();
    } catch (e: any) {
      setAiResult(`❌ خطا در استقرار سناریو: ${e.message}\n\nتوصیه می‌شود تنظیمات اتصال به هوش مصنوعی را از طریق آیکون چرخ‌دنده بررسی کرده و ارائه‌دهنده را بسنجید.`);
      setAiWorking(false);
      SoundFX.quizFail();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    SoundFX.click();
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    SoundFX.click();
    setAiResult('');
  };

  // Export dynamically designed VLSM / Analysed audits to Word doc file
  const handleExportWord = () => {
    SoundFX.click();
    if (!aiResult) return;
    
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>گزارش دستیار هوشمند شبکه</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: justify;
            line-height: 1.8;
            padding: 30px;
          }
          h2 {
            color: #312e81;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h2>گزارش تحلیل فنی و امنیتی آدرس شبکه</h2>
        <p style="text-align: justify; white-space: pre-wrap;">${aiResult}</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `AI-Network-Analysis-${ip}.doc`;
    link.click();
  };

  // Export designed results inside printable separate viewport
  const handleExportPDF = () => {
    SoundFX.click();
    if (!aiResult) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <title>گزارش تحلیل فنی شبکه - آی‌پی پلاس</title>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
            padding: 40px;
            color: #111827;
            background-color: #ffffff;
            line-height: 1.8;
          }
          .header {
            border-bottom: 3px solid #6366f1;
            padding-bottom: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title {
            font-size: 20px;
            font-weight: 800;
            color: #312e81;
          }
          .meta {
            font-size: 11px;
            color: #4b5563;
            text-align: left;
            line-height: 1.5;
          }
          .content {
            text-align: justify;
            font-size: 13px;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">گزارش کالبدشکافی هوشمند آدرس شبکه</div>
          <div class="meta">
            آدرس آی‌پی مبدأ: ${ip}/${cidr}<br>
            تاریخ تولید گزارش: ${new Date().toLocaleDateString('fa-IR')}
          </div>
        </div>
        <div class="content">${aiResult}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  return (
    <div
      className={`${
        isMaximized
          ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-10 flex flex-col justify-start items-center shadow-2xl'
          : 'relative glass-panel p-6 rounded-3xl border border-indigo-500/20 shadow-xl bg-gradient-to-br from-indigo-950/20 via-slate-950 to-slate-950'
      }`}
      dir="rtl"
      id="panel-ai-assistant"
    >
      <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-4'}>
        {/* Header toolbar */}
        <div className="flex justify-between items-center mb-1 pb-3 border-b border-slate-900 select-none">
          <h3 className="font-extrabold flex items-center gap-1.5 text-indigo-300 text-xs">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>دستیار هوشمند شبکه</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMaximize}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="تمام‌صفحه دستیار"
              id="ai-max-btn"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleSettings}
              className={`p-1.5 rounded transition-all duration-300 ${
                showSettings || !aiWorking
                  ? 'bg-indigo-650/30 text-indigo-300 rounded-xl border border-indigo-500/40 animate-none'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="تنظیمات اتصال هوش مصنوعی"
              id="ai-settings-toggle"
            >
              <Settings className={`w-4 h-4 ${!aiWorking ? 'animate-spin-slow text-rose-450' : ''}`} />
            </button>
          </div>
        </div>

        {/* Beautiful warning banner shown only when AI is detected as unavailable/disconnected */}
        {!aiWorking && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-4 space-y-3 text-rose-300 shadow-md shadow-rose-950/25 animate-pulse-slow">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>⚠️ دستیار هوشمند شبکه موقتاً مسدود یا آفلاین است!</span>
            </div>
            <p className="text-[11px] leading-relaxed select-none text-justify">
              برنامه نتوانست پاسخی سالم از موتور پیش‌فرض دریافت کند. برای بازیابی قابلیت‌های طراحی VLSM مدرن و تست سناریوها، کافیست روی دکمه چرخ‌دنده کلیپ کرده یا از پنل زیر ارائه‌دهنده فعال خود نظیر <strong className="text-white">OpenAI</strong>، <strong className="text-white">DeepSeek</strong> یا <strong className="text-white">جدول مدل‌های لوکال (Ollama)</strong> را متصل نمایید.
            </p>
            <button
              onClick={() => {
                SoundFX.click();
                setShowSettings(true);
              }}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/30 text-rose-200 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>گشایش فوری تنظیمات اتصال هوش مصنوعی</span>
            </button>
          </div>
        )}

        {/* AI Client Setting UI Drawer Panel (Completely Expanded and Refined) */}
        {showSettings && (
          <div className="p-4 bg-slate-950 border border-indigo-500/25 rounded-2xl mb-4 space-y-4 shadow-inner" id="ai-settings-drawer">
            <div className="text-[11px] text-indigo-400 font-extrabold flex items-center gap-1 select-none">
              <Activity className="w-3.5 h-3.5" />
              <span>مدیریت یکپارچه بستر اتصال هوش مصنوعی</span>
            </div>

            {/* Provider Select dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold select-none">انتخاب هاب ارائه‌دهنده (Provider):</label>
              <select
                value={provider}
                onChange={(e) => handleProviderSelection(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                id="ai-provider-select"
              >
                <option value="default_gemini">Google Gemini (پیش‌فرض سیستم رایگان)</option>
                <option value="openai">OpenAI (اپن ای آی - GPT)</option>
                <option value="deepseek">DeepSeek (دیپ سیک چین)</option>
                <option value="gemini">Google AI Studio (جمنی با کلید شما)</option>
                <option value="openrouter">OpenRouter (اپن روتر چند مدله)</option>
                <option value="local">Ollama Local (آفلاین محلی روی ویندوز/لینوکس)</option>
              </select>
            </div>

            {/* Helpful Informative segments displayed based on active provider */}
            {(() => {
              const helpInfo = PROVIDER_HELP[provider as keyof typeof PROVIDER_HELP];
              if (!helpInfo) return null;
              return (
                <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2 select-text" id="ai-help-segment">
                  <div className="text-[11px] text-white font-black">{helpInfo.title}:</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                    {helpInfo.desc}
                  </p>
                  
                  {helpInfo.url && (
                    <div className="pt-1 flex">
                      <a
                        href={helpInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-bold group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110" />
                        <span>{helpInfo.urlLabel}</span>
                        <span className="font-mono text-slate-500">({helpInfo.url})</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* API Key credential field for remote providers */}
            {provider !== 'default_gemini' && provider !== 'local' && (
              <div className="space-y-1.5" id="custom-api-key-block">
                <label className="text-[10px] text-slate-400 block font-bold select-none">
                  کلید API محرمانه (API Key):
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-mono tracking-wider focus:outline-none focus:border-indigo-500"
                  placeholder="کلید عبور یا API Key خود را وارد کنید..."
                  id="custom-api-key-input"
                />
              </div>
            )}

            {/* Advanced configurations (Base URL or Model names for custom routing) */}
            {provider !== 'default_gemini' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="advanced-fields-row">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block font-bold select-none">آدرس سرویس دهنده (Base URL):</label>
                  <input
                    type="text"
                    value={baseUrlInput}
                    onChange={(e) => setBaseUrlInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-350 focus:outline-none focus:border-indigo-500"
                    placeholder="پیش‌فرض ارائه‌دهنده..."
                    id="custom-base-url-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block font-bold select-none">مدل انتخابی (Model Name):</label>
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: llama3, gpt-4o"
                    id="custom-model-input"
                  />
                </div>
              </div>
            )}

            {/* Advanced Active Diagnostics Hub */}
            <div className="border-t border-slate-900 pt-3 space-y-2 select-none">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowDiagLogs(!showDiagLogs)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-bold flex items-center gap-0.5"
                >
                  {showDiagLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>پیش‌نمایش ترمینال مانیتورینگ اتصال</span>
                </button>

                <button
                  type="button"
                  onClick={runLiveConnectionDiagnostics}
                  disabled={isTesting}
                  className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 font-bold text-[10px] rounded-xl flex items-center gap-1 transition-all disabled:opacity-40"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isTesting ? 'درحال آزمایش...' : 'آزمایش و تست فیزیکی اتصال'}</span>
                </button>
              </div>

              {showDiagLogs && diagLogs.length > 0 && (
                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[9px] leading-relaxed space-y-1 select-text overflow-y-auto max-h-40 custom-scrollbar shadow-inner text-left" dir="ltr">
                  {diagLogs.map((log, idx) => {
                    let color = 'text-slate-400';
                    if (log.startsWith('[SUCCESS]')) color = 'text-emerald-400 font-bold';
                    if (log.startsWith('[ERROR]')) color = 'text-rose-450 font-bold';
                    if (log.startsWith('[SYSTEM]')) color = 'text-indigo-400 font-bold';
                    // Special bullet line
                    if (log.startsWith('—') || log.startsWith('۱') || log.startsWith('۲') || log.startsWith('۳')) color = 'text-amber-400';
                    return (
                      <div key={idx} className={color}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions for settings saving */}
            <button
              onClick={handleSaveConfig}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1 shadow-indigo-950/40"
              id="ai-save-settings-btn"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>ثبت و ذخیره هوشمند پیکربندی مابین سیستم</span>
            </button>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed font-semibold text-justify select-none">
            به کارگیری سیستم هوش مصنوعی، طراحی و کدهای سابنتینگ VLSM و تحلیل‌های مستدل امنیتی را به صورت خودکار پشتیبانی می‌کند.
          </p>

          {/* Action 1: Evaluate Current IP */}
          <div className="space-y-2 font-black">
            <button
              onClick={handleAnalyzeIP}
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              id="ai-analyze-ip-btn"
            >
              <Shield className="w-4 h-4" />
              <span>تحلیل امنیتی و کاربردی این آی‌پی</span>
            </button>
          </div>

          {/* Action 2: Design Network VLSM Textarea */}
          <div className="border-t border-slate-900 pt-3 space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-slate-400 block select-none">
              طراحی هوشمند معماری شبکه (VLSM):
            </label>
            <textarea
              rows={3}
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 custom-scrollbar"
              placeholder="مثال: من یک رنج 192.168.10.0/24 دارم. ۳ تا بخش دارم: فنی ۸۰ سیستم، حسابداری ۱۵ سیستم و مدیریت ۵ سیستم. چطور سابنت کنم؟"
              id="ai-scenario-textarea"
            />

            <button
              onClick={handleDesignSubnets}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/10 transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              id="ai-design-btn"
            >
              <span>طراحی سناریو با هوش مصنوعی</span>
            </button>
          </div>

          {/* Response Box Panel Output */}
          {aiResult && (
            <div className="p-4 bg-slate-950/80 border border-indigo-500/10 rounded-2xl space-y-3" id="ai-response-box">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 select-none">
                <span className="text-[9px] text-indigo-400 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>پاسخ طراح هوشمند شبکه:</span>
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold transition-all"
                    id="ai-copy-btn"
                  >
                    {copied ? <span className="text-emerald-400 font-sans">کپی شد!</span> : <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> کپی متن</span>}
                  </button>
                  <button
                    onClick={handleClear}
                    className="text-[10px] text-slate-500 hover:text-rose-450 font-bold flex items-center gap-0.5"
                    id="ai-clear-btn"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>پاک کردن</span>
                  </button>
                </div>
              </div>

              {/* justified responsive prose text */}
              <div className="text-xs text-slate-300 leading-relaxed font-sans font-medium text-justify whitespace-pre-line max-h-60 overflow-y-auto custom-scrollbar select-text selection:bg-indigo-500 selection:text-white">
                {aiResult}
              </div>

              {/* Dynamic Action Exports */}
              <div className="flex gap-2 pt-2 border-t border-slate-900 text-[10px] font-black select-none">
                <button
                  onClick={handleExportWord}
                  className="flex-grow p-2 bg-indigo-600/10 hover:bg-indigo-650/20 border border-indigo-500/20 text-indigo-300 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                  id="ai-export-word"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>دانلود Word (DOC)</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex-grow p-2 bg-emerald-600/10 hover:bg-emerald-650/20 border border-emerald-500/20 text-emerald-300 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                  id="ai-export-pdf"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>خروجی PDF راست‌چین</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
