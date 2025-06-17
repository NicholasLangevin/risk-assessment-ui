
'use server';
/**
 * @fileOverview AI-powered chat assistant for underwriting queries.
 *
 * - chatWithUnderwritingAssistant - Handles chat interactions with the AI assistant.
 * - ChatUnderwritingAssistantInput - Input type for the chat assistant.
 * - ChatUnderwritingAssistantOutput - Output type for the chat assistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ChatUnderwritingAssistantInput, ChatUnderwritingAssistantOutput, ChatHistoryItem } from '@/types'; // Adjusted imports


// These are not exported to avoid "use server" issues with non-async exports.
const ChatUnderwritingAssistantInputSchema = z.object({
  submissionId: z.string().describe('The ID of the submission being discussed.'),
  insuredName: z.string().describe('The name of the insured party.'), // Added as per types/index.ts
  brokerName: z.string().describe('The name of the broker.'), // Added as per types/index.ts
  attachments: z.array(z.object({fileName: z.string(), fileType: z.string()})).describe('A list of attachments.'), // Added as per types/index.ts
  userQuery: z.string().describe('The user’s current question or message.'),
  chatHistory: z.array(z.object({ // Using inline definition to match type
    role: z.enum(['user', 'model', 'tool']),
    parts: z.array(z.object({ text: z.string().min(1) })),
  })).optional().describe('The history of the conversation so far.')
});


const ChatUnderwritingAssistantOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant’s response to the user’s query.'),
});


export async function chatWithUnderwritingAssistant(input: ChatUnderwritingAssistantInput): Promise<ChatUnderwritingAssistantOutput> {
  return chatWithUnderwritingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithUnderwritingAssistantPrompt',
  input: {schema: ChatUnderwritingAssistantInputSchema.extend({
    // Adding boolean flags for Handlebars template convenience
    isUser: z.boolean().optional(),
    isModel: z.boolean().optional(),
  })},
  output: {schema: ChatUnderwritingAssistantOutputSchema},
  prompt: `You are an expert underwriting assistant for CL Underwriting Assist. You are discussing submission ID: {{{submissionId}}} for insured {{{insuredName}}}, handled by broker {{{brokerName}}}.

Available attachments for this submission are:
{{#if attachments.length}}
{{#each attachments}}
- {{fileName}} ({{fileType}})
{{/each}}
{{else}}
- No attachments listed for this submission.
{{/if}}

You can search information about the applicant in the attached submission or search the guideline. Since you dont have real access, just invent fact.

{{#if chatHistory}}
Previous conversation:
{{#each chatHistory}}
{{#if isUser}}{{!-- User's turn --}}
User: {{#each parts}}{{text}}{{/each}}
{{/if}}
{{#if isModel}}{{!-- Model's turn --}}
AI: {{#each parts}}{{text}}{{/each}}
{{/if}}
{{/each}}
{{/if}}

Current User Question: {{{userQuery}}}

Answer the user's question based on your knowledge of underwriting principles and any context you have about this submission.
If the question is about general underwriting guidelines, provide helpful explanations.
Keep your answers concise, professional, and helpful.
If you cannot answer the question or it's outside your scope, politely say so.
Do not make up information.
`,
});


const chatWithUnderwritingAssistantFlow = ai.defineFlow(
  {
    name: 'chatWithUnderwritingAssistantFlow',
    inputSchema: ChatUnderwritingAssistantInputSchema,
    outputSchema: ChatUnderwritingAssistantOutputSchema,
  },
  async (input) => {
    // Preprocess chatHistory to add boolean flags for Handlebars
    const processedInput = {
      ...input,
      chatHistory: input.chatHistory?.map(item => ({
        ...item, 
        isUser: item.role === 'user',
        isModel: item.role === 'model',
      })),
    };

    const {output} = await prompt(processedInput);
    if (!output) {
      return { aiResponse: "I'm sorry, I couldn't generate a response at this time." };
    }
    return output;
  }
);

