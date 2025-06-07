
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

const MessagePartSchema = z.object({
  text: z.string(),
});

const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(MessagePartSchema),
});

export const ChatUnderwritingAssistantInputSchema = z.object({
  submissionId: z.string().describe('The ID of the submission being discussed.'),
  userQuery: z.string().describe('The user’s current question or message.'),
  chatHistory: z.array(ChatHistoryItemSchema).optional().describe('The history of the conversation so far.')
});
export type ChatUnderwritingAssistantInput = z.infer<typeof ChatUnderwritingAssistantInputSchema>;

export const ChatUnderwritingAssistantOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant’s response to the user’s query.'),
});
export type ChatUnderwritingAssistantOutput = z.infer<typeof ChatUnderwritingAssistantOutputSchema>;

export async function chatWithUnderwritingAssistant(input: ChatUnderwritingAssistantInput): Promise<ChatUnderwritingAssistantOutput> {
  return chatWithUnderwritingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithUnderwritingAssistantPrompt',
  input: {schema: ChatUnderwritingAssistantInputSchema},
  output: {schema: ChatUnderwritingAssistantOutputSchema},
  prompt: `You are an expert underwriting assistant for RiskPilot. You are discussing submission ID: {{{submissionId}}}.

{{#if chatHistory}}
Previous conversation:
{{#each chatHistory}}
{{#if (eq role "user")}}{{!-- User's turn --}}
User: {{#each parts}}{{text}}{{/each}}
{{/if}}
{{#if (eq role "model")}}{{!-- Model's turn --}}
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
    const {output} = await prompt(input);
    if (!output) {
      return { aiResponse: "I'm sorry, I couldn't generate a response at this time." };
    }
    return output;
  }
);
