import type { Guideline } from '@/types';
import { CheckCircle, AlertCircle, HelpCircle, XCircle, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
        return 'default'; // Or a success variant
      case 'Needs Clarification':
        return 'secondary'; // Consider a warning variant
      case 'Issue Found':
        return 'destructive';
      case 'Not Applicable':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  const item = (
    <div className="flex items-start space-x-3 p-3 border-b last:border-b-0">
      <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{guideline.name}</p>
          <Badge variant={getStatusVariant(guideline.status)} className="text-xs">{guideline.status}</Badge>
        </div>
        {guideline.details && (
          <p className="text-xs text-muted-foreground mt-1">{guideline.details}</p>
        )}
      </div>
    </div>
  );
  
  if (guideline.details && guideline.details.length > 50) { // Only show tooltip for long details
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {item}
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-xs break-words">
            <p>{guideline.details}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return item;
}
