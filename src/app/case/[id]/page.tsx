
import { getMockCaseDetails } from '@/lib/mockData';
import type { Case } from '@/types';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ClientFormattedDate } from '@/components/common/ClientFormattedDate';

interface CaseDetailsPageProps {
  params: {
    id: string; // This is the Case ID
  };
}

export default async function CaseDetailsPage({ params }: CaseDetailsPageProps) {
  const { id: caseId } = params;
  const caseDetails: Case | null = getMockCaseDetails(caseId);

  if (!caseDetails) {
    notFound();
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-primary">Case Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><strong>Status:</strong> {caseDetails.status}</div>
        <div><strong>Priority:</strong> {caseDetails.priority}</div>
        <div><strong>Date Received:</strong> <ClientFormattedDate isoDateString={caseDetails.receivedDate} /></div>
        <div><strong>Assigned To:</strong> {caseDetails.assignedTo || 'Unassigned'}</div>
        {caseDetails.description && (
            <div className="md:col-span-2"><strong>Description:</strong> {caseDetails.description}</div>
        )}
        {caseDetails.relatedQuoteId && (
            <div className="md:col-span-2">
                <strong>Related Quote:</strong> 
                <Button variant="link" asChild className="p-0 h-auto ml-1 font-medium">
                    <Link href={`/quote/${caseDetails.relatedQuoteId}`}>{caseDetails.relatedQuoteId}</Link>
                </Button>
            </div>
        )}
         {caseDetails.relatedPolicyId && (
            <div className="md:col-span-2"><strong>Related Policy:</strong> {caseDetails.relatedPolicyId}</div>
        )}
      </div>
      {/* More detailed fields specific to Case Detail can be added here */}
    </div>
  );
}
