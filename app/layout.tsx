import './globals.css';
import { Inter } from 'next/font/google';

// Optimize font loading for better performance
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// 1. Updated Metadata configuration
export const metadata = {
  title: 'FinSight AI | Technical Scanner Cluster',
  description: 'Advanced real-time market signal mapping and multimodal financial analysis workstation.',
};

// 2. Separate Viewport configuration (Fixes the Next.js warning)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        {/* Favicon or additional meta tags can go here */}
      </head>
      <body className="bg-[#030712] text-slate-100 antialiased font-sans selection:bg-indigo-500/30">
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}