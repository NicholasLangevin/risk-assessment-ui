'use client';

import { useState } from 'react';
import type { Attachment } from '@/types';
import { Card } from '@/components/ui/card';
import { ChevronRight, Paperclip, FileText, FileSpreadsheet, FileImage, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentsCardProps {
  attachments: Attachment[];
  onViewAttachment: (attachment: Attachment) => void;
}

export function AttachmentsCard({ attachments, onViewAttachment }: AttachmentsCardProps) {
  const getFileIcon = (fileType: Attachment['fileType']) => {
    const iconClass = "h-4 w-4 flex-shrink-0";
    switch (fileType) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'docx':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'xlsx':
        return <FileSpreadsheet className={`${iconClass} text-green-500`} />;
      case 'jpg':
        return <FileImage className={`${iconClass} text-purple-500`} />;
      case 'zip':
        return <FileArchive className={`${iconClass} text-yellow-500`} />;
      case 'txt':
        return <FileText className={`${iconClass} text-muted-foreground`} />;
      default:
        return <Paperclip className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const [isExpanded, setIsExpanded] = useState(true);

  if (!attachments || attachments.length === 0) return null;

  return (
    <Card className="bg-background mt-2">
      <div className="p-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">All Attachments ({attachments.length})</h3>
          </div>
          <ChevronRight 
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              isExpanded ? "rotate-90" : ""
            )} 
          />
        </div>
        
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAttachment(attachment);
                }}
                title={`View ${attachment.fileName}`}
              >
                {getFileIcon(attachment.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" title={attachment.fileName}>
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {attachment.fileSize}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
