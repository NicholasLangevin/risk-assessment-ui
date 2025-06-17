
'use client';

import type React from 'react';
import { useState } from 'react'; // Added useState
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Case, ActiveSheetItem, ChatAttachmentInfo } from '@/types'; // Added ActiveSheetItem
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Added Sheet components
import { AiProcessingMonitorContent } from '@/components/quote/AiProcessingMonitorContent'; // Added AI Monitor Content
import { getMockAiToolActions } from '@/lib/mockData'; // Added mock data import
import { Activity } from 'lucide-react'; // Added Activity icon

interface CasePageLayoutClientProps {
  caseDetails: Case;
  children: React.ReactNode;
}

export function CasePageLayoutClient({ caseDetails, children }: CasePageLayoutClientProps) {
  const pathname = usePathname();
  const [activeSheetItem, setActiveSheetItem] = useState<ActiveSheetItem | null>(null);

  const navItems = [
    { href: `/case/${caseDetails.id}`, label: 'Case Detail' },
    { href: `/case/${caseDetails.id}/emails`, label: 'Emails Exchange' },
    { href: `/case/${caseDetails.id}/data-entry`, label: 'Data Entry' },
    { href: `/case/${caseDetails.id}/risk-assessment`, label: 'Risk Assessment' },
  ];

  const handleShowAiMonitor = () => {
    setActiveSheetItem({ type: 'aiMonitor', submissionId: caseDetails.id });
  };

  const caseAttachmentsForChat: ChatAttachmentInfo[] = []; 

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Case Header Information */}
      <div className="mb-6 pb-2">
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold font-headline">Case: {caseDetails.id}</h1>
            <Button variant="outline" className="h-9" onClick={handleShowAiMonitor}>
                <Activity className="mr-2 h-4 w-4" /> AI Chat & Monitor
            </Button>
        </div>
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

      <Sheet open={activeSheetItem?.type === 'aiMonitor'} onOpenChange={(isOpen) => !isOpen && setActiveSheetItem(null)}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl lg:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="p-6 border-b flex-shrink-0">
            <SheetTitle>AI Processing Monitor & Chat</SheetTitle>
            <SheetDescription>Monitor AI actions for case {caseDetails.id} and chat with the AI assistant.</SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            {activeSheetItem?.type === 'aiMonitor' && (
              <AiProcessingMonitorContent
                aiToolActions={getMockAiToolActions(caseDetails.id)}
                submissionId={caseDetails.id}
                insuredName={caseDetails.insuredName}
                brokerName={caseDetails.broker}
                attachmentsList={caseAttachmentsForChat} 
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
