
'use client';

import type { Attachment } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, FileSpreadsheet, FileImage, FileArchive, DownloadCloud, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttachmentViewerContentProps {
  attachment: Attachment;
}

export function AttachmentViewerContent({ attachment }: AttachmentViewerContentProps) {
  const getFileIcon = (fileType: Attachment['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="mr-2 h-5 w-5 text-red-500" />;
      case 'docx':
        return <FileText className="mr-2 h-5 w-5 text-blue-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="mr-2 h-5 w-5 text-green-500" />;
      case 'jpg':
        return <FileImage className="mr-2 h-5 w-5 text-purple-500" />;
      case 'zip':
        return <FileArchive className="mr-2 h-5 w-5 text-yellow-500" />;
      case 'txt':
        return <FileText className="mr-2 h-5 w-5 text-gray-500" />;
      default:
        return <Paperclip className="mr-2 h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col h-full p-1">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          {getFileIcon(attachment.fileType)}
          {attachment.fileName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Type: {attachment.fileType.toUpperCase()} | Size: {attachment.fileSize}
        </p>
        <Button variant="outline" size="sm" className="mt-3">
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download (mock)
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h4 className="font-semibold mb-2 text-base">Mock Document Preview:</h4>
          <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md border">
            {attachment.mockContent || 'No preview content available for this attachment.'}
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
}
