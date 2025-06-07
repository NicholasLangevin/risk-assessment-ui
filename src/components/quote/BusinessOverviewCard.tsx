
import type { QuoteDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

interface BusinessOverviewCardProps {
  overview: QuoteDetails['businessOverview'];
}

export function BusinessOverviewCard({ overview }: BusinessOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Business Summary</CardTitle>
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Key risk components of the insured's business.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1">Buildings</h4>
          <p className="text-sm text-muted-foreground">{overview.buildingsDescription}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Operations</h4>
          <p className="text-sm text-muted-foreground">{overview.operationsDescription}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Product/Service</h4>
          <p className="text-sm text-muted-foreground">{overview.productDescription}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Completed Operations Main Risks</h4>
          <p className="text-sm text-muted-foreground">{overview.completedOperationsRisk}</p>
        </div>
      </CardContent>
    </Card>
  );
}
