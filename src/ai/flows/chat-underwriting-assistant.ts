
'use server';
/**
 * @fileOverview AI-powered chat assistant for underwriting queries, with intent detection and tool usage.
 */

import { ai } from '@/ai/genkit';
import { generate, type GenerateResponseChunkData } from 'genkit'; // Correct Genkit v1.x import
import { z } from 'zod';
import type { MessageData, Part } from 'genkit/ai';
import { mockAttachments, mockAllPossibleGuidelines } from '@/lib/mockData';
import type { Attachment, ChatUnderwritingAssistantInput, ChatHistoryItem, ChatAttachmentInfo } from '@/types'; // Ensure types from @/types are used for exported function signature
import { ChatUnderwritingAssistantInputSchema, ChatHistoryItemSchema as TypesChatHistoryItemSchema } from '@/types'; // Import Zod schemas from @/types

// --- Define LOCAL Zod schemas for internal prompt structure ---
// These are not exported from this server actions file.

// Local history item schema for the prompt template, extending the one from @/types for template flags
const PromptChatHistoryItemSchema = TypesChatHistoryItemSchema.extend({
  isUser: z.boolean().optional(),
  isModel: z.boolean().optional(),
});

// Schema for the input data that the Handlebars prompt template will receive
const PromptInputSchemaForHandlebars = ChatUnderwritingAssistantInputSchema.extend({
  // Override chatHistory to use the PromptChatHistoryItemSchema for template logic
  chatHistory: z.array(PromptChatHistoryItemSchema).optional().describe('The history of the conversation, augmented for template use.'),
});

// Schema for the expected output from the AI model (used in ai.definePrompt)
const LocalChatUnderwritingAssistantOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant’s response to the user’s query.'),
});


// --- The ONLY EXPORTED function ---
export async function* chatWithUnderwritingAssistant(
  input: ChatUnderwritingAssistantInput // Type comes from @/types
): AsyncGenerator<GenerateResponseChunkData> {
  let submissionIdForErrorHandling = (input && typeof input.submissionId === 'string') ? input.submissionId : "UNKNOWN_SUBMISSION_ID";

  try {
    // --- Define Genkit Tools and Prompt INSIDE the try block ---
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
      async (toolInput) => {
        // Find in mockAttachments (which is Attachment[] from @/types)
        const attachment = mockAttachments.find((att: Attachment) => att.fileName.toLowerCase() === toolInput.fileName.toLowerCase());
        if (attachment && attachment.mockContent) {
          return { content: attachment.mockContent };
        }
        return { content: `Attachment named "${toolInput.fileName}" not found or has no mock content available.` };
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
      async (toolInput) => {
        const lowerQuery = toolInput.query.toLowerCase();
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
        return { results: `I couldn't find a specific underwriting guideline matching your query: "${toolInput.query}". You can ask about general guideline topics or specific guideline names like "Exposure Limits", "Financial Stability Check", etc.` };
      }
    );

    const chatAssistantPromptDefinition = ai.definePrompt(
      {
        name: 'chatWithUnderwritingAssistantPrompt',
        input: { schema: PromptInputSchemaForHandlebars },
        output: { schema: LocalChatUnderwritingAssistantOutputSchema },
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
      }
    );
    // --- End of internal definitions ---

    const { submissionId, insuredName, brokerName, attachments, userQuery, chatHistory } = input;
    submissionIdForErrorHandling = submissionId;

    // Convert ChatHistoryItem[] (from @/types) to MessageData[] (for Genkit)
    const modelHistory: MessageData[] = [];
    if (chatHistory) {
      for (const h of chatHistory) { // h is ChatHistoryItem from @/types
        const currentMessageParts: Part[] = [];
        if (h.parts) {
          for (const p of h.parts) { // p is MessagePart from @/types (which is {text?: string})
            if (typeof p.text === 'string' && p.text.trim() !== '') { // Ensure text is a non-empty string
              currentMessageParts.push({ text: p.text });
            }
          }
        }
        // Only add message to history if it has valid parts
        if (currentMessageParts.length > 0) {
          modelHistory.push({
            role: h.role as 'user' | 'model', // Cast role; 'tool' role parts are handled by Genkit
            parts: currentMessageParts,
          });
        }
      }
    }
    
    // Prepare input for the Handlebars template
    const templateInput = {
      submissionId,
      insuredName,
      brokerName,
      attachments, // This is ChatAttachmentInfo[] from @/types
      userQuery,
      // Augment chatHistory for template: ChatHistoryItem[] (from @/types) -> PromptChatHistoryItemSchema[]
      chatHistory: chatHistory?.map(item => ({
          ...item, // Spread parts from ChatHistoryItem
          isUser: item.role === 'user',
          isModel: item.role === 'model',
      })).filter(item => item.parts && item.parts.some(p => typeof p.text === 'string' && p.text.trim() !== '')), // Ensure history items for template also have content
    };

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: chatAssistantPromptDefinition,
      input: templateInput, // This will be validated against PromptInputSchemaForHandlebars
      tools: [readAttachmentContentTool, searchUnderwritingGuidelinesTool],
      history: modelHistory, // This is MessageData[]
      stream: true,
    });

    for await (const chunk of result.stream) {
      yield chunk;
    }

  } catch (error: any) {
    console.error(`Error in chatWithUnderwritingAssistant stream for submission ${submissionIdForErrorHandling}. Original error object:`, error);
    if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        if (error.stack) {
            console.error('Error stack:', error.stack);
        }
    } else if (typeof error === 'object' && error !== null) {
        let errorDetails: { [key: string]: any } = {};
        for (const propName of Object.getOwnPropertyNames(error)) {
            errorDetails[propName] = error[propName];
        }
        console.error('Error details (JSON):', JSON.stringify(errorDetails, null, 2));
        if (Object.keys(errorDetails).length === 0) {
            console.error('Error object has no enumerable properties. Stringified:', String(error));
        }
    } else {
        console.error('Error is not an object or Error instance. Stringified:', String(error));
    }

    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'An unknown error occurred while processing your request.');
    const errorChunk: GenerateResponseChunkData = {
      index: 0,
      choices: [{
        index: 0,
        delta: {
          role: 'model',
          content: [{ text: `Server Error: ${errorMessage}` }], // Genkit v1.x delta content structure
        },
        finishReason: 'error',
        custom: { type: 'error', error: errorMessage }
      }],
    };
    yield errorChunk;
  }
}

    