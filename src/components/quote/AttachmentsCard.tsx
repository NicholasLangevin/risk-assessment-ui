'use client';

import type { Attachment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, FileText, FileSpreadsheet, FileImage, FileArchive } from 'lucide-react';

interface AttachmentsCardProps {
  attachments: Attachment[];
  onViewAttachment: (attachment: Attachment) => void;
}

export function AttachmentsCard({ attachments, onViewAttachment }: AttachmentsCardProps) {
  const getFileIcon = (fileType: Attachment['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />;
      case 'jpg':
        return <FileImage className="h-5 w-5 text-purple-500 flex-shrink-0" />;
      case 'zip':
        return <FileArchive className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
      case 'txt':
         return <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />;
      default:
        return <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Paperclip className="h-5 w-5 mr-2" />
          Attachments
        </CardTitle>
        <CardDescription className="text-sm">Documents attached to this submission. Click to view details.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {(!attachments || attachments.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center px-6 py-4">No attachments for this submission.</p>
        ) : (
          <ScrollArea className="h-[200px] w-full"> {/* Adjust height as needed */}
            <div className="divide-y divide-border">
            {attachments.map((attachment) => (
              <Button
                key={attachment.id}
                variant="ghost"
                className="w-full justify-start h-auto py-3 px-4 text-left rounded-none border-b-0"
                onClick={() => onViewAttachment(attachment)}
                title={`View ${attachment.fileName}`}
              >
                <div className="flex items-center space-x-3 w-full overflow-hidden">
                  {getFileIcon(attachment.fileType)}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate" title={attachment.fileName}>{attachment.fileName}</span>
                    <span className="text-xs text-muted-foreground">{attachment.fileSize}</span>
                  </div>
                </div>
              </Button>
            ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
