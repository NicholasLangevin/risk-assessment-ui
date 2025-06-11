
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-start"> {/* Changed justify-center to justify-start */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold sm:inline-block font-headline">
            Underwriting Platform
          </span>
        </Link>
        {/* Add navigation items here if needed */}
      </div>
    </header>
  );
}
