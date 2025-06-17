
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
      <Sidebar collapsible="icon"> {/* Changed collapsible to "icon" */}
        <SidebarHeader className="p-4">
          
          <Link href="/" className="flex items-center space-x-2">
            
            <span className="font-bold text-lg text-sidebar-primary-foreground">RiskPilot</span>
          </Link>
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
