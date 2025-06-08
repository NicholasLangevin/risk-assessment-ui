import { QuoteViewClient } from '@/components/quote/QuoteViewClient';
import { getMockQuoteDetails, getMockAiToolActions } from '@/lib/mockData';
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions, CoverageItem, RiskLevel } from '@/types';
import { notFound } from 'next/navigation';

interface QuotePageProps {
  params: {
    id: string;
  };
}

// This is a server component
export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = params;

  // Fetch initial quote details (without AI-generated content that takes time)
  const quoteDetailsData: QuoteDetails | null = getMockQuoteDetails(id); 

  if (!quoteDetailsData) {
    notFound();
  }

  // For components that were previously AI-driven, we now provide mock/static data.
  // The AI Chat Assistant is the only component that will retain its live AI functionality.

  const initialAiUnderwritingActions: AiUnderwritingActions = {
    suggestedActions: ["Mock: Review policy terms thoroughly", "Mock: Check for specific exclusions relevant to industry"], 
    informationRequests: ["Mock: Provide updated financial statements for the last 2 years.", "Mock: Clarify business operations in the new Midwest region."], 
    potentialSubjectToOffers: ["Mock: Subject to satisfactory site inspection report.", "Mock: Subject to exclusion of pre-existing environmental liabilities."] 
  };

  // Use the dedicated mock function for AI tool actions
  const initialAiProcessingData: AiProcessingData = {
    aiToolActions: getMockAiToolActions(id),
  };
  
  // Ensure coverages have mock AI data.
  // getMockQuoteDetails already provides some AI-related fields; ensure they are used or overridden here if needed.
  const mockCoverages = quoteDetailsData.coveragesRequested.map(cov => ({
    ...cov,
    aiRiskEvaluation: `Mock AI evaluation for ${cov.type}: Standard risk profile observed. No major concerns.`,
    riskLevel: 'Normal' as RiskLevel,
  }));

  const finalQuoteDetails: QuoteDetails = {
    ...quoteDetailsData,
    coveragesRequested: mockCoverages,
    // aiOverallRiskStatement is handled with a mock value directly in QuoteViewClient
    // managedSubjectToOffers and managedInformationRequests are initialized in QuoteViewClient from initialAiUnderwritingActions
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
  // Assuming mockSubmissions is correctly imported or defined elsewhere
  // For example, if it's directly in mockData.ts and exported:
  const { mockSubmissions } = await import('@/lib/mockData');
  return mockSubmissions.map((submission) => ({
    id: submission.id,
  }));
}

    