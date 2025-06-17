
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger
import { Input } from '@/components/ui/input'; // Import Input
import { Search } from 'lucide-react'; // Import Search icon

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center space-x-2">
          <SidebarTrigger className="h-8 w-8 p-2" />
          <Link href="/" className="flex items-center">
            <span className="font-bold sm:inline-block font-headline">
              RiskPilot
            </span>
          </Link>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search (e.g., quote ID, insured name)..."
              className="w-full rounded-md bg-background/70 pl-10 pr-4 py-2 text-sm h-9"
            />
          </div>
        </div>

        {/* Right Section - Future Icons/User Menu */}
        <div className="flex items-center space-x-2">
          {/* Placeholder for future user menu, notifications, etc. */}
          {/* Example: <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button> */}
        </div>
      </div>
    </header>
  );
}
