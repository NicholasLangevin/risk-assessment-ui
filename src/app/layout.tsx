'use client'; // Make RootLayout a Client Component

import type { Metadata } from 'next'; // Keep if metadata object is still used (though it's less effective in client root)
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/Header';
import { AppLayout } from '@/components/layout/AppLayout';
import type React from 'react';

// Metadata should ideally be in a server component layout if possible,
// or handled differently if RootLayout must be client.
// For now, we'll keep it, but be aware of implications.
// export const metadata: Metadata = { // Metadata export won't work in Client Component
//   title: 'RiskPilot',
//   description: 'AI-Powered Underwriting Assistance',
// };

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* If metadata object is removed, add title tag here directly */}
        <title>RiskPilot</title>
        <meta name="description" content="AI-Powered Underwriting Assistance" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div
          className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            } as React.CSSProperties
          }
        >
          <SidebarProvider defaultOpen={true}>
            <Header />
            <AppLayout>
              {children}
            </AppLayout>
          </SidebarProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}