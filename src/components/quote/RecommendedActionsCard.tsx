
import type { AiUnderwritingActions } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, Bot } from 'lucide-react'; // Removed FileQuestion, CheckSquare

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

  // Filter out specific action types handled elsewhere (Information Requests, Subject-To Offers)
  const hasOtherActions = actions.suggestedActions.filter(action => !action.toLowerCase().includes('decline')).length > 0;
  const hasDeclineAction = actions.suggestedActions.some(action => action.toLowerCase().includes('decline'));

  const noActionsToShow = !hasOtherActions && !hasDeclineAction;


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Recommended Next Steps</CardTitle>
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>General next steps suggested by the AI assistant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {noActionsToShow && (
            <p className="text-muted-foreground">No specific next steps recommended by AI at this time.</p>
        )}
        
        {hasOtherActions && (
          <div className="p-3 border rounded-md bg-card shadow-sm">
            <h3 className="text-sm font-semibold mb-2 flex items-center"><Bot className="h-4 w-4 mr-2 text-primary"/>Suggested Actions:</h3>
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
