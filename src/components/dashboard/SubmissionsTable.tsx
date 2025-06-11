
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
import type { Submission, PriorityLevel } from '@/types';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubmissionsTableProps {
  submissions: Submission[];
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const getStatusVariant = (status: Submission['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'New':
        return 'default';
      case 'Pending Review':
        return 'secondary';
      case 'Information Requested':
        return 'outline';
      case 'Quoted':
        return 'default';
      case 'Bound':
        return 'default';
      case 'Declined':
        return 'destructive';
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

  const sortedSubmissions = [...submissions].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription>Manage incoming underwriting submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submission ID</TableHead>
              <TableHead>Insured Name</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead> {/* Changed from Received Date */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
              sortedSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.id}</TableCell>
                  <TableCell>{submission.insuredName}</TableCell>
                  <TableCell>{submission.broker}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(submission.status)}>{submission.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-semibold", getPriorityBadgeClass(submission.priority))}>
                      {submission.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/quote/${submission.id}`}>
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
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
