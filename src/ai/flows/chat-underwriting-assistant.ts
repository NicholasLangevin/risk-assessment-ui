
'use server';
/**
 * @fileOverview AI-powered chat assistant for underwriting queries, with intent detection and tool usage.
 *
 * - chatWithUnderwritingAssistant - Handles chat interactions with the AI assistant.
 * - ChatUnderwritingAssistantInput - Input type for the chat assistant.
 * - ChatUnderwritingAssistantOutput - Output type for the chat assistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { mockAttachments, mockAllPossibleGuidelines } from '@/lib/mockData';
import type { Attachment } from '@/types';

// Define schemas for chat history and input/output
const MessagePartSchema = z.object({
  text: z.string(),
});

const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(MessagePartSchema),
});

const ChatAttachmentInfoSchema = z.object({
  fileName: z.string().describe('The name of the attachment file.'),
  fileType: z.string().describe('The type of the attachment file (e.g., pdf, docx).')
});

const ChatUnderwritingAssistantInputSchema = z.object({
  submissionId: z.string().describe('The ID of the submission being discussed.'),
  insuredName: z.string().describe('The name of the insured party.'),
  brokerName: z.string().describe('The name of the broker.'),
  attachments: z.array(ChatAttachmentInfoSchema).describe('A list of attachments available for this submission.'),
  userQuery: z.string().describe('The user’s current question or message.'),
  chatHistory: z.array(ChatHistoryItemSchema).optional().describe('The history of the conversation so far.'),
});
export type ChatUnderwritingAssistantInput = z.infer<typeof ChatUnderwritingAssistantInputSchema>;

const ChatUnderwritingAssistantOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant’s response to the user’s query.'),
});
export type ChatUnderwritingAssistantOutput = z.infer<typeof ChatUnderwritingAssistantOutputSchema>;


// --- Define Genkit Tools ---

const readAttachmentContentTool = ai.defineTool(
  {
    name: 'readAttachmentContent',
    description: 'Reads the mock content of a specific attachment file related to the current submission. Use this if the user explicitly asks about the content of a document by its name.',
    inputSchema: z.object({
      fileName: z.string().describe('The full name of the attachment file to read (e.g., "Submission_Form_Completed.pdf"). This must be one of the available attachments for the submission.'),
    }),
    outputSchema: z.object({
      content: z.string().describe('The mock content of the attachment file.'),
    }),
  },
  async (input) => {
    // In a real app, you might fetch this from a storage service or database
    const attachment = mockAttachments.find((att: Attachment) => att.fileName.toLowerCase() === input.fileName.toLowerCase());
    if (attachment && attachment.mockContent) {
      return { content: attachment.mockContent };
    }
    return { content: `Attachment named "${input.fileName}" not found or has no mock content available.` };
  }
);

const getMockGuidelineContent = (guidelineName: string): string => {
    const lowerName = guidelineName.toLowerCase();
    if (lowerName.includes("exposure limits")) {
        return "The 'Exposure Limits' guideline details maximum insurable values per location and aggregate limits for catastrophic events. It ensures the company does not overexpose itself in any single event or region. Key sections include: Property Limits, Liability Caps, and CAT Aggregates.";
    }
    if (lowerName.includes("financial stability")) {
        return "The 'Financial Stability Check' guideline outlines criteria for assessing an insured's financial health. This includes reviewing balance sheets, income statements, credit ratings, and debt-to-equity ratios. The goal is to ensure the insured can meet premium obligations and manage their risks effectively.";
    }
    if (lowerName.includes("claims history")) {
        return "The 'Claims History Review' guideline mandates a thorough review of the applicant's loss runs for at least the past 5 years. Frequency, severity, and nature of claims are analyzed. Trends and corrective actions taken post-loss are key considerations.";
    }
    if (lowerName.includes("regulatory compliance")) {
        return "The 'Regulatory Compliance' guideline ensures that both the insured's operations and the proposed insurance policy adhere to all applicable local, national, and international laws and regulations. This includes sanctions checks and industry-specific compliance requirements.";
    }
    return `Details for '${guidelineName}': This guideline covers standard underwriting procedures for ${guidelineName}. It emphasizes thorough risk assessment and adherence to company policy. (This is mock content: Specific details depend on the full guideline document).`;
};

const searchUnderwritingGuidelinesTool = ai.defineTool(
  {
    name: 'searchUnderwritingGuidelines',
    description: 'Searches and retrieves information about specific underwriting guidelines. Use this if the user asks about underwriting rules, company policies, or specific guidelines by name or topic.',
    inputSchema: z.object({
      query: z.string().describe('Keywords or the name of the guideline the user is asking about (e.g., "exposure limits", "What are the financial stability criteria?").'),
    }),
    outputSchema: z.object({
      results: z.string().describe('A summary of relevant guideline information found, or a message if no specific guideline is found.'),
    }),
  },
  async (input) => {
    const lowerQuery = input.query.toLowerCase();
    const relevantGuidelines = mockAllPossibleGuidelines.filter(g =>
      g.name.toLowerCase().includes(lowerQuery) || lowerQuery.includes(g.name.toLowerCase())
    );

    if (relevantGuidelines.length > 0) {
      let results = "Found the following relevant guideline(s) based on your query:\n";
      relevantGuidelines.forEach(g => {
        results += `\nGuideline: ${g.name}\nSummary: ${getMockGuidelineContent(g.name)}\n`;
      });
      return { results };
    }
    return { results: `I couldn't find a specific underwriting guideline matching your query: "${input.query}". You can ask about general guideline topics or specific guideline names like "Exposure Limits", "Financial Stability Check", etc.` };
  }
);

// --- End Genkit Tools ---

export async function chatWithUnderwritingAssistant(input: ChatUnderwritingAssistantInput): Promise<ChatUnderwritingAssistantOutput> {
  return chatWithUnderwritingAssistantFlow(input);
}

// Define an extended schema for the prompt's input, including boolean flags for chat history items
const PromptInputSchema = ChatUnderwritingAssistantInputSchema.extend({
  chatHistory: z.array(
    ChatHistoryItemSchema.extend({
      isUser: z.boolean().optional(),
      isModel: z.boolean().optional(),
    })
  ).optional().describe('The history of the conversation so far, with added boolean flags for role.'),
});


const prompt = ai.definePrompt({
  name: 'chatWithUnderwritingAssistantPrompt',
  input: {schema: PromptInputSchema}, // Use the extended schema for the prompt
  output: {schema: ChatUnderwritingAssistantOutputSchema},
  tools: [readAttachmentContentTool, searchUnderwritingGuidelinesTool],
  prompt: `You are an expert underwriting assistant for RiskPilot.
You are currently discussing submission ID: {{{submissionId}}} for Insured: {{{insuredName}}}, Broker: {{{brokerName}}}.

Available attachments for this submission:
{{#if attachments.length}}
  {{#each attachments}}
- {{fileName}} (Type: {{fileType}})
  {{/each}}
{{else}}
- No attachments are listed for this submission.
{{/if}}

Your capabilities are:
1.  Answer questions specifically about the current submission (ID: {{{submissionId}}}), its details (like insured name, broker), or general aspects of it.
2.  If the user asks about the *content* of a specific attachment *by its name* from the list above, use the "readAttachmentContent" tool to get its content and then answer the question.
3.  If the user asks about general underwriting guidelines, rules, company policies, or specific guidelines by name or topic, use the "searchUnderwritingGuidelines" tool.
4.  If the user's question is not directly about this submission or underwriting guidelines (e.g., general knowledge, off-topic), politely respond with: "I'm sorry, I can't help with that. I can only answer questions about this specific submission (ID: {{{submissionId}}}) or search our underwriting guidelines."

{{#if chatHistory}}
Previous conversation:
{{#each chatHistory}}
  {{#if isUser}}
User: {{#each parts}}{{text}}{{/each}}
  {{/if}}
  {{#if isModel}}
AI: {{#each parts}}{{text}}{{/each}}
  {{/if}}
{{/each}}
{{/if}}

Current User Question: {{{userQuery}}}

Carefully consider the user's question and use your capabilities as described above. If using a tool, clearly state that you are retrieving information.
Do not make up information. Be concise, professional, and helpful.
Your response should be in the 'aiResponse' field.
`,
});


const chatWithUnderwritingAssistantFlow = ai.defineFlow(
  {
    name: 'chatWithUnderwritingAssistantFlow',
    inputSchema: ChatUnderwritingAssistantInputSchema, // Flow's external input remains the same
    outputSchema: ChatUnderwritingAssistantOutputSchema,
  },
  async (input) => {
    // Preprocess chatHistory to add boolean flags for Handlebars
    const processedChatHistory = input.chatHistory?.map(item => ({
      ...item,
      isUser: item.role === 'user',
      isModel: item.role === 'model',
    }));

    const promptInputPayload = {
      ...input,
      chatHistory: processedChatHistory,
    };

    const {output} = await prompt(promptInputPayload);
    if (!output) {
      return { aiResponse: "I'm sorry, I couldn't generate a response at this time. Please try again." };
    }
    return output;
  }
);
