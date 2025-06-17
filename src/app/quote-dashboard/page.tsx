
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { mockCaseListItems } from '@/lib/mockData';
import type { CaseListItem } from '@/types';

// This is a server component
export default async function QuoteDashboardPage() {
  // In a real app, you'd fetch this data from an API or database
  const caseListItems: CaseListItem[] = mockCaseListItems;

  return <DashboardClient caseListItems={caseListItems} />;
}
