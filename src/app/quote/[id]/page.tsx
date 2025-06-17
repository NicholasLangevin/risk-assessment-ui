
import { QuoteViewClient } from '@/components/quote/QuoteViewClient';
import { getMockQuoteDetails, getMockAiToolActions, allMockQuotes } from '@/lib/mockData';
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions, CoverageItem, RiskLevel } from '@/types';
import { notFound } from 'next/navigation';

interface QuotePageProps {
  params: {
    id: string; // This is the Quote ID
  };
}

// This is a server component
export default async function QuotePage({ params }: QuotePageProps) {
  const { id: quoteId } = params;

  // Fetch initial quote details using the quoteId
  const quoteDetailsData: QuoteDetails | null = getMockQuoteDetails(quoteId); 

  if (!quoteDetailsData) {
    notFound();
  }

  // AI-generated content (now largely part of QuoteDetails from JSON or with defaults)
  const initialAiUnderwritingActions: AiUnderwritingActions = {
    suggestedActions: quoteDetailsData.managedInformationRequests && quoteDetailsData.managedInformationRequests.length > 0 ? ["Review provided information"] : ["Assess overall risk"],
    informationRequests: quoteDetailsData.managedInformationRequests?.map(ir => ir.currentText) || ["Confirm key business activities."],
    potentialSubjectToOffers: quoteDetailsData.managedSubjectToOffers?.map(sto => sto.currentText) || ["Standard terms and conditions apply."]
  };

  // Use the dedicated mock function for AI tool actions, passing quoteId
  const initialAiProcessingData: AiProcessingData = {
    aiToolActions: getMockAiToolActions(quoteId), 
  };
  
  // Ensure coverages have AI data (already handled if quoteDetailsData.coveragesRequested is populated from JSON)
  const finalCoverages = quoteDetailsData.coveragesRequested.map(cov => ({
    ...cov,
    aiRiskEvaluation: cov.aiRiskEvaluation || `Mock AI evaluation for ${cov.type}: Standard risk profile.`,
    riskLevel: cov.riskLevel || ('Normal' as RiskLevel),
  }));

  const finalQuoteDetails: QuoteDetails = {
    ...quoteDetailsData,
    coveragesRequested: finalCoverages,
    // aiOverallRiskStatement should come from quoteDetailsData if available in JSON
    aiOverallRiskStatement: quoteDetailsData.aiOverallRiskStatement || "AI overall risk statement pending or not available in mock data.",
  };


  return (
    <QuoteViewClient
      initialQuoteDetails={finalQuoteDetails}
      initialAiProcessingData={initialAiProcessingData}
      initialAiUnderwritingActions={initialAiUnderwritingActions}
    />
  );
}

export async function generateStaticParams() {
  // Generate static paths for each quote ID from the mock quotes data
  return allMockQuotes.map((quote) => ({
    id: quote.id,
  }));
}
