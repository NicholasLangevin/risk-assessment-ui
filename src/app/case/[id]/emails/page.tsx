'use client';

import { EmailExchangeView } from '@/components/case-view/EmailExchangeView';
import { getMockEmailsForCase, getMockCaseDetails } from '@/lib/mockData';

interface EmailsPageProps {
  params: {
    id: string;
  };
}

export default function EmailsPage({ params: { id } }: EmailsPageProps) {
  const emails = getMockEmailsForCase(id);
  const caseDetails = getMockCaseDetails(id);

  return (
    <div className="container mx-auto px-4 py-6">
      <EmailExchangeView 
        emails={emails} 
        caseId={id}
        quoteId={caseDetails?.relatedQuoteId}
      />
    </div>
  )
}
