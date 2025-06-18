
'use client'; // Make RootLayout a Client Component

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/Header';
import { AppLayout } from '@/components/layout/AppLayout';
import type React from 'react';

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
        <title>CL Underwriting Assist</title>
        <meta name="description" content="AI-Powered Underwriting Assistance" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div
          className="group/sidebar-wrapper flex flex-col min-h-svh w-full has-[[data-variant=inset]]:bg-background/95 has-[[data-variant=inset]]:supports-[backdrop-filter]:bg-background/60"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            } as React.CSSProperties
          }
        >
          <SidebarProvider defaultOpen={false}>
            <Header />
            {/* This div now handles the offset for the header and takes remaining space */}
            <div className="flex-1 pt-1 overflow-hidden"> {/* pt-14 for header, flex-1 to grow */}
              <AppLayout>{children}</AppLayout>
            </div>
          </SidebarProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

