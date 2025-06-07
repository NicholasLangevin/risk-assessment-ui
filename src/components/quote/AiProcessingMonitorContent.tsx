import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bot, Milestone } from 'lucide-react';

interface AiProcessingMonitorContentProps {
  steps: string[];
  reasoning: string;
}

export function AiProcessingMonitorContent({ steps, reasoning }: AiProcessingMonitorContentProps) {
  return (
    <div className="flex flex-col h-full pt-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Milestone className="mr-2 h-5 w-5 text-primary" />
        Processing Steps
      </h3>
      <ScrollArea className="flex-grow mb-4 pr-4 border rounded-md p-2">
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No processing steps available.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary font-medium mr-2">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      
      <Separator className="my-4" />
      
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        AI Reasoning
      </h3>
      <ScrollArea className="flex-grow pr-4 border rounded-md p-2">
        {reasoning ? (
          <p className="text-sm whitespace-pre-wrap">{reasoning}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No reasoning details available.</p>
        )}
      </ScrollArea>
    </div>
  );
}
