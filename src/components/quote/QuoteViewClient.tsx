'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuoteDetails, AiUnderwritingActions, Guideline, ManagedSubjectToOffer, ManagedInformationRequest, CoverageItem, UnderwritingDecision, Citation, ActiveSheetItem, Attachment, RiskLevel } from '@/types';
import { PremiumSummaryCard } from './PremiumSummaryCard';
import { CapacityCheckCard } from './CapacityCheckCard';
import { BusinessSummaryCard } from './BusinessSummaryCard';
import { GuidelineStatusList } from './GuidelineStatusList';
// AIProcessingMonitorContent is no longer used directly here for its own sheet
import { SubjectToOffersCard } from './SubjectToOffersCard';
import { InformationRequestsCard } from './InformationRequestsCard';
import { CoverageRequestedCard } from './CoverageRequestedCard';
import { GuidelineDetailsContent } from './GuidelineDetailsContent';
import { CitationViewerContent } from './CitationViewerContent';
import { AttachmentViewerContent } from './AttachmentViewerContent';
import { updateSubjectToOffersInDB } from '@/app/actions/updateSubjectToOffers';


import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Activity, ChevronLeft, AlertTriangle, Loader2, Info, Edit, ThumbsUp, ThumbsDown, MailWarning, Wrench, Database } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
// getMockAiToolActions is no longer needed here if AiProcessingMonitor is handled by layout
// import { chatWithUnderwritingAssistant, type ChatUnderwritingAssistantInput } from '@/ai/flows/chat-underwriting-assistant';


interface QuoteViewClientProps {
  initialQuoteDetails: QuoteDetails | null;
  // initialAiProcessingData prop removed
  initialAiUnderwritingActions: AiUnderwritingActions;
  hideHeader?: boolean;
}

// Type for active sheet item within QuoteViewClient, excluding 'aiMonitor'
type QuoteViewActiveSheetItem =
  | { type: 'guideline'; data: Guideline }
  | { type: 'citation'; data: Citation }
  | { type: 'attachment'; data: Attachment; quoteId: string };


const AiSparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30"
    fill="currentColor"
    {...props}
  >
    <path d="M15.142,1.451L15.142,1.451c0.693,7.098,6.31,12.714,13.408,13.408l0,0c0.171,0.017,0.171,0.267,0,0.283l0,0	c-7.098,0.693-12.714,6.31-13.408,13.408l0,0c-0.017,0.171-0.267,0.171-0.283,0l0,0c-0.693-7.098-6.31-12.714-13.408-13.408l0,0	c-0.171-0.017-0.171-0.267,0-0.283l0,0c7.098-0.693,12.714-6.31,13.408-13.408l0,0C14.875,1.279,15.125,1.279,15.142,1.451z"></path>
  </svg>
);


