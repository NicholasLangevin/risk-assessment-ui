
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { CaseListItem, CaseStatus, PriorityLevel, OpenedCaseInfo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ClientFormattedDate } from '@/components/common/ClientFormattedDate';
import { cn } from '@/lib/utils';
// Link is no longer directly used for navigation for case ID, useRouter is used instead
// import Link from 'next/link'; 
import { useRouter } from 'next/navigation';
import { useOpenedCases } from '@/contexts/OpenedCasesContext';

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
      const router = useRouter();
      const { openCase } = useOpenedCases();

      const handleOpenCase = () => {
        const caseInfo: OpenedCaseInfo = {
          id: caseItem.id,
          insuredName: caseItem.insuredName,
          broker: caseItem.broker,
        };
        openCase(caseInfo);
        router.push(`/case/${caseItem.id}`);
      };

      return (
        <Button variant="link" onClick={handleOpenCase} className="p-0 h-auto font-medium">
          {caseItem.id}
        </Button>
      );
    },
  },
  {
    accessorKey: 'insuredName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Insured Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'broker',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Broker
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
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
      return <div className="text-sm">{status}</div>;
    },
  },
];
