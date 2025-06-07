
import type { AiUnderwritingActions } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, FileQuestion, Bot } from 'lucide-react';

interface RecommendedActionsCardProps {
  actions: AiUnderwritingActions | null;
}

export function RecommendedActionsCard({ actions }: RecommendedActionsCardProps) {
  if (!actions) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI Recommended Actions</CardTitle>
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>Suggestions from the AI underwriting assistant.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading AI recommendations or none available...</p>
        </CardContent>
      </Card>
    );
  }

  // Filter out "Potential Subject-To Offers" as they are now in a separate card
  const hasInformationRequests = actions.informationRequests.length > 0;
  const hasOtherActions = actions.suggestedActions.filter(action => !action.toLowerCase().includes('decline')).length > 0;
  const hasDeclineAction = actions.suggestedActions.some(action => action.toLowerCase().includes('decline'));

  const noActionsToShow = !hasInformationRequests && !hasOtherActions && !hasDeclineAction;


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Recommended Actions</CardTitle>
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Suggestions from the AI underwriting assistant (excluding Subject-Tos).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {noActionsToShow && (
            <p className="text-muted-foreground">No specific actions (other than subject-tos) recommended by AI at this time.</p>
        )}

        {hasInformationRequests && (
          <div className="p-3 border rounded-md bg-card shadow-sm">
            <h3 className="text-sm font-semibold mb-2 flex items-center"><FileQuestion className="h-4 w-4 mr-2 text-primary" />Information Requests:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
              {actions.informationRequests.map((req, index) => (
                <li key={`info-${index}`}>{req}</li>
              ))}
            </ul>
          </div>
        )}
        
        {hasOtherActions && (
          <div className="p-3 border rounded-md bg-card shadow-sm">
            <h3 className="text-sm font-semibold mb-2 flex items-center"><Bot className="h-4 w-4 mr-2 text-primary"/>Other Suggested Actions:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
              {actions.suggestedActions.filter(action => !action.toLowerCase().includes('decline')).map((action, index) => (
                <li key={`action-${index}`}>{action}</li>
              ))}
            </ul>
          </div>
        )}

        {hasDeclineAction && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Recommendation: Decline</AlertTitle>
            <AlertDescription>
              {actions.suggestedActions.find(action => action.toLowerCase().includes('decline'))}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
