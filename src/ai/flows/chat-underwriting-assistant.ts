'use server';
/**
 * @fileOverview A simplified conversational AI assistant for underwriting tasks.
 * It maintains a conversation but does not use tools or have complex logic.
 */

import { ai } from '@/ai/genkit'; // Assuming this correctly initializes Genkit
import type { MessageData } from 'genkit';
import type {
  ChatUnderwritingAssistantInput,
  ChatUnderwritingAssistantOutput,
} from '@/types';

/**
 * A simplified conversational agent that uses the same interface as the complex one.
 * It maintains conversational context but has no tools or special rules.
 *
 * @param input - An object containing the user's query and chat history.
 * @returns A promise that resolves to the AI's response.
 */
export async function chatWithUnderwritingAssistant(
  input: ChatUnderwritingAssistantInput,
): Promise<ChatUnderwritingAssistantOutput> {
  try {
    console.log("hello world")

    // 1. Prepare the conversation messages for the AI.
    const messages: MessageData[] = [];

    // Add a simple instruction for the AI.
    messages.push({
      role: 'system',
      parts: [{ text: 'You are a helpful underwriting assistant.' }],
    });

    // Add the previous messages from the chat history.
    // The `?? []` ensures this works even if chatHistory is undefined.
    for (const historyMessage of input.chatHistory ?? []) {
      // We only add valid messages to avoid errors
      if (
        historyMessage &&
        historyMessage.role &&
        Array.isArray(historyMessage.parts)
      ) {
        messages.push(historyMessage);
      }
    }

    // Add the user's current message.
    messages.push({
      role: 'user',
      parts: [{ text: input.userQuery }],
    });

    // 2. Call the AI model to get a response.
    const { response } = await ai.generate({
      messages: messages,
    });
    console.log("hello world")

    // 3. Return the AI's text response in the expected format.
    return {
      aiResponse: response.text(),
    };
  } catch (error) {
    console.error(
      `Error in simplified chatWithUnderwritingAssistant:`,
      error,
    );
    // Provide a basic error response that fits the output schema.
    return {
      aiResponse: 'Sorry, I encountered an error and could not respond.',
    };
  }
}