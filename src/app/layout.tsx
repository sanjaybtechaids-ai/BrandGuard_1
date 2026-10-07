import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ToastProvider } from '@/components/common/ToastProvider';
import { UserContextProvider } from '@/context/UserContext';
import { BrandContextProvider } from '@/context/BrandContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BrandGuard AI — Digital Risk Protection | Social & App Monitoring',
  description:
    'Detect potential brand impersonation across mobile applications and social-media accounts by comparing suspicious entities against a trusted official brand profile.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600/20 selection:text-blue-600">
        <ThemeProvider>
          <ToastProvider>
            <UserContextProvider>
              <BrandContextProvider>{children}</BrandContextProvider>
            </UserContextProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
