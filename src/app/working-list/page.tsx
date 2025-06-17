
import { WorkingListPageClient } from '@/components/working-list/WorkingListPageClient';
import { mockCaseListItems } from '@/lib/mockData';
import type { CaseListItem } from '@/types';

// This is a server component
export default async function WorkingListPage() {
  // In a real app, you'd fetch this data from an API or database,
  // potentially with a filter for the current user.
  const allCaseListItems: CaseListItem[] = mockCaseListItems;

  // Filter cases assigned to "Alex Underwriter"
  const currentUser = "Alex Underwriter"; // This could come from user session
  const filteredCaseListItems = allCaseListItems.filter(
    (item) => item.assignedTo === currentUser
  );

  return <WorkingListPageClient caseListItems={filteredCaseListItems} userName={currentUser} />;
}
