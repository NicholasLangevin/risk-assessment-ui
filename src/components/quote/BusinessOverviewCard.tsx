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
          <CardTitle>Business Overview</CardTitle>
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Key information about the insured's business.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold">Industry</h4>
          <p className="text-sm text-muted-foreground">{overview.industry}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Years in Business</h4>
          <p className="text-sm text-muted-foreground">{overview.yearsInBusiness}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Location</h4>
          <p className="text-sm text-muted-foreground">{overview.location}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Description</h4>
          <p className="text-sm text-muted-foreground">{overview.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
