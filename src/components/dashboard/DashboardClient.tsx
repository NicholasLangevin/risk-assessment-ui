
'use client';

import type { Submission } from '@/types';
import { MetricsCard } from './MetricsCard';
import { SubmissionsTable } from './SubmissionsTable';
import { FileText, Clock, BarChartBig } from 'lucide-react';

interface DashboardClientProps {
  submissions: Submission[];
}

export function DashboardClient({ submissions }: DashboardClientProps) {
  const quotesToProcess = submissions.filter(
    s => s.status === 'New' || s.status === 'Pending Review'
  ).length;

  const pendingBrokerResponses = submissions.filter(
    s => s.status === 'Information Requested'
  ).length;
  
  const totalSubmissions = submissions.length;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">
        Dashboard Overview
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <MetricsCard
          title="Quotes to Process"
          value={quotesToProcess}
          icon={FileText}
          description="Submissions awaiting review or action."
        />
        <MetricsCard
          title="Pending Broker Responses"
          value={pendingBrokerResponses}
          icon={Clock}
          description="Submissions where information has been requested."
        />
        <MetricsCard
          title="Total Active Submissions"
          value={totalSubmissions}
          icon={BarChartBig}
          description="All submissions currently in the workflow."
        />
      </div>
      <SubmissionsTable submissions={submissions} />
    </div>
  );
}
