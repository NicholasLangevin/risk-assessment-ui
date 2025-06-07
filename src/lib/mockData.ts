
import type { Submission, QuoteDetails, Guideline, BusinessSummaryDetails, ManagedSubjectToOffer, AiUnderwritingActions, ManagedInformationRequest } from '@/types';

const insuredNames = ["Innovate Corp", "Future Solutions Ltd.", "Synergy Group", "Apex Enterprises", "Momentum Industries"];
const brokers = ["Marsh", "Aon", "Willis Towers Watson", "Gallagher", "HUB International"];
const statuses: Submission['status'][] = ['New', 'Pending Review', 'Information Requested', 'Quoted', 'Bound', 'Declined'];
const guidelineNames = [
  "Exposure Limits", "Geographical Restrictions", "Claims History Review",
  "Financial Stability Check", "Regulatory Compliance", "Specific Industry Exclusions"
];
const guidelineStatuses: Guideline['status'][] = ['Compliant', 'Needs Clarification', 'Issue Found', 'Not Applicable'];

export const mockSubmissions: Submission[] = Array.from({ length: 10 }, (_, i) => ({
  id: `SUB-${1001 + i}`,
  insuredName: insuredNames[i % insuredNames.length],
  broker: brokers[i % brokers.length],
  status: statuses[i % statuses.length],
  receivedDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  premium: Math.floor(Math.random() * 50000) + 5000,
}));

export const getMockQuoteDetails = (id: string): QuoteDetails | null => {
  const submission = mockSubmissions.find(s => s.id === id);
  if (!submission) return null;

  const totalPremium = submission.premium || Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
  const taxesAndFees = totalPremium * 0.1; // 10%
  const netPremium = totalPremium - taxesAndFees;

  const guidelines: Guideline[] = guidelineNames.map((name, index) => ({
    id: `GUIDE-${100 + index}`,
    name: name,
    status: guidelineStatuses[index % guidelineStatuses.length],
    details: guidelineStatuses[index % guidelineStatuses.length] === 'Issue Found' ? 'Requires underwriter attention for XYZ reason.' : (guidelineStatuses[index % guidelineStatuses.length] === 'Needs Clarification' ? 'Please provide document ABC.' : undefined)
  }));

  const businessSummary: BusinessSummaryDetails = {
    buildingsDescription: "Modern office complex with 3 buildings, steel frame construction, built in 2015. Fully sprinklered with central station alarm.",
    operationsDescription: "Software development, cloud hosting services, and 24/7 customer support. Includes management of sensitive client data.",
    productDescription: "Suite of SaaS products for enterprise resource planning and data analytics. Also offers custom AI model development for B2B clients.",
    completedOperationsRisk: "Potential liability from data breaches post-service, software implementation errors leading to client business interruption, or failure of AI models causing financial loss."
  };

  // Mock AI underwriting actions to get initial suggestions
  const mockAiActions: AiUnderwritingActions = {
    suggestedActions: ["Review loss control report", "Verify financial statements"],
    informationRequests: ["Latest audited financials for 3 years", "Details of current cybersecurity measures", "Loss runs for the past 5 years"],
    potentialSubjectToOffers: [
      "Subject to satisfactory building inspection.",
      "Subject to exclusion for prior acts.",
      "Subject to $10,000 deductible for water damage."
    ]
  };

  const managedSubjectToOffers: ManagedSubjectToOffer[] = mockAiActions.potentialSubjectToOffers.map((offer, index) => ({
    id: `sto-${index}-${Date.now()}`,
    originalText: offer,
    currentText: offer,
    isRemoved: false,
    isEdited: false,
  }));

  const managedInformationRequests: ManagedInformationRequest[] = mockAiActions.informationRequests.map((request, index) => ({
    id: `ir-${index}-${Date.now()}`,
    originalText: request,
    currentText: request,
    isRemoved: false,
    isEdited: false,
  }));


  return {
    id: submission.id,
    insuredName: submission.insuredName,
    broker: submission.broker,
    submissionDate: submission.receivedDate,
    premiumSummary: {
      totalPremium,
      taxesAndFees,
      netPremium,
    },
    capacityCheck: {
      status: Math.random() > 0.7 ? 'Limited' : (Math.random() > 0.9 ? 'Exceeded' : 'Available'),
      percentageUsed: Math.floor(Math.random() * 100),
      notes: Math.random() > 0.8 ? "Approaching aggregate limit for this sector." : undefined,
    },
    businessSummary: businessSummary,
    underwritingGuidelines: guidelines,
    managedSubjectToOffers,
    managedInformationRequests, // Initialized based on AI suggestions
    rawSubmissionData: `Submission ID: ${submission.id}\nInsured: ${submission.insuredName}\nBroker: ${submission.broker}\nIndustry: Technology Services\nRevenue: $${totalPremium * 20}M\nEmployees: ${Math.floor(Math.random() * 200) + 50}\nRequesting coverage for General Liability and Cyber Risk.\nClaims history: Minor property damage claim 3 years ago, $5,000. Recent security audit: Passed with minor recommendations.\nBuildings: ${businessSummary.buildingsDescription}\nOperations: ${businessSummary.operationsDescription}\nProducts: ${businessSummary.productDescription}\nCompleted Operations Risk: ${businessSummary.completedOperationsRisk}`
  };
};

export const getMockAiProcessingSteps = (submissionId: string): string[] => {
  return [
    `Initialized for submission ${submissionId}`,
    "Data ingestion and parsing completed.",
    "Risk factor analysis in progress...",
    "Cross-referencing with internal guidelines.",
    "External data source lookup (credit, sanctions).",
    "Preliminary recommendation formulated.",
    "Confidence score calculated.",
    "Generating detailed reasoning report.",
    "Process completed."
  ].slice(0, Math.floor(Math.random() * 8) + 2); // Return a variable number of steps
};

export const getMockAiReasoning = (submissionId: string): string => {
  return `For submission ${submissionId}, the primary risk factors identified are related to cyber exposure given the industry. The recommendation to request further information on security protocols is based on standard underwriting practice for tech companies. Capacity is available. Subject-to offers considered but not prioritized over information gathering at this stage.`;
};

// List of all possible guidelines that can be added
export const mockAllPossibleGuidelines: { id: string; name: string }[] = [
  { id: 'ALL-001', name: 'Exposure Limits' },
  { id: 'ALL-002', name: 'Geographical Restrictions' },
  { id: 'ALL-003', name: 'Claims History Review' },
  { id: 'ALL-004', name: 'Financial Stability Check' },
  { id: 'ALL-005', name: 'Regulatory Compliance' },
  { id: 'ALL-006', name: 'Specific Industry Exclusions' },
  { id: 'ALL-007', name: 'Property Valuation Standards' },
  { id: 'ALL-008', name: 'Liability Coverage Minimums' },
  { id: 'ALL-009', name: 'Cybersecurity Protocols' },
  { id: 'ALL-010', name: 'Environmental Impact Assessment' },
  { id: 'ALL-011', name: 'Business Continuity Plan Review' },
  { id: 'ALL-012', name: 'Employee Safety Standards' },
  { id: 'ALL-013', name: 'Product Liability Assessment' },
  { id: 'ALL-014', name: 'Professional Indemnity Requirements' },
  { id: 'ALL-015', name: 'Supply Chain Risk Analysis' },
];

