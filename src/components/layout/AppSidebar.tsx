
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { HomeIcon, UserCircle, FolderKanban, ListChecksIcon } from 'lucide-react'; // Added ListChecksIcon
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname(); 

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home" isActive={pathname === '/'}>
              <Link href="/">
                <span className={cn("inline-flex items-center justify-center")}>
                  <HomeIcon className="h-4 w-4" />
                </span>
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Working List" isActive={pathname === '/working-list'}>
              <Link href="/working-list">
                <span className={cn("inline-flex items-center justify-center")}>
                  <ListChecksIcon className="h-4 w-4" />
                </span>
                <span>Working List</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="All Cases" isActive={pathname === '/cases'}>
              <Link href="/cases">
                <span className={cn("inline-flex items-center justify-center")}>
                  <FolderKanban className="h-4 w-4" />
                </span>
                <span>All Cases</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Add more navigation items here if needed */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="User Profile">
              {/* In a real app, this might link to /profile or open a user menu popover */}
              <Link href="#"> 
                <span className={cn("inline-flex items-center justify-center")}>
                  <UserCircle className="h-4 w-4" />
                </span>
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
