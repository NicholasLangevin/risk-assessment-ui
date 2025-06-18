
import type React from 'react';
import { getMockCaseDetails, mockCaseListItems } from '@/lib/mockData';
import type { Case } from '@/types';
import { notFound } from 'next/navigation';
import { CasePageLayoutClient } from '@/components/case-view/CasePageLayoutClient';

interface CaseLayoutProps {
  params: {
    id: string; // This is the Case ID
  };
  children: React.ReactNode;
}

export default async function CaseLayout({ params, children }: CaseLayoutProps) {
  const { id: caseId } = params;
  const caseDetails: Case | null = getMockCaseDetails(caseId);

  if (!caseDetails) {
    notFound();
  }

  return (
    <CasePageLayoutClient caseDetails={caseDetails}>
      {children}
    </CasePageLayoutClient>
  );
}

export async function generateStaticParams() {
  return mockCaseListItems.map((caseItem) => ({
    id: caseItem.id,
  }));
}
