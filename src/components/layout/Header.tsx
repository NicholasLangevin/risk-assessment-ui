
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Search, Bell, UserCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationList } from './NotificationList';
import { mockNotifications } from '@/lib/mockData';
import { useState } from 'react';

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-2">
        
        {/* Left Section: Sidebar Trigger and App Title */}
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold sm:inline-block font-headline">
              CL Underwriting Assist
            </span>
          </Link>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="Search submissions, policies..."
              className="pl-10 h-9"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Right Section: Notification Icon & Popover */}
        <div className="flex items-center space-x-2">
           <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-border shadow-xl mt-2" align="end" sideOffset={8}>
              <NotificationList notifications={mockNotifications} />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" aria-label="User Profile">
            <UserCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}

