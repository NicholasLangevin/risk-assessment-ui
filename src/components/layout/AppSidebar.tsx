
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
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { HomeIcon, UserCircle, FolderKanban, ListChecksIcon, Users, X, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile, OpenedCaseInfo } from '@/types';
import { getUserProfileById } from '@/lib/mockData';
import { useOpenedCases } from '@/contexts/OpenedCasesContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<UserProfile['role'] | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { openedCases, closeCase, clearAllCases } = useOpenedCases();

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
        } else {
            setCurrentUserRole(null);
        }
      }
    }
  }, [isMounted, pathname]);

  const handleCloseCaseTab = (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation(); // Prevent navigation if clicking on X within a link
    e.preventDefault();
    closeCase(caseId, pathname);
  };

  const handleClearAllTabs = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    clearAllCases();
  }

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
              <SidebarSeparator className="my-1 mx-0" />
              <SidebarGroup className="!p-0">
                <div className="flex justify-between items-center px-2 pt-1">
                    <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground !p-0 !h-auto">Open Cases</SidebarGroupLabel>
                    <Button variant="ghost" size="icon" onClick={handleClearAllTabs} className="h-6 w-6" tooltip="Close All Tabs">
                        <Archive className="h-3.5 w-3.5" />
                        <span className="sr-only">Close All Tabs</span>
                    </Button>
                </div>
                 <ScrollArea className="max-h-[200px] pl-2 pr-1 py-1"> {/* Adjust max-h as needed */}
                  <SidebarMenu className="pl-2 border-l border-border ml-1">
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
              </SidebarGroup>
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
