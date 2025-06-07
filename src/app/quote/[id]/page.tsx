
import { QuoteViewClient } from '@/components/quote/QuoteViewClient';
import { getMockQuoteDetails, getMockAiToolActions } from '@/lib/mockData'; // Updated import
import type { QuoteDetails, AiProcessingData, AiUnderwritingActions, CoverageItem, RiskLevel } from '@/types';
import { suggestUnderwritingActions } from '@/ai/flows/suggest-underwriting-actions';
import { monitorAiProcessing } from '@/ai/flows/monitor-ai-processing';
import { evaluateCoverageRisk } from '@/ai/flows/evaluate-coverage-risk';
import { notFound } from 'next/navigation';

interface QuotePageProps {
  params: {
    id: string;
  };
}

// This is a server component
export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = params;

  const quoteDetailsData: QuoteDetails | null = getMockQuoteDetails(id);

  if (!quoteDetailsData) {
    notFound();
  }

  // Fetch AI underwriting actions (for subject-tos, info requests)
  let aiUnderwritingActions: AiUnderwritingActions | null = null;
  try {
    aiUnderwritingActions = await suggestUnderwritingActions({ submissionData: quoteDetailsData.rawSubmissionData });
  } catch (error) {
    console.error("Error fetching AI underwriting actions:", error);
    aiUnderwritingActions = {
        suggestedActions: ["Error retrieving AI actions."],
        informationRequests: [],
        potentialSubjectToOffers: []
    };
  }
  
  // Fetch AI processing data for monitor
  let aiProcessingData: AiProcessingData | null = null;
  try {
    const monitorOutput = await monitorAiProcessing({ submissionId: id });
    aiProcessingData = {
      aiToolActions: monitorOutput.aiToolActions || [], // Ensure aiToolActions is always an array
    };
  } catch (error) {
    console.error("Error fetching AI processing data:", error);
     aiProcessingData = {
      aiToolActions: getMockAiToolActions(id), // Use new mock data structure
    };
  }

  // Enrich coveragesRequested with AI evaluations
  const enrichedCoveragesRequested: CoverageItem[] = await Promise.all(
    quoteDetailsData.coveragesRequested.map(async (coverage) => {
      try {
        const evaluationOutput = await evaluateCoverageRisk({
          submissionData: quoteDetailsData.rawSubmissionData,
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
          riskLevel: "Normal" as RiskLevel, // Default on error
        };
      }
    })
  );

  const finalQuoteDetails: QuoteDetails = {
    ...quoteDetailsData,
    coveragesRequested: enrichedCoveragesRequested,
  };

  return (
    <QuoteViewClient
      quoteDetails={finalQuoteDetails}
      aiProcessingData={aiProcessingData}
      aiUnderwritingActions={aiUnderwritingActions}
    />
  );
}

export async function generateStaticParams() {
  const { mockSubmissions } = await import('@/lib/mockData');
  return mockSubmissions.map((submission) => ({
    id: submission.id,
  }));
}
