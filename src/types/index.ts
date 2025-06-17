
import { z } from 'zod';

// General Application Types
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type CaseType = 'New Business' | 'Endorsement' | 'Renewal' | 'Cancellation';
export type CaseStatus = 'Open' | 'In Progress' | 'Pending Information' | 'Action Required' | 'Completed' | 'Closed';

export interface Case {
  id: string; // e.g., C-YYYYMMDD-001
  caseType: CaseType;
  status: CaseStatus;
  broker: string;
  insuredName: string;
  receivedDate: string; // ISO date string
  description?: string; // Brief description of the request
  relatedQuoteId?: string; // Link to a Quote if CaseType is New Business or leads to a new quote
  relatedPolicyId?: string; // Link to a Policy if CaseType is Endorsement, Renewal, Cancellation
  priority: PriorityLevel;
}

export type PolicyStatus = 'Active' | 'Pending Endorsement' | 'Expired' | 'Cancelled' | 'Pending Renewal';

export interface Policy {
  id: string; // e.g., P-YYYYMMDD-001
  policyNumber: string; // e.g., POL-XYZ-123456789
  status: PolicyStatus;
  insuredName: string;
  broker: string;
  effectiveDate: string; // ISO date string
  expirationDate: string; // ISO date string
  totalPremium: number;
  originalQuoteId: string; // The quote that originated this policy
  // Potentially add a list of endorsement case IDs or renewal case IDs if needed for history
}

// CaseListItem replaces the old Submission type for the dashboard
export interface CaseListItem {
  id: string; // This will be the Case ID
  caseType: CaseType;
  insuredName: string;
  broker: string;
  status: CaseStatus;
  receivedDate: string; // ISO date string
  priority: PriorityLevel;
  relatedQuoteId?: string; // Link to a specific quote if applicable
}


export type RiskLevel = 'Very Low' | 'Low' | 'Normal' | 'High' | 'Very High' | 'Loading';

export interface CoverageItem {
  type: string;
  limits: string;
  aiRiskEvaluation: string;
  riskLevel: RiskLevel;
}

export interface Guideline {
  id: string;
  name: string;
  status: 'Compliant' | 'Needs Clarification' | 'Issue Found' | 'Not Applicable';
  details?: string;
}

export interface TextSegment {
  type: 'text';
  content: string;
}

export interface CitationLinkSegment {
  type: 'citationLink';
  citationId: string;
  markerText?: string; // e.g., "[1]", "[INFO]"
}

export type RichTextSegment = TextSegment | CitationLinkSegment;

export interface BusinessSummaryDetails {
  buildingsDescription: RichTextSegment[];
  operationsDescription: RichTextSegment[];
  productDescription: RichTextSegment[];
  completedOperationsRisk: RichTextSegment[];
}

export interface Citation {
  id: string; // e.g., "building-spec-2015"
  sourceType: 'attachment' | 'web';
  quickDescription: string; // e.g., "Building Specifications (2015)" or "Industry Report on Cyber Trends"
  sourceNameOrUrl: string; // Filename for attachment, URL for web
  attachmentMockContent?: string; // Only for 'attachment' type
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png' | 'zip' | 'txt' | 'eml' | 'msg' | 'other';
  fileSize: string;
  mockContent?: string;
}

export type AiToolActionType = 'ReadingAttachment' | 'SearchingWeb' | 'PerformingAction' | 'ReadingGuideline';

export interface AiToolActionDetails {
  targetName?: string;
  url?: string;
  query?: string;
  actionSummary?: string;
}

export interface AiToolAction {
  id: string;
  type: AiToolActionType;
  timestamp: string; // ISO 8601 string
  description: string;
  details: AiToolActionDetails;
}

export interface QuoteDetails {
  id: string; // Quote ID, e.g., Q-YYYYMMDD-001
  caseId: string; // The parent Case ID
  insuredName: string;
  broker: string;
  submissionDate: string; // ISO date string (when the quote process started, from case receivedDate)
  premiumSummary: {
    recommendedPremium: number;
    status: 'Pass' | 'Missing Information from policy system';
    policySystemLink: string;
  };
  capacityCheck: {
    status: 'Available' | 'Limited' | 'Exceeded';
    percentageUsed: number;
    notes?: string;
  };
  businessSummary: BusinessSummaryDetails;
  underwritingGuidelines: Guideline[];
  managedSubjectToOffers?: ManagedSubjectToOffer[];
  managedInformationRequests?: ManagedInformationRequest[];
  coveragesRequested: CoverageItem[];
  citations: Citation[];
  attachments: Attachment[];
  aiOverallRiskStatement?: string;
  rawSubmissionData: string;
  subjectToOffers?: string[]; // These are the final chosen ones
  subjectToOffersUpdatedAt?: string;
}


