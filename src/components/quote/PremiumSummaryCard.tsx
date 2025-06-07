import type { QuoteDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

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
        <div className="flex items-center justify-between">
          <CardTitle>Premium Summary</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Breakdown of the quote premium.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Net Premium:</span>
          <span className="font-medium">{formatCurrency(summary.netPremium)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Taxes & Fees:</span>
          <span className="font-medium">{formatCurrency(summary.taxesAndFees)}</span>
        </div>
        <hr className="my-2 border-border" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total Premium:</span>
          <span>{formatCurrency(summary.totalPremium)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
