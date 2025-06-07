
'use client';

import React, { useState } from 'react';
import type { ManagedSubjectToOffer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3, Trash2, Check, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectToOfferItemProps {
  offer: ManagedSubjectToOffer;
  onUpdateOffer: (id: string, newText: string) => void;
  onToggleRemoveOffer: (id: string) => void;
}

export function SubjectToOfferItem({ offer, onUpdateOffer, onToggleRemoveOffer }: SubjectToOfferItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(offer.currentText);

  const handleSave = () => {
    onUpdateOffer(offer.id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(offer.currentText);
    setIsEditing(false);
  };

  const handleToggleRemove = () => {
    // If currently editing, cancel edit before toggling removal
    if (isEditing) {
      handleCancel();
    }
    onToggleRemoveOffer(offer.id);
  };
  
  const handleEditClick = () => {
    // If removed, un-remove it first before enabling edit.
    // This simplifies state, as editing a "removed" item is counter-intuitive.
    if (offer.isRemoved) {
        onToggleRemoveOffer(offer.id);
    }
    setIsEditing(true);
  }

  return (
    <div className="py-2 border-b border-border/50 last:border-b-0">
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-grow h-8 text-sm"
          />
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8 text-green-600 hover:text-green-700">
            <Check className="h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between space-x-2">
          <p
            className={cn(
              "text-sm flex-grow",
              offer.isRemoved && "line-through text-muted-foreground",
              !offer.isRemoved && offer.isEdited && "text-green-600 dark:text-green-500"
            )}
          >
            {offer.currentText}
          </p>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {!offer.isRemoved && (
                 <Button variant="ghost" size="icon" onClick={handleEditClick} className="h-7 w-7">
                    <Edit3 className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleToggleRemove} className="h-7 w-7">
              {offer.isRemoved ? <RotateCcw className="h-4 w-4 text-yellow-600" /> : <Trash2 className="h-4 w-4 text-destructive" />}
              <span className="sr-only">{offer.isRemoved ? 'Restore' : 'Remove'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
