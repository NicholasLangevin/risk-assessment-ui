
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Search, UserCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-2">
        
        {/* Left Section: Sidebar Trigger and App Title */}
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Link href="/" className="flex items-center space-x-2">
            {/* You can add a logo here if you have one */}
            {/* <Image src="https://logotyp.us/file/firebase.svg" alt="Logo" width={24} height={24} /> */}
            <span className="font-bold sm:inline-block font-headline">
              RiskPilot
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

        {/* Right Section: User Icon */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="User Profile">
            <UserCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
