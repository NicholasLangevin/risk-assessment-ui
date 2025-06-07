
'use client';

import type { Guideline } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface GuidelineDetailsContentProps {
  guideline: Guideline;
}

export function GuidelineDetailsContent({ guideline }: GuidelineDetailsContentProps) {
  // Mock HTML content generation based on guideline name
  const generateMockContent = (g: Guideline) => {
    let issueClarificationHtml = '';
    if (g.status === 'Issue Found' && g.details) {
      issueClarificationHtml = `
      <div class="my-4 p-3 border border-destructive/50 rounded-md bg-destructive/10">
        <h3 class="text-lg font-semibold text-destructive mb-1">Specific Issue for this Submission</h3>
        <p class="text-sm text-destructive/90">${g.details}</p>
      </div>`;
    } else if (g.status === 'Needs Clarification' && g.details) {
      issueClarificationHtml = `
      <div class="my-4 p-3 border border-yellow-500/50 rounded-md bg-yellow-500/10">
        <h3 class="text-lg font-semibold text-yellow-600 dark:text-yellow-500 mb-1">Clarification Required</h3>
        <p class="text-sm text-yellow-700 dark:text-yellow-600">${g.details}</p>
      </div>`;
    }

    return `
      <h2 class="text-2xl font-bold mb-1">${g.name}</h2>
      <p class="mb-4 text-base text-muted-foreground">This document outlines the specifics for the "${g.name}" guideline. Adherence is crucial for risk assessment.</p>
      
      ${issueClarificationHtml}

      <h3 class="text-xl font-semibold mt-6 mb-2">Key Principles</h3>
      <ul class="list-disc list-inside space-y-1.5 text-base mb-4">
        <li>All exposures must be clearly identified and quantified. This includes primary, secondary, and contingent exposures.</li>
        <li>Geographical concentrations of risk should be assessed against natural catastrophe models and internal aggregate limits.</li>
        <li>Compliance with all local, national, and international regulations relevant to the insured's operations and the proposed coverage is mandatory.</li>
        <li>Past claims history, including frequency, severity, and mitigation efforts, must be thoroughly reviewed and factored into the underwriting decision.</li>
      </ul>

      <h3 class="text-xl font-semibold mt-6 mb-2">Application Criteria & Documentation</h3>
      <p class="text-base mb-2">The following criteria must be met, with supporting documentation as specified:</p>
      <ol class="list-decimal list-inside space-y-1.5 text-base mb-4">
        <li><strong>Financial Stability:</strong> Audited financial statements for the past 3 years. Minimum acceptable solvency ratios apply.</li>
        <li><strong>Loss Control Measures:</strong> Recent loss control reports and evidence of implemented recommendations. For property risks, fire safety and security system details are required.</li>
        <li><strong>Contractual Obligations:</strong> Review of key contracts that may impact liability (e.g., hold harmless agreements, indemnification clauses).</li>
        <li><strong>Sanctions & Compliance Checks:</strong> Verification against relevant sanctions lists and confirmation of an adequate internal compliance program.</li>
      </ol>

      <h3 class="text-xl font-semibold mt-6 mb-2">Examples & Scenarios</h3>
      <div class="text-base space-y-3">
        <div class="p-3 border rounded-md">
          <p class="font-semibold">Scenario 1: Compliant Application</p>
          <p class="text-sm text-muted-foreground">Insured provides all requested documentation, demonstrates strong financial health, and has a clean claims history for the past 5 years. All checks are clear.</p>
        </div>
        <div class="p-3 border rounded-md">
          <p class="font-semibold">Scenario 2: Potential Issue - Needs Clarification</p>
          <p class="text-sm text-muted-foreground">Insured operates in a high-risk territory not initially declared. Underwriter to request detailed information on local operations and safety measures.</p>
        </div>
         <div class="p-3 border rounded-md">
          <p class="font-semibold">Scenario 3: Non-Compliant - Likely Decline</p>
          <p class="text-sm text-muted-foreground">Insured has multiple severe, unresolved claims related to the coverage sought and fails to meet minimum financial stability requirements.</p>
        </div>
      </div>

      <p class="text-xs text-muted-foreground mt-8 pt-4 border-t">Guideline Version: ${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}. Last Updated: ${new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
    `;
  };

  return (
    <ScrollArea className="h-full">
      <div 
        className={cn(
          "p-6 prose prose-sm sm:prose dark:prose-invert max-w-none",
          "prose-headings:font-headline prose-headings:tracking-tight",
          "prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3",
          "prose-h3:text-xl prose-h3:font-medium prose-h3:mt-5 prose-h3:mb-2",
          "prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/90",
          "prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1",
          "prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1",
          "prose-li:text-base prose-li:text-foreground/90",
          "prose-strong:font-semibold",
          "prose-a:text-primary hover:prose-a:underline"
        )}
        dangerouslySetInnerHTML={{ __html: generateMockContent(guideline) }} 
      />
    </ScrollArea>
  );
}
