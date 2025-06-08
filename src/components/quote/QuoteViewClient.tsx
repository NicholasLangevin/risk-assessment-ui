'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions, Guideline, ManagedSubjectToOffer, ManagedInformationRequest, CoverageItem, UnderwritingDecision, EmailGenerationInput, Citation, ActiveSheetItem, Attachment, StreamedTextResponse } from '@/types';
import { PremiumSummaryCard } from './PremiumSummaryCard';
import { CapacityCheckCard } from './CapacityCheckCard';
import { BusinessSummaryCard } from './BusinessSummaryCard';
import { GuidelineStatusList } from './GuidelineStatusList';
import { AiProcessingMonitorContent } from './AiProcessingMonitorContent';
import { SubjectToOffersCard } from './SubjectToOffersCard';
import { InformationRequestsCard } from './InformationRequestsCard';
import { CoverageRequestedCard } from './CoverageRequestedCard';
import { EmailPreviewDialog } from './EmailPreviewDialog';
import { GuidelineDetailsContent } from './GuidelineDetailsContent';
import { CitationViewerContent } from './CitationViewerContent';
import { AttachmentsCard } from './AttachmentsCard';
import { AttachmentViewerContent } from './AttachmentViewerContent';
import { generateUnderwritingEmail, type EmailGenerationOutput } from '@/ai/flows/generate-underwriting-email';
import { suggestUnderwritingActions } from '@/ai/flows/suggest-underwriting-actions';
import { monitorAiProcessing } from '@/ai/flows/monitor-ai-processing';
import { evaluateCoverageRisk } from '@/ai/flows/evaluate-coverage-risk';
import { generateOverallRiskStatement } from '@/ai/flows/generate-overall-risk-statement'; // New import

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, ChevronLeft, Send as SendIcon, AlertTriangle, Loader2, Info, Edit, ThumbsUp, ThumbsDown, MailWarning } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface QuoteViewClientProps {
  initialQuoteDetails: QuoteDetails | null;
  initialAiProcessingData: AiProcessingData | null; // For AI Monitor, if we decide to fetch some initial state or pass static
  initialAiUnderwritingActions: AiUnderwritingActions | null; // For recommended actions, if pre-fetched
}

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


