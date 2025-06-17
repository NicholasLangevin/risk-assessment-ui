
import type {Metadata} from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar'; // Import SidebarProvider

export const metadata: Metadata = {
  title: 'RiskPilot',
  description: 'AI-Powered Underwriting Assistance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen={true}> {/* Wrap Header and AppLayout */}
          <Header />
          <AppLayout>
            {children}
          </AppLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
