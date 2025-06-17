
'use client';

import type { CaseListItem } from '@/types';
import { CasesDataTable } from '@/components/cases/CasesDataTable';
import { columns } from '@/components/cases/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkingListPageClientProps {
  caseListItems: CaseListItem[];
  userName: string;
}

export function WorkingListPageClient({ caseListItems, userName }: WorkingListPageClientProps) {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">My Working List</CardTitle>
          <CardDescription>Cases assigned to {userName}. View, sort, and filter your active underwriting cases.</CardDescription>
        </CardHeader>
        <CardContent>
          <CasesDataTable columns={columns} data={caseListItems} />
        </CardContent>
      </Card>
    </div>
  );
}
