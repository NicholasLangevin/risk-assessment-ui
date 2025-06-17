
import { CasesPageClient } from '@/components/cases/CasesPageClient';
import { mockCaseListItems } from '@/lib/mockData';
import type { CaseListItem } from '@/types';

// This is a server component
export default async function CasesPage() {
  // In a real app, you'd fetch this data from an API or database
  const caseListItems: CaseListItem[] = mockCaseListItems;

  return <CasesPageClient caseListItems={caseListItems} />;
}
