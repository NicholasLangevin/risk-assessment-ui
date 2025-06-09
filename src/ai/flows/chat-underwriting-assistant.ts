
'use server';
/**
 * @fileOverview A specialized AI assistant for underwriting tasks within RiskPilot.
 * It answers questions about a specific insurance submission and general underwriting guidelines.
 *
 * - chatWithUnderwritingAssistant - The main exported function to interact with the assistant.
 * - ChatUnderwritingAssistantInput - Expected input structure.
 * - ChatUnderwritingAssistantOutput - Expected output structure.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { MessageData, Part } from 'genkit'; // Import Genkit specific types
import type {
  ChatUnderwritingAssistantInput,
  ChatUnderwritingAssistantOutput,
  ChatHistoryItem, // Used for input processing
  ChatAttachmentInfo // Used for input processing
} from '@/types';
import { ChatUnderwritingAssistantOutputSchema, ChatUnderwritingAssistantInputSchema } from '@/types';

// Schemas for the tools
const ReadAttachmentInputSchema = z.object({
  fileName: z.string().describe("The full name of the attachment file to read (e.g., \"Submission_Form_Completed.pdf\"). This must be one of the available attachments for the submission."),
});
const ReadAttachmentOutputSchema = z.object({
  content: z.string().describe("The mock content of the attachment file. If not found, a message indicating so."),
});

const SearchGuidelinesInputSchema = z.object({
  query: z.string().describe("Keywords or the name of the guideline the user is asking about (e.g., \"exposure limits\", \"What are the financial stability criteria?\")."),
});
const SearchGuidelinesOutputSchema = z.object({
  results: z.string().describe("A summary of relevant guideline information found, or a message if no specific guideline is found."),
});

// Internal Zod schema for the data object that will be passed to the Handlebars prompt template.
// This extends the main input schema to add formatted fields for the template.
const PromptTemplateInputSchema = ChatUnderwritingAssistantInputSchema.extend({
  formattedAttachments: z.string(),
  formattedChatHistory: z.string(),
});


export async function chatWithUnderwritingAssistant(
  input: ChatUnderwritingAssistantInput
): Promise<ChatUnderwritingAssistantOutput> {
  try {
    const readAttachmentContentTool = ai.defineTool(
      {
        name: 'readAttachmentContent',
        description: 'Reads the mock content of a specific attachment file related to the current submission. Use this if the user explicitly asks about the content of a document by its name.',
        inputSchema: ReadAttachmentInputSchema,
        outputSchema: ReadAttachmentOutputSchema,
      },
      async ({ fileName }) => {
        const attachment = input.attachments?.find(att => att.fileName.toLowerCase() === fileName.toLowerCase());
        if (attachment) {
          const mockFileContents: Record<string, string> = {
              "submission_form_completed.pdf": "This PDF contains the applicant's details, coverage requests, and prior insurance history. Key sections include company information, revenue, and requested limits.",
              "business_financials_fy2023.xlsx": "This Excel file includes the balance sheet (Assets: $5M, Liabilities: $2M, Equity: $3M), income statement (Revenue: $10M, COGS: $4M, Net Profit: $2M), and cash flow statement for the last fiscal year.",
              "loss_control_report_q1_2024.docx": "This Word document details findings from the recent loss control survey conducted on March 15, 2024. It highlights good safety measures in place but recommends upgrading the fire suppression system in Warehouse B. Overall risk assessed as moderate.",
              "site_overview_main_building.jpg": "This is an image file. Visually, it's a photo of a modern, two-story office building with a glass facade, surrounded by well-maintained landscaping. The parking lot appears to be at 70% capacity.",
              "property_inspection_photos.zip": "This is a ZIP archive containing multiple photos of the property. The AI cannot view ZIP contents directly but can inform the user it's a collection of images.",
              "additional_notes.txt": "This text file contains supplementary notes from the broker: Insured is planning an expansion into a new state (Nevada) in Q3 2024. They are also interested in higher limits for cyber liability. Please expedite if possible.",
          };
          return { content: mockFileContents[fileName.toLowerCase()] || `Mock content for ${fileName} is available.` };
        }
        return { content: `Attachment named "${fileName}" was not found or is not listed for this submission.` };
      }
    );

    const getMockGuidelineContent = (query: string): string => {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes("exposure limits")) {
          return "Guideline: Exposure Limits - Maximum permissible exposure for any single risk is $10M. Aggregate limits for catastrophe-prone zones (e.g., earthquake, hurricane areas) apply. Specific industries like energy, aviation, or large-scale construction have pre-defined sub-limits and require senior underwriter review if exceeded.";
      } else if (lowerQuery.includes("financial stability")) {
          return "Guideline: Financial Stability Check - Insured must demonstrate positive net worth for the last 3 fiscal years and maintain a current ratio (current assets / current liabilities) greater than 1.5. Audited financial statements are required for submissions requesting coverage limits over $5M. A debt-to-equity ratio below 2.0 is preferred.";
      } else if (lowerQuery.includes("claims history")) {
          return "Guideline: Claims History Review - Generally, no more than 2 claims exceeding $50,000 (excluding legal fees) in the past 5 years. Any single large loss (>$250,000) or a pattern of recurring losses requires detailed explanation and senior underwriter approval. Loss frequency and severity are key considerations.";
      } else if (lowerQuery.includes("cybersecurity") || lowerQuery.includes("cyber risk")) {
          return "Guideline: Cybersecurity Protocols - For cyber risk coverage, insureds must demonstrate baseline security measures including: multi-factor authentication (MFA) for all critical systems, regular data backups (tested), an incident response plan, employee training on phishing and social engineering, and use of endpoint detection and response (EDR) solutions. Higher limits may require SOC2 compliance or equivalent certifications.";
      }
      return `No specific information found for your guideline query: "${query}". General underwriting principles emphasize a comprehensive risk assessment based on the insured's specific industry, operations, financial health, and loss history.`;
    };

    const searchUnderwritingGuidelinesTool = ai.defineTool(
      {
        name: 'searchUnderwritingGuidelines',
        description: 'Searches and retrieves information about specific underwriting guidelines, company policies, or general risk assessment principles. Use this if the user asks about underwriting rules or criteria.',
        inputSchema: SearchGuidelinesInputSchema,
        outputSchema: SearchGuidelinesOutputSchema,
      },
      async ({ query }) => {
        return { results: getMockGuidelineContent(query) };
      }
    );

    const formattedAttachmentsForPrompt = (input.attachments && input.attachments.length > 0
      ? input.attachments.map(att => `- ${att.fileName} (${att.fileType})`).join('\n')
      : "No attachments provided for this submission."
    ).trim();

    let formattedChatHistoryForPrompt = "No previous conversation.";
    if (input.chatHistory && input.chatHistory.length > 0) {
      const historyStr = input.chatHistory
        .map(msg => {
          if (!msg || !msg.role || !Array.isArray(msg.parts) || msg.parts.length === 0) return null;
          
          const firstPartText = (msg.parts[0] && typeof msg.parts[0].text === 'string')
                                ? msg.parts[0].text.trim()
                                : '[non-text or empty part]';

          if (!firstPartText) return null; // Skip if text is effectively empty

          let prefix = "Unknown Role:";
          if (msg.role === 'user') prefix = "User:";
          else if (msg.role === 'model') prefix = "Assistant:";
          else return null; // Only include user and model text messages in this simple history format
          
          return `${prefix} ${firstPartText}`;
        })
        .filter(Boolean) // Remove nulls
        .join('\n');
      
      if (historyStr.trim()) {
        formattedChatHistoryForPrompt = historyStr.trim();
      }
    }

    // Prepare history for Genkit's `ai.generate()` call
    const modelHistory: MessageData[] = [];
    if (input.chatHistory && Array.isArray(input.chatHistory)) {
      for (const histItem of input.chatHistory) {
        if (!histItem || !histItem.role || !Array.isArray(histItem.parts)) continue;

        if (histItem.role === 'user' || histItem.role === 'model') {
          const processedParts: Part[] = [];
          for (const p of histItem.parts) {
            // Ensure p and p.text are valid and p.text is a non-empty string after trimming
            if (p && typeof p.text === 'string') {
              const trimmedText = p.text.trim();
              if (trimmedText) { // Only add if text has content after trimming
                processedParts.push({ text: trimmedText });
              }
            }
          }
          // Only add the message to history if it has valid parts
          if (processedParts.length > 0) {
            modelHistory.push({
              role: histItem.role, // 'user' or 'model'
              parts: processedParts,
            });
          }
        }
      }
    }
    
    // Add current user query to modelHistory if it's non-empty
    const currentUserQueryTrimmed = input.userQuery.trim();
    if (currentUserQueryTrimmed) {
        modelHistory.push({
            role: 'user',
            parts: [{ text: currentUserQueryTrimmed }],
        });
    } else if (modelHistory.length === 0) {
        // If history is empty AND current query is empty,
        // we must provide at least one user message for the model.
        // The prompt template itself will serve as this message.
        // So, modelHistory can remain empty.
    }


    const templateInputForPrompt: z.infer<typeof PromptTemplateInputSchema> = {
      submissionId: input.submissionId,
      insuredName: input.insuredName,
      brokerName: input.brokerName,
      attachments: input.attachments || [], // Pass original attachments
      userQuery: currentUserQueryTrimmed || "User provided no specific query text for this turn.", // For template
      formattedAttachments: formattedAttachmentsForPrompt,
      formattedChatHistory: formattedChatHistoryForPrompt,
      chatHistory: input.chatHistory, // Pass original chatHistory for Zod validation
    };

    const chatAssistantPrompt = ai.definePrompt({
      name: 'chatUnderwritingAssistantPrompt_v4_non_stream_strict_history',
      input: { schema: PromptTemplateInputSchema },
      output: { schema: ChatUnderwritingAssistantOutputSchema },
      tools: [readAttachmentContentTool, searchUnderwritingGuidelinesTool],
      prompt: `You are a specialized underwriting assistant for RiskPilot.
Your primary role is to answer questions strictly related to the current insurance submission (Quote ID: {{submissionId}}, Insured: {{insuredName}}, Broker: {{brokerName}}) and general underwriting guidelines.

Current Submission Context:
- Quote ID: {{submissionId}}
- Insured Name: {{insuredName}}
- Broker: {{brokerName}}

Available Attachments for this Submission:
{{formattedAttachments}}

Conversation History (for your reference, not part of the current query structure):
{{formattedChatHistory}}

Current User Query (this is the main query to respond to): "{{userQuery}}"

Your Task:
1.  Analyze "Current User Query". Determine if it directly relates to:
    a.  The specific details of the current submission (attachments, data within the quote).
    b.  General underwriting guidelines, company policies, or risk assessment principles.
2.  In-Scope - Submission Specific: If the query is about this submission:
    - If user asks about an attachment, use 'readAttachmentContent' tool with the exact filename.
    - Provide a concise answer based on available information or tool output.
3.  In-Scope - Guidelines: If query is about guidelines:
    - Use 'searchUnderwritingGuidelines' tool with a clear query.
    - Provide an informative summary based on tool output.
4.  Out-of-Scope: If query is NOT about this submission NOR general underwriting guidelines:
    - Respond ONLY with: "I can only answer questions related to the current quote ({{submissionId}}) or general underwriting guidelines. How can I help you with those specific topics?"
    - Do NOT use tools or attempt to answer the out-of-scope query.
5.  Tool Usage: Only use tools if directly relevant and the query is in-scope. Prioritize answering from context if possible.
6.  Response Quality: Be concise, accurate, and professional. If information isn't available (even after tool use), state that clearly.

Your final response MUST be a JSON object with a single key "aiResponse", containing your textual answer.
Example: {"aiResponse": "The requested information is..."}
If declining due to scope, the aiResponse should be exactly: "I can only answer questions related to the current quote ({{submissionId}}) or general underwriting guidelines. How can I help you with those specific topics?"
`,
    });
    
    // If modelHistory is empty and currentUserQueryTrimmed is also empty,
    // the prompt template itself (with userQuery as "User provided no specific query text...")
    // will act as the user's turn. This should be valid.
    const { response } = await ai.generate({
      prompt: chatAssistantPrompt,
      input: templateInputForPrompt,
      history: modelHistory, // Pass the carefully constructed history
      tools: [readAttachmentContentTool, searchUnderwritingGuidelinesTool],
    });

    const output = response.output();
    if (output) {
      return output as ChatUnderwritingAssistantOutput;
    } else {
      // Fallback if structured output is not available
      if (response.text) {
         try {
            // Attempt to parse if the model still produced a JSON string in .text
            const parsedText = JSON.parse(response.text);
            if (parsedText && typeof parsedText.aiResponse === 'string') {
                return parsedText as ChatUnderwritingAssistantOutput;
            }
         } catch (e) { /* Not a valid JSON string */ }
        // If not JSON, or parsing failed, return the raw text wrapped in the schema
        return { aiResponse: response.text };
      }
      // If no output and no text, it's a more significant issue
      console.error('Chat assistant did not return structured output or text for submission', input.submissionId, 'Full response object:', JSON.stringify(response, null, 2));
      return { aiResponse: "I received a response, but it wasn't in the expected format. Please try rephrasing or check the logs." };
    }

  } catch (error: any) {
    console.error(`Error in chatWithUnderwritingAssistant for submission ${input.submissionId || 'UNKNOWN'}:`, error);
    let errorMessage = "An unexpected error occurred while processing your request in the AI assistant. Please check the system logs for more details.";
    if (error.name === 'GenkitError' && error.message && error.message.includes('Schema validation failed')) {
        errorMessage = `A data validation error occurred: ${error.message.substring(0, 300)}... Check server logs for full details of invalid data.`;
    } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        if (error.name) errorMessage = `${error.name}: ${error.message}`;
        if (error.stack) console.error("Error stack:", error.stack);
    } else if (typeof error === 'object' && error !== null) {
        try {
            const errorStr = JSON.stringify(error);
            errorMessage = `An error occurred: ${errorStr.substring(0,500)}`;
        } catch(e) { /* unable to stringify error object */ }
    }
    return { aiResponse: errorMessage };
  }
}
