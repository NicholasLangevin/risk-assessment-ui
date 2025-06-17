
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // Added Button for consistent styling

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
           {/* You can add a logo here if you have one */}
          {/* <Image src="https://logotyp.us/file/firebase.svg" alt="Logo" width={24} height={24} /> */}
          <span className="font-bold sm:inline-block font-headline">
            Underwriting Platform
          </span>
        </Link>
        <nav className="flex items-center space-x-2">
          <Button variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground">
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground">
            <Link href="/quote-dashboard">Quote Dashboard</Link>
          </Button>
          {/* Add more navigation items here if needed */}
        </nav>
      </div>
    </header>
  );
}
