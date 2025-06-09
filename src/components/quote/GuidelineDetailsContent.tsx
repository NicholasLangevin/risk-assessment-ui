
'use client';

import React, { useState, useEffect } from 'react';
import type { Guideline } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface GuidelineDetailsContentProps {
  guideline: Guideline;
}

export function GuidelineDetailsContent({ guideline }: GuidelineDetailsContentProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guideline || !guideline.id) {
      setError("Guideline ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchGuidelineContent = async () => {
      setIsLoading(true);
      setError(null);
      setHtmlContent(null);

      try {
        // Assume the API expects the guideline ID as a query parameter
        const apiUrl = `http://localhost:8000/open-guideline?guidelineId=${guideline.id}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch guideline content: ${response.status} ${response.statusText}`);
        }

        const data = await response.text();
        setHtmlContent(data);
      } catch (err: any) {
        console.error("Error fetching guideline content:", err);
        setError(err.message || "An unknown error occurred while fetching the guideline.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuidelineContent();
  }, [guideline]); // Re-fetch when the guideline object (specifically its ID) changes

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-lg">Loading guideline content...</p>
        <p className="text-sm">Fetching details for "{guideline.name}"</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Guideline</h3>
        <p className="text-center mb-1">Could not load content for "{guideline.name}".</p>
        <p className="text-sm text-center bg-destructive/10 p-2 rounded-md border border-destructive/30">{error}</p>
        <p className="text-xs mt-4 text-muted-foreground">Please ensure the guideline API at http://localhost:8000 is running and accessible.</p>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
        <p>No content available for this guideline.</p>
      </div>
    );
  }

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
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </ScrollArea>
  );
}
