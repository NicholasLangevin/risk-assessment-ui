
import type React from 'react';
import Link from 'next/link';
import { Header } from './Header';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger // Added import for SidebarTrigger
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboard as LayoutDashboardIcon, SettingsIcon, UserCircle } from 'lucide-react'; 

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-2 flex justify-end items-center">
          {/* Link component was previously removed here by user request */}
          <SidebarTrigger /> {/* SidebarTrigger added here */}
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <HomeIcon />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/quote-dashboard">
                  <LayoutDashboardIcon />
                  Quote Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
          </SidebarMenu>
        </SidebarContent>
        
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 bg-background"> 
          {children}
        </main>
        
      </SidebarInset>
    </SidebarProvider>
  );
}
