
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14">
      <div className="container flex h-full max-w-screen-2xl items-center">
        <SidebarTrigger className="h-8 w-8 p-2 mr-4" /> {/* SidebarTrigger added to the left */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold sm:inline-block font-headline">
            RiskPilot
          </span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Future header items can go here */}
        </div>
      </div>
    </header>
  );
}
