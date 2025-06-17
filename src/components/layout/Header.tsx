
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <SidebarTrigger className="h-8 w-8 md:hidden" /> {/* Trigger for mobile, hidden on md+ if sidebar is persistent */}
          <Link href="/" className="flex items-center space-x-2 ml-2 md:ml-0">
            {/* You can add a logo here if you have one */}
            {/* <Image src="https://logotyp.us/file/firebase.svg" alt="Logo" width={24} height={24} /> */}
            <span className="font-bold sm:inline-block font-headline">
              RiskPilot
            </span>
          </Link>
        </div>
        {/* Navigation items previously here are now in the Sidebar */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Add other header items here, like user profile, notifications, etc. */}
        </div>
      </div>
    </header>
  );
}
