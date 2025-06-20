import { z } from 'zod';

// General Application Types
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type CaseType = 'New Business' | 'Endorsement' | 'Renewal' | 'Cancellation';
// Array for iterating over CaseType values
export const AllCaseTypes: CaseType[] = ['New Business', 'Endorsement', 'Renewal', 'Cancellation'];

export type CaseStatus = 'Open' | 'In Progress' | 'Pending Information' | 'Action Required' | 'Completed' | 'Closed' | 'Untouched' | 'Triage';

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
  assignedTo: string;
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
}

export interface CaseListItem {
  id: string;
  caseType: CaseType;
  insuredName: string;
  broker: string;
  status: CaseStatus;
  receivedDate: string;
  priority: PriorityLevel;
  relatedQuoteId?: string;
  assignedTo: string;
}

export interface OpenedCaseInfo {
  id: string;
  insuredName: string;
  broker: string;
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
  markerText?: string;
}

export type RichTextSegment = TextSegment | CitationLinkSegment;

export interface BusinessSummaryDetails {
  buildingsDescription: RichTextSegment[];
  operationsDescription: RichTextSegment[];
  productDescription: RichTextSegment[];
  completedOperationsRisk: RichTextSegment[];
}

export interface Citation {
  id: string;
  sourceType: 'attachment' | 'web';
  quickDescription: string;
  sourceNameOrUrl: string;
  attachmentMockContent?: string;
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
  timestamp: string;
  description: string;
  details: AiToolActionDetails;
}

export interface QuoteDetails {
  id: string;
  caseId: string;
  insuredName: string;
  broker: string;
  submissionDate: string;
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
  subjectToOffers?: string[];
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
  | { type: 'aiMonitor'; submissionId: string }
  | { type: 'guideline'; data: Guideline }
  | { type: 'citation'; data: Citation }
  | { type: 'attachment'; data: Attachment; quoteId: string };


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
  chatHistory: z.array(ChatHistoryItemSchema).optional().describe('The history of the conversation so far.')
});
export type ChatUnderwritingAssistantInput = z.infer<typeof ChatUnderwritingAssistantInputSchema>;


export const ChatUnderwritingAssistantOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant's response to the user's query.'),
});
export type ChatUnderwritingAssistantOutput = z.infer<typeof ChatUnderwritingAssistantOutputSchema>;


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

export type NotificationType = 'newCase' | 'brokerResponse' | 'systemUpdate' | 'generic';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'Important' | 'More';
}

// --- Type for Email Exchange ---
export type EmailDirection = 'inbound' | 'outbound';

export interface Email {
  id: string;
  caseId: string; // Link to the case
  quoteId?: string; // Optional link to quote if applicable
  direction: EmailDirection;
  from: string; // Sender name/email
  to: string; // Recipient name/email
  subject: string;
  body: string;
  timestamp: string; // ISO date string
  attachments?: Attachment[]; // Optional attachments
  isRead: boolean;
  threadId?: string; // For grouping related emails
}

export type UserRole = 'underwriter' | 'manager';

export interface SkillSettings {
  transactionTypes: CaseType[] | 'ALL';
  linesOfBusiness: string[] | 'ALL';
  branches: string[] | 'ALL';
  brokerCodes: string[] | 'ALL';
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  managerId?: string; // ID of the manager, if this user is an underwriter
  skills?: SkillSettings;
}
