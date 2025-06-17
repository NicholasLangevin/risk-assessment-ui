
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar'; 

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <SidebarTrigger className="h-8 w-8" /> {/* Removed md:hidden */}
          <Link href="/" className="flex items-center space-x-2 ml-2 md:ml-0">
            
            
            <span className="font-bold sm:inline-block font-headline">
              RiskPilot
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          
        </div>
      </div>
    </header>
  );
}
