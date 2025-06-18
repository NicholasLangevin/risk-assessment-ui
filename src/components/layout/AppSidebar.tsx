
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { HomeIcon, UserCircle, FolderKanban, ListChecksIcon, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile, OpenedCaseInfo } from '@/types';
import { getUserProfileById } from '@/lib/mockData';
import { useOpenedCases } from '@/contexts/OpenedCasesContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar'; // Import useSidebar

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<UserProfile['role'] | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { openedCases, closeCase } = useOpenedCases();
  const { state: viewMode } = useSidebar(); // Get sidebar view mode

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const storedProfileId = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      let profileToSet: UserProfile | null = null;

      if (storedProfileId) {
        profileToSet = getUserProfileById(storedProfileId);
      }
      
      if (profileToSet) {
        setCurrentUserRole(profileToSet.role);
      } else {
        if (storedProfileId) {
            localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        }
        const defaultProfile = getUserProfileById("user-alex-uw");
        if (defaultProfile) {
          setCurrentUserRole(defaultProfile.role);
          // Optionally set the default in localStorage if it was missing/invalid
          // localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, defaultProfile.id);
        } else {
            setCurrentUserRole(null); // Or some other fallback
        }
      }
    }
  }, [isMounted, pathname]); // Re-check on navigation

  const handleCloseCaseTab = (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation(); 
    e.preventDefault();
    closeCase(caseId, pathname);
  };

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

          {openedCases.length > 0 && (
            <>
              <ScrollArea className="max-h-[200px] pl-1 pr-1 py-1">
                <SidebarMenu className={cn(
                  "border-l border-border",
                  viewMode === 'expanded' ? "pl-2 ml-1.5" : "pl-1 ml-0.5" // Dynamic classes for indentation
                )}>
                  {openedCases.map((caseInfo) => (
                    <SidebarMenuItem key={caseInfo.id} className="relative group/tab">
                      <SidebarMenuButton
                        asChild
                        tooltip={`${caseInfo.insuredName} - ${caseInfo.broker}`}
                        isActive={pathname === `/case/${caseInfo.id}` || pathname.startsWith(`/case/${caseInfo.id}/`)}
                        className="!py-1.5 !text-xs !h-auto !pl-1.5 !pr-6 w-full"
                        size="sm"
                      >
                        <Link href={`/case/${caseInfo.id}`} className="truncate">
                          <span className="truncate w-full block" title={`${caseInfo.id}: ${caseInfo.insuredName}`}>
                              {caseInfo.id}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50 group-hover/tab:opacity-100 focus:opacity-100"
                        onClick={(e) => handleCloseCaseTab(e, caseInfo.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Close tab {caseInfo.id}</span>
                      </Button>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
              <SidebarSeparator className="my-1 mx-0" />
            </>
          )}

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
