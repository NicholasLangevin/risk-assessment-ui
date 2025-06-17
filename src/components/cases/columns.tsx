
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { CaseListItem, CaseStatus, PriorityLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ClientFormattedDate } from '@/components/common/ClientFormattedDate';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const getStatusBadgeVariant = (status: CaseStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'Untouched':
      return 'outline';
    case 'Triage':
      return 'secondary';
    case 'Open':
      return 'default'; // Using primary color
    case 'In Progress':
      return 'secondary'; // Could be a specific 'info' or 'warning' color
    case 'Pending Information':
      return 'outline'; // Example: Yellowish/Orange using accent if configured
    case 'Action Required':
      return 'destructive'; // Example: Red
    case 'Completed':
      return 'default'; // Using a less prominent primary or specific 'success' color (e.g. green)
    case 'Closed':
      return 'outline'; // Muted
    default:
      return 'secondary';
  }
};
// Use a specific class for 'Completed' if default primary is not suitable (e.g. if primary is blue, completed might be green)
const completedBadgeClass = "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600";
const openBadgeClass = "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600";
const pendingInfoBadgeClass = "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600/30 dark:text-yellow-300 dark:border-yellow-500";


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

export const columns: ColumnDef<CaseListItem>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Case Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const caseItem = row.original;
      // Link to quote if relatedQuoteId exists, otherwise just display ID
      if (caseItem.relatedQuoteId) {
        return (
          <Button variant="link" asChild className="p-0 h-auto font-medium">
            <Link href={`/quote/${caseItem.relatedQuoteId}`}>{caseItem.id}</Link>
          </Button>
        );
      }
      return <div className="font-medium">{caseItem.id}</div>;
    },
  },
  {
    accessorKey: 'caseType',
    header: 'Transaction Type',
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const priority = row.getValue('priority') as PriorityLevel;
      return <Badge variant="outline" className={cn("font-semibold", getPriorityBadgeClass(priority))}>{priority}</Badge>;
    },
  },
  {
    accessorKey: 'receivedDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date Received
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('receivedDate') as string;
      return <ClientFormattedDate isoDateString={date} />;
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as CaseStatus;
      let badgeClass = '';
      if (status === 'Completed') badgeClass = completedBadgeClass;
      else if (status === 'Open') badgeClass = openBadgeClass;
      else if (status === 'Pending Information') badgeClass = pendingInfoBadgeClass;
      
      return <Badge variant={getStatusBadgeVariant(status)} className={cn(badgeClass)}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const caseItem = row.original;
      if (caseItem.relatedQuoteId) {
        return (
          <Button variant="ghost" asChild size="sm">
            <Link href={`/quote/${caseItem.relatedQuoteId}`}>View Quote</Link>
          </Button>
        );
      }
      // Placeholder for future case detail view or other actions
      return (
        <Button variant="ghost" size="sm" disabled>
          View Case
        </Button>
      );
    },
  },
];