export interface AiProcessingData {
  aiToolActions: AiToolAction[];
}

export interface AiUnderwritingActions {
  suggestedActions: string[];
  informationRequests: string[];
  potentialSubjectToOffers: string[];
}

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

export type UnderwritingDecision = 'Decline' | 'OfferWithSubjectTos' | 'InformationRequired';

export type ActiveSheetItem =
  | { type: 'aiMonitor'; submissionId: string } // submissionId could be a caseId or quoteId depending on context
  | { type: 'guideline'; data: Guideline }
  | { type: 'citation'; data: Citation }
  | { type: 'attachment'; data: Attachment; quoteId: string };


// --- Types and Schemas for Chat Underwriting Assistant (from chat-underwriting-assistant.ts) ---
export const MessagePartSchema = z.object({
  text: z.string().min(1).describe('The text content of the message part. Must be non-empty.'),
});
export type MessagePart = z.infer<typeof MessagePartSchema>;

export const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model', 'tool']),
  parts: z.array(MessagePartSchema),
});
export type ChatHistoryItem = z.infer<typeof ChatHistoryItemSchema>;

export const ChatAttachmentInfoSchema = z.object({
  fileName: z.string().min(1).describe('The name of the attachment file. Must be non-empty.'),
  fileType: z.string().min(1).describe('The type of the attachment file (e.g., pdf, docx). Must be non-empty.')
});
export type ChatAttachmentInfo = z.infer<typeof ChatAttachmentInfoSchema>;

export const ChatUnderwritingAssistantInputSchema = z.object({
  submissionId: z.string().min(1).describe('The ID of the submission (e.g., Case ID or Quote ID) being discussed. Must be non-empty.'),
  insuredName: z.string().min(1).describe('The name of the insured party. Must be non-empty.'),
  brokerName: z.string().min(1).describe('The name of the broker. Must be non-empty.'),
  attachments: z.array(ChatAttachmentInfoSchema).describe('A list of attachments available for this submission.'),
  userQuery: z.string().describe('The user’s current question or message.'),
});
export type ChatUnderwritingAssistantInput = z.infer<typeof ChatUnderwritingAssistantInputSchema>;


export const ChatUnderwritingAssistantOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant’s response to the user’s query.'),
});
export type ChatUnderwritingAssistantOutput = z.infer<typeof ChatUnderwritingAssistantOutputSchema>;


// --- Types for Email Generation (from generate-underwriting-email.ts) ---
const UnderwritingDecisionEnum = z.enum(['Decline', 'OfferWithSubjectTos', 'InformationRequired']);

export const EmailGenerationInputSchema = z.object({
  decision: UnderwritingDecisionEnum.describe('The underwriting decision taken.'),
  quoteId: z.string().describe('The ID of the quote.'),
  insuredName: z.string().describe('The name of the insured party.'),
  brokerName: z.string().describe('The name of the broker.'),
  premium: z.number().optional().describe('The total premium amount, if an offer is being made.'),
  subjectToOffers: z.array(z.string()).optional().describe('A list of subject-to conditions if an offer is being made.'),
  informationRequests: z.array(z.string()).optional().describe('A list of information requests if further information is needed.'),
});
export type EmailGenerationInput = z.infer<typeof EmailGenerationInputSchema>;


export const EmailGenerationOutputSchema = z.object({
  emailSubject: z.string().describe('The suggested subject line for the email.'),
  emailBody: z.string().describe('The suggested body content for the email.'),
});
export type EmailGenerationOutput = z.infer<typeof EmailGenerationOutputSchema>;

// --- Type for Notifications Popover ---
export interface NotificationItem {
  id: string;
  avatarSrc: string;
  avatarAlt: string;
  message: string;
  timestamp: string; // e.g., "13 hours ago", "3 days ago"
  imageSrc?: string;
  imageAlt?: string;
  isRead: boolean;
  category: 'Important' | 'More';
}
