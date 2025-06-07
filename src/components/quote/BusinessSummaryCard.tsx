
'use client';

import type { BusinessSummaryDetails, Citation, RichTextSegment, TextSegment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Briefcase, FileText, ExternalLink } from 'lucide-react';
import React from 'react';

interface BusinessSummaryCardProps {
  summary: BusinessSummaryDetails;
  citations: Citation[];
  onShowCitation: (citation: Citation) => void;
}

const RenderRichText = ({ segments, citations, onShowCitation }: { segments: RichTextSegment[], citations: Citation[], onShowCitation: (citation: Citation) => void }) => {
  if (!segments || segments.length === 0) {
    return <div className="text-sm text-muted-foreground leading-relaxed">Not available.</div>;
  }

  return (
    <div className="text-sm text-muted-foreground leading-relaxed">
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          let contentToRender = segment.content;
          if (typeof segment.content === 'object' && segment.content !== null && 'type' in segment.content && 'content' in segment.content) {
            contentToRender = (segment.content as TextSegment).content;
          }
          
          if (typeof contentToRender !== 'string') {
            return <span key={index} className="text-destructive">[Invalid Content]</span>;
          }
          return <React.Fragment key={index}>{contentToRender}</React.Fragment>;
        }
        if (segment.type === 'citationLink') {
          const citation = citations.find(c => c.id === segment.citationId);
          if (!citation) {
            return <span key={index} className="text-destructive font-bold">[Err: Citation Missing]</span>;
          }

          let IconComponent;
          if (citation.sourceType === 'attachment') {
            IconComponent = <FileText className="h-3.5 w-3.5" />;
          } else { // 'web'
            IconComponent = <ExternalLink className="h-3.5 w-3.5" />;
          }

          return (
            <TooltipProvider key={index} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0.5 h-auto text-xs align-middle inline-flex items-center justify-center mx-0.5 text-primary hover:text-primary/80 focus:outline-none focus:ring-1 focus:ring-ring rounded-sm"
                    onClick={() => onShowCitation(citation)}
                    aria-label={`View citation ${segment.markerText}: ${citation.quickDescription}`}
                  >
                    {IconComponent}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-center">
                  <div className="text-xs">
                    {segment.markerText}: {citation.quickDescription}
                    {citation.sourceType === 'attachment' && ` (Attachment: ${citation.sourceNameOrUrl})`}
                    {citation.sourceType === 'web' && ` (Web: ${new URL(citation.sourceNameOrUrl).hostname})`}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return null;
      })}
    </div>
  );
};

export function BusinessSummaryCard({ summary, citations, onShowCitation }: BusinessSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Business Summary</CardTitle>
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Key risk components of the insured's business with citations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1">Buildings</h4>
          <RenderRichText segments={summary.buildingsDescription} citations={citations} onShowCitation={onShowCitation} />
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Operations</h4>
          <RenderRichText segments={summary.operationsDescription} citations={citations} onShowCitation={onShowCitation} />
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Product/Service</h4>
          <RenderRichText segments={summary.productDescription} citations={citations} onShowCitation={onShowCitation} />
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Completed Operations Main Risks</h4>
          <RenderRichText segments={summary.completedOperationsRisk} citations={citations} onShowCitation={onShowCitation} />
        </div>
      </CardContent>
    </Card>
  );
}
