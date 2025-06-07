
'use client';

import type { BusinessSummaryDetails, Citation, RichTextSegment, TextSegment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Briefcase, Link as LinkIcon } from 'lucide-react'; 
import React from 'react';

interface BusinessSummaryCardProps {
  summary: BusinessSummaryDetails;
  citations: Citation[];
  onShowCitation: (citation: Citation) => void;
}

const RenderRichText = ({ segments, citations, onShowCitation }: { segments: RichTextSegment[], citations: Citation[], onShowCitation: (citation: Citation) => void }) => {
  if (!segments || segments.length === 0) {
    return <p className="text-sm text-muted-foreground">Not available.</p>;
  }

  return (
    <div className="text-sm text-muted-foreground leading-relaxed">
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          // Defensive rendering for segment.content
          let contentToRender = segment.content;
          if (typeof segment.content === 'object' && segment.content !== null && 'type' in segment.content && 'content' in segment.content) {
            // If segment.content is itself an object {type, content}, extract its content string
            // This guards against unexpected data nesting.
            // console.warn("Detected nested TextSegment-like object in content property:", segment.content);
            contentToRender = (segment.content as TextSegment).content;
          }
          
          if (typeof contentToRender !== 'string') {
            // If, after checks, it's still not a string, provide a fallback.
            // console.error("Final contentToRender is not a string:", contentToRender);
            return <span key={index} className="text-destructive">[Invalid Content]</span>;
          }
          return <React.Fragment key={index}>{contentToRender}</React.Fragment>;
        }
        if (segment.type === 'citationLink') {
          const citation = citations.find(c => c.id === segment.citationId);
          if (!citation) {
            return <span key={index} className="text-destructive font-bold">{segment.markerText}[Error: Missing Citation]</span>;
          }
          return (
            <TooltipProvider key={index} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs align-baseline inline text-primary hover:text-primary/80 focus:outline-none focus:ring-1 focus:ring-ring rounded-sm"
                    onClick={() => onShowCitation(citation)}
                    aria-label={`View citation: ${citation.quickDescription}`}
                  >
                    <sup className="font-semibold px-0.5">{segment.markerText}</sup>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-center">
                  <div className="text-xs">{citation.quickDescription}</div>
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

