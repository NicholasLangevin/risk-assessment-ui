
import type {
  Case,
  CaseListItem,
  QuoteDetails,
  Policy,
  Guideline,
  BusinessSummaryDetails,
  ManagedSubjectToOffer,
  AiUnderwritingActions,
  ManagedInformationRequest,
  CoverageItem,
  RiskLevel,
  Citation,
  RichTextSegment,
  Attachment,
  AiToolAction,
  PriorityLevel,
  CaseType,
  CaseStatus,
  NotificationItem, 
  NotificationType,
  UserProfile, // Added UserProfile
} from '@/types';
import { formatISO, addMinutes, subDays, subHours } from 'date-fns'; 

// Import the JSON data
import mockCasesData from './mockData/cases.json';
import mockQuotesData from './mockData/quotes.json';
import mockPoliciesData from './mockData/policies.json';
import mockUserProfilesData from './mockData/userProfiles.json'; // Added UserProfiles import

// Cast the imported JSON data to the defined types
const allMockCases: Case[] = mockCasesData as Case[];
export const allMockQuotes: QuoteDetails[] = mockQuotesData as QuoteDetails[]; // Export for generateStaticParams
const allMockPolicies: Policy[] = mockPoliciesData as Policy[];
const allMockUserProfiles: UserProfile[] = mockUserProfilesData as UserProfile[]; // Added UserProfiles data

// This will be used by the dashboard
export const mockCaseListItems: CaseListItem[] = allMockCases.map(c => ({
  id: c.id,
  caseType: c.caseType,
  insuredName: c.insuredName,
  broker: c.broker,
  status: c.status,
  receivedDate: c.receivedDate, 
  priority: c.priority,
  relatedQuoteId: c.relatedQuoteId,
  assignedTo: c.assignedTo, // Ensure assignedTo is mapped
}));


export const getMockQuoteDetails = (quoteId: string): QuoteDetails | null => {
  const quote = allMockQuotes.find(q => q.id === quoteId);
  if (!quote) {
    console.warn(`Mock quote with ID ${quoteId} not found in quotes.json.`);
    return null;
  }

  // Ensure attachments and guidelines are present, even if empty arrays, to match type
  // Also provide default empty arrays for optional fields if they are undefined in JSON
  return {
    ...quote,
    attachments: quote.attachments || [],
    underwritingGuidelines: quote.underwritingGuidelines || [],
    citations: quote.citations || [],
    managedSubjectToOffers: quote.managedSubjectToOffers || [],
    managedInformationRequests: quote.managedInformationRequests || [],
    coveragesRequested: quote.coveragesRequested || [],
    aiOverallRiskStatement: quote.aiOverallRiskStatement || "AI overall risk statement not available.",
    rawSubmissionData: quote.rawSubmissionData || "Raw submission data not available.",
    subjectToOffers: quote.subjectToOffers || [],
  };
};

export const getMockPolicyDetails = (policyId: string): Policy | null => {
  return allMockPolicies.find(p => p.id === policyId) || null;
}

export const getMockCaseDetails = (caseId: string): Case | null => {
  return allMockCases.find(c => c.id === caseId) || null;
}

// User Profile Mock Data Functions
export const getAllUserProfiles = (): UserProfile[] => {
  return allMockUserProfiles;
};

export const getUserProfileById = (userId: string): UserProfile | null => {
  return allMockUserProfiles.find(p => p.id === userId) || null;
};


// Keep existing mock data for things not yet migrated to JSON or if needed as fallback
const constantBaseDateForMocking = new Date(2024, 0, 1); // Jan 1, 2024

// Default attachments (can be overridden by quote specific data if that quote is in quotes.json)
export const mockAttachments: Attachment[] = [
  {
    id: 'attach-generic-pdf',
    fileName: 'Generic_Document.pdf',
    fileType: 'pdf',
    fileSize: '500KB',
    mockContent: 'This is generic mock PDF content. Specific attachments should be defined in quotes.json.',
  },
  {
    id: 'attach-generic-xlsx',
    fileName: 'Generic_Spreadsheet.xlsx',
    fileType: 'xlsx',
    fileSize: '300KB',
    mockContent: 'Mock Excel Content: Column A, Column B...',
  },
];

