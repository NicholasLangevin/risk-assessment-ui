
'use client';

import type { ManagedSubjectToOffer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubjectToOfferItem } from './SubjectToOfferItem';
import { ClipboardList, PlusCircle } from 'lucide-react';
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

interface SubjectToOffersCardProps {
  offers: ManagedSubjectToOffer[];
  onUpdateOffer: (id: string, newText: string) => void;
  onToggleRemoveOffer: (id: string) => void;
  onAddSubjectToOffer: (newOfferText: string) => void;
}

export function SubjectToOffersCard({
  offers,
  onUpdateOffer,
  onToggleRemoveOffer,
  onAddSubjectToOffer,
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
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-primary" />
            Subject-To Offers
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
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
        <CardDescription>Manage and adjust subject-to conditions for the quote.</CardDescription>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No subject-to offers currently defined.</p>
        ) : (
          <ScrollArea className="h-[180px] pr-2"> {/* Adjust height as needed */}
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

