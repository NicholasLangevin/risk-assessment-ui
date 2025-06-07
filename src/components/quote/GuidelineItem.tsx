
'use client';

import React, { useState } from 'react';
import type { Guideline } from '@/types';
import { CheckCircle, AlertCircle, HelpCircle, XCircle, ListChecks, MoreVertical, Edit3, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface GuidelineItemProps {
  guideline: Guideline;
  onUpdateGuideline: (id: string, status: Guideline['status'], details?: string) => void;
  onViewDetails: (guideline: Guideline) => void; // Callback to open details in parent
}

export function GuidelineItem({ guideline, onUpdateGuideline, onViewDetails }: GuidelineItemProps) {
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState(guideline.details || '');
  const [statusToUpdate, setStatusToUpdate] = useState<Guideline['status'] | null>(null);

  const getStatusIcon = () => {
    switch (guideline.status) {
      case 'Compliant':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Needs Clarification':
        return <HelpCircle className="h-5 w-5 text-yellow-600" />;
      case 'Issue Found':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'Not Applicable':
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <ListChecks className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: Guideline['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
     switch (status) {
      case 'Compliant':
        return 'default';
      case 'Needs Clarification':
        return 'secondary';
      case 'Issue Found':
        return 'destructive';
      case 'Not Applicable':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleStatusSelection = (newStatus: Guideline['status']) => {
    if (newStatus === 'Needs Clarification' || newStatus === 'Issue Found') {
      setStatusToUpdate(newStatus);
      setFeedbackText(guideline.status === newStatus ? guideline.details || '' : '');
      setIsFeedbackDialogOpen(true);
    } else {
      onUpdateGuideline(guideline.id, newStatus, undefined);
    }
  };

  const handleSaveFeedback = () => {
    if (statusToUpdate) {
      onUpdateGuideline(guideline.id, statusToUpdate, feedbackText);
    }
    setIsFeedbackDialogOpen(false);
    setStatusToUpdate(null);
  };

  const openEditDialog = () => {
    setStatusToUpdate(guideline.status);
    setFeedbackText(guideline.details || '');
    setIsFeedbackDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-start space-x-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
        <button onClick={() => onViewDetails(guideline)} className="flex-shrink-0 mt-0.5 cursor-pointer focus:outline-none" aria-label={`View details for ${guideline.name}`}>
          {getStatusIcon()}
        </button>
        <div onClick={() => onViewDetails(guideline)} className="flex-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{guideline.name}</p>
            <Badge variant={getStatusVariant(guideline.status)} className="text-xs">{guideline.status}</Badge>
          </div>
          {guideline.details && guideline.details.length <= 70 && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{guideline.details}</p>
          )}
          {guideline.details && guideline.details.length > 70 && (
             <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                   <p className="text-xs text-muted-foreground mt-1 truncate">{guideline.details}</p>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-xs break-words p-2">
                  <p className="text-xs">{guideline.details}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 ml-auto">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(guideline)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            {(['Compliant', 'Needs Clarification', 'Issue Found', 'Not Applicable'] as Guideline['status'][]).map(statusValue => (
              <DropdownMenuItem key={statusValue} onClick={() => handleStatusSelection(statusValue)} disabled={guideline.status === statusValue}>
                {statusValue}
              </DropdownMenuItem>
            ))}
            {(guideline.status === 'Needs Clarification' || guideline.status === 'Issue Found') && guideline.details && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openEditDialog}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {statusToUpdate === 'Issue Found' ? 'Describe Issue' : 'Provide Clarification'}
            </DialogTitle>
            <DialogDescription>
              Please provide details for the status: {statusToUpdate}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedback" className="text-right col-span-1">
                Details
              </Label>
              <Textarea
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="col-span-3"
                placeholder={statusToUpdate === 'Issue Found' ? 'Explain what went wrong...' : 'Enter clarification notes...'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFeedback}>Save Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
