
export interface Submission {
  id: string;
  insuredName: string;
  broker: string;
  status: 'New' | 'Pending Review' | 'Information Requested' | 'Quoted' | 'Bound' | 'Declined';
  receivedDate: string; // ISO string date
  premium?: number; // Optional, for display
}

export interface Guideline {
  id: string;
  name: string;
  status: 'Compliant' | 'Needs Clarification' | 'Issue Found' | 'Not Applicable';
  details?: string;
}

export interface AiRecommendedAction {
  type: 'Information Request' | 'Subject-To Offer' | 'Decline' | 'General Action';
  description: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface BusinessSummaryDetails {
  buildingsDescription: string;
  operationsDescription: string;
  productDescription: string;
  completedOperationsRisk: string;
}

export interface QuoteDetails {
  id: string;
  insuredName: string;
  broker: string;
  submissionDate: string; // ISO string date
  premiumSummary: {
    totalPremium: number;
    taxesAndFees: number;
    netPremium: number;
  };
  capacityCheck: {
    status: 'Available' | 'Limited' | 'Exceeded';
    percentageUsed: number; // 0-100
    notes?: string;
  };
  businessSummary: BusinessSummaryDetails; // Updated from businessOverview
  underwritingGuidelines: Guideline[];
  // Data to be fed to the AI
  rawSubmissionData: string; 
}

export interface AiProcessingStep {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Error';
  timestamp: string; // ISO string date
  details?: string;
}

export interface AiProcessingData {
  processingSteps: string[];
  reasoning: string;
}

export interface AiUnderwritingActions {
  suggestedActions: string[];
  informationRequests: string[];
  potentialSubjectToOffers: string[];
}
