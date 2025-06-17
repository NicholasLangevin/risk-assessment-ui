
'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CaseListItem, PriorityLevel, CaseStatus } from '@/types';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubmissionsTableProps {
  caseListItems: CaseListItem[];
}

export function SubmissionsTable({ caseListItems }: SubmissionsTableProps) {
  const getStatusVariant = (status: CaseStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Open':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Pending Information':
      case 'Action Required':
        return 'outline';
      case 'Completed':
      case 'Closed':
        return 'default'; // Or a more neutral color like 'secondary'
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeClass = (priority: PriorityLevel): string => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600/30 dark:text-yellow-300 dark:border-yellow-500';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600';
      default:
        return '';
    }
  };

  const priorityOrder: Record<PriorityLevel, number> = {
    'High': 1,
    'Medium': 2,
    'Low': 3,
  };

  const sortedCaseListItems = [...caseListItems].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Case Inbox</CardTitle>
        <CardDescription>Manage incoming underwriting cases.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Case Type</TableHead>
              <TableHead>Insured Name</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCaseListItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No cases found.
                </TableCell>
              </TableRow>
            ) : (
              sortedCaseListItems.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.id}</TableCell>
                  <TableCell>{caseItem.caseType}</TableCell>
                  <TableCell>{caseItem.insuredName}</TableCell>
                  <TableCell>{caseItem.broker}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(caseItem.status)}>{caseItem.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-semibold", getPriorityBadgeClass(caseItem.priority))}>
                      {caseItem.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {caseItem.relatedQuoteId ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/quote/${caseItem.relatedQuoteId}`}>
                          View Quote <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        View Case {/* Placeholder for future Case Detail View */}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
