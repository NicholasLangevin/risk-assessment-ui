import { QuoteViewClient } from '@/components/quote/QuoteViewClient';
import { getMockQuoteDetails, getMockAiProcessingSteps, getMockAiReasoning } from '@/lib/mockData';
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions } from '@/types';
import { suggestUnderwritingActions } from '@/ai/flows/suggest-underwriting-actions';
import { monitorAiProcessing } from '@/ai/flows/monitor-ai-processing';
import { notFound } from 'next/navigation';

interface QuotePageProps {
  params: {
    id: string;
  };
}

// This is a server component
export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = params;

  const quoteDetails: QuoteDetails | null = getMockQuoteDetails(id);

  if (!quoteDetails) {
    notFound(); // Or handle as an error page
  }

  let aiUnderwritingActions: AiUnderwritingActions | null = null;
  try {
    aiUnderwritingActions = await suggestUnderwritingActions({ submissionData: quoteDetails.rawSubmissionData });
  } catch (error) {
    console.error("Error fetching AI underwriting actions:", error);
    // Optionally set a default or error state for aiUnderwritingActions
  }
  
  let aiProcessingData: AiProcessingData | null = null;
  try {
    // Using dummy values for monitorAiProcessing as it's for "real-time view"
    // In a real app, this might be a stream or fetched differently
    const monitorOutput = await monitorAiProcessing({ submissionId: id });
    aiProcessingData = {
      processingSteps: monitorOutput.processingSteps,
      reasoning: monitorOutput.reasoning,
    };

  } catch (error) {
    console.error("Error fetching AI processing data:", error);
    // Fallback to mock if AI call fails or not fully implemented for this context
     aiProcessingData = {
      processingSteps: getMockAiProcessingSteps(id),
      reasoning: getMockAiReasoning(id)
    };
  }


  return (
    <QuoteViewClient
      quoteDetails={quoteDetails}
      aiProcessingData={aiProcessingData}
      aiUnderwritingActions={aiUnderwritingActions}
    />
  );
}

export async function generateStaticParams() {
  // In a real app, fetch all possible submission IDs
  // For now, using mockSubmissions to pre-render some paths
  const { mockSubmissions } = await import('@/lib/mockData');
  return mockSubmissions.map((submission) => ({
    id: submission.id,
  }));
}
