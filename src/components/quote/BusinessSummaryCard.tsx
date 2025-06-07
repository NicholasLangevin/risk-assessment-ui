
import type { BusinessSummaryDetails } from '@/types'; // Updated import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

interface BusinessSummaryCardProps {
  summary: BusinessSummaryDetails; // Updated prop type
}

export function BusinessSummaryCard({ summary }: BusinessSummaryCardProps) { // Renamed component, updated prop name
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Business Summary</CardTitle> {/* Updated title */}
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Key risk components of the insured's business.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1">Buildings</h4>
          <p className="text-sm text-muted-foreground">{summary.buildingsDescription}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Operations</h4>
          <p className="text-sm text-muted-foreground">{summary.operationsDescription}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Product/Service</h4>
          <p className="text-sm text-muted-foreground">{summary.productDescription}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Completed Operations Main Risks</h4>
          <p className="text-sm text-muted-foreground">{summary.completedOperationsRisk}</p>
        </div>
      </CardContent>
    </Card>
  );
}
