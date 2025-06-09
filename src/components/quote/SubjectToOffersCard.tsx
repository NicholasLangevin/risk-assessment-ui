
'use client';

import type { ManagedSubjectToOffer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubjectToOfferItem } from './SubjectToOfferItem';
import { PlusCircle, Loader2 } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useState } from 'react';

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

interface SubjectToOffersCardProps {
  offers: ManagedSubjectToOffer[];
  onUpdateOffer: (id: string, newText: string) => void;
  onToggleRemoveOffer: (id: string) => void;
  onAddSubjectToOffer: (newOfferText: string) => void;
  isSaving?: boolean; // Added isSaving prop
}

export function SubjectToOffersCard({
  offers,
  onUpdateOffer,
  onToggleRemoveOffer,
  onAddSubjectToOffer,
  isSaving, // Destructure isSaving prop
}: SubjectToOffersCardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newOfferText, setNewOfferText] = useState('');

  const handleAddNewOffer = () => {
    if (newOfferText.trim() !== "") {
      onAddSubjectToOffer(newOfferText.trim());
      setNewOfferText('');
      setIsAddDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-primary">
            <AiSparkleIcon className="h-5 w-5 mr-2" />
            AI Subject-To Offers
            {isSaving && <Loader2 className="ml-2 h-5 w-5 animate-spin text-muted-foreground" />}
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isSaving}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Subject-To Offer</DialogTitle>
                <DialogDescription>
                  Enter the details for the new subject-to offer.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="E.g., Subject to satisfactory inspection..."
                  value={newOfferText}
                  onChange={(e) => setNewOfferText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewOffer()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNewOffer} disabled={!newOfferText.trim()}>Add Offer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Manage and adjust AI-suggested or manually added subject-to conditions. Changes are saved automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No subject-to offers currently defined.</p>
        ) : (
          <ScrollArea className="h-[180px] pr-2"> 
            <div className="space-y-1">
              {offers.map((offer) => (
                <SubjectToOfferItem
                  key={offer.id}
                  offer={offer}
                  onUpdateOffer={onUpdateOffer}
                  onToggleRemoveOffer={onToggleRemoveOffer}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
