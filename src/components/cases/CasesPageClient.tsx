
'use client';

import type { CaseListItem } from '@/types';
import { CasesDataTable } from './CasesDataTable';
import { columns } from './columns'; // We will create this file next
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CasesPageClientProps {
  caseListItems: CaseListItem[];
}

export function CasesPageClient({ caseListItems }: CasesPageClientProps) {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Manage Cases</CardTitle>
          <CardDescription>View, sort, and filter all underwriting cases.</CardDescription>
        </CardHeader>
        <CardContent>
          <CasesDataTable columns={columns} data={caseListItems} />
        </CardContent>
      </Card>
    </div>
  );
}
