
import { getMockCaseDetails, getMockQuoteDetails, getMockAiToolActions, allMockQuotes } from '@/lib/mockData';
import type { Case, QuoteDetails, AiProcessingData, AiUnderwritingActions, RiskLevel } from '@/types';
import { notFound } from 'next/navigation';
import { QuoteViewClient } from '@/components/quote/QuoteViewClient'; // Adjust path as necessary

interface CaseRiskAssessmentPageProps {
  params: {
    id: string; // Case ID
  };
}

export default async function CaseRiskAssessmentPage({ params }: CaseRiskAssessmentPageProps) {
  const { id: caseId } = params;
  const caseDetails: Case | null = getMockCaseDetails(caseId);

  if (!caseDetails) {
    notFound();
  }

  if (caseDetails.relatedQuoteId) {
    const quoteDetailsData: QuoteDetails | null = getMockQuoteDetails(caseDetails.relatedQuoteId);

    if (!quoteDetailsData) {
      // This case means the relatedQuoteId in case data points to a non-existent quote in mockQuotes
      return (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-primary">Risk Assessment</h3>
          <p className="text-muted-foreground">
            Risk assessment linked to Quote ID: {caseDetails.relatedQuoteId}, but quote details could not be found.
          </p>
        </div>
      );
    }

    // Prepare data for QuoteViewClient, similar to src/app/quote/[id]/page.tsx
    const initialAiUnderwritingActions: AiUnderwritingActions = {
      suggestedActions: quoteDetailsData.managedInformationRequests && quoteDetailsData.managedInformationRequests.length > 0 ? ["Review provided information"] : ["Assess overall risk"],
      informationRequests: quoteDetailsData.managedInformationRequests?.map(ir => ir.currentText) || ["Confirm key business activities."],
      potentialSubjectToOffers: quoteDetailsData.managedSubjectToOffers?.map(sto => sto.currentText) || ["Standard terms and conditions apply."]
    };

    const initialAiProcessingData: AiProcessingData = {
      aiToolActions: getMockAiToolActions(quoteDetailsData.id),
    };
    
    const finalCoverages = quoteDetailsData.coveragesRequested.map(cov => ({
      ...cov,
      aiRiskEvaluation: cov.aiRiskEvaluation || `Mock AI evaluation for ${cov.type}: Standard risk profile.`,
      riskLevel: cov.riskLevel || ('Normal' as RiskLevel),
    }));

    const finalQuoteDetails: QuoteDetails = {
      ...quoteDetailsData,
      coveragesRequested: finalCoverages,
      aiOverallRiskStatement: quoteDetailsData.aiOverallRiskStatement || "AI overall risk statement pending or not available in mock data.",
    };

    return (
      <QuoteViewClient
        initialQuoteDetails={finalQuoteDetails}
        initialAiProcessingData={initialAiProcessingData}
        initialAiUnderwritingActions={initialAiUnderwritingActions}
        hideHeader={true} // Pass the new prop here
      />
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-primary">Risk Assessment</h3>
      <p className="text-muted-foreground">
        Risk assessment is not applicable for Case {caseDetails.id} as it is not linked to a specific quote.
      </p>
    </div>
  );
}

// Optional: If you want to pre-render these pages at build time for known cases
// This might need to be in the layout if layout fetches primary data
// For now, keeping it here. If build errors occur, move to layout.
// export async function generateStaticParams() {
//   return mockCaseListItems.map((caseItem) => ({
//     id: caseItem.id,
//   }));
// }
