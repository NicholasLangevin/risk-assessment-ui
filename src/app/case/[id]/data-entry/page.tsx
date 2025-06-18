
import { getMockCaseDetails } from '@/lib/mockData';
import type { Case } from '@/types';
import { notFound } from 'next/navigation';

interface CaseDataEntryPageProps {
  params: {
    id: string;
  };
}

export default async function CaseDataEntryPage({ params }: CaseDataEntryPageProps) {
  const { id: caseId } = params;
  const caseDetails: Case | null = getMockCaseDetails(caseId);

  if (!caseDetails) {
    notFound();
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-primary">Data Entry</h3>
      <p className="text-muted-foreground">Placeholder: Data entry forms and information relevant to case {caseDetails.id} will be managed here.</p>
      {/* For example, forms to input specific data points or checklists */}
    </div>
  );
}
