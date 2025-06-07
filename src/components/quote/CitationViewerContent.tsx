
'use client';

import type { Citation } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, FileText } from 'lucide-react';

interface CitationViewerContentProps {
  citation: Citation;
}

export function CitationViewerContent({ citation }: CitationViewerContentProps) {
  return (
    <div className="flex flex-col h-full p-1">
      {citation.sourceType === 'web' ? (
        <>
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <ExternalLink className="mr-2 h-5 w-5 text-primary" />
              Web Citation
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              Source: <a href={citation.sourceNameOrUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{citation.sourceNameOrUrl}</a>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tooltip: {citation.quickDescription}</p>
          </div>
          <iframe
            src={citation.sourceNameOrUrl}
            title={`Web content for ${citation.quickDescription}`}
            className="flex-grow w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Basic sandbox for security
          />
        </>
      ) : (
        <>
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Attachment Citation
            </h3>
            <p className="text-sm text-muted-foreground">Filename: {citation.sourceNameOrUrl}</p>
            <p className="text-xs text-muted-foreground mt-1">Tooltip: {citation.quickDescription}</p>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              <h4 className="font-semibold mb-2">Mock Attachment Content:</h4>
              <p>{citation.attachmentMockContent || 'No mock content available for this attachment.'}</p>
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
