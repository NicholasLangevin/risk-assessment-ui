
'use client';

import type { Guideline } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuidelineItem } from './GuidelineItem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ListChecks, PlusCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { mockAllPossibleGuidelines } from '@/lib/mockData'; // Source of all guidelines
import { cn } from '@/lib/utils';

interface GuidelineStatusListProps {
  guidelines: Guideline[];
  onAddGuideline: (guidelineInfo: { id: string; name: string }) => void;
}

export function GuidelineStatusList({ guidelines, onAddGuideline }: GuidelineStatusListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isDialogOpen) {
      setSearchTerm(''); // Reset search term when dialog closes
    }
  }, [isDialogOpen]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const currentGuidelineIds = new Set(guidelines.map(g => g.id));

    const suggestions = mockAllPossibleGuidelines
      .filter(g => !currentGuidelineIds.has(g.id)) // Exclude already added guidelines
      .filter(g => g.name.toLowerCase().includes(lowerCaseSearchTerm));
    
    setFilteredSuggestions(suggestions);
  }, [searchTerm, guidelines]);

  const handleSelectGuideline = (suggestion: { id: string; name: string }) => {
    onAddGuideline(suggestion);
    setIsDialogOpen(false); // Close dialog after selection
    setSearchTerm(''); // Reset search term
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <CardTitle>Guideline Status</CardTitle>
            <CardDescription>Compliance status of underwriting guidelines.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              {/* Optional: Footer for close button if needed */}
              {/* <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
              </DialogFooter> */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {guidelines.length === 0 ? (
          <p className="p-6 text-muted-foreground">No guidelines evaluated for this submission.</p>
        ) : (
          <ScrollArea className="h-[300px] w-full">
            <div className="divide-y divide-border">
              {guidelines.map((guideline) => (
                <GuidelineItem key={guideline.id} guideline={guideline} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
