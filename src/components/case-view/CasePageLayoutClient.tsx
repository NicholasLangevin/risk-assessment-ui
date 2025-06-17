
'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Case } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CasePageLayoutClientProps {
  caseDetails: Case;
  children: React.ReactNode;
}

export function CasePageLayoutClient({ caseDetails, children }: CasePageLayoutClientProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/case/${caseDetails.id}`, label: 'Case Detail' },
    { href: `/case/${caseDetails.id}/emails`, label: 'Emails Exchange' },
    { href: `/case/${caseDetails.id}/data-entry`, label: 'Data Entry' },
    { href: `/case/${caseDetails.id}/risk-assessment`, label: 'Risk Assessment' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Case Header Information */}
      <div className="mb-6 pb-2">
        <h1 className="text-2xl font-bold font-headline">Case: {caseDetails.id}</h1>
        <p className="text-md text-muted-foreground mt-1">
          Insured: {caseDetails.insuredName} | Broker: {caseDetails.broker} | Type: {caseDetails.caseType}
        </p>
      </div>

      {/* Tab-like Navigation */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm',
                pathname === item.href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Page Content for the active sub-route */}
      <div className="mt-2 py-6 px-4 border bg-background/50 rounded-md min-h-[300px] shadow-sm">
        {children}
      </div>
    </div>
  );
}
