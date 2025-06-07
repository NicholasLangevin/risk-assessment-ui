
'use client';

import React, { useState, useEffect } from 'react';
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions, Guideline } from '@/types';
import { PremiumSummaryCard } from './PremiumSummaryCard';
import { RecommendedActionsCard } from './RecommendedActionsCard';
import { CapacityCheckCard } from './CapacityCheckCard';
import { BusinessSummaryCard } from './BusinessSummaryCard'; // Renamed from BusinessOverviewCard
import { GuidelineStatusList } from './GuidelineStatusList';
import { AiProcessingMonitorContent } from './AiProcessingMonitorContent';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Activity, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface QuoteViewClientProps {
  quoteDetails: QuoteDetails | null;
  aiProcessingData: AiProcessingData | null;
  aiUnderwritingActions: AiUnderwritingActions | null;
}

export function QuoteViewClient({ quoteDetails: initialQuoteDetails, aiProcessingData, aiUnderwritingActions }: QuoteViewClientProps) {
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(initialQuoteDetails);
  const { toast } = useToast();
  
  useEffect(() => {
    setQuoteDetails(initialQuoteDetails);
  }, [initialQuoteDetails]);


  if (!quoteDetails) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
        <p className="text-muted-foreground">The requested quote could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  const handleAddGuideline = (guidelineInfo: { id: string; name: string }) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails) return null;

      const newGuideline: Guideline = {
        id: guidelineInfo.id,
        name: guidelineInfo.name,
        status: 'Needs Clarification', // Default status for newly added guidelines
        details: 'Manually added for evaluation. Please provide details.',
      };

      if (prevDetails.underwritingGuidelines.some(g => g.id === newGuideline.id)) {
        toast({
          title: "Guideline Exists",
          description: `"${newGuideline.name}" is already in the list.`,
          variant: "default" 
        });
        return prevDetails;
      }

      toast({
        title: "Guideline Added",
        description: `"${newGuideline.name}" has been added. Please update its status and details.`,
        variant: "default"
      });
      return {
        ...prevDetails,
        underwritingGuidelines: [...prevDetails.underwritingGuidelines, newGuideline],
      };
    });
  };

  const handleUpdateGuideline = (id: string, status: Guideline['status'], details?: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails) return null;
      const updatedGuidelines = prevDetails.underwritingGuidelines.map(g => 
        g.id === id ? { ...g, status, details: details !== undefined ? details : g.details } : g
      );
      
      const updatedGuideline = updatedGuidelines.find(g => g.id === id);
      if (updatedGuideline) {
        toast({
          title: "Guideline Updated",
          description: `Status for "${updatedGuideline.name}" changed to ${status}.`,
          variant: "default"
        });
      }

      return {
        ...prevDetails,
        underwritingGuidelines: updatedGuidelines,
      };
    });
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-grow">
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
          <h1 className="text-3xl font-bold font-headline">
            Quote: {quoteDetails.id}
          </h1>
          <p className="text-muted-foreground">Insured: {quoteDetails.insuredName} | Broker: {quoteDetails.broker}</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="ml-4 flex-shrink-0">
              <Activity className="mr-2 h-4 w-4" /> AI Monitor
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 flex flex-col">
            <SheetHeader className="p-6 border-b flex-shrink-0">
              <SheetTitle>AI Processing Monitor</SheetTitle>
              <SheetDescription>
                Real-time view of AI processing for submission {quoteDetails.id}.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto">
              <AiProcessingMonitorContent
                steps={aiProcessingData?.processingSteps || []}
                reasoning={aiProcessingData?.reasoning || "No reasoning data available."}
                submissionId={quoteDetails.id}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <BusinessSummaryCard summary={quoteDetails.businessSummary} /> 
          <GuidelineStatusList 
            guidelines={quoteDetails.underwritingGuidelines} 
            onAddGuideline={handleAddGuideline}
            onUpdateGuideline={handleUpdateGuideline}
          />
        </div>

        {/* Right Column / Summaries */}
        <div className="lg:col-span-1 space-y-6">
          <PremiumSummaryCard summary={quoteDetails.premiumSummary} />
          <CapacityCheckCard capacity={quoteDetails.capacityCheck} />
          <RecommendedActionsCard actions={aiUnderwritingActions} />
        </div>
      </div>
    </div>
  );
}
