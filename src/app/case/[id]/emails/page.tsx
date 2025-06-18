'use client';

import { EmailExchangeView } from '@/components/case-view/EmailExchangeView';
import { getMockEmailsForCase } from '@/lib/mockData';

interface EmailsPageProps {
  params: {
    id: string;
  };
}

export default function EmailsPage({ params: { id } }: EmailsPageProps) {
  const emails = getMockEmailsForCase(id);

  return (
    <div className="container mx-auto px-4 py-6">
      <EmailExchangeView emails={emails} />
    </div>
  )
}
