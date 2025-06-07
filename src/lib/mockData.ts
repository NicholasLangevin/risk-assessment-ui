
import type { Submission, QuoteDetails, Guideline, BusinessSummaryDetails, ManagedSubjectToOffer, AiUnderwritingActions, ManagedInformationRequest, CoverageItem, RiskLevel, Citation, RichTextSegment, Attachment, AiToolAction } from '@/types';
import { addMinutes, formatISO } from 'date-fns';

const insuredNames = ["Innovate Corp", "Future Solutions Ltd.", "Synergy Group", "Apex Enterprises", "Momentum Industries"];
const brokers = ["Marsh", "Aon", "Willis Towers Watson", "Gallagher", "HUB International"];
const statuses: Submission['status'][] = ['New', 'Pending Review', 'Information Requested', 'Quoted', 'Bound', 'Declined'];
const guidelineNames = [
  "Exposure Limits", "Geographical Restrictions", "Claims History Review",
  "Financial Stability Check", "Regulatory Compliance", "Specific Industry Exclusions"
];
const guidelineStatuses: Guideline['status'][] = ['Compliant', 'Needs Clarification', 'Issue Found', 'Not Applicable'];

const mockCoverageTypes = [
  { type: "Property", limits: "$5,000,000 Building / $2,000,000 Contents" },
  { type: "General Liability", limits: "$2,000,000 Each Occurrence / $4,000,000 Aggregate" },
  { type: "Equipment Breakdown", limits: "$1,000,000 Per Breakdown" },
  { type: "Crime", limits: "$500,000 Employee Theft / $250,000 Forgery" },
  { type: "Floaters (Inland Marine)", limits: "$150,000 Scheduled Equipment" }
];

export const mockSubmissions: Submission[] = Array.from({ length: 10 }, (_, i) => ({
  id: `Q${String(1000000 + i).padStart(7, '0')}`,
  insuredName: insuredNames[i % insuredNames.length],
  broker: brokers[i % brokers.length],
  status: statuses[i % statuses.length],
  receivedDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  premium: Math.floor(Math.random() * 50000) + 5000,
}));

export const mockAttachments: Attachment[] = [
  {
    id: 'attach-001-pdf',
    fileName: 'Submission_Form_Completed.pdf',
    fileType: 'pdf',
    fileSize: '1.2MB',
    mockContent: 'This is the mock content for the completed submission form PDF. It contains all the initial details provided by the broker regarding the insured and the requested coverages. Section A: Insured Information. Section B: Coverage Details. Section C: Loss History...',
  },
  {
    id: 'attach-002-xlsx',
    fileName: 'Business_Financials_FY2023.xlsx',
    fileType: 'xlsx',
    fileSize: '780KB',
    mockContent: 'Mock Excel Content: Financial statements for Fiscal Year 2023. Includes Balance Sheet, Income Statement, and Cash Flow Statement. Revenue: $XXX, Net Profit: $YYY. Assets: $ZZZ.',
  },
  {
    id: 'attach-003-docx',
    fileName: 'Loss_Control_Report_Q1_2024.docx',
    fileType: 'docx',
    fileSize: '2.5MB',
    mockContent: 'Mock Word Document Content: Loss Control Inspection Report from Q1 2024. Inspector: John Doe. Findings: Premises in good condition. Recommendations: Update fire extinguishers in warehouse section. Overall risk: Low.',
  },
  {
    id: 'attach-004-jpg',
    fileName: 'Site_Overview_Main_Building.jpg',
    fileType: 'jpg',
    fileSize: '4.1MB',
    mockContent: 'Mock Image Content: This is a photo of the main building at the insureds primary location. Shows a modern, well-maintained structure. (Imagine an image here)',
  },
   {
    id: 'attach-005-zip',
    fileName: 'Property_Inspection_Photos.zip',
    fileType: 'zip',
    fileSize: '15.3MB',
    mockContent: 'This is a ZIP archive containing multiple JPEG images of the insured property. (Mock viewer would typically show "Cannot preview ZIP content directly" or list files if advanced)',
  },
  {
    id: 'attach-006-txt',
    fileName: 'Additional_Notes.txt',
    fileType: 'txt',
    fileSize: '5KB',
    mockContent: 'Additional notes from the broker:\n- Insured is planning an expansion in Q3.\n- Interested in discussing cyber liability limits further.\n- Please expedite review if possible.',
  },
];


