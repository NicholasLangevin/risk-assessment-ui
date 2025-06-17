
import { CaseViewPageClient } from '@/components/case-view/CaseViewPageClient';
import { getMockCaseDetails, mockCaseListItems } from '@/lib/mockData';
import type { Case } from '@/types';
import { notFound } from 'next/navigation';

interface CasePageProps {
  params: {
    id: string; // This is the Case ID
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { id: caseId } = params;
  const caseDetails: Case | null = getMockCaseDetails(caseId);

  if (!caseDetails) {
    notFound();
  }

  return <CaseViewPageClient caseDetails={caseDetails} />;
}

// Optional: If you want to pre-render these pages at build time for known cases
export async function generateStaticParams() {
  return mockCaseListItems.map((caseItem) => ({
    id: caseItem.id,
  }));
}
