
'use server';
/**
 * @fileOverview AI agent to generate underwriting decision emails.
 *
 * - generateUnderwritingEmail - Function to trigger email content generation.
 * - EmailGenerationInput - Input type for the function.
 * - EmailGenerationOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { EmailGenerationInput, EmailGenerationOutput, UnderwritingDecision } from '@/types';

const UnderwritingDecisionEnum = z.enum(['Decline', 'OfferWithSubjectTos', 'InformationRequired']);

const EmailGenerationInputSchema = z.object({
  decision: UnderwritingDecisionEnum.describe('The underwriting decision taken.'),
  quoteId: z.string().describe('The ID of the quote.'),
  insuredName: z.string().describe('The name of the insured party.'),
  brokerName: z.string().describe('The name of the broker.'),
  premium: z.number().optional().describe('The total premium amount, if an offer is being made.'),
  subjectToOffers: z.array(z.string()).optional().describe('A list of subject-to conditions if an offer is being made.'),
  informationRequests: z.array(z.string()).optional().describe('A list of information requests if further information is needed.'),
});

const EmailGenerationOutputSchema = z.object({
  emailSubject: z.string().describe('The suggested subject line for the email.'),
  emailBody: z.string().describe('The suggested body content for the email.'),
});

// Export types for use in client components, matching the Zod schema structure.
export type { EmailGenerationInput, EmailGenerationOutput };


export async function generateUnderwritingEmail(input: EmailGenerationInput): Promise<EmailGenerationOutput> {
  return generateUnderwritingEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUnderwritingEmailPrompt',
  input: {schema: EmailGenerationInputSchema},
  output: {schema: EmailGenerationOutputSchema},
  prompt: `You are an expert underwriting support assistant for RiskPilot.
Your task is to draft a professional email to the broker ({{brokerName}}) regarding quote ID {{quoteId}} for the insured ({{insuredName}}).
The decision made is: {{decision}}.

Base the email content STRICTLY on the decision:

{{#if (eq decision "OfferWithSubjectTos")}}
Compose an email offering the quote.
The total premium is \${{premium}}.
The offer is subject to the following conditions:
{{#each subjectToOffers}}
- {{{this}}}
{{/each}}
Ensure the tone is positive and clear about the offer and its conditions.
The subject line should be: "Offer for Quote {{quoteId}} - {{insuredName}}"
{{/if}}

{{#if (eq decision "InformationRequired")}}
Compose an email requesting further information.
We require the following to proceed with the evaluation:
{{#each informationRequests}}
- {{{this}}}
{{/each}}
Ensure the tone is polite and clearly lists the required items.
The subject line should be: "Information Required for Quote {{quoteId}} - {{insuredName}}"
{{/if}}

{{#if (eq decision "Decline")}}
Compose a polite email declining the quote.
Provide a brief, general reason for the declination without going into excessive specifics (e.g., "After careful review, we are unable to offer terms for this risk at this time as it does not meet our current underwriting appetite.").
Do not list specific guideline failures.
The subject line should be: "Update on Quote {{quoteId}} - {{insuredName}}"
{{/if}}

The email should be professional, concise, and addressed to the broker. Start with "Dear {{brokerName}}," and end with a professional closing like "Sincerely,\nThe RiskPilot Underwriting Team".
Structure the email with clear paragraphs.
Return the subject line and body in the specified JSON format.
`,
});

const generateUnderwritingEmailFlow = ai.defineFlow(
  {
    name: 'generateUnderwritingEmailFlow',
    inputSchema: EmailGenerationInputSchema,
    outputSchema: EmailGenerationOutputSchema,
  },
  async (input) => {
    // Helper for Handlebars `eq`
    const handlebarsOptions = {
      helpers: {
        eq: (arg1: string, arg2: string) => arg1 === arg2,
      }
    };

    const {output} = await prompt(input, handlebarsOptions);
    if (!output) {
      // Fallback in case AI fails
      return {
        emailSubject: `Regarding Quote ${input.quoteId}`,
        emailBody: `Dear ${input.brokerName},\n\nWe are writing to you regarding quote ${input.quoteId} for ${input.insuredName}.\n\n[AI failed to generate specific content based on decision: ${input.decision}. Please draft manually.]\n\nSincerely,\nThe RiskPilot Underwriting Team`,
      };
    }
    return output;
  }
);
