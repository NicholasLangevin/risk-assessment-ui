
'use client';

import React, { useState } from 'react';
import type { Guideline } from '@/types';
import { CheckCircle, AlertCircle, HelpCircle, XCircle, ListChecks, MoreVertical, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  DialogTrigger, // We might not need DialogTrigger directly here if controlled
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GuidelineDetailsContent } from './GuidelineDetailsContent';
import { cn } from '@/lib/utils';

interface GuidelineItemProps {
  guideline: Guideline;
  onUpdateGuideline: (id: string, status: Guideline['status'], details?: string) => void;
}

export function GuidelineItem({ guideline, onUpdateGuideline }: GuidelineItemProps) {
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
      setFeedbackText(guideline.status === newStatus ? guideline.details || '' : ''); // Keep existing details if same status, else clear
      setIsFeedbackDialogOpen(true);
    } else {
      onUpdateGuideline(guideline.id, newStatus, undefined); // No details for compliant/NA
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

  const itemContent = (
    <div className="flex items-start space-x-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <SheetTrigger asChild>
        <div className="flex-shrink-0 mt-0.5 cursor-pointer">{getStatusIcon()}</div>
      </SheetTrigger>
      <SheetTrigger asChild>
        <div className="flex-1 cursor-pointer">
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
      </SheetTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 ml-auto">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
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
  );

  return (
    <>
      <Sheet>
        {/* SheetTrigger is handled inside itemContent for specific clickable areas */}
        {itemContent}
        <SheetContent
          side="right"
          className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 flex flex-col"
          aria-describedby={undefined}
        >
          <SheetHeader className="p-6 border-b flex-shrink-0">
            <SheetTitle className="truncate max-w-full">Guideline: {guideline.name}</SheetTitle>
            <SheetDescription>
              Detailed information and criteria for the "{guideline.name}" underwriting guideline. Current status: {guideline.status}.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <GuidelineDetailsContent guideline={guideline} />
          </div>
        </SheetContent>
      </Sheet>

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
