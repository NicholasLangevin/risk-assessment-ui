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
  SidebarTrigger // Added SidebarTrigger if needed directly in AppLayout, though typically in Header
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboard as LayoutDashboardIcon, SettingsIcon, UserCircle } from 'lucide-react'; // Example icons

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="p-4">
          {/* You can add a logo or title here specific to the sidebar header */}
          <Link href="/" className="flex items-center space-x-2">
            {/* Optional: Icon for sidebar header if different from main header */}
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
            {/* Example of more items
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <SettingsIcon />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            */}
          </SidebarMenu>
        </SidebarContent>
        {/*
        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UserCircle />
                User Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        */}
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 bg-background"> {/* Ensure main content area has a background */}
          {children}
        </main>
        {/* Add a footer here if needed, within SidebarInset */}
      </SidebarInset>
    </SidebarProvider>
  );
}