export function QuoteViewClient({ initialQuoteDetails }: QuoteViewClientProps) {
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
  
  const [activeSheetItem, setActiveSheetItem] = useState<ActiveSheetItem>(null);

  // States for AI-driven data
  const [aiOverallRiskStatement, setAiOverallRiskStatement] = useState<string>("");
  const [isRiskStatementLoading, setIsRiskStatementLoading] = useState(true);
  const [managedSubjectToOffers, setManagedSubjectToOffers] = useState<ManagedSubjectToOffer[]>([]);
  const [isSubjectToOffersLoading, setIsSubjectToOffersLoading] = useState(true);
  const [managedInformationRequests, setManagedInformationRequests] = useState<ManagedInformationRequest[]>([]);
  const [isInfoRequestsLoading, setIsInfoRequestsLoading] = useState(true);
  const [currentCoveragesRequested, setCurrentCoveragesRequested] = useState<CoverageItem[]>(initialQuoteDetails?.coveragesRequested || []);
  const [aiProcessingData, setAiProcessingData] = useState<AiProcessingData | null>(null);


  useEffect(() => {
    setQuoteDetails(initialQuoteDetails);
    if (initialQuoteDetails) {
        // Initialize coverages with 'Loading' state
        setCurrentCoveragesRequested(
            initialQuoteDetails.coveragesRequested.map(cov => ({
                ...cov,
                aiRiskEvaluation: 'Loading AI insights...',
                riskLevel: 'Loading'
            }))
        );

        // Fetch AI Overall Risk Statement
        const fetchRiskStatement = async () => {
          setIsRiskStatementLoading(true);
          try {
            const stream = generateOverallRiskStatement({ submissionData: initialQuoteDetails.rawSubmissionData });
            let fullStatement = "";
            for await (const chunk of stream) {
              if (chunk.type === 'textChunk' && chunk.content) {
                fullStatement += chunk.content;
                setAiOverallRiskStatement(prev => prev + chunk.content);
              } else if (chunk.type === 'error') {
                console.error("Error streaming risk statement:", chunk.error);
                setAiOverallRiskStatement("Error generating risk statement.");
                break;
              }
            }
          } catch (error) {
            console.error("Failed to fetch AI risk statement:", error);
            setAiOverallRiskStatement("Could not load AI risk assessment.");
          } finally {
            setIsRiskStatementLoading(false);
          }
        };

        // Fetch AI Underwriting Actions
        const fetchUnderwritingActions = async () => {
          setIsSubjectToOffersLoading(true);
          setIsInfoRequestsLoading(true);
          try {
            const actions = await suggestUnderwritingActions({ submissionData: initialQuoteDetails.rawSubmissionData });
            setManagedSubjectToOffers(actions.potentialSubjectToOffers.map((text, index) => ({
              id: `sto-${index}-${Date.now()}`,
              originalText: text,
              currentText: text,
              isRemoved: false,
              isEdited: false,
            })));
            setManagedInformationRequests(actions.informationRequests.map((text, index) => ({
              id: `ir-${index}-${Date.now()}`,
              originalText: text,
              currentText: text,
              isRemoved: false,
              isEdited: false,
            })));
          } catch (error) {
            console.error("Error fetching AI underwriting actions:", error);
            toast({ title: "Error", description: "Failed to load AI suggestions.", variant: "destructive" });
          } finally {
            setIsSubjectToOffersLoading(false);
            setIsInfoRequestsLoading(false);
          }
        };

        // Fetch AI Processing Monitor Data
        const fetchProcessingData = async () => {
          try {
            const monitorOutput = await monitorAiProcessing({ submissionId: initialQuoteDetails.id });
            setAiProcessingData({
              aiToolActions: monitorOutput.aiToolActions || [],
            });
          } catch (error) {
            console.error("Error fetching AI processing data:", error);
            // Use mock data as fallback if needed, or handle error display
            setAiProcessingData({ aiToolActions: getMockAiToolActions(initialQuoteDetails.id) });
          }
        };

        // Fetch Individual Coverage Risks
        const fetchCoverageRisks = async () => {
          const updatedCoverages = await Promise.all(
            initialQuoteDetails.coveragesRequested.map(async (coverage) => {
              try {
                const evaluationOutput = await evaluateCoverageRisk({
                  submissionData: initialQuoteDetails.rawSubmissionData,
                  coverageType: coverage.type,
                });
                return {
                  ...coverage,
                  aiRiskEvaluation: evaluationOutput.aiRiskEvaluation,
                  riskLevel: evaluationOutput.riskLevel,
                };
              } catch (error) {
                console.error(`Error evaluating risk for coverage ${coverage.type}:`, error);
                return {
                  ...coverage,
                  aiRiskEvaluation: "AI evaluation failed. Please review manually.",
                  riskLevel: "Normal" as RiskLevel,
                };
              }
            })
          );
          setCurrentCoveragesRequested(updatedCoverages);
        };
        
        fetchRiskStatement();
        fetchUnderwritingActions();
        fetchProcessingData();
        fetchCoverageRisks();
    }
  }, [initialQuoteDetails, toast]);


  const handleAddGuideline = (guidelineInfo: { id: string; name: string }) => {
    setQuoteDetails(prevDetails => {
      if (!prevDetails) return null;
      const newGuideline: Guideline = {
        id: guidelineInfo.id,
        name: guidelineInfo.name,
        status: 'Needs Clarification', // Default status for manually added guidelines
        details: 'Manually added for evaluation. Please provide details.',
      };
      if (prevDetails.underwritingGuidelines.some(g => g.id === newGuideline.id)) {
        setTimeout(() => { // Ensure toast appears after state update
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
        }, 0);
      }
      return {
        ...prevDetails,
        underwritingGuidelines: updatedGuidelines,
      };
    });
  };

  const handleUpdateSubjectToOffer = (id: string, newText: string) => {
    setManagedSubjectToOffers(prevOffers => 
      prevOffers.map(offer =>
        offer.id === id ? { ...offer, currentText: newText, isEdited: true, isRemoved: false } : offer
      )
    );
    toast({
      title: "Subject-To Offer Updated",
      description: `Offer "${newText.substring(0,30)}..." has been modified.`,
      variant: "default"
    });
  };

  const handleToggleRemoveSubjectToOffer = (id: string) => {
    setManagedSubjectToOffers(prevOffers => {
      let offerText = "";
      let isNowRemoved = false;
      const updatedOffers = prevOffers.map(offer => {
        if (offer.id === id) {
          offerText = offer.currentText;
          isNowRemoved = !offer.isRemoved;
          return { ...offer, isRemoved: !offer.isRemoved };
        }
        return offer;
      });
      toast({
        title: `Subject-To Offer ${isNowRemoved ? 'Removed' : 'Restored'}`,
        description: `Offer "${offerText.substring(0,30)}..." has been ${isNowRemoved ? 'marked as removed' : 'restored'}.`,
        variant: "default"
      });
      return updatedOffers;
    });
  };

   const handleAddSubjectToOffer = (newOfferText: string) => {
    const newOffer: ManagedSubjectToOffer = {
      id: `sto-custom-${Date.now()}`,
      originalText: `User-added: ${newOfferText}`,
      currentText: newOfferText,
      isRemoved: false,
      isEdited: false,
    };
    setManagedSubjectToOffers(prev => [...prev, newOffer]);
    toast({
      title: "Subject-To Offer Added",
      description: `New offer "${newOfferText.substring(0,30)}..." added.`,
      variant: "default"
    });
  };

  const handleUpdateInformationRequest = (id: string, newText: string) => {
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
  };

  const handleToggleRemoveInformationRequest = (id: string) => {
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
  };

  const handleAddInformationRequest = (newRequestText: string) => {
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
  };
  
  const handleConfirmAndGenerateEmail = async () => {
    if (!selectedDecision || !quoteDetails) return;

    setIsGeneratingEmail(true);
    setEmailState(null);

    const activeInformationRequests = managedInformationRequests
      .filter(req => !req.isRemoved)
      .map(req => req.currentText);

    const activeSubjectToOffers = managedSubjectToOffers
      .filter(offer => !offer.isRemoved)
      .map(offer => offer.currentText);

    const emailInput: EmailGenerationInput = {
      decision: selectedDecision,
      quoteId: quoteDetails.id,
      insuredName: quoteDetails.insuredName,
      brokerName: quoteDetails.broker,
      ...(selectedDecision === 'OfferWithSubjectTos' && {
        premium: quoteDetails.premiumSummary.recommendedPremium, 
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
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Email Sent (Simulated)",
      description: `Email regarding quote ${quoteDetails?.id} has been 'sent' to ${quoteDetails?.broker}.`,
      variant: "default",
    });
    setIsSendingEmail(false);
    setIsEmailDialogOpen(false);
    setEmailState(null);
    setSelectedDecision(null);
    router.push('/');
  };

  const handleShowGuidelineDetails = (guideline: Guideline) => {
    setActiveSheetItem({ type: 'guideline', data: guideline });
  };

  const handleShowCitation = (citation: Citation) => {
    setActiveSheetItem({ type: 'citation', data: citation });
  };
  
  const handleShowAiMonitor = () => {
     if (quoteDetails) {
        setActiveSheetItem({ type: 'aiMonitor', submissionId: quoteDetails.id });
     }
  };

  const handleShowAttachment = (attachment: Attachment) => {
    setActiveSheetItem({ type: 'attachment', data: attachment, quoteId: quoteDetails?.id || "" });
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

  const renderSheetContent = () => {
    if (!activeSheetItem) return null;
    switch (activeSheetItem.type) {
      case 'aiMonitor':
        return (
          <AiProcessingMonitorContent
            aiToolActions={aiProcessingData?.aiToolActions || []} 
            submissionId={activeSheetItem.submissionId}
            insuredName={quoteDetails.insuredName}
            brokerName={quoteDetails.broker}
            attachmentsList={quoteDetails.attachments.map(att => ({ fileName: att.fileName, fileType: att.fileType }))}
          />
        );
      case 'guideline':
        return <GuidelineDetailsContent guideline={activeSheetItem.data} />;
      case 'citation':
        return <CitationViewerContent citation={activeSheetItem.data} />;
      case 'attachment':
        return <AttachmentViewerContent attachment={activeSheetItem.data} quoteId={activeSheetItem.quoteId} />;
      default:
        return null;
    }
  };

  const getSheetTitle = () => {
    if (!activeSheetItem) return "";
    switch (activeSheetItem.type) {
      case 'aiMonitor': return "AI Processing Monitor & Chat";
      case 'guideline': return `Guideline: ${activeSheetItem.data.name}`;
      case 'citation': return `Citation: ${activeSheetItem.data.quickDescription}`;
      case 'attachment': return `Attachment: ${activeSheetItem.data.fileName}`;
      default: return "";
    }
  };

   const getSheetDescription = () => {
    if (!activeSheetItem || !quoteDetails) return "";
    switch (activeSheetItem.type) {
      case 'aiMonitor': return `Monitor AI actions for submission ${quoteDetails.id} and chat with the AI assistant.`;
      case 'guideline': return `Detailed information for guideline "${activeSheetItem.data.name}". Current status: ${activeSheetItem.data.status}.`;
      case 'citation': return `Details for citation: ${activeSheetItem.data.sourceType === 'web' ? activeSheetItem.data.sourceNameOrUrl : activeSheetItem.data.sourceNameOrUrl }`;
      case 'attachment': return `Details for attachment "${activeSheetItem.data.fileName}". Type: ${activeSheetItem.data.fileType.toUpperCase()}, Size: ${activeSheetItem.data.fileSize}`;
      default: return "";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <Button variant="outline" className="h-9" onClick={handleShowAiMonitor}>
          <Activity className="mr-2 h-4 w-4" /> AI Chat & Monitor
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline mb-1">
              Quote: {quoteDetails.id}
            </h1>
            <p className="text-muted-foreground">
              Insured: {quoteDetails.insuredName} | Broker: {quoteDetails.broker}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
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
        
        <div className="mt-4 p-3 border rounded-md bg-muted/30 shadow-sm">
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
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{aiOverallRiskStatement || "AI risk assessment is being generated..."}</p>
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
           <AttachmentsCard
            attachments={quoteDetails.attachments || []}
            onViewAttachment={handleShowAttachment}
          />
          <InformationRequestsCard
            requests={managedInformationRequests}
            onUpdateInfoRequest={handleUpdateInformationRequest}
            onToggleRemoveInfoRequest={handleToggleRemoveInformationRequest}
            onAddInfoRequest={handleAddInformationRequest}
            isLoading={isInfoRequestsLoading}
          />
          <SubjectToOffersCard
            offers={managedSubjectToOffers}
            onUpdateOffer={handleUpdateSubjectToOffer}
            onToggleRemoveOffer={handleToggleRemoveSubjectToOffer}
            onAddSubjectToOffer={handleAddSubjectToOffer}
            isLoading={isSubjectToOffersLoading}
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
