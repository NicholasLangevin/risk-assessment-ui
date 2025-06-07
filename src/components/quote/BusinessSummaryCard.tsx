
'use client';

import type { BusinessSummaryDetails, Citation, RichTextSegment, TextSegment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Briefcase, FileText, Globe } from 'lucide-react';
import React from 'react';

interface BusinessSummaryCardProps {
  summary: BusinessSummaryDetails;
  citations: Citation[];
  onShowCitation: (citation: Citation) => void;
}

// Custom PDF Icon SVG
const PdfIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" opacity="0.3"/>
    <path d="M13 2V9H20" opacity="0.3"/>
    <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="7px" fontWeight="bold" fill="currentColor">PDF</text>
  </svg>
);

// Define AiSparkleIcon locally or import if it becomes a shared component
const AiSparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30" // Updated viewBox
    fill="currentColor" // Changed to fill
    {...props}
  >
    {/* Updated path data */}
    <path d="M15.142,1.451L15.142,1.451c0.693,7.098,6.31,12.714,13.408,13.408l0,0c0.171,0.017,0.171,0.267,0,0.283l0,0	c-7.098,0.693-12.714,6.31-13.408,13.408l0,0c-0.017,0.171-0.267,0.171-0.283,0l0,0c-0.693-7.098-6.31-12.714-13.408-13.408l0,0	c-0.171-0.017-0.171-0.267,0-0.283l0,0c7.098-0.693,12.714-6.31,13.408-13.408l0,0C14.875,1.279,15.125,1.279,15.142,1.451z"></path>
  </svg>
);

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
          let tooltipText = citation.quickDescription;

          if (citation.sourceType === 'attachment') {
            if (citation.sourceNameOrUrl.toLowerCase().endsWith('.pdf')) {
              IconComponent = <PdfIcon />;
              tooltipText = `PDF: ${citation.quickDescription}`;
            } else {
              IconComponent = <FileText className="h-3.5 w-3.5" />;
              tooltipText = `Attachment: ${citation.quickDescription}`;
            }
          } else { // 'web'
            IconComponent = <Globe className="h-3.5 w-3.5" />;
            tooltipText = `Web: ${citation.quickDescription}`;
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
                    aria-label={`View citation: ${citation.quickDescription}`}
                  >
                    {IconComponent}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-center">
                  <div className="text-xs">
                    {segment.markerText ? `${segment.markerText}: ` : ''}{tooltipText}
                    {citation.sourceType === 'attachment' && ` (${citation.sourceNameOrUrl})`}
                    {citation.sourceType === 'web' && ` (${new URL(citation.sourceNameOrUrl).hostname})`}
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
          <CardTitle className="flex items-center">
            <AiSparkleIcon className="h-5 w-5 mr-2 text-primary" />
            Business Summary
          </CardTitle>
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>AI-augmented risk components of the insured's business with citations.</CardDescription>
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
