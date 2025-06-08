
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
import type { Submission } from '@/types';
import { ArrowRight } from 'lucide-react';
import { ClientFormattedDate } from '@/components/common/ClientFormattedDate'; // Added import

interface SubmissionsTableProps {
  submissions: Submission[];
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const getStatusVariant = (status: Submission['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'New':
        return 'default'; // primary color
      case 'Pending Review':
        return 'secondary';
      case 'Information Requested':
        return 'outline'; // uses accent color from theme for border
      case 'Quoted':
        return 'default'; // can use a different color if 'default' is primary
      case 'Bound':
        return 'default'; // can use a 'success' variant if defined in theme
      case 'Declined':
        return 'destructive';
      default:
        return 'secondary';
    }
  };


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
              <TableHead>Received Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.id}</TableCell>
                  <TableCell>{submission.insuredName}</TableCell>
                  <TableCell>{submission.broker}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(submission.status)}>{submission.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <ClientFormattedDate isoDateString={submission.receivedDate} />
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

// Needs Card, CardHeader, CardTitle, CardDescription from ui/card
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
