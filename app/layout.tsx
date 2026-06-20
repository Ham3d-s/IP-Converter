import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'آی‌پی پلاس ۲.۰ | آزمایشگاه تعاملی آموزش و آنالیز شبکه',
  description: 'پلی بین مفاهیم سنتی سابنتینگ و قدرت هوش مصنوعی جهت شبیه‌سازی کالبدشکافی زنده و بازی‌سازی آموزش‌های فنی شبکه',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} dark`} style={{ colorScheme: 'dark' }}>
      <body
        className="font-sans antialiased bg-[#050811] text-slate-100 min-h-screen relative overflow-x-hidden custom-scrollbar selection:bg-indigo-500/30 selection:text-indigo-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
