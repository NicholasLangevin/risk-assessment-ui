import Link from 'next/link';
import Image from 'next/image';
import { BotMessageSquare } from 'lucide-react'; // Example icon

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* Placeholder logo - replace with actual logo if available */}
          {/* <Image src="https://placehold.co/32x32.png" alt="RiskPilot Logo" width={32} height={32} data-ai-hint="modern abstract" /> */}
          <BotMessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block font-headline">
            RiskPilot
          </span>
        </Link>
        {/* Add navigation items here if needed */}
      </div>
    </header>
  );
}
