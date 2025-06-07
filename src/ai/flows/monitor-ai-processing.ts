// MonitorAIProcessing flow
'use server';

/**
 * @fileOverview Provides a real-time view of the AI's processing steps and reasoning for a submission.
 *
 * - monitorAiProcessing - A function that handles the monitoring of AI processing.
 * - MonitorAiProcessingInput - The input type for the monitorAiProcessing function.
 * - MonitorAiProcessingOutput - The return type for the monitorAiProcessing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonitorAiProcessingInputSchema = z.object({
  submissionId: z.string().describe('The ID of the submission being processed.'),
});
export type MonitorAiProcessingInput = z.infer<typeof MonitorAiProcessingInputSchema>;

const MonitorAiProcessingOutputSchema = z.object({
  processingSteps: z
    .array(z.string())
    .describe('A list of processing steps the AI has taken.'),
  reasoning: z.string().describe('The AI’s reasoning for its recommendations.'),
});
export type MonitorAiProcessingOutput = z.infer<typeof MonitorAiProcessingOutputSchema>;

export async function monitorAiProcessing(input: MonitorAiProcessingInput): Promise<MonitorAiProcessingOutput> {
  return monitorAiProcessingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monitorAiProcessingPrompt',
  input: {schema: MonitorAiProcessingInputSchema},
  output: {schema: MonitorAiProcessingOutputSchema},
  prompt: `You are monitoring the AI processing for submission ID {{{submissionId}}}.

    Provide a list of processing steps the AI has taken so far and the reasoning behind its recommendations.

    Format the response as a JSON object with 'processingSteps' as an array of strings and 'reasoning' as a string.
    `,
});

const monitorAiProcessingFlow = ai.defineFlow(
  {
    name: 'monitorAiProcessingFlow',
    inputSchema: MonitorAiProcessingInputSchema,
    outputSchema: MonitorAiProcessingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