export const getMockQuoteDetails = (id: string): QuoteDetails | null => {
  const submission = mockSubmissions.find(s => s.id === id);
  if (!submission) return null;

  const currentPremium = submission.premium || Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;

  const guidelines: Guideline[] = guidelineNames.map((name, index) => ({
    id: `GUIDE-${100 + index}`,
    name: name,
    status: guidelineStatuses[index % guidelineStatuses.length],
    details: guidelineStatuses[index % guidelineStatuses.length] === 'Issue Found' ? 'Requires underwriter attention for XYZ reason.' : (guidelineStatuses[index % guidelineStatuses.length] === 'Needs Clarification' ? 'Please provide document ABC.' : undefined)
  }));

  const mockCitations: Citation[] = [
    {
      id: 'building-spec-2015',
      sourceType: 'attachment',
      quickDescription: 'Building Specifications (PDF, 2015)',
      sourceNameOrUrl: 'building_specs_final_2015.pdf',
      attachmentMockContent: 'Mock PDF Content: This document contains detailed architectural and engineering specifications for the office complex completed in 2015. It includes materials used, safety compliance certificates, and floor plans.'
    },
    {
      id: 'nfpa-13',
      sourceType: 'web',
      quickDescription: 'NFPA 13 Sprinkler Standards',
      sourceNameOrUrl: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=13',
    },
    {
      id: 'cybersecurity-policy-v3',
      sourceType: 'attachment',
      quickDescription: 'Internal Cybersecurity Policy v3.0 (DOCX)',
      sourceNameOrUrl: 'cyber_policy_v3_internal.docx',
      attachmentMockContent: 'Mock DOCX Content: Our company\'s comprehensive cybersecurity policy, version 3.0. Covers data handling, access control, incident response, and employee training.'
    },
    {
      id: 'gdpr-compliance-overview',
      sourceType: 'web',
      quickDescription: 'GDPR Overview (Official EU Site)',
      sourceNameOrUrl: 'https://gdpr-info.eu/',
    }
  ];

  const businessSummary: BusinessSummaryDetails = {
    buildingsDescription: [
      { type: 'text', content: 'Modern office complex with 3 buildings, steel frame construction, built in 2015 ' },
      { type: 'citationLink', citationId: 'building-spec-2015', markerText: '[1]' },
      { type: 'text', content: '. Fully sprinklered to ' },
      { type: 'citationLink', citationId: 'nfpa-13', markerText: '[2]' },
      { type: 'text', content: ' standards with central station alarm.' }
    ],
    operationsDescription: [
      { type: 'text', content: 'Software development, cloud hosting services, and 24/7 customer support. Includes management of sensitive client data as per internal '},
      { type: 'citationLink', citationId: 'cybersecurity-policy-v3', markerText: '[3]'},
      { type: 'text', content: ' and relevant regulations like GDPR '},
      { type: 'citationLink', citationId: 'gdpr-compliance-overview', markerText: '[4]'},
      { type: 'text', content: '.'}
    ],
    productDescription: [
      { type: 'text', content: "Suite of SaaS products for enterprise resource planning and data analytics. Also offers custom AI model development for B2B clients." }
    ],
    completedOperationsRisk: [
      { type: 'text', content: "Potential liability from data breaches post-service, software implementation errors leading to client business interruption, or failure of AI models causing financial loss. All service agreements include liability caps." }
    ]
  };

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

  const coveragesRequested: CoverageItem[] = mockCoverageTypes.map((cov) => ({
    type: cov.type,
    limits: cov.limits,
    aiRiskEvaluation: "Awaiting AI evaluation...",
    riskLevel: "Normal" as RiskLevel,
  })).slice(0, Math.floor(Math.random() * 3) + 3); // Show 3 to 5 coverages

  const aiOverallRiskStatementText = `The AI assesses ${submission.insuredName}'s overall risk as moderate. Primary drivers include its operations in the ${submission.broker === 'Aon' || submission.broker === 'Gallagher' ? 'emerging tech' : 'established software'} sector, which inherently carries cyber and E&O exposures. Positive factors are the modern infrastructure and (assumed) adherence to standard compliance protocols. However, a detailed review of their specific cybersecurity measures, recent loss history, and any contractual liabilities (especially around data protection and service uptime) is essential. The recommended actions aim to clarify these points to enable a more precise risk quantification and appropriate pricing/terms.`;


  return {
    id: submission.id,
    insuredName: submission.insuredName,
    broker: submission.broker,
    submissionDate: submission.receivedDate,
    premiumSummary: {
      recommendedPremium: currentPremium,
      status: Math.random() < 0.7 ? 'Pass' : 'Missing Information from Contact2.0',
      contactSystemLink: `https://mock.contact2.system.com/policy/${submission.id}`,
    },
    capacityCheck: {
      status: Math.random() > 0.7 ? 'Limited' : (Math.random() > 0.9 ? 'Exceeded' : 'Available'),
      percentageUsed: Math.floor(Math.random() * 100),
      notes: Math.random() > 0.8 ? "Approaching aggregate limit for this sector." : undefined,
    },
    businessSummary: businessSummary,
    underwritingGuidelines: guidelines,
    managedSubjectToOffers,
    managedInformationRequests,
    coveragesRequested,
    citations: mockCitations,
    attachments: mockAttachments.slice(0, Math.floor(Math.random() * (mockAttachments.length -1)) + 2), // show 2 to all attachments
    aiOverallRiskStatement: aiOverallRiskStatementText, // Added mock statement
    rawSubmissionData: `Submission ID: ${submission.id}\nInsured: ${submission.insuredName}\nBroker: ${submission.broker}\nIndustry: Technology Services\nRevenue: $${currentPremium * 20}M\nEmployees: ${Math.floor(Math.random() * 200) + 50}\nRequesting coverage for General Liability and Cyber Risk.\nClaims history: Minor property damage claim 3 years ago, $5,000. Recent security audit: Passed with minor recommendations.\nBuildings: ${businessSummary.buildingsDescription.map(s => s.type === 'text' ? s.content : (s.type === 'citationLink' ? s.markerText : '')).join('')}\nOperations: ${businessSummary.operationsDescription.map(s => s.type === 'text' ? s.content : (s.type === 'citationLink' ? s.markerText : '')).join('')}\nProducts: ${businessSummary.productDescription.map(s => s.type === 'text' ? s.content : (s.type === 'citationLink' ? s.markerText : '')).join('')}\nCompleted Operations Risk: ${businessSummary.completedOperationsRisk.map(s => s.type === 'text' ? s.content : (s.type === 'citationLink' ? s.markerText : '')).join('')}`
  };
};

