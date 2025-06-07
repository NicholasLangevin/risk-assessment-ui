
'use client';

import type { CoverageItem, RiskLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldHalf, Shield } from 'lucide-react'; // Example icons
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CoverageRequestedCardProps {
  coverages: CoverageItem[];
}

const getRiskLevelVariant = (riskLevel: RiskLevel): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (riskLevel) {
    case 'Very Low':
    case 'Low':
      return 'default'; // Uses primary theme color (greenish by default if primary is green)
    case 'Normal':
      return 'secondary';
    case 'High':
      return 'outline'; // Uses accent theme color (typically for warnings)
    case 'Very High':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getRiskLevelIcon = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case 'Very Low':
      return <ShieldCheck className="h-4 w-4 text-green-600" />;
    case 'Low':
      return <ShieldHalf className="h-4 w-4 text-green-500" />;
    case 'Normal':
      return <Shield className="h-4 w-4 text-blue-500" />; // Use a more distinct color for normal if possible
    case 'High':
      return <ShieldAlert className="h-4 w-4 text-yellow-600" />;
    case 'Very High':
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    default:
      return <ShieldQuestion className="h-4 w-4 text-muted-foreground" />;
  }
};

// Tailwind classes for High risk level badge, if theme doesn't provide a good warning variant
const highRiskBadgeClass = "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700";

export function CoverageRequestedCard({ coverages }: CoverageRequestedCardProps) {
  if (!coverages || coverages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coverages Requested</CardTitle>
          <CardDescription>Details of the insurance coverages requested in this submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No specific coverages listed for this submission.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coverages Requested</CardTitle>
        <CardDescription>AI-assisted risk evaluation for each requested coverage.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full"> {/* Adjust height as needed */}
          <div className="divide-y divide-border">
            {coverages.map((coverage, index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-md font-semibold text-primary">{coverage.type}</h4>
                    <p className="text-sm text-muted-foreground">Limits: {coverage.limits}</p>
                  </div>
                  <Badge 
                    variant={getRiskLevelVariant(coverage.riskLevel)}
                    className={cn(coverage.riskLevel === 'High' ? highRiskBadgeClass : '')}
                  >
                    {getRiskLevelIcon(coverage.riskLevel)}
                    <span className="ml-1.5">{coverage.riskLevel}</span>
                  </Badge>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">AI Risk Evaluation:</h5>
                  <p className="text-sm text-foreground/80 bg-muted/30 p-2 rounded-md border border-muted/50">
                    {coverage.aiRiskEvaluation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