export const getMockAiToolActions = (idInput: string): AiToolAction[] => {
  let numericIdPart = parseInt(idInput.replace(/[^0-9]/g, ''), 10) || 0;
  if (numericIdPart === 0 && idInput.length > 0) { 
    numericIdPart = idInput.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  const baseTime = addMinutes(constantBaseDateForMocking, numericIdPart % 1440); 

  const predeterminedActions: AiToolAction[] = [
    {
      id: `step-${numericIdPart}-1`,
      type: 'ReadingAttachment',
      timestamp: formatISO(addMinutes(baseTime, (numericIdPart % 3) * 2)), // Vary timestamp slightly
      description: "AI analyzed the primary submission document for initial risk factors.",
      details: { targetName: "Application.pdf" } // Generic name
    },
    {
      id: `step-${numericIdPart}-2`,
      type: 'SearchingWeb',
      timestamp: formatISO(addMinutes(baseTime, ((numericIdPart % 3) * 2) + 2)),
      description: `AI searched for public news and financial overviews.`,
      details: { url: "https://financialnews.example.com/search", query: `Company background check`, targetName: "financialnews.example.com" }
    },
    {
      id: `step-${numericIdPart}-3`,
      type: 'ReadingGuideline',
      timestamp: formatISO(addMinutes(baseTime, ((numericIdPart % 3) * 2) + 5)),
      description: "AI consulted the 'Financial Stability Check' and 'Exposure Limits' underwriting guidelines.",
      details: { targetName: "Guideline: Financial Stability & Exposure" }
    },
    {
      id: `step-${numericIdPart}-4`,
      type: 'PerformingAction',
      timestamp: formatISO(addMinutes(baseTime, ((numericIdPart % 3) * 2) + 8)),
      description: "AI identified key areas needing clarification based on initial data.",
      details: { actionSummary: "Flagged missing financial statements for last year.", targetName: "Missing Financials" }
    },
     {
      id: `step-${numericIdPart}-5`,
      type: 'ReadingAttachment',
      timestamp: formatISO(addMinutes(baseTime, ((numericIdPart % 3) * 2) + 10)),
      description: "AI cross-referenced loss history attachment with application.",
      details: { targetName: "Loss_Runs.pdf" }
    },
  ];
  // Return a deterministic slice of actions
  return predeterminedActions.slice(0, (numericIdPart % 3) + 3); // Return 3 to 5 actions
};

export const mockAllPossibleGuidelines: { id: string; name: string }[] = [
  { id: 'GUIDE-100', name: 'Exposure Limits' },
  { id: 'GUIDE-101', name: 'Geographical Restrictions' },
  { id: 'GUIDE-102', name: 'Claims History Review' },
  { id: 'GUIDE-103', name: 'Financial Stability Check' },
  { id: 'GUIDE-104', name: 'Regulatory Compliance' },
  { id: 'GUIDE-105', name: 'Specific Industry Exclusions' },
  { id: 'GUIDE-106', name: 'Property Valuation Standards' },
  { id: 'GUIDE-107', name: 'Liability Coverage Minimums' },
  { id: 'GUIDE-108', name: 'Cybersecurity Protocols' },
  { id: 'GUIDE-109', name: 'Environmental Impact Assessment' },
  { id: 'GUIDE-110', name: 'Business Continuity Plan Review' },
  { id: 'GUIDE-111', name: 'Employee Safety Standards' },
  { id: 'GUIDE-112', name: 'Product Liability Assessment' },
  { id: 'GUIDE-113', name: 'Professional Indemnity Requirements' },
  { id: 'GUIDE-114', name: 'Supply Chain Risk Analysis' },
];

const now = new Date();

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-newcase-1',
    type: 'newCase',
    message: 'New case C-20240715-011 (TechServe Solutions) has been assigned to Alex Miller.',
    timestamp: formatISO(subHours(now, 2)),
    isRead: false,
    category: 'Important',
  },
  {
    id: 'notif-broker-resp-1',
    type: 'brokerResponse',
    message: 'Broker (Marsh) responded with additional documents for Case C-20240701-001 (Innovate Corp).',
    timestamp: formatISO(subHours(now, 5)),
    isRead: false,
    category: 'Important',
  },
  {
    id: 'notif-newcase-2',
    type: 'newCase',
    message: 'New case C-20240712-010 (Quick Eats Delivery) created and is in Triage.',
    timestamp: formatISO(subDays(now, 1)),
    isRead: true,
    category: 'More',
  },
  {
    id: 'notif-broker-resp-2',
    type: 'brokerResponse',
    message: 'Information received from Broker (Aon) for Case C-20240709-007 (BuildRight Construction).',
    timestamp: formatISO(subDays(now, 2)),
    isRead: true,
    category: 'More',
  },
  {
    id: 'notif-newcase-3',
    type: 'newCase',
    message: 'New Business case C-20240708-006 (GreenTech Innovations) requires assignment.',
    timestamp: formatISO(subDays(now, 3)),
    isRead: false,
    category: 'Important',
  },
   {
    id: 'notif-broker-resp-3',
    type: 'brokerResponse',
    message: 'Broker (Gallagher) uploaded requested financials for Case C-20240704-004 (Apex Enterprises).',
    timestamp: formatISO(subHours(now, 26)), // Just over a day ago
    isRead: true,
    category: 'More',
  }
];

// Ensure timestamps in mockNotifications are strings after formatISO
mockNotifications.forEach(n => {
  n.timestamp = n.timestamp; // Already a string from formatISO, but reinforces if logic changes
});

