
'use client';

import type { ManagedInformationRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InformationRequestItem } from './InformationRequestItem';
import { FileQuestion, PlusCircle } from 'lucide-react';
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

interface InformationRequestsCardProps {
  requests: ManagedInformationRequest[];
  onUpdateInfoRequest: (id: string, newText: string) => void;
  onToggleRemoveInfoRequest: (id: string) => void;
  onAddInfoRequest: (newRequestText: string) => void;
}

export function InformationRequestsCard({
  requests,
  onUpdateInfoRequest,
  onToggleRemoveInfoRequest,
  onAddInfoRequest,
}: InformationRequestsCardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRequestText, setNewRequestText] = useState('');

  const handleAddNewRequest = () => {
    if (newRequestText.trim() !== "") {
      onAddInfoRequest(newRequestText.trim());
      setNewRequestText('');
      setIsAddDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileQuestion className="h-5 w-5 mr-2 text-primary" />
            Information Requests
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Information Request</DialogTitle>
                <DialogDescription>
                  Enter the details for the new information request.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="E.g., Latest financial statements..."
                  value={newRequestText}
                  onChange={(e) => setNewRequestText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewRequest()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNewRequest} disabled={!newRequestText.trim()}>Add Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Manage and adjust AI-suggested or manually added information requests.</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No information requests currently defined.</p>
        ) : (
          <ScrollArea className="h-[180px] pr-2"> {/* Adjust height as needed */}
            <div className="space-y-1">
              {requests.map((request) => (
                <InformationRequestItem
                  key={request.id}
                  request={request}
                  onUpdateInfoRequest={onUpdateInfoRequest}
                  onToggleRemoveInfoRequest={onToggleRemoveInfoRequest}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
