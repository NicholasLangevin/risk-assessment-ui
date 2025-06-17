
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Case } from "@/types";
import { ClientFormattedDate } from '@/components/common/ClientFormattedDate';


interface CaseViewPageClientProps {
  caseDetails: Case | null;
}

export function CaseViewPageClient({ caseDetails }: CaseViewPageClientProps) {
  if (!caseDetails) {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Case Not Found</h1>
            <p className="text-muted-foreground">The case you are looking for does not exist or could not be loaded.</p>
            <Button variant="outline" size="sm" asChild className="mt-4">
                <Link href="/cases"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Cases</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Case Header Information */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline">Case: {caseDetails.id}</h1>
        <p className="text-md text-muted-foreground mt-1">
            Insured: {caseDetails.insuredName} | Broker: {caseDetails.broker} | Type: {caseDetails.caseType}
        </p>
        {/* Can add action buttons here if needed, e.g., Edit, Assign */}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="caseDetail" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="caseDetail">Case Detail</TabsTrigger>
          <TabsTrigger value="emails">Emails Exchange</TabsTrigger>
          <TabsTrigger value="dataEntry">Data Entry</TabsTrigger>
          <TabsTrigger value="riskAssessment">Risk Assessment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="caseDetail" className="mt-2 py-6 px-4 border bg-background/50 rounded-md min-h-[300px] shadow-sm">
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
          {/* More detailed fields can be added here */}
        </TabsContent>

        <TabsContent value="emails" className="mt-2 py-6 px-4 border bg-background/50 rounded-md min-h-[300px] shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-primary">Emails Exchange</h3>
          <p className="text-muted-foreground">Placeholder: Content for Emails Exchange associated with case {caseDetails.id} will go here.</p>
          {/* For example, a list of emails or an embedded email client view */}
        </TabsContent>

        <TabsContent value="dataEntry" className="mt-2 py-6 px-4 border bg-background/50 rounded-md min-h-[300px] shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-primary">Data Entry</h3>
          <p className="text-muted-foreground">Placeholder: Data entry forms and information relevant to case {caseDetails.id} will be managed here.</p>
          {/* For example, forms to input specific data points or checklists */}
        </TabsContent>

        <TabsContent value="riskAssessment" className="mt-2 py-6 px-4 border bg-background/50 rounded-md min-h-[300px] shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-primary">Risk Assessment</h3>
          <p className="text-muted-foreground">Placeholder: Risk assessment details, scores, and AI analysis for case {caseDetails.id} will be displayed here.</p>
          {/* For example, risk scoring, AI insights, or related documents */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
