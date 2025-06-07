
import type { Submission, QuoteDetails, Guideline, BusinessSummaryDetails } from '@/types';

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
    businessSummary: businessSummary, // Updated from businessOverview
    underwritingGuidelines: guidelines,
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
