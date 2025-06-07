
'use server';
/**
 * @fileOverview AI agent to evaluate risk for a specific coverage type based on submission data.
 *
 * - evaluateCoverageRisk - Function to trigger the coverage risk evaluation.
 * - EvaluateCoverageRiskInput - Input type for the function.
 * - EvaluateCoverageRiskOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { RiskLevel } from '@/types';

const EvaluateCoverageRiskInputSchema = z.object({
  submissionData: z.string().describe('Comprehensive data related to the insurance submission, including business overview, industry, financials, and loss history.'),
  coverageType: z.string().describe('The specific type of insurance coverage being evaluated (e.g., "Property", "General Liability", "Cyber").'),
});
export type EvaluateCoverageRiskInput = z.infer<typeof EvaluateCoverageRiskInputSchema>;

const EvaluateCoverageRiskOutputSchema = z.object({
  aiRiskEvaluation: z.string().describe('A concise textual summary of the AI\'s risk assessment for this specific coverage, highlighting key risk factors and considerations. Should be 1-2 sentences.'),
  riskLevel: z.enum(['Very Low', 'Low', 'Normal', 'High', 'Very High']).describe('The overall categorical risk level determined by the AI for this coverage. Must be one of the provided enum values.'),
});
export type EvaluateCoverageRiskOutput = z.infer<typeof EvaluateCoverageRiskOutputSchema>;

export async function evaluateCoverageRisk(input: EvaluateCoverageRiskInput): Promise<EvaluateCoverageRiskOutput> {
  return evaluateCoverageRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCoverageRiskPrompt',
  input: {schema: EvaluateCoverageRiskInputSchema},
  output: {schema: EvaluateCoverageRiskOutputSchema},
  prompt: `You are an expert insurance underwriter. Your task is to evaluate the risk for a specific coverage type based on the provided submission data.

Submission Data:
\`\`\`
{{{submissionData}}}
\`\`\`

Coverage Type to Evaluate: {{{coverageType}}}

Based on the submission data, analyze the risk factors relevant to the "{{{coverageType}}}" coverage.
Provide:
1.  **aiRiskEvaluation**: A concise (1-2 sentences) textual summary of your risk assessment for this coverage. Highlight key drivers of risk.
2.  **riskLevel**: The overall categorical risk level. Choose exclusively from: 'Very Low', 'Low', 'Normal', 'High', 'Very High'.

Consider the nature of the insured's business, their operational characteristics, any relevant loss history, and general underwriting principles for the specified coverage type.
Focus solely on the risk associated with the "{{{coverageType}}}".

Return your response in the specified JSON format.
`,
});

const evaluateCoverageRiskFlow = ai.defineFlow(
  {
    name: 'evaluateCoverageRiskFlow',
    inputSchema: EvaluateCoverageRiskInputSchema,
    outputSchema: EvaluateCoverageRiskOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback in case AI fails to produce structured output
      return {
        aiRiskEvaluation: "Could not determine risk evaluation at this time.",
        riskLevel: "Normal" as RiskLevel,
      };
    }
    return output;
  }
);
