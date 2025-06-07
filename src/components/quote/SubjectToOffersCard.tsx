
'use client';

import type { ManagedSubjectToOffer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubjectToOfferItem } from './SubjectToOfferItem';
import { ClipboardList, PlusCircle } from 'lucide-react'; // Or CheckSquare
import { Button } from '@/components/ui/button'; // For potential "Add New" button

interface SubjectToOffersCardProps {
  offers: ManagedSubjectToOffer[];
  onUpdateOffer: (id: string, newText: string) => void;
  onToggleRemoveOffer: (id: string) => void;
  onAddSubjectToOffer: (newOfferText: string) => void; // Optional: if you want to add new ones
}

export function SubjectToOffersCard({
  offers,
  onUpdateOffer,
  onToggleRemoveOffer,
  // onAddSubjectToOffer, // Implement if "Add New" is needed
}: SubjectToOffersCardProps) {
  // const handleAddNewOffer = () => {
  //   const newOfferText = prompt("Enter new subject-to offer text:");
  //   if (newOfferText && newOfferText.trim() !== "") {
  //     onAddSubjectToOffer(newOfferText.trim());
  //   }
  // };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-primary" />
            Subject-To Offers
          </CardTitle>
          {/* Optional: Add button to create new subject-to from scratch */}
          {/* <Button variant="outline" size="sm" onClick={handleAddNewOffer}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button> */}
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
