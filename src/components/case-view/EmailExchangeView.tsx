'use client';

import { useState, useEffect } from 'react';
import type { Email, Attachment } from '@/types';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { MailIcon, ChevronDown, Paperclip, Clock, ArrowDown, ArrowUp, ChevronRight, Plus, Loader2, Sparkles } from 'lucide-react';
import { ClientFormattedDate } from '@/components/common/ClientFormattedDate';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AttachmentViewerContent } from '@/components/quote/AttachmentViewerContent';
import { AttachmentsCard } from '@/components/quote/AttachmentsCard';

interface EmailExchangeViewProps {
  emails: Email[];
}

export function EmailExchangeView({ emails }: EmailExchangeViewProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [sortedEmails, setSortedEmails] = useState<Email[]>([]);
  const [isNewEmailDialogOpen, setIsNewEmailDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newEmail, setNewEmail] = useState({
    subject: '',
    body: '',
    to: '',
    from: '', // This would typically be pre-filled with the current user's email
    attachments: [] as { id: string; fileName: string; fileSize: string }[]
  });
  const [openAttachment, setOpenAttachment] = useState<Attachment | null>(null);
  const [allAttachments, setAllAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    const sorted = [...emails].sort((a, b) => {
      const comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortOrder === 'desc' ? comparison : -comparison;
    });
    setSortedEmails(sorted);

    const attachments = emails.flatMap(email => email.attachments || []);
    setAllAttachments(attachments);
  }, [emails, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  const getInboxIcon = (email: Email) => {
    if (email.direction === 'inbound') {
      return <ArrowDown className="h-4 w-4 text-emerald-600" />;
    }
    return <ArrowUp className="h-4 w-4 text-blue-600" />;
  };

  const toggleEmailExpansion = (emailId: string) => {
    setExpandedEmailId(current => current === emailId ? null : emailId);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // Here you would typically make an API call to send the email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setIsNewEmailDialogOpen(false);
      setNewEmail({
        subject: '',
        body: '',
        to: '',
        from: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleViewAttachment = (attachment: Attachment) => {
    setOpenAttachment(attachment);
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MailIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Email Exchange</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center space-x-1"
          >
            <Clock className="h-4 w-4 mr-1" />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsNewEmailDialogOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Email
          </Button>
        </div>
      </div>

      <AttachmentsCard attachments={allAttachments} onViewAttachment={handleViewAttachment} />

      {/* Email List */}
      <ScrollArea className="h-[500px]">
        {sortedEmails.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No emails found</p>
          </div>
        ) : (
          <div className="space-y-1 px-1 py-1">
            {sortedEmails.map((email) => (
              <Card
                key={email.id}
                className={`${!email.isRead ? 'bg-primary/5' : 'bg-background'}`}
              >
                <div className="p-3">
                  {/* Header row: only this is clickable for expand/collapse */}
                  <div
                    className="flex items-start justify-between hover:bg-muted/50 transition-colors cursor-pointer rounded-md px-1 -mx-1 py-1"
                    onClick={() => toggleEmailExpansion(email.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getInboxIcon(email)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-normal text-sm">{email.direction === 'inbound' ? email.from : email.to}</span>
                          {email.attachments && email.attachments.length > 0 && (
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground leading-tight">{email.subject}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <ClientFormattedDate isoDateString={email.timestamp} />
                        </div>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                        expandedEmailId === email.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                  
                  {/* AI Summary */}
                  <div className={cn(
                    "mt-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-2",
                    expandedEmailId === email.id ? "mb-4" : ""
                  )}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Summary</span>
                    </div>
                    <p className="text-sm">
                      {email.direction === 'inbound' ? 
                        "Broker inquires about policy coverage details and requests clarification on specific terms." :
                        "Response providing detailed explanation of policy terms and confirmation of coverage scope."}
                    </p>
                  </div>
                  
                  {/* Expanded Email Content */}
                  {expandedEmailId === email.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-3 pl-6">
                        <div className="text-sm text-muted-foreground">
                          <strong>From:</strong> {email.from}<br />
                          <strong>To:</strong> {email.to}<br />
                          <strong>Date:</strong> <ClientFormattedDate isoDateString={email.timestamp} />
                        </div>
                        
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap text-sm">{email.body}</div>
                        </div>
                        
                        {email.attachments && email.attachments.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Attachments</h4>
                            <div className="space-y-2">
                              {email.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleViewAttachment(attachment);
                                  }}
                                >
                                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{attachment.fileName}</span>
                                  <span className="text-xs text-muted-foreground">({attachment.fileSize})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* New Email Dialog */}
      <Dialog open={isNewEmailDialogOpen} onOpenChange={setIsNewEmailDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>New Email</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                value={newEmail.from}
                onChange={(e) => setNewEmail({ ...newEmail, from: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={newEmail.to}
                onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                placeholder="recipient@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={newEmail.body}
                onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                placeholder="Write your message here..."
                className="min-h-[200px]"
              />
            </div>
            <div className="grid gap-2">
              <Label>Attachments</Label>
              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => {}}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Add Attachment
                </Button>
              </div>
              {newEmail.attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {newEmail.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attachment.fileName}</span>
                        <span className="text-xs text-muted-foreground">({attachment.fileSize})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={isSending || !newEmail.to || !newEmail.subject || !newEmail.body}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment Sheet */}
      <Sheet open={!!openAttachment} onOpenChange={isOpen => !isOpen && setOpenAttachment(null)}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl lg:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="p-6 border-b flex-shrink-0">
            <SheetTitle>
              {openAttachment ? `Attachment: ${openAttachment.fileName}` : ''}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            {openAttachment && (
              <AttachmentViewerContent attachment={openAttachment} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 