
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { HomeIcon, UserCircle, FolderKanban, ListChecksIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';
import { getUserProfileById } from '@/lib/mockData';

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

export function AppSidebar() {
  const pathname = usePathname(); 
  const [currentUserRole, setCurrentUserRole] = useState<UserProfile['role'] | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const storedProfileId = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (storedProfileId) {
        const profile = getUserProfileById(storedProfileId);
        if (profile) {
          setCurrentUserRole(profile.role);
        }
      } else {
        // Default to first profile if nothing stored (e.g. Alex Miller who is underwriter)
        const defaultProfile = getUserProfileById("user-alex-uw");
        if (defaultProfile) {
          setCurrentUserRole(defaultProfile.role);
        }
      }
    }
  }, [isMounted]);


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
          {isMounted && currentUserRole === 'manager' && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Manage Team" isActive={pathname === '/manage-team'}>
                <Link href="/manage-team">
                  <span className={cn("inline-flex items-center justify-center")}>
                    <Users className="h-4 w-4" />
                  </span>
                  <span>Manage Team</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="User Profile" isActive={pathname === '/profile'}>
              <Link href="/profile"> 
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
