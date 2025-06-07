
import type { Guideline } from '@/types';
import { CheckCircle, AlertCircle, HelpCircle, XCircle, ListChecks } from 'lucide-react';
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
import { GuidelineDetailsContent } from './GuidelineDetailsContent';
import { cn } from '@/lib/utils';


interface GuidelineItemProps {
  guideline: Guideline;
}

export function GuidelineItem({ guideline }: GuidelineItemProps) {
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
  }

  const itemContent = (
    <div className="flex items-start space-x-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
      <div className="flex-1">
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
    </div>
  );
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {itemContent}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 flex flex-col"
        aria-describedby={undefined} // Remove default aria-describedby if SheetDescription is conditional or complex
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
  );
}
