import type { Guideline } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuidelineItem } from './GuidelineItem';
import { ListChecks } from 'lucide-react';

interface GuidelineStatusListProps {
  guidelines: Guideline[];
}

export function GuidelineStatusList({ guidelines }: GuidelineStatusListProps) {
  return (
    <Card>
      <CardHeader>
         <div className="flex items-center justify-between">
          <CardTitle>Guideline Status</CardTitle>
          <ListChecks className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Compliance status of underwriting guidelines.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {guidelines.length === 0 ? (
          <p className="p-6 text-muted-foreground">No guidelines evaluated for this submission.</p>
        ) : (
          <ScrollArea className="h-[300px] w-full">
            <div className="divide-y divide-border">
              {guidelines.map((guideline) => (
                <GuidelineItem key={guideline.id} guideline={guideline} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
