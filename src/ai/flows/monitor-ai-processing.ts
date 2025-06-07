
'use server';

/**
 * @fileOverview Provides a structured log of AI tool actions for a submission.
 *
 * - monitorAiProcessing - A function that retrieves the AI tool action log.
 * - MonitorAiProcessingInput - The input type for the monitorAiProcessing function.
 * - MonitorAiProcessingOutput - The return type for the monitorAiProcessing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AiToolAction } from '@/types'; // Import for type safety if needed, though schema defines output

const MonitorAiProcessingInputSchema = z.object({
  submissionId: z.string().describe('The ID of the submission being processed.'),
});
export type MonitorAiProcessingInput = z.infer<typeof MonitorAiProcessingInputSchema>;

const AiToolActionDetailsSchema = z.object({
  targetName: z.string().optional().describe("The name of the item being interacted with (e.g., attachment filename, guideline name, or text of a subject-to)."),
  url: z.string().url().optional().describe("The URL, if the action involves a web resource."),
  query: z.string().optional().describe("The search query used, if the action is a web search."),
  actionSummary: z.string().optional().describe("A brief summary if the action is of a generic 'PerformingAction' type.")
}).describe("Specific details related to the action type.");

const AiToolActionSchema = z.object({
  id: z.string().describe("A unique identifier for this action step (e.g., \"step-1\")."),
  type: z.enum(['ReadingAttachment', 'SearchingWeb', 'PerformingAction', 'ReadingGuideline']).describe("The type of AI tool action taken."),
  timestamp: z.string().datetime({ message: "Timestamp must be a valid ISO 8601 date-time string." }).describe("ISO 8601 timestamp of when the action occurred (e.g., \"2024-05-15T14:30:00Z\")."),
  description: z.string().describe("A human-readable description of what the AI tool did."),
  details: AiToolActionDetailsSchema.describe("Structured details about the action.")
});

const MonitorAiProcessingOutputSchema = z.object({
  aiToolActions: z.array(AiToolActionSchema).describe('A list of actions taken by the AI tools, in chronological order.')
});
export type MonitorAiProcessingOutput = z.infer<typeof MonitorAiProcessingOutputSchema>;


export async function monitorAiProcessing(input: MonitorAiProcessingInput): Promise<MonitorAiProcessingOutput> {
  return monitorAiProcessingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monitorAiProcessingPrompt',
  input: {schema: MonitorAiProcessingInputSchema},
  output: {schema: MonitorAiProcessingOutputSchema},
  prompt: `You are an AI assistant that logs the operational steps of an underwriting AI agent.
For submission ID {{{submissionId}}}, detail the sequence of tool interactions performed by the agent.
Each interaction should be an object with the following fields:
- "id": A unique string identifier for this step (e.g., "step-1", "step-2").
- "type": The type of tool interaction. Choose from:
    - "ReadingAttachment": When the agent reads a document.
    - "SearchingWeb": When the agent searches the web.
    - "PerformingAction": When the agent makes a decision or proposes something (e.g., a subject-to).
    - "ReadingGuideline": When the agent consults an underwriting guideline.
- "timestamp": An ISO 8601 formatted timestamp (e.g., "2024-05-15T14:30:00Z").
- "description": A concise, human-readable sentence describing what the AI agent did.
- "details": An object containing specific data about the interaction:
    - For "ReadingAttachment": { "targetName": "filename.pdf" }
    - For "SearchingWeb": { "url": "https://www.example.com/search-results", "query": "search terms", "targetName": "www.example.com (use hostname for targetName)" }
    - For "PerformingAction": { "actionSummary": "Proposed subject-to offer: Proof of insurance for sub-contractors.", "targetName": "Subject-to: Proof of insurance for sub-contractors." }
    - For "ReadingGuideline": { "targetName": "Guideline: Financial Stability Ratios" }

Your output MUST be a JSON object with a single key "aiToolActions", which is an array of these action objects, ordered chronologically.

Example for a few steps:
{
  "aiToolActions": [
    {
      "id": "step-1",
      "type": "ReadingAttachment",
      "timestamp": "2024-05-15T10:00:00Z",
      "description": "AI analyzed the 'submission_form_main.pdf' for initial risk factors.",
      "details": { "targetName": "submission_form_main.pdf" }
    },
    {
      "id": "step-2",
      "type": "SearchingWeb",
      "timestamp": "2024-05-15T10:05:00Z",
      "description": "AI searched for recent news regarding 'Innovate Corp'.",
      "details": { "url": "https://news.example.com/search?q=Innovate+Corp+recent", "query": "Innovate Corp recent news", "targetName": "news.example.com" }
    },
    {
      "id": "step-3",
      "type": "ReadingGuideline",
      "timestamp": "2024-05-15T10:10:00Z",
      "description": "AI consulted the 'Cybersecurity Protocols' guideline.",
      "details": { "targetName": "Guideline: Cybersecurity Protocols" }
    },
    {
      "id": "step-4",
      "type": "PerformingAction",
      "timestamp": "2024-05-15T10:15:00Z",
      "description": "AI proposed a subject-to offer regarding SOC2 compliance.",
      "details": { "actionSummary": "Proposed: Subject to SOC2 Type II report.", "targetName": "Subject to SOC2 Type II report." }
    }
  ]
}

Generate the actions for submission ID {{{submissionId}}}. Ensure timestamps are chronological and unique for each step.
Return AT LEAST 3 actions and NO MORE THAN 7 actions.
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
    if (!output?.aiToolActions) {
        // Fallback or error handling if AI doesn't return expected structure
        return { aiToolActions: [] };
    }
    return output;
  }
);
