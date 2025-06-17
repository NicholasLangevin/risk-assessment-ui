
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
  SidebarTrigger
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboard as LayoutDashboardIcon, SettingsIcon, UserCircle } from 'lucide-react'; 

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-2 flex items-center group-data-[state=expanded]:justify-end group-data-[state=collapsed]:justify-center">
          <SidebarTrigger className="h-8 w-8 p-2" /> 
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
