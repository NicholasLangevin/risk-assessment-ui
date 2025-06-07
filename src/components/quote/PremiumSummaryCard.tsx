
import type { QuoteDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react';

interface PremiumSummaryCardProps {
  summary: QuoteDetails['premiumSummary'];
}

export function PremiumSummaryCard({ summary }: PremiumSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <DollarSign className="h-5 w-5 mr-2" />
          Premium Recommendation
        </CardTitle>
        <CardDescription>Details from Contact2.0 policy system.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          {summary.status === 'Pass' ? (
            <span className="font-semibold text-green-600 ml-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Pass
            </span>
          ) : (
            <span className="font-semibold text-yellow-600 dark:text-yellow-500 ml-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Missing Information from Contact2.0
            </span>
          )}
        </div>
        
        <div className="pt-1">
          <p className="text-sm text-muted-foreground mb-0.5">Recommended Premium:</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.recommendedPremium)}</p>
        </div>

        <Button variant="link" asChild className="p-0 h-auto text-sm !mt-3">
          <a href={summary.contactSystemLink} target="_blank" rel="noopener noreferrer">
            View in Contact2.0
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