export const getMockAiToolActions = (submissionId: string): AiToolAction[] => {
  const baseTime = new Date();
  const actions: AiToolAction[] = [
    {
      id: 'step-1',
      type: 'ReadingAttachment',
      timestamp: formatISO(addMinutes(baseTime, 0)),
      description: "AI analyzed the 'Submission_Form_Completed.pdf' for initial risk factors.",
      details: { targetName: "Submission_Form_Completed.pdf" }
    },
    {
      id: 'step-2',
      type: 'SearchingWeb',
      timestamp: formatISO(addMinutes(baseTime, 2)),
      description: `AI searched for recent news and financial health of '${insuredNames[Math.floor(Math.random()*insuredNames.length)]}'.`,
      details: { url: "https://financialnews.example.com/search?q=Innovate+Corp+financials", query: `${insuredNames[Math.floor(Math.random()*insuredNames.length)]} financial health news`, targetName: "financialnews.example.com" }
    },
    {
      id: 'step-3',
      type: 'ReadingGuideline',
      timestamp: formatISO(addMinutes(baseTime, 5)),
      description: "AI consulted the 'Financial Stability Check' underwriting guideline.",
      details: { targetName: "Guideline: Financial Stability Check" }
    },
    {
      id: 'step-4',
      type: 'PerformingAction',
      timestamp: formatISO(addMinutes(baseTime, 8)),
      description: "AI proposed a subject-to offer regarding a satisfactory loss control report.",
      details: { actionSummary: "Proposed Subject-To: Satisfactory loss control inspection.", targetName: "Subject-To: Satisfactory loss control inspection." }
    },
    {
      id: 'step-5',
      type: 'ReadingAttachment',
      timestamp: formatISO(addMinutes(baseTime, 10)),
      description: "AI reviewed 'Loss_Control_Report_Q1_2024.docx'.",
      details: { targetName: "Loss_Control_Report_Q1_2024.docx" }
    },
     {
      id: 'step-6',
      type: 'SearchingWeb',
      timestamp: formatISO(addMinutes(baseTime, 12)),
      description: "AI performed a sanctions check on the insured entity.",
      details: { url: "https://sanctionschecker.example.gov/check", query: "Innovate Corp sanctions", targetName: "sanctionschecker.example.gov" }
    },
  ];
  return actions.slice(0, Math.floor(Math.random() * 3) + 3); // Return 3 to 5 actions
};


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


    