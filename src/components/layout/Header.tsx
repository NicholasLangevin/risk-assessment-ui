
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Search, Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationList } from './NotificationList';
import { mockNotifications, mockCaseListItems, type CaseListItem } from '@/lib/mockData'; // Import mockCaseListItems and CaseListItem
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CaseListItem[]>([]);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearchPopoverOpen(false); // Close popover if search term is empty
      return;
    }

    // Debounce search
    const handler = setTimeout(() => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = mockCaseListItems.filter(
        (item) =>
          item.id.toLowerCase().includes(lowerSearchTerm) ||
          item.insuredName.toLowerCase().includes(lowerSearchTerm) ||
          item.broker.toLowerCase().includes(lowerSearchTerm)
      );
      setSearchResults(filtered);
      setIsSearchPopoverOpen(true); // Open popover if there's a search term
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSearchResultClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
    setIsSearchPopoverOpen(false);
    setSearchTerm(''); // Reset search term
  };

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
          <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
            <PopoverTrigger asChild>
              {/* Wrap Input in a div to serve as PopoverTrigger if Input itself cannot be a direct trigger */}
              {/* This div helps control focus and interaction for opening the popover. */}
              <div 
                className="relative w-full max-w-md" 
                role="button" // Make it act like a button for accessibility
                tabIndex={0} // Make it focusable
                onClick={() => searchInputRef.current?.focus()} // Focus input on click
                onKeyDown={(e) => { // Allow opening with Enter/Space for accessibility
                  if (e.key === 'Enter' || e.key === ' ') {
                    searchInputRef.current?.focus();
                  }
                }}
              >
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search cases by ID, Insured..."
                  className="pl-10 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchTerm.trim()) { // Only open on focus if there's already a search term
                      setIsSearchPopoverOpen(true);
                    }
                  }}
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[--radix-popover-trigger-width] mt-1 p-0" 
              sideOffset={5}
              onOpenAutoFocus={(e) => e.preventDefault()} // Prevent content from stealing focus from input
            >
              {searchResults.length > 0 ? (
                <ScrollArea className="max-h-[300px]">
                  <div className="py-1">
                    {searchResults.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        onClick={() => handleSearchResultClick(caseItem.id)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' || e.key === ' ') {
                             handleSearchResultClick(caseItem.id);
                           }
                        }}
                        className="px-3 py-2 text-sm hover:bg-accent rounded-sm cursor-pointer focus:bg-accent focus:outline-none"
                        role="button"
                        tabIndex={0}
                      >
                        <p className="font-medium">{caseItem.id} - {caseItem.insuredName}</p>
                        <p className="text-xs text-muted-foreground">
                          {caseItem.broker} | Status: {caseItem.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                searchTerm.trim() && ( // Only show "No results" if user has typed something
                  <p className="p-3 text-sm text-muted-foreground text-center">No results found.</p>
                )
              )}
               {!searchTerm.trim() && isSearchPopoverOpen && ( // Show prompt if popover is open but search is empty
                  <p className="p-3 text-sm text-muted-foreground text-center">Start typing to search cases.</p>
                )}
            </PopoverContent>
          </Popover>
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
          {/* User Profile button removed from here */}
        </div>
      </div>
    </header>
  );
}
