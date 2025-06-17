
'use client';

import type { CaseListItem } from '@/types';
import { MetricsCard } from './MetricsCard';
import { SubmissionsTable } from './SubmissionsTable';
import { FileText, Clock, BarChartBig } from 'lucide-react';

interface DashboardClientProps {
  caseListItems: CaseListItem[];
}

export function DashboardClient({ caseListItems }: DashboardClientProps) {
  const quotesToProcess = caseListItems.filter(
    item => item.status === 'Open' || item.status === 'In Progress' || item.status === 'Action Required'
  ).length;

  const pendingBrokerResponses = caseListItems.filter(
    item => item.status === 'Pending Information'
  ).length;
  
  const totalActiveCases = caseListItems.filter(
    item => item.status !== 'Completed' && item.status !== 'Closed'
  ).length;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">
        Workflow Overview
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <MetricsCard
          title="Cases to Process"
          value={quotesToProcess}
          icon={FileText}
          description="Cases awaiting review or action."
        />
        <MetricsCard
          title="Pending Broker Responses"
          value={pendingBrokerResponses}
          icon={Clock}
          description="Cases where information has been requested."
        />
        <MetricsCard
          title="Total Active Cases"
          value={totalActiveCases}
          icon={BarChartBig}
          description="All cases currently active in the workflow."
        />
      </div>
      <SubmissionsTable caseListItems={caseListItems} />
    </div>
  );
}
