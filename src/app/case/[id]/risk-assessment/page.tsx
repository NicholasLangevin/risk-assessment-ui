
import { getMockCaseDetails, getMockQuoteDetails, getMockAiToolActions, allMockQuotes } from '@/lib/mockData';
import type { Case, QuoteDetails, AiUnderwritingActions, RiskLevel } from '@/types'; // Removed AiProcessingData
import { notFound } from 'next/navigation';
import { QuoteViewClient } from '@/components/quote/QuoteViewClient'; 

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
      return (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-primary">Risk Assessment</h3>
          <p className="text-muted-foreground">
            Risk assessment linked to Quote ID: {caseDetails.relatedQuoteId}, but quote details could not be found.
          </p>
        </div>
      );
    }

    const initialAiUnderwritingActions: AiUnderwritingActions = {
      suggestedActions: quoteDetailsData.managedInformationRequests && quoteDetailsData.managedInformationRequests.length > 0 ? ["Review provided information"] : ["Assess overall risk"],
      informationRequests: quoteDetailsData.managedInformationRequests?.map(ir => ir.currentText) || ["Confirm key business activities."],
      potentialSubjectToOffers: quoteDetailsData.managedSubjectToOffers?.map(sto => sto.currentText) || ["Standard terms and conditions apply."]
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
        // initialAiProcessingData prop removed
        initialAiUnderwritingActions={initialAiUnderwritingActions}
        hideHeader={true}
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
