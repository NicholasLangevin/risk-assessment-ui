
import { WorkingListPageClient } from '@/components/working-list/WorkingListPageClient';
import { mockCaseListItems } from '@/lib/mockData';
import type { CaseListItem } from '@/types';

// This is a server component
export default async function WorkingListPage() {
  // In a real app, you'd fetch this data from an API or database.
  // We pass all items to the client, and the client will filter based on localStorage.
  const allCaseListItems: CaseListItem[] = mockCaseListItems;

  // The client component will determine the actual user and filter.
  // The 'userName' prop here is more of a placeholder or initial value if needed before client-side hydration.
  return <WorkingListPageClient caseListItems={allCaseListItems} initialUserName="User" />;
}
