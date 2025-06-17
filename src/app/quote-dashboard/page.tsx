
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { mockSubmissions } from '@/lib/mockData';
import type { Submission } from '@/types';

// This is a server component
export default async function QuoteDashboardPage() {
  // In a real app, you'd fetch this data from an API or database
  const submissions: Submission[] = mockSubmissions;

  return <DashboardClient submissions={submissions} />;
}
