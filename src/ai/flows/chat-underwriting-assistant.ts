
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod'; // Corrected import
import type {
  ChatUnderwritingAssistantInput,
  ChatUnderwritingAssistantOutput,
  ChatHistoryItem, // For internal modelHistory conversion
  // ChatAttachmentInfo is implicitly handled by ChatUnderwritingAssistantInput
} from '@/types'; 
import { ChatUnderwritingAssistantOutputSchema } from '@/types'; // Import the schema

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
// This is distinct from ChatUnderwritingAssistantInput which is the external API of this function.
const PromptTemplateInputSchema = z.object({
  submissionId: z.string(),
  insuredName: z.string(),
  brokerName: z.string(),
  formattedAttachments: z.string(),
  userQuery: z.string(),
  formattedChatHistory: z.string(),
});


export async function chatWithUnderwritingAssistant(
  input: ChatUnderwritingAssistantInput
): Promise<ChatUnderwritingAssistantOutput> {

  // Define tools available to the AI
  const readAttachmentContentTool = ai.defineTool(
    {
      name: 'readAttachmentContent',
      description: 'Reads the mock content of a specific attachment file related to the current submission. Use this if the user explicitly asks about the content of a document by its name.',
      inputSchema: ReadAttachmentInputSchema,
      outputSchema: ReadAttachmentOutputSchema,
    },
    async ({ fileName }) => {
      // Find the attachment in the input (case-insensitive find for robustness)
      const attachment = input.attachments?.find(att => att.fileName.toLowerCase() === fileName.toLowerCase());
      if (attachment) {
        // Mock content based on filename - in a real app, this would fetch actual content.
        const mockFileContents: Record<string, string> = {
            "submission_form_completed.pdf": "This PDF contains the applicant's details, coverage requests, and prior insurance history. Key sections include company information, revenue, and requested limits.",
            "business_financials_fy2023.xlsx": "This Excel file includes the balance sheet (Assets: $5M, Liabilities: $2M, Equity: $3M), income statement (Revenue: $10M, COGS: $4M, Net Profit: $2M), and cash flow statement for the last fiscal year.",
            "loss_control_report_q1_2024.docx": "This Word document details findings from the recent loss control survey conducted on March 15, 2024. It highlights good safety measures in place but recommends upgrading the fire suppression system in Warehouse B. Overall risk assessed as moderate.",
            "site_overview_main_building.jpg": "This is an image file. Visually, it's a photo of a modern, two-story office building with a glass facade, surrounded by well-maintained landscaping. The parking lot appears to be at 70% capacity.",
            "property_inspection_photos.zip": "This is a ZIP archive containing multiple photos of the property. The AI cannot view ZIP contents directly but can inform the user it's a collection of images.",
            "additional_notes.txt": "This text file contains supplementary notes from the broker: Insured is planning an expansion into a new state (Nevada) in Q3 2024. They are also interested in higher limits for cyber liability. Please expedite if possible.",
            // Add more mock contents as needed, matching file names in mockData.ts
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

  // Prepare templateInputForPrompt:
  const formattedAttachments = input.attachments && input.attachments.length > 0
    ? input.attachments.map(att => `- ${att.fileName} (${att.fileType})`).join('\n')
    : "  - No attachments provided for this submission.";

  let formattedChatHistory = "  No previous messages in this conversation.";
  if (input.chatHistory && input.chatHistory.length > 0) {
    formattedChatHistory = input.chatHistory
      .map(msg => {
        let prefix = "  Unknown Role:";
        const firstPartText = msg.parts?.[0]?.text?.trim() || '[empty message or non-text part]';

        if (msg.role === 'user') prefix = "  User:";
        else if (msg.role === 'model') prefix = "  Assistant:";
        else if (msg.role === 'tool') {
            // This is how the client formats tool interactions in its history to send to us
            // We just make it readable for the prompt context.
            prefix = "  Tool Interaction:";
        }
        return `${prefix} ${firstPartText}`;
      })
      .join('\n');
  }

  const templateInputForPrompt: z.infer<typeof PromptTemplateInputSchema> = {
    submissionId: input.submissionId,
    insuredName: input.insuredName,
    brokerName: input.brokerName,
    userQuery: input.userQuery,
    formattedAttachments,
    formattedChatHistory,
  };

  // Define the main prompt for the AI
  const chatAssistantPrompt = ai.definePrompt({
    name: 'chatUnderwritingAssistantPrompt_v3_scoped',
    input: { schema: PromptTemplateInputSchema },
    output: { schema: ChatUnderwritingAssistantOutputSchema }, // Use imported schema
    tools: [readAttachmentContentTool, searchUnderwritingGuidelinesTool],
    prompt: `You are a specialized underwriting assistant for RiskPilot.
Your primary role is to answer questions strictly related to the current insurance submission (Quote ID: {{submissionId}}, Insured: {{insuredName}}, Broker: {{brokerName}}) and general underwriting guidelines.

Current Submission Context:
- Quote ID: {{submissionId}}
- Insured Name: {{insuredName}}
- Broker: {{brokerName}}

Available Attachments for this Submission:
{{formattedAttachments}}

Conversation History (if any):
{{formattedChatHistory}}

Current User Query: "{{userQuery}}"

Your Task:
1.  **Analyze Query Scope**: Carefully examine the "Current User Query". Determine if it directly relates to:
    a.  The specific details of the current submission (e.g., its status, information within its attachments, data points like insured name or broker).
    b.  General underwriting guidelines, company policies, or risk assessment principles.
2.  **In-Scope - Submission Specific**: If the query is about this submission:
    - Use the provided context (Quote ID, Insured, Broker).
    - If the user asks about the content of a specific document listed in "Available Attachments", use the 'readAttachmentContent' tool with the exact file name.
    - Provide a concise and accurate answer.
3.  **In-Scope - Guidelines**: If the query is about general underwriting guidelines or policies:
    - Use the 'searchUnderwritingGuidelines' tool to find relevant information.
    - Provide an informative summary based on the tool's output.
4.  **Out-of-Scope**: If the "Current User Query" is NOT about this specific submission NOR general underwriting guidelines (e.g., asking about different clients, general news, market trends, unrelated technical support, or asking you to perform actions beyond providing information about this quote/guidelines):
    - You MUST politely decline. Respond with: "I can only answer questions related to the current quote ({{submissionId}}) or general underwriting guidelines. How can I help you with those specific topics?"
    - Do NOT attempt to answer or search for information outside this defined scope.
5.  **Tool Usage**:
    - Only use tools if they are directly relevant to answering an in-scope query.
    - For 'readAttachmentContent', ensure the fileName matches one from "Available Attachments".
6.  **Response Quality**:
    - Be concise and to the point.
    - Do not make up information. If information is not available in the provided context or via tools, state that.
    - Always maintain a professional and helpful tone.

Your final response MUST be a JSON object with a single key "aiResponse", containing your textual answer to the user. Example: {"aiResponse": "The requested information is..."}
`,
  });

  try {
    // Prepare proper history for ai.generate (Genkit's MessageData format)
    // Ensure this transformation is robust and produces valid Genkit MessageData[]
    const modelHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    if (input.chatHistory && Array.isArray(input.chatHistory)) {
      for (const h of input.chatHistory) {
        if (h && (h.role === 'user' || h.role === 'model') && Array.isArray(h.parts)) {
          const validParts = h.parts
            .map(p => {
              if (p && typeof p.text === 'string') {
                const trimmedText = p.text.trim();
                if (trimmedText !== '') {
                  return { text: trimmedText }; // Valid TextPart
                }
              }
              return null; // Invalid part or empty text
            })
            .filter(part => part !== null) as { text: string }[]; // Filter out nulls and assert type

          if (validParts.length > 0) {
            modelHistory.push({ role: h.role, parts: validParts });
          }
        }
      }
    }


    const { response } = await ai.generate({
      prompt: chatAssistantPrompt,
      input: templateInputForPrompt, // Data for the Handlebars template
      history: modelHistory,       // Conversational history for the LLM
      tools: [readAttachmentContentTool, searchUnderwritingGuidelinesTool], // Ensure tools are available
      config: {
        // You might want to adjust safetySettings if needed, e.g., for financial topics
        // safetySettings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }]
      },
      // Ensure model is set if not defaulted in ai.ts or if you want to override
      // model: 'googleai/gemini-1.5-flash-latest',
    });

    const output = response.output(); // Should conform to ChatUnderwritingAssistantOutputSchema
    if (output) {
      return output as ChatUnderwritingAssistantOutput;
    } else {
      // Fallback if structured output is not present but text might be
      if (response.text) {
        // This case indicates the model didn't follow the JSON output instruction.
        // We'll wrap its text response in the expected structure.
        console.warn('Chat assistant returned plain text instead of structured JSON for submission', input.submissionId, 'Text:', response.text);
        // Check if the text itself IS the JSON string.
        try {
            const parsedText = JSON.parse(response.text);
            if (parsedText && typeof parsedText.aiResponse === 'string') {
                return parsedText as ChatUnderwritingAssistantOutput;
            }
        } catch (e) {
            // Not a JSON string, so just use the text.
        }
        return { aiResponse: response.text };
      }
      console.error('Chat assistant did not return structured output or text for submission', input.submissionId, 'Full response object:', JSON.stringify(response));
      return { aiResponse: "I received a response, but it wasn't in the expected format. Please try rephrasing or ask a different question." };
    }

  } catch (error: any) {
    console.error(`Error in chatWithUnderwritingAssistant for submission ${input.submissionId || 'UNKNOWN'}:`, error);
    let errorMessage = "An unexpected error occurred while processing your request. Please check the system logs for more details.";
    if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        if (error.name) { // Add error name if available
            errorMessage = `${error.name}: ${error.message}`;
        }
        if (error.stack) {
             console.error("Error stack:", error.stack);
        }
        if (error.cause) { // Genkit often wraps errors in 'cause'
           try {
            const causeStr = JSON.stringify(error.cause);
            errorMessage += ` Details: ${causeStr.substring(0, 500)}`; // Limit length
           } catch (e) {
            errorMessage += ` Cause: (unable to stringify cause)`;
           }
        }
    } else if (typeof error === 'object' && error !== null) {
        try {
            const errorStr = JSON.stringify(error);
            errorMessage = `An error occurred: ${errorStr.substring(0,500)}`;
        } catch(e) {
            errorMessage = `An unexpected error object was caught.`;
        }
    }
    return { aiResponse: errorMessage };
  }
}
