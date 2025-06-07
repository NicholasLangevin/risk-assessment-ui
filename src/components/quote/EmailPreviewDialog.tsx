
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DiffDisplay } from '@/components/common/DiffDisplay'; // To display diffs
import type { EmailGenerationOutput } from '@/ai/flows/generate-underwriting-email';
import { Loader2 } from 'lucide-react';

interface EmailPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emailContent: EmailGenerationOutput & { originalBody: string; currentBody: string } | null;
  onEmailBodyChange: (newBody: string) => void;
  onSend: () => void;
  isSending: boolean; // To disable button while "sending"
}

export function EmailPreviewDialog({
  isOpen,
  onOpenChange,
  emailContent,
  onEmailBodyChange,
  onSend,
  isSending,
}: EmailPreviewDialogProps) {
  if (!emailContent) {
    return null; 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Email Preview & Edit</DialogTitle>
          <DialogDescription>
            Review and edit the AI-generated email before sending. Subject: "{emailContent.emailSubject}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 flex-grow min-h-0">
          <div className="grid gap-2 flex-grow flex flex-col">
            <Label htmlFor="email-body">Email Body</Label>
            <Textarea
              id="email-body"
              value={emailContent.currentBody}
              onChange={(e) => onEmailBodyChange(e.target.value)}
              className="flex-grow min-h-[200px] resize-none"
              placeholder="Enter email content..."
            />
          </div>
          
          <div className="grid gap-2 mt-2">
            <Label>Changes Preview (from AI original)</Label>
            <ScrollArea className="h-[150px] border rounded-md p-3 text-sm bg-muted/30">
              <DiffDisplay originalText={emailContent.originalBody} currentText={emailContent.currentBody} />
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={isSending || !emailContent.currentBody.trim()}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
