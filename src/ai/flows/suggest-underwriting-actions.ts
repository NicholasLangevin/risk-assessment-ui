// This is a server-side file.
'use server';

/**
 * @fileOverview AI-powered agent that suggests optimal underwriting actions based on submission data.
 *
 * - suggestUnderwritingActions - The main function to trigger the underwriting action suggestions.
 * - SuggestUnderwritingActionsInput - The input type for the suggestUnderwritingActions function.
 * - SuggestUnderwritingActionsOutput - The output type for the suggestUnderwritingActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the underwriting action suggestions.
const SuggestUnderwritingActionsInputSchema = z.object({
  submissionData: z
    .string()
    .describe('Comprehensive data related to the insurance submission.'),
});

export type SuggestUnderwritingActionsInput = z.infer<
  typeof SuggestUnderwritingActionsInputSchema
>;

// Define the output schema for the underwriting action suggestions.
const SuggestUnderwritingActionsOutputSchema = z.object({
  suggestedActions: z
    .array(z.string())
    .describe('List of suggested underwriting actions.'),
  informationRequests: z
    .array(z.string())
    .describe('List of suggested information requests.'),
  potentialSubjectToOffers: z
    .array(z.string())
    .describe('List of potential subject-to offers.'),
});

export type SuggestUnderwritingActionsOutput = z.infer<
  typeof SuggestUnderwritingActionsOutputSchema
>;

// Exported function to suggest underwriting actions
export async function suggestUnderwritingActions(
  input: SuggestUnderwritingActionsInput
): Promise<SuggestUnderwritingActionsOutput> {
  return suggestUnderwritingActionsFlow(input);
}

// Define the prompt for the AI model.
const prompt = ai.definePrompt({
  name: 'suggestUnderwritingActionsPrompt',
  input: {schema: SuggestUnderwritingActionsInputSchema},
  output: {schema: SuggestUnderwritingActionsOutputSchema},
  prompt: `You are an experienced insurance underwriter. Analyze the following submission data and suggest optimal underwriting actions, information requests, and potential subject-to offers to streamline the evaluation process and make faster decisions.

Submission Data: {{{submissionData}}}

Consider factors such as risk assessment, compliance, and profitability.

Format your output as a JSON object with 'suggestedActions', 'informationRequests', and 'potentialSubjectToOffers' fields, each containing a list of strings.
`,
});

// Define the Genkit flow for suggesting underwriting actions.
const suggestUnderwritingActionsFlow = ai.defineFlow(
  {
    name: 'suggestUnderwritingActionsFlow',
    inputSchema: SuggestUnderwritingActionsInputSchema,
    outputSchema: SuggestUnderwritingActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
