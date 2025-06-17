
import { getMockCaseDetails } from '@/lib/mockData';
import type { Case } from '@/types';
import { notFound } from 'next/navigation';

interface CaseEmailsPageProps {
  params: {
    id: string;
  };
}

export default async function CaseEmailsPage({ params }: CaseEmailsPageProps) {
  const { id: caseId } = params;
  const caseDetails: Case | null = getMockCaseDetails(caseId);

  if (!caseDetails) {
    notFound();
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-primary">Emails Exchange</h3>
      <p className="text-muted-foreground">Placeholder: Content for Emails Exchange associated with case {caseDetails.id} will go here.</p>
      {/* For example, a list of emails or an embedded email client view */}
    </div>
  );
}