export function QuoteViewClient({ initialQuoteDetails, initialAiUnderwritingActions, hideHeader = false }: QuoteViewClientProps) {
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(initialQuoteDetails);
  const { toast } = useToast();
  const router = useRouter();

  const [isSavingToDB, setIsSavingToDB] = useState(false);

  const [activeSheetItem, setActiveSheetItem] = useState<QuoteViewActiveSheetItem | null>(null); // Updated type

  const [aiOverallRiskStatement, setAiOverallRiskStatement] = useState<string>("Mock AI Overall Risk Statement: Based on the initial review, the risk profile appears moderate. Key areas to investigate include financial stability and claims history. Recommend further due diligence on operational risks.");
  const [isRiskStatementLoading, setIsRiskStatementLoading] = useState(false);

  const [managedSubjectToOffers, setManagedSubjectToOffers] = useState<ManagedSubjectToOffer[]>([]);
  const [isSubjectToOffersLoading, setIsSubjectToOffersLoading] = useState(false);

  const [managedInformationRequests, setManagedInformationRequests] = useState<ManagedInformationRequest[]>([]);
  const [isInfoRequestsLoading, setIsInfoRequestsLoading] = useState(false);

  const [currentCoveragesRequested, setCurrentCoveragesRequested] = useState<CoverageItem[]>([]);
  // aiProcessingData state removed as it was for the AI monitor sheet


  useEffect(() => {
    setQuoteDetails(initialQuoteDetails);
    if (initialQuoteDetails) {
        setAiOverallRiskStatement(initialQuoteDetails.aiOverallRiskStatement || "Mock AI Overall Risk Statement: Based on the initial review, the risk profile appears moderate. Key areas to investigate include financial stability and claims history. Recommend further due diligence on operational risks.");
        setIsRiskStatementLoading(false);

        const initialSTOs = initialAiUnderwritingActions.potentialSubjectToOffers.length > 0
            ? initialAiUnderwritingActions.potentialSubjectToOffers.map((text, index) => ({
                id: `sto-mock-${index}-${Date.now()}`,
                originalText: text,
                currentText: text,
                isRemoved: false,
                isEdited: false,
              }))
            : [
                { id: 'mock-sto-1', originalText: 'Subject to satisfactory building inspection report.', currentText: 'Subject to satisfactory building inspection report.', isRemoved: false, isEdited: false },
                { id: 'mock-sto-2', originalText: 'Subject to review of last 3 years audited financials.', currentText: 'Subject to review of last 3 years audited financials.', isRemoved: false, isEdited: false },
            ];
        setManagedSubjectToOffers(initialQuoteDetails.managedSubjectToOffers || initialSTOs);
        setIsSubjectToOffersLoading(false);

        const initialIRs = initialAiUnderwritingActions.informationRequests.length > 0
            ? initialAiUnderwritingActions.informationRequests.map((text, index) => ({
                id: `ir-mock-${index}-${Date.now()}`,
                originalText: text,
                currentText: text,
                isRemoved: false,
                isEdited: false,
              }))
            : [
                { id: 'mock-ir-1', originalText: 'Provide detailed loss history for the past 5 years.', currentText: 'Provide detailed loss history for the past 5 years.', isRemoved: false, isEdited: false },
                { id: 'mock-ir-2', originalText: 'Clarify security measures for data protection.', currentText: 'Clarify security measures for data protection.', isRemoved: false, isEdited: false },
            ];
        setManagedInformationRequests(initialQuoteDetails.managedInformationRequests || initialIRs);
        setIsInfoRequestsLoading(false);

        setCurrentCoveragesRequested(
            initialQuoteDetails.coveragesRequested.map(cov => ({
                ...cov,
                aiRiskEvaluation: cov.aiRiskEvaluation || `Mock AI evaluation for ${cov.type}: Standard risk profile observed. No major concerns.`,
                riskLevel: cov.riskLevel && cov.riskLevel !== 'Loading' ? cov.riskLevel : 'Normal' as RiskLevel,
            }))
        );
        
        // setAiProcessingData removed
    }
  }, [initialQuoteDetails, initialAiUnderwritingActions]);


  const syncSubjectToOffersToDB = useCallback(async (updatedOffers: ManagedSubjectToOffer[]) => {
    if (!quoteDetails?.id) return;
    setIsSavingToDB(true);
    const offerTexts = updatedOffers.filter(offer => !offer.isRemoved).map(offer => offer.currentText);
    try {
      const result = await updateSubjectToOffersInDB(quoteDetails.id, offerTexts);
      if (result.success) {
        toast({
          title: "Subject-Tos Saved",
          description: result.message,
          variant: "default",
        });
      } else {
        throw new Error(result.message || "Failed to save to database.");
      }
    } catch (error: any) {
      console.error("Failed to save subject-to offers:", error);
      toast({
        title: "Save Error",
        description: error.message || "Could not save subject-to offers to the database.",
        variant: "destructive",
      });
    } finally {
      setIsSavingToDB(false);
    }
  }, [quoteDetails?.id, toast]);

  const handleAddGuideline = useCallback((guidelineInfo: { id: string; name: string }) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails) return null;
      const newGuideline: Guideline = {
        id: guidelineInfo.id,
        name: guidelineInfo.name,
        status: 'Needs Clarification', 
        details: 'Manually added for evaluation. Please provide details.',
      };
      if (prevDetails.underwritingGuidelines.some(g => g.id === newGuideline.id)) {
        setTimeout(() => { 
          toast({
            title: "Guideline Exists",
            description: `"${newGuideline.name}" is already in the list.`,
            variant: "default"
          });
        },0);
        return prevDetails;
      }
      setTimeout(() => {
        toast({
          title: "Guideline Added",
          description: `"${newGuideline.name}" has been added. Please update its status and details.`,
          variant: "default"
        });
      },0);
      return {
        ...prevDetails,
        underwritingGuidelines: [...prevDetails.underwritingGuidelines, newGuideline],
      };
    });
  }, [toast]);

  const handleUpdateGuideline = useCallback((id: string, status: Guideline['status'], details?: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails) return null;
      const updatedGuidelines = prevDetails.underwritingGuidelines.map(g =>
        g.id === id ? { ...g, status, details: details !== undefined ? details : g.details } : g
      );
      const updatedGuideline = updatedGuidelines.find(g => g.id === id);
      if (updatedGuideline) {
         setTimeout(() => {
          toast({
            title: "Guideline Updated",
            description: `Status for "${updatedGuideline.name}" changed to ${status}.`,
            variant: "default"
          });
        }, 0);
      }
      return {
        ...prevDetails,
        underwritingGuidelines: updatedGuidelines,
      };
    });
  }, [toast]);

  const handleUpdateSubjectToOffer = useCallback((id: string, newText: string) => {
    const updated = managedSubjectToOffers.map(offer =>
        offer.id === id ? { ...offer, currentText: newText, isEdited: true, isRemoved: false } : offer
      );
    setManagedSubjectToOffers(updated);
    syncSubjectToOffersToDB(updated);
  }, [managedSubjectToOffers, syncSubjectToOffersToDB]);

  const handleToggleRemoveSubjectToOffer = useCallback((id: string) => {
    let offerText = "";
    let isNowRemoved = false;
    const updated = managedSubjectToOffers.map(offer => {
      if (offer.id === id) {
        offerText = offer.currentText;
        isNowRemoved = !offer.isRemoved;
        return { ...offer, isRemoved: !offer.isRemoved };
      }
      return offer;
    });
    setManagedSubjectToOffers(updated);
    syncSubjectToOffersToDB(updated);
  }, [managedSubjectToOffers, syncSubjectToOffersToDB]);

   const handleAddSubjectToOffer = useCallback((newOfferText: string) => {
    const newOffer: ManagedSubjectToOffer = {
      id: `sto-custom-${Date.now()}`,
      originalText: `User-added: ${newOfferText}`,
      currentText: newOfferText,
      isRemoved: false,
      isEdited: false, 
    };
    const updated = [...managedSubjectToOffers, newOffer];
    setManagedSubjectToOffers(updated);
    syncSubjectToOffersToDB(updated);
  }, [managedSubjectToOffers, syncSubjectToOffersToDB]);

  const handleUpdateInformationRequest = useCallback((id: string, newText: string) => {
    setManagedInformationRequests(prevRequests => 
      prevRequests.map(req =>
        req.id === id ? { ...req, currentText: newText, isEdited: true, isRemoved: false } : req
      )
    );
    toast({
      title: "Information Request Updated",
      description: `Request "${newText.substring(0,30)}..." has been modified.`,
      variant: "default"
    });
  }, [toast]);

  const handleToggleRemoveInformationRequest = useCallback((id: string) => {
    setManagedInformationRequests(prevRequests => {
      let reqText = "";
      let isNowRemoved = false;
      const updatedRequests = prevRequests.map(req => {
        if (req.id === id) {
          reqText = req.currentText;
          isNowRemoved = !req.isRemoved;
          return { ...req, isRemoved: !req.isRemoved };
        }
        return req;
      });
      toast({
        title: `Information Request ${isNowRemoved ? 'Removed' : 'Restored'}`,
        description: `Request "${reqText.substring(0,30)}..." has been ${isNowRemoved ? 'marked as removed' : 'restored'}.`,
        variant: "default"
      });
      return updatedRequests;
    });
  }, [toast]);

  const handleAddInformationRequest = useCallback((newRequestText: string) => {
    const newRequest: ManagedInformationRequest = {
      id: `ir-custom-${Date.now()}`,
      originalText: `User-added: ${newRequestText}`,
      currentText: newRequestText,
      isRemoved: false,
      isEdited: false,
    };
    setManagedInformationRequests(prev => [...prev, newRequest]);
    toast({
      title: "Information Request Added",
      description: `New request "${newRequestText.substring(0,30)}..." added.`,
      variant: "default"
    });
  }, [toast]);
  
  const handleShowGuidelineDetails = (guideline: Guideline) => {
    setActiveSheetItem({ type: 'guideline', data: guideline });
  };

  const handleShowCitation = (citation: Citation) => {
    setActiveSheetItem({ type: 'citation', data: citation });
  };
  
  // handleShowAiMonitor removed

  if (!quoteDetails) {
    return (
      <div className="container mx-auto py-8 text-center">
         <AlertTriangle className="h-16 w-16 text-destructive mb-6 mx-auto" />
        <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
        <p className="text-muted-foreground">The requested quote could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const renderSheetContent = () => {
    if (!activeSheetItem) return null;
    // 'aiMonitor' case removed
    switch (activeSheetItem.type) {
      case 'guideline':
        return <GuidelineDetailsContent guideline={activeSheetItem.data} />;
      case 'citation':
        return <CitationViewerContent citation={activeSheetItem.data} />;
      case 'attachment':
        return <AttachmentViewerContent attachment={activeSheetItem.data} />;
      default:
        // This should ideally not be reached if types are correct
        const exhaustiveCheck: never = activeSheetItem; 
        return null;
    }
  };

  const getSheetTitle = () => {
    if (!activeSheetItem) return "";
    // 'aiMonitor' case removed
    switch (activeSheetItem.type) {
      case 'guideline': return `Guideline: ${activeSheetItem.data.name}`;
      case 'citation': return `Citation: ${activeSheetItem.data.quickDescription}`;
      case 'attachment': return `Attachment: ${activeSheetItem.data.fileName}`;
      default: 
        const exhaustiveCheck: never = activeSheetItem;
        return "";
    }
  };

   const getSheetDescription = () => {
    if (!activeSheetItem || !quoteDetails) return "";
    // 'aiMonitor' case removed
    switch (activeSheetItem.type) {
      case 'guideline': return `Detailed information for guideline "${activeSheetItem.data.name}". Current status: ${activeSheetItem.data.status}.`;
      case 'citation': return `Details for citation: ${activeSheetItem.data.sourceType === 'web' ? activeSheetItem.data.sourceNameOrUrl : activeSheetItem.data.sourceNameOrUrl }`;
      case 'attachment': return `Details for attachment "${activeSheetItem.data.fileName}". Type: ${activeSheetItem.data.fileType.toUpperCase()}, Size: ${activeSheetItem.data.fileSize}`;
      default: 
        const exhaustiveCheck: never = activeSheetItem;
        return "";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Header section with quote ID, insured, broker */}
      {!hideHeader && (
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold font-headline mb-1">
                    Quote: {quoteDetails.id}
                </h1>
                <p className="text-muted-foreground">
                    Insured: {quoteDetails.insuredName} | Broker: {quoteDetails.broker}
                </p>
            </div>
            {/* AI Chat & Monitor button removed from here */}
        </div>
      )}

      {/* Decision making and AI Risk Assessment section - always visible */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6 border border-slate-200 dark:border-slate-700">
        <div className="mt-4 p-3 border rounded-md bg-muted/30 dark:bg-slate-700/30 shadow-sm border-slate-200 dark:border-slate-600">
          <h4 className="text-sm font-semibold mb-1 flex items-center text-primary">
            <AiSparkleIcon className="h-4 w-4 mr-2" />
            AI Risk Assessment
          </h4>
          {isRiskStatementLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-sm text-foreground/90 dark:text-slate-300 whitespace-pre-wrap">{aiOverallRiskStatement}</p>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BusinessSummaryCard 
            summary={quoteDetails.businessSummary} 
            citations={quoteDetails.citations || []}
            onShowCitation={handleShowCitation}
          />
          <CoverageRequestedCard coverages={currentCoveragesRequested} />
          <GuidelineStatusList
            guidelines={quoteDetails.underwritingGuidelines}
            onAddGuideline={handleAddGuideline}
            onUpdateGuideline={handleUpdateGuideline}
            onViewGuidelineDetails={handleShowGuidelineDetails}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <PremiumSummaryCard summary={quoteDetails.premiumSummary} />
          <CapacityCheckCard capacity={quoteDetails.capacityCheck} />
          <InformationRequestsCard
            requests={managedInformationRequests}
            onUpdateInfoRequest={handleUpdateInformationRequest}
            onToggleRemoveInfoRequest={handleToggleRemoveInformationRequest}
            onAddInfoRequest={handleAddInformationRequest}
            
          />
          <SubjectToOffersCard
            offers={managedSubjectToOffers}
            onUpdateOffer={handleUpdateSubjectToOffer}
            onToggleRemoveOffer={handleToggleRemoveSubjectToOffer}
            onAddSubjectToOffer={handleAddSubjectToOffer}
            isSaving={isSavingToDB}
          />
        </div>
      </div>

      <Sheet open={activeSheetItem !== null} onOpenChange={(isOpen) => !isOpen && setActiveSheetItem(null)}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl lg:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="p-6 border-b flex-shrink-0">
            <SheetTitle>{getSheetTitle()}</SheetTitle>
            <SheetDescription>{getSheetDescription()}</SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            {renderSheetContent()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
