
'use client';

import type { Guideline } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuidelineItem } from './GuidelineItem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react'; // Removed ListChecks
import React, { useState, useEffect } from 'react';
import { mockAllPossibleGuidelines } from '@/lib/mockData';
import { cn } from '@/lib/utils';

// Define AiSparkleIcon locally
const AiSparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30"
    fill="currentColor"
    {...props}
  >
    <path d="M15.142,1.451L15.142,1.451c0.693,7.098,6.31,12.714,13.408,13.408l0,0c0.171,0.017,0.171,0.267,0,0.283l0,0	c-7.098,0.693-12.714,6.31-13.408,13.408l0,0c-0.017,0.171-0.267,0.171-0.283,0l0,0c-0.693-7.098-6.31-12.714-13.408-13.408l0,0	c-0.171-0.017-0.171-0.267,0-0.283l0,0c7.098-0.693,12.714-6.31,13.408-13.408l0,0C14.875,1.279,15.125,1.279,15.142,1.451z"></path>
  </svg>
);

interface GuidelineStatusListProps {
  guidelines: Guideline[];
  onAddGuideline: (guidelineInfo: { id: string; name: string }) => void;
  onUpdateGuideline: (id: string, status: Guideline['status'], details?: string) => void;
  onViewGuidelineDetails: (guideline: Guideline) => void; // New prop
}

export function GuidelineStatusList({ guidelines, onAddGuideline, onUpdateGuideline, onViewGuidelineDetails }: GuidelineStatusListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isAddDialogOpen) {
      setSearchTerm('');
    }
  }, [isAddDialogOpen]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const currentGuidelineIds = new Set(guidelines.map(g => g.id));

    const suggestions = mockAllPossibleGuidelines
      .filter(g => !currentGuidelineIds.has(g.id))
      .filter(g => g.name.toLowerCase().includes(lowerCaseSearchTerm));
    
    setFilteredSuggestions(suggestions);
  }, [searchTerm, guidelines]);

  const handleSelectGuideline = (suggestion: { id: string; name: string }) => {
    onAddGuideline(suggestion);
    setIsAddDialogOpen(false);
    setSearchTerm('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <CardTitle className="flex items-center text-primary">
              <AiSparkleIcon className="h-5 w-5 mr-2" />
              AI Guideline Evaluation
            </CardTitle>
            <CardDescription>AI-assisted compliance status. Click item to view details, use menu to change status.</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Guideline
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Guideline</DialogTitle>
                <DialogDescription>
                  Search and select a guideline to add to the evaluation list.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <Input
                  placeholder="Search guideline name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm.trim() !== '' && (
                  <ScrollArea className="h-[200px] border rounded-md">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          onClick={() => handleSelectGuideline(suggestion)}
                          className={cn(
                            "p-2 hover:bg-muted cursor-pointer text-sm",
                            "border-b last:border-b-0" 
                          )}
                        >
                          {suggestion.name}
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-muted-foreground text-center">
                        No matching guidelines found or all matching guidelines are already added.
                      </p>
                    )}
                  </ScrollArea>
                )}
                 {searchTerm.trim() === '' && (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                        Start typing to search for guidelines.
                    </p>
                 )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {guidelines.length === 0 ? (
          <p className="p-6 text-muted-foreground">No guidelines evaluated for this submission. Click "Add Guideline" to start.</p>
        ) : (
          <ScrollArea className="h-[300px] w-full">
            <div className="divide-y divide-border">
              {guidelines.map((guideline) => (
                <GuidelineItem 
                  key={guideline.id} 
                  guideline={guideline} 
                  onUpdateGuideline={onUpdateGuideline}
                  onViewDetails={onViewGuidelineDetails} // Pass down the new prop
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

