
import { z } from 'zod';

// General Application Types
export interface Submission {
  id: string;
  insuredName: string;
  broker: string;
  status: 'New' | 'Pending Review' | 'Information Requested' | 'Quoted' | 'Bound' | 'Declined';
  receivedDate: string; // ISO date string
  premium?: number;
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
  id: string;
  insuredName: string;
  broker: string;
  submissionDate: string; // ISO date string
  premiumSummary: {
    recommendedPremium: number;
    status: 'Pass' | 'Missing Information from Contact2.0';
    contactSystemLink: string;
  };
  capacityCheck: {
    status: 'Available' | 'Limited' | 'Exceeded';
    percentageUsed: number;
    notes?: string;
  };
  businessSummary: BusinessSummaryDetails;
  underwritingGuidelines: Guideline[];
  managedSubjectToOffers: ManagedSubjectToOffer[];
  managedInformationRequests: ManagedInformationRequest[];
  coveragesRequested: CoverageItem[];
  citations: Citation[];
  attachments: Attachment[];
  aiOverallRiskStatement?: string;
  rawSubmissionData: string; // For passing to AI
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
  isEdited: boolean; // True if currentText differs from originalText
}

export interface ManagedInformationRequest {
  id: string;
  originalText: string;
  currentText: string;
  isRemoved: boolean;
  isEdited: boolean; // True if currentText differs from originalText
}

export type UnderwritingDecision = 'Decline' | 'OfferWithSubjectTos' | 'InformationRequired';

export type ActiveSheetItem =
  | { type: 'aiMonitor'; submissionId: string }
  | { type: 'guideline'; data: Guideline }
  | { type: 'citation'; data: Citation }
  | { type: 'attachment'; data: Attachment; quoteId: string };


// --- Types and Schemas for Chat Underwriting Assistant (from chat-underwriting-assistant.ts) ---
export const MessagePartSchema = z.object({
  text: z.string().optional(),
});
export type MessagePart = z.infer<typeof MessagePartSchema>;

export const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model', 'tool']),
  parts: z.array(MessagePartSchema),
});
export type ChatHistoryItem = z.infer<typeof ChatHistoryItemSchema>;

export const ChatAttachmentInfoSchema = z.object({
  fileName: z.string().describe('The name of the attachment file.'),
  fileType: z.string().describe('The type of the attachment file (e.g., pdf, docx).')
});
export type ChatAttachmentInfo = z.infer<typeof ChatAttachmentInfoSchema>;

export const ChatUnderwritingAssistantInputSchema = z.object({
  submissionId: z.string().describe('The ID of the submission being discussed.'),
  insuredName: z.string().describe('The name of the insured party.'),
  brokerName: z.string().describe('The name of the broker.'),
  attachments: z.array(ChatAttachmentInfoSchema).describe('A list of attachments available for this submission.'),
  userQuery: z.string().describe('The user’s current question or message.'),
  chatHistory: z.array(ChatHistoryItemSchema).optional().describe('The history of the conversation so far.'),
});
export type ChatUnderwritingAssistantInput = z.infer<typeof ChatUnderwritingAssistantInputSchema>;

// This output schema describes the *conceptual* full response, not the stream chunks.
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
