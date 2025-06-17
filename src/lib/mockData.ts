
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
  NotificationItem, // Added NotificationItem
} from '@/types';
import { formatISO, addDays, addMinutes, subDays } from 'date-fns';

// Import the JSON data
import mockCasesData from './mockData/cases.json';
import mockQuotesData from './mockData/quotes.json';
import mockPoliciesData from './mockData/policies.json';

// Cast the imported JSON data to the defined types
const allMockCases: Case[] = mockCasesData as Case[];
export const allMockQuotes: QuoteDetails[] = mockQuotesData as QuoteDetails[]; // Export for generateStaticParams
const allMockPolicies: Policy[] = mockPoliciesData as Policy[];

// This will be used by the dashboard
export const mockCaseListItems: CaseListItem[] = allMockCases.map(c => ({
  id: c.id,
  caseType: c.caseType,
  insuredName: c.insuredName,
  broker: c.broker,
  status: c.status,
  receivedDate: c.receivedDate, // keep for potential future use or if other components need it
  priority: c.priority,
  relatedQuoteId: c.relatedQuoteId, // Ensure this is mapped
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

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    avatarSrc: 'https://placehold.co/40x40.png',
    avatarAlt: 'User1',
    message: 'AhnaldT101 a mis en ligne: We need to talk about GL Ahsoka Tano... Was This a MASSIVE Failure?',
    timestamp: '13 hours ago',
    imageSrc: 'https://placehold.co/112x63.png',
    imageAlt: 'Video thumbnail for Ahsoka Tano discussion',
    isRead: false,
    category: 'Important',
  },
  {
    id: 'notif-2',
    avatarSrc: 'https://placehold.co/40x40.png',
    avatarAlt: 'User2',
    message: 'Risk Assessment for Q-20240701-001 has been updated. Please review the changes.',
    timestamp: '2 days ago',
    isRead: true,
    category: 'Important',
  },
  {
    id: 'notif-3',
    avatarSrc: 'https://placehold.co/40x40.png',
    avatarAlt: 'User1',
    message: 'AhnaldT101 a mis en ligne: One of the WORST Things SWGoH Has Done... What Are They Thinking?',
    timestamp: '3 days ago',
    imageSrc: 'https://placehold.co/112x63.png',
    imageAlt: 'Video thumbnail for SWGoH discussion',
    isRead: false,
    category: 'More',
  },
  {
    id: 'notif-4',
    avatarSrc: 'https://placehold.co/40x40.png',
    avatarAlt: 'System',
    message: 'Policy P-20230915-002 is due for renewal in 14 days. Start renewal process for Synergy Group.',
    timestamp: '4 days ago',
    isRead: true,
    category: 'More',
  },
  {
    id: 'notif-5',
    avatarSrc: 'https://placehold.co/40x40.png',
    avatarAlt: 'User1',
    message: "AhnaldT101 a mis en ligne: I can't believe this is not 100% trash...",
    timestamp: '4 days ago',
    imageSrc: 'https://placehold.co/112x63.png',
    imageAlt: 'Video thumbnail for game critique',
    isRead: true,
    category: 'More',
  },
  {
    id: 'notif-6',
    avatarSrc: 'https://placehold.co/40x40.png',
    avatarAlt: 'User3',
    message: 'New case C-20240715-009 assigned: High priority submission from Innovate Corp.',
    timestamp: '1 hour ago',
    isRead: false,
    category: 'Important',
  },
  {
    id: 'notif-7',
    avatarSrc: 'https://placehold.co/40x40.png',
    avatarAlt: 'AI Agent',
    message: 'AI has completed initial analysis for Quote Q-20240710-004. Guideline evaluation is ready.',
    timestamp: '5 hours ago',
    isRead: true,
    category: 'More',
  },
];
