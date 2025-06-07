
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions, Guideline, ManagedSubjectToOffer, ManagedInformationRequest, CoverageItem, UnderwritingDecision, EmailGenerationInput } from '@/types';
import { PremiumSummaryCard } from './PremiumSummaryCard';
import { CapacityCheckCard } from './CapacityCheckCard';
import { BusinessSummaryCard } from './BusinessSummaryCard';
import { GuidelineStatusList } from './GuidelineStatusList';
import { AiProcessingMonitorContent } from './AiProcessingMonitorContent';
import { SubjectToOffersCard } from './SubjectToOffersCard';
import { InformationRequestsCard } from './InformationRequestsCard';
import { CoverageRequestedCard } from './CoverageRequestedCard';
import { EmailPreviewDialog } from './EmailPreviewDialog';
import { generateUnderwritingEmail, type EmailGenerationOutput } from '@/ai/flows/generate-underwriting-email';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Activity, ChevronLeft, Send as SendIcon, AlertTriangle, Loader2 } from 'lucide-react';
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
  const router = useRouter();

  const [selectedDecision, setSelectedDecision] = useState<UnderwritingDecision | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailState, setEmailState] = useState<{
    subject: string;
    originalBody: string;
    currentBody: string;
  } | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);


  useEffect(() => {
    if (initialQuoteDetails) {
      let updatedDetails = { ...initialQuoteDetails };

      if (!initialQuoteDetails.managedSubjectToOffers && aiUnderwritingActions?.potentialSubjectToOffers) {
        const initialManagedOffers = aiUnderwritingActions.potentialSubjectToOffers.map((text, index) => ({
          id: `sto-${index}-${Date.now()}`,
          originalText: text,
          currentText: text,
          isRemoved: false,
          isEdited: false,
        }));
        updatedDetails.managedSubjectToOffers = initialManagedOffers;
      } else if (!initialQuoteDetails.managedSubjectToOffers) {
        updatedDetails.managedSubjectToOffers = [];
      }


      if (!initialQuoteDetails.managedInformationRequests && aiUnderwritingActions?.informationRequests) {
        const initialManagedInfoRequests = aiUnderwritingActions.informationRequests.map((text, index) => ({
          id: `ir-${index}-${Date.now()}`,
          originalText: text,
          currentText: text,
          isRemoved: false,
          isEdited: false,
        }));
        updatedDetails.managedInformationRequests = initialManagedInfoRequests;
      } else if (!initialQuoteDetails.managedInformationRequests) {
         updatedDetails.managedInformationRequests = [];
      }
      setQuoteDetails(updatedDetails);
    }
  }, [initialQuoteDetails, aiUnderwritingActions]);


  const handleAddGuideline = (guidelineInfo: { id: string; name: string }) => {
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
        }, 0);
        return prevDetails;
      }
      setTimeout(() => {
        toast({
          title: "Guideline Added",
          description: `"${newGuideline.name}" has been added. Please update its status and details.`,
          variant: "default"
        });
      }, 0);
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
        setTimeout(() => {
          toast({
            title: "Guideline Updated",
            description: `Status for "${updatedGuideline.name}" changed to ${status}.`,
            variant: "default"
          });
        },0);
      }
      return {
        ...prevDetails,
        underwritingGuidelines: updatedGuidelines,
      };
    });
  };

  const handleUpdateSubjectToOffer = (id: string, newText: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails || !prevDetails.managedSubjectToOffers) return prevDetails;
      const updatedOffers = prevDetails.managedSubjectToOffers.map(offer =>
        offer.id === id ? { ...offer, currentText: newText, isEdited: true, isRemoved: false } : offer
      );
       setTimeout(() => {
        toast({
          title: "Subject-To Offer Updated",
          description: `Offer "${newText.substring(0,30)}..." has been modified.`,
          variant: "default"
        });
      },0);
      return { ...prevDetails, managedSubjectToOffers: updatedOffers };
    });
  };

  const handleToggleRemoveSubjectToOffer = (id: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails || !prevDetails.managedSubjectToOffers) return prevDetails;
      let offerText = "";
      let isNowRemoved = false;
      const updatedOffers = prevDetails.managedSubjectToOffers.map(offer => {
        if (offer.id === id) {
          offerText = offer.currentText;
          isNowRemoved = !offer.isRemoved;
          return { ...offer, isRemoved: !offer.isRemoved };
        }
        return offer;
      });
      setTimeout(() => {
        toast({
          title: `Subject-To Offer ${isNowRemoved ? 'Removed' : 'Restored'}`,
          description: `Offer "${offerText.substring(0,30)}..." has been ${isNowRemoved ? 'marked as removed' : 'restored'}.`,
          variant: "default"
        });
      },0);
      return { ...prevDetails, managedSubjectToOffers: updatedOffers };
    });
  };

   const handleAddSubjectToOffer = (newOfferText: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails) return null;
      const newOffer: ManagedSubjectToOffer = {
        id: `sto-custom-${Date.now()}`,
        originalText: `User-added: ${newOfferText}`, 
        currentText: newOfferText,
        isRemoved: false,
        isEdited: true, 
      };
      const updatedOffers = [...(prevDetails.managedSubjectToOffers || []), newOffer];
      setTimeout(() => {
        toast({
          title: "Subject-To Offer Added",
          description: `New offer "${newOfferText.substring(0,30)}..." added.`,
          variant: "default"
        });
      }, 0);
      return { ...prevDetails, managedSubjectToOffers: updatedOffers };
    });
  };

  const handleUpdateInformationRequest = (id: string, newText: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails || !prevDetails.managedInformationRequests) return prevDetails;
      const updatedRequests = prevDetails.managedInformationRequests.map(req =>
        req.id === id ? { ...req, currentText: newText, isEdited: true, isRemoved: false } : req
      );
      setTimeout(() => {
        toast({
          title: "Information Request Updated",
          description: `Request "${newText.substring(0,30)}..." has been modified.`,
          variant: "default"
        });
      }, 0);
      return { ...prevDetails, managedInformationRequests: updatedRequests };
    });
  };

  const handleToggleRemoveInformationRequest = (id: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails || !prevDetails.managedInformationRequests) return prevDetails;
      let reqText = "";
      let isNowRemoved = false;
      const updatedRequests = prevDetails.managedInformationRequests.map(req => {
        if (req.id === id) {
          reqText = req.currentText;
          isNowRemoved = !req.isRemoved;
          return { ...req, isRemoved: !req.isRemoved };
        }
        return req;
      });
      setTimeout(() => {
        toast({
          title: `Information Request ${isNowRemoved ? 'Removed' : 'Restored'}`,
          description: `Request "${reqText.substring(0,30)}..." has been ${isNowRemoved ? 'marked as removed' : 'restored'}.`,
          variant: "default"
        });
      }, 0);
      return { ...prevDetails, managedInformationRequests: updatedRequests };
    });
  };

  const handleAddInformationRequest = (newRequestText: string) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails) return null;
      const newRequest: ManagedInformationRequest = {
        id: `ir-custom-${Date.now()}`,
        originalText: `User-added: ${newRequestText}`,
        currentText: newRequestText,
        isRemoved: false,
        isEdited: true,
      };
      const updatedRequests = [...(prevDetails.managedInformationRequests || []), newRequest];
      setTimeout(() => {
        toast({
          title: "Information Request Added",
          description: `New request "${newRequestText.substring(0,30)}..." added.`,
          variant: "default"
        });
      }, 0);
      return { ...prevDetails, managedInformationRequests: updatedRequests };
    });
  };

  const handleConfirmAndGenerateEmail = async () => {
    if (!selectedDecision || !quoteDetails) return;

    setIsGeneratingEmail(true);
    setEmailState(null);

    const activeInformationRequests = quoteDetails.managedInformationRequests
      .filter(req => !req.isRemoved)
      .map(req => req.currentText);

    const activeSubjectToOffers = quoteDetails.managedSubjectToOffers
      .filter(offer => !offer.isRemoved)
      .map(offer => offer.currentText);

    const emailInput: EmailGenerationInput = {
      decision: selectedDecision,
      quoteId: quoteDetails.id,
      insuredName: quoteDetails.insuredName,
      brokerName: quoteDetails.broker, 
      ...(selectedDecision === 'OfferWithSubjectTos' && {
        premium: quoteDetails.premiumSummary.totalPremium,
        subjectToOffers: activeSubjectToOffers,
      }),
      ...(selectedDecision === 'InformationRequired' && {
        informationRequests: activeInformationRequests,
      }),
    };

    try {
      const result = await generateUnderwritingEmail(emailInput);
      setEmailState({
        subject: result.emailSubject,
        originalBody: result.emailBody,
        currentBody: result.emailBody,
      });
      setIsEmailDialogOpen(true);
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Email Generation Failed",
        description: "Could not generate the email. Please try again or draft manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEmail(false);
    }
  };
  
  const handleEmailBodyChange = (newBody: string) => {
    setEmailState(prev => prev ? { ...prev, currentBody: newBody } : null);
  };

  const handleSendEmail = async () => {
    if (!emailState) return;
    setIsSendingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    toast({
      title: "Email Sent (Simulated)",
      description: `Email regarding quote ${quoteDetails?.id} has been 'sent' to ${quoteDetails?.broker}.`,
      variant: "default",
    });
    setIsSendingEmail(false);
    setIsEmailDialogOpen(false);
    setEmailState(null);
    setSelectedDecision(null); // Reset decision
    router.push('/');
  };


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

  const decisionOptions: { value: UnderwritingDecision; label: string }[] = [
    { value: 'OfferWithSubjectTos', label: 'Offer with Subject-Tos' },
    { value: 'InformationRequired', label: 'Request Information' },
    { value: 'Decline', label: 'Decline Quote' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-grow">
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
          
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-3xl font-bold font-headline">
              Quote: {quoteDetails.id}
            </h1>

            <div className="flex items-center space-x-2">
              <Select
                value={selectedDecision || ""}
                onValueChange={(value) => setSelectedDecision(value as UnderwritingDecision)}
              >
                <SelectTrigger className="w-[230px] h-9" id="decision-select-trigger" aria-label="Underwriting Decision">
                  <SelectValue placeholder="Select decision..." />
                </SelectTrigger>
                <SelectContent>
                  {decisionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
              <Button
                onClick={handleConfirmAndGenerateEmail}
                disabled={!selectedDecision || isGeneratingEmail}
                size="sm"
                className="h-9"
              >
                {isGeneratingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendIcon className="mr-2 h-4 w-4" />}
                Confirm & Generate Email
              </Button>
            </div>
          </div>
          
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
        <div className="lg:col-span-2 space-y-6">
          <BusinessSummaryCard summary={quoteDetails.businessSummary} />
          <CoverageRequestedCard coverages={quoteDetails.coveragesRequested || []} />
          <GuidelineStatusList
            guidelines={quoteDetails.underwritingGuidelines}
            onAddGuideline={handleAddGuideline}
            onUpdateGuideline={handleUpdateGuideline}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <PremiumSummaryCard summary={quoteDetails.premiumSummary} />
          <CapacityCheckCard capacity={quoteDetails.capacityCheck} />
          <InformationRequestsCard
            requests={quoteDetails.managedInformationRequests || []}
            onUpdateInfoRequest={handleUpdateInformationRequest}
            onToggleRemoveInfoRequest={handleToggleRemoveInformationRequest}
            onAddInfoRequest={handleAddInformationRequest}
          />
          <SubjectToOffersCard
            offers={quoteDetails.managedSubjectToOffers || []}
            onUpdateOffer={handleUpdateSubjectToOffer}
            onToggleRemoveOffer={handleToggleRemoveSubjectToOffer}
            onAddSubjectToOffer={handleAddSubjectToOffer}
          />
        </div>
      </div>
      
      {emailState && (
        <EmailPreviewDialog
          isOpen={isEmailDialogOpen}
          onOpenChange={setIsEmailDialogOpen}
          emailContent={emailState}
          onEmailBodyChange={handleEmailBodyChange}
          onSend={handleSendEmail}
          isSending={isSendingEmail}
        />
      )}
    </div>
  );
}

