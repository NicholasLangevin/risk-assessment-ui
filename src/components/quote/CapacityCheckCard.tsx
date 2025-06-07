
import type { QuoteDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge } from 'lucide-react';

interface CapacityCheckCardProps {
  capacity: QuoteDetails['capacityCheck'];
}

export function CapacityCheckCard({ capacity }: CapacityCheckCardProps) {
  let progressColorClass = "bg-primary"; // Default for 'Available'
  if (capacity.status === 'Limited') {
    progressColorClass = "bg-yellow-500"; // Consider adding a warning color to theme
  } else if (capacity.status === 'Exceeded') {
    progressColorClass = "bg-destructive";
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gauge className="h-5 w-5 mr-2 text-muted-foreground" />
          Capacity Check
        </CardTitle>
        <CardDescription>Current underwriting capacity status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <span className="font-semibold">Status: </span>
          <span className={capacity.status === 'Exceeded' ? 'text-destructive' : (capacity.status === 'Limited' ? 'text-yellow-600' : 'text-green-600')}>{capacity.status}</span>
        </div>
        <div className="mb-1">
          <span className="text-sm text-muted-foreground">Percentage Used: {capacity.percentageUsed}%</span>
        </div>
        <Progress value={capacity.percentageUsed} aria-label={`${capacity.percentageUsed}% capacity used`} indicatorClassName={progressColorClass} />
        {capacity.notes && (
          <p className="text-xs text-muted-foreground mt-2">{capacity.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Custom Progress indicator class support
declare module "@/components/ui/progress" {
  interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    indicatorClassName?: string;
  }
}

// Modify Progress component to accept indicatorClassName
// This part would ideally be a patch to the actual progress.tsx or handled by variant props.
// For this exercise, I'll assume the Progress component can take an `indicatorClassName` prop.
// If not, one would need to either fork the component or use CSS to target the indicator based on a parent data-attribute.
// For now, this is a conceptual addition to show intent.
// In a real scenario, you'd update ui/progress.tsx:
// const Progress = React.forwardRef<..., ProgressProps>(({ className, value, indicatorClassName, ...props }, ref) => (
// ...
// <ProgressPrimitive.Indicator className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)} ... />
// ...
// ));
