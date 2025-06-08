import { QuoteViewClient } from '@/components/quote/QuoteViewClient';
import { getMockQuoteDetails, getMockAiToolActions } from '@/lib/mockData';
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions, CoverageItem, RiskLevel } from '@/types';
// Removed: import { suggestUnderwritingActions } from '@/ai/flows/suggest-underwriting-actions';
// Removed: import { monitorAiProcessing } from '@/ai/flows/monitor-ai-processing';
// Removed: import { evaluateCoverageRisk } from '@/ai/flows/evaluate-coverage-risk';
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
  const quoteDetailsData: QuoteDetails | null = getMockQuoteDetails(id, true); // Pass true to get minimal data initially

  if (!quoteDetailsData) {
    notFound();
  }

  // AI-dependent data will now be fetched on the client-side in QuoteViewClient
  // We can pass empty or placeholder data for initial render
  const initialAiUnderwritingActions: AiUnderwritingActions = {
    suggestedActions: [],
    informationRequests: [],
    potentialSubjectToOffers: []
  };

  const initialAiProcessingData: AiProcessingData = {
    aiToolActions: [], // Initially empty, will be fetched on client
  };

  return (
    <QuoteViewClient
      initialQuoteDetails={quoteDetailsData}
      initialAiProcessingData={initialAiProcessingData}
      initialAiUnderwritingActions={initialAiUnderwritingActions}
    />
  );
}

export async function generateStaticParams() {
  const { mockSubmissions } = await import('@/lib/mockData');
  return mockSubmissions.map((submission) => ({
    id: submission.id,
  }));
}
