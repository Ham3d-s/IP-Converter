# 🌐 پلتفرم هوشمند تحلیل و آموزش شبکه | IP & Subnetting Intelligence Node

[![Next.js](https://img.shields.io/badge/Powered_by-Next.js_15+-black?logo=next.js&style=for-the-badge)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css&style=for-the-badge)](https://tailwindcss.com/)
[![AI Integration](https://img.shields.io/badge/AI_Engine-Google_Gemini-orange?logo=google&style=for-the-badge)](#)

این پلتفرم بسیار فراتر از یک مبدل ساده‌ی IP به باینری است؛ این برنامه یک **محیط جامع، تعاملی و هوشمند** برای درک عمیق ساختارهای شبکه، آدرس‌دهی (IP Addressing) و محاسبات دقیق زیرشبکه (Subnetting) است. با ادغام قدرت پردازش سمت سرور، رابط کاربری مدرن و هوش مصنوعی، پیچیده‌ترین مفاهیم شبکه در اینجا به المان‌هایی بصری، قابل لمس و جذاب تبدیل شده‌اند.

---

## 🎯 قابلیت‌های کلیدی و معماری ویژگی‌ها

این برنامه با رویکردی مهندسی‌شده، ترکیبی از ابزارهای تحلیلی و آموزشی را در یک اکوسیستم واحد ارائه می‌دهد:

### 🧠 دستیار هوشمند و تعاملی (AI Assistant)
یک ماژول قدرتمند متصل به API هوش مصنوعی (Google Gemini) که به عنوان یک منتور شبکه عمل می‌کند. هرگونه ابهام در محاسبات CIDR، درک کلاس‌های شبکه و یا مبانی مسیریابی دارید؟ این دستیار با درک کامل کانتکست شبکه، مفاهیم را قدم به قدم برای شما تشریح می‌کند.

### 🎛️ شبیه‌ساز بی‌درنگ بیت‌ها (Bit Flipper Card)
یادگیری ماشینی‌ترین زبان کامپیوتر نیازمند تعامل است! این ابزار نبوغ‌آمیز به شما اجازه می‌دهد وضعیت هر بیت از معماری ۳۲ بیتی آدرس IPv4 را به صورت گرافیکی تغییر دهید و تأثیر ریاضی آن را به صورت کاملاً زنده (Real-time) مشاهده کنید.

### 📊 موتور تحلیل دقیق شبکه (Advanced Network Analysis)
هسته پردازشی برنامه که با دریافت هر آدرس IP، ساختار آن را از هم می‌شکافد:
- استخراج NetID و HostID
- محاسبه دقیق Network Address و Broadcast Address
- تعیین کلاس شبکه و ساختار Subnet Mask پیش‌فرض
- نمایش تعداد دقیق شبکه‌ها و میزبان‌های قابل استفاده

### 🎮 پلتفرم آموزشی گیمیفای‌شده (Quiz & Flashcard Hub)
یادگیری خشک و تئوری به پایان رسیده است. برنامه مجهز به یک اکوسیستم آزمون‌ساز (QuizHub) با سطوح مختلف، فلش‌کارت‌های آموزشی (FlashcardHub) برای مرور سریع اصطلاحات و بازخورد‌های صوتی و بصری بهینه‌شده است تا ماندگاری مفاهیم در ذهن کاربر تضمین شود.

### 💾 سیستم مدیریت داده و خروجی (Data Exporter & History)
تمام تعاملات، محاسبات و جستجوهای شما در یک سایدبار تاریخچه (History Sidebar) ثبت می‌شود. همچنین ماژول Data Exporter به مهندسین شبکه این امکان را می‌دهد تا لاگ محاسبات خود را در قالب‌های استانداردی مانند JSON، CSV و PDF خروجی بگیرند.

---

## 🏗️ ساختار و مهندسی پروژه

این اپلیکیشن بر بستر فریم‌ورک Next.js (App Router) و بر پایه معماری Component-Driven طراحی شده است تا بالاترین سطح نگهداری پذیری (Maintainability) و پرفورمنس را تضمین کند:

```text
📦 src
 ┣ 📂 app               # نقطه ورود برنامه و پیکربندی App Router
 ┃ ┣ 📂 api/gemini      # ارتباط امن سرور‌ساید (Server-side) با موتور هوش مصنوعی
 ┃ ┣ 📜 layout.tsx      # لایه اصلی و مدیریت فونت‌ها/تم‌ها
 ┃ ┗ 📜 page.tsx        # ارکستراتور اصلی کامپوننت‌های UI
 ┣ 📂 components        # ماژول‌های رابط کاربری کاملاً ایزوله
 ┃ ┣ 📜 AIAssistant.tsx # رابط گفتگو با هوش مصنوعی
 ┃ ┣ 📜 BitFlipperCard.tsx
 ┃ ┣ 📜 NetworkAnalysis.tsx
 ┃ ┣ 📜 QuizHub.tsx
 ┃ ┗ ... (شامل ده‌ها کامپوننت هوشمند دیگر)
 ┣ 📂 context           # مدیریت وضعیت (State Management) متمرکز
 ┃ ┗ 📜 IPContext.tsx
 ┣ 📂 hooks             # Custom Hooks برای مدیریت رفتارهای داینامیک
 ┃ ┗ 📜 use-mobile.ts
 ┗ 📂 lib               # هسته منطقی و ابزارهای پردازشی
   ┣ 📜 ip-utils.ts     # فرمول‌ها و الگوریتم‌های خالص شبکه
   ┣ 📜 audio.ts        # هندلر افکت‌های صوتی
   ┗ 📜 utils.ts        # توابع کاربردی و استایل‌دهی داینامیک Tailwind
```

---

## 🚀 راهنمای نصب و راه‌اندازی (Quick Start)

برای اجرای این پلتفرم در محیط توسعه محلی، مراحل زیر را به دقت دنبال کنید:

**پیش‌نیازها:** `Node.js` (ترجیحاً نسخه 18 به بالا) و یکی از مدیر بسته‌های `npm` یا `yarn` یا `pnpm`.

۱. **دریافت سورس‌کد:**
```bash
git clone <repository_url>
cd <repository_name>
```

۲. **نصب وابستگی‌ها (Dependencies):**
```bash
npm install
```

۳. **پیکربندی متغیرهای محیطی:**
فایل `.env.example` را در روت پروژه پیدا کرده و نام آن را به `.env` تغییر دهید. کلید اختصاصی Google Gemini API خود را وارد کنید تا ماژول AI فعال شود:
```env
GEMINI_API_KEY=your_secure_api_key_here
```

۴. **اجرای سرور توسعه (Development Server):**
```bash
npm run dev
```

برنامه شما با موفقیت کامپایل شده و در آدرس `http://localhost:3000` در دسترس خواهد بود. آماده‌ی کاوش در دنیای بی‌نهایت شبکه‌ها شوید!

---

💡 *طراحی و مهندسی شده با رویکردِ پیوند عمیق میان تئوری شبکه و هنر برنامه‌نویسی.*
