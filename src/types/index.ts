
export interface Submission {
  id: string;
  insuredName: string;
  broker: string;
  status: 'New' | 'Pending Review' | 'Information Requested' | 'Quoted' | 'Bound' | 'Declined';
  receivedDate: string; // ISO string date
  premium?: number; // Optional, for display
}

export interface Guideline {
  id:string;
  name: string;
  status: 'Compliant' | 'Needs Clarification' | 'Issue Found' | 'Not Applicable';
  details?: string;
}

export interface AiRecommendedAction {
  type: 'Information Request' | 'Subject-To Offer' | 'Decline' | 'General Action';
  description: string;
  priority?: 'High' | 'Medium' | 'Low';
}

// --- Citation Feature Types ---
export type CitationSourceType = 'attachment' | 'web';

export interface Citation {
  id: string; // Unique ID for the citation, e.g., "financials-2023-report"
  sourceType: CitationSourceType;
  quickDescription: string; // Short text for tooltip, e.g., "Financial Report 2023 (PDF)" or "Industry Stats - statista.com"
  sourceNameOrUrl: string; // Filename for 'attachment', URL for 'web'
  attachmentMockContent?: string; // For 'attachment', simplified content to display in sheet
}

export interface TextSegment {
  type: 'text';
  content: string;
}

export interface CitationLinkSegment {
  type: 'citationLink';
  citationId: string; // Corresponds to Citation.id
  markerText: string; // The text to display for the link, e.g., "[1]", "[Source A]"
}

export type RichTextSegment = TextSegment | CitationLinkSegment;

export interface BusinessSummaryDetails {
  buildingsDescription: RichTextSegment[];
  operationsDescription: RichTextSegment[];
  productDescription: RichTextSegment[];
  completedOperationsRisk: RichTextSegment[];
}
// --- End Citation Feature Types ---

export interface ManagedSubjectToOffer {
  id: string;
  originalText: string;
  currentText: string;
  isRemoved: boolean;
  isEdited: boolean;
}

export interface ManagedInformationRequest {
  id: string;
  originalText: string;
  currentText: string;
  isRemoved: boolean;
  isEdited: boolean;
}

export type RiskLevel = 'Very Low' | 'Low' | 'Normal' | 'High' | 'Very High';

export interface CoverageItem {
  type: string; // e.g., Property, Liability
  limits: string; // e.g., "$1M / $2M Aggregate"
  aiRiskEvaluation: string; // Textual evaluation from AI
  riskLevel: RiskLevel; // Categorical risk level from AI
}

// --- Attachment Feature Types ---
export interface Attachment {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'xlsx' | 'jpg' | 'zip';
  fileSize: string; // e.g., "2.1MB", "128KB"
  mockContent: string;
}
// --- End Attachment Feature Types ---

export interface QuoteDetails {
  id: string;
  insuredName: string;
  broker: string;
  submissionDate: string; // ISO string date
  premiumSummary: {
    recommendedPremium: number;
    status: 'Pass' | 'Missing Information from Contact2.0';
    contactSystemLink: string;
  };
  capacityCheck: {
    status: 'Available' | 'Limited' | 'Exceeded';
    percentageUsed: number; // 0-100
    notes?: string;
  };
  businessSummary: BusinessSummaryDetails; // Updated type
  underwritingGuidelines: Guideline[];
  managedSubjectToOffers: ManagedSubjectToOffer[];
  managedInformationRequests: ManagedInformationRequest[];
  coveragesRequested: CoverageItem[];
  citations: Citation[];
  attachments: Attachment[];
  aiOverallRiskStatement: string; // Added field for AI's overall risk statement
  rawSubmissionData: string;
}

// --- AI Processing Monitor Types ---
export type AiToolActionType = 'ReadingAttachment' | 'SearchingWeb' | 'PerformingAction' | 'ReadingGuideline';

export interface AiToolActionDetails {
  targetName?: string; // For attachment name, guideline name, subject-to text, or general action description
  url?: string; // For web URL
  query?: string; // For web search query
  actionSummary?: string; // More specific summary for 'PerformingAction', if applicable
}

export interface AiToolAction {
  id: string; // Unique ID for the action step
  type: AiToolActionType;
  timestamp: string; // ISO string for date and time
  description: string; // A human-readable description of what the AI tool did
  details: AiToolActionDetails; // Structured details about the action
}

export interface AiProcessingData {
  aiToolActions: AiToolAction[];
}
// --- End AI Processing Monitor Types ---


export interface AiUnderwritingActions {
  suggestedActions: string[];
  informationRequests: string[];
  potentialSubjectToOffers: string[];
}

// --- Chat Assistant Types ---
interface ChatAttachmentInfo {
  fileName: string;
  fileType: Attachment['fileType'];
}

export interface ChatUnderwritingAssistantInput {
  submissionId: string;
  insuredName: string;
  brokerName: string;
  attachments: ChatAttachmentInfo[];
  userQuery: string;
  chatHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[];
}

export interface ChatUnderwritingAssistantOutput {
  aiResponse: string;
}
// --- End Chat Assistant Types ---


// Types for Email Generation Flow
export type UnderwritingDecision = 'Decline' | 'OfferWithSubjectTos' | 'InformationRequired';

export interface EmailGenerationInput {
  decision: UnderwritingDecision;
  quoteId: string;
  insuredName: string;
  brokerName: string;
  premium?: number; // Only for 'OfferWithSubjectTos'
  subjectToOffers?: string[]; // Only for 'OfferWithSubjectTos'
  informationRequests?: string[]; // Only for 'InformationRequired'
}

export interface EmailGenerationOutput {
  emailSubject: string;
  emailBody: string;
}

// For QuoteViewClient state to manage the active sheet content
export type ActiveSheetItem =
  | { type: 'aiMonitor'; submissionId: string; }
  | { type: 'guideline'; data: Guideline }
  | { type: 'citation'; data: Citation }
  | { type: 'attachment'; data: Attachment }
  | null;
