
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, FileText, Search, ListChecks, Zap, ClockIcon, MessageSquare as ChatIcon } from 'lucide-react'; // Renamed MessageSquare to ChatIcon for clarity
import { chatWithUnderwritingAssistant } from '@/ai/flows/chat-underwriting-assistant';
import { cn } from '@/lib/utils';
import type { AiToolAction, AiToolActionType, ChatUnderwritingAssistantInput, ChatHistoryItem, ChatAttachmentInfo } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  type?: 'text' | 'tool_code' | 'tool_result';
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  isLoading?: boolean;
}

interface AiProcessingMonitorContentProps {
  aiToolActions: AiToolAction[];
  submissionId: string;
  insuredName: string;
  brokerName: string;
  attachmentsList: ChatAttachmentInfo[]; // Updated to use ChatAttachmentInfo from @/types
}

const getActionIcon = (type: AiToolActionType) => {
  switch (type) {
    case 'ReadingAttachment':
      return <FileText className="h-5 w-5 text-primary flex-shrink-0" />;
    case 'SearchingWeb':
      return <Search className="h-5 w-5 text-primary flex-shrink-0" />;
    case 'PerformingAction':
      return <Zap className="h-5 w-5 text-primary flex-shrink-0" />;
    case 'ReadingGuideline':
      return <ListChecks className="h-5 w-5 text-primary flex-shrink-0" />;
    default:
      return <Zap className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
  }
};

export function AiProcessingMonitorContent({
  aiToolActions,
  submissionId,
  insuredName,
  brokerName,
  attachmentsList,
}: AiProcessingMonitorContentProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      type: 'text',
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setIsAiTyping(true);

    const genkitChatHistory: ChatHistoryItem[] = chatMessages
        // Exclude the new user message we just added to UI from history sent to Genkit
        .filter(msg => msg.id !== newUserMessage.id) 
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
          parts: [{ text: msg.text }], // Assuming simple text parts for history
      }));


    const chatInputPayload: ChatUnderwritingAssistantInput = {
      submissionId,
      insuredName,
      brokerName,
      attachments: attachmentsList, // Already correctly typed from props
      userQuery: currentInput,
      chatHistory: genkitChatHistory,
    };

    let accumulatedText = "";
    let currentAiMessageId = `ai-${Date.now()}`;
    let firstChunkForMessage = true;

    try {
      const stream = chatWithUnderwritingAssistant(chatInputPayload); // Returns async iterable

      for await (const chunk of stream) {
        if (firstChunkForMessage) {
          setChatMessages(prev => {
            // Remove previous loading message if any
            const filtered = prev.filter(m => !(m.sender === 'ai' && m.isLoading && m.text === ''));
            return [
              ...filtered,
              { id: currentAiMessageId, sender: 'ai', text: '', type: 'text', isLoading: true },
            ];
          });
          firstChunkForMessage = false;
        }

        if (chunk.choices && chunk.choices.length > 0) {
          const choice = chunk.choices[0];

          let processedChunk = false;

          // Handle text delta
          if (choice.delta && choice.delta.parts && choice.delta.parts.length > 0 && choice.delta.parts[0].text) {
            const textContent = choice.delta.parts[0].text;
            accumulatedText += textContent;
            setChatMessages(prev =>
              prev.map(msg =>
                msg.id === currentAiMessageId ? { ...msg, text: accumulatedText, isLoading: false } : msg
              )
            );
            processedChunk = true;
          }

          // Handle tool call (either on choice or in delta.parts)
          const toolCall = choice.toolCall || (choice.delta?.parts?.[0]?.toolCall);
          if (toolCall) {
            firstChunkForMessage = true; // Reset for AI's text response after tool
            const toolMessageId = `ai-tool-call-${Date.now()}`;
            setChatMessages(prev => [
              ...prev.map(m => m.id === currentAiMessageId && m.text === '' && m.isLoading ? {...m, isLoading: false } : m), // Mark previous empty loading as done if any
              {
                id: toolMessageId,
                sender: 'ai',
                text: `Using tool: ${toolCall.name}...`,
                type: 'tool_code',
                toolName: toolCall.name,
                toolInput: toolCall.args,
                isLoading: true, // This message itself is loading until result or next AI text
              },
            ]);
            currentAiMessageId = `ai-${Date.now()}`; // Prepare for next AI text message
            accumulatedText = ""; // Reset for next text message
            processedChunk = true;
          }

          // Handle tool result (either on choice or in delta.parts)
          const toolResult = choice.toolResult || (choice.delta?.parts?.[0]?.toolResult);
          if (toolResult) {
            firstChunkForMessage = true;
            const toolResultMessageId = `ai-tool-result-${Date.now()}`;
            const toolResultContentString = typeof toolResult.content === 'string' ? toolResult.content : JSON.stringify(toolResult.content);
            
            setChatMessages(prev => {
              // Update the corresponding tool_code message to show it's done (if applicable)
              // This is a bit tricky as tool_code and tool_result might be separate messages.
              // For simplicity, we add a new message for the tool result.
              const updatedMessages = prev.map(m => (m.type === 'tool_code' && m.isLoading && m.toolName === toolResult.name) ? {...m, isLoading: false, text: `${m.text} completed.`} : m);
              return [
                  ...updatedMessages,
                  {
                      id: toolResultMessageId,
                      sender: 'ai',
                      text: `Tool ${toolResult.name || 'N/A'} executed.`, // Displaying full result might be too verbose
                      type: 'tool_result',
                      toolName: toolResult.name,
                      toolOutput: toolResult.content,
                      isLoading: false,
                  }
              ];
            });
            currentAiMessageId = `ai-${Date.now()}`; // Prepare for next AI text message
            accumulatedText = "";
            processedChunk = true;
          }
          
          // Handle finish reason
          if (choice.finishReason && choice.finishReason !== 'unknown' && choice.finishReason !== 'stop') {
             // If it's an error or other non-stop finish, ensure loading state is cleared.
            setChatMessages(prev =>
              prev.map(msg =>
                msg.id === currentAiMessageId ? { ...msg, isLoading: false } : msg
              )
            );
            if (choice.finishReason === 'error' && choice.delta?.parts?.[0]?.text) {
              // If finishReason is error and there's text, it might be the error message from the server.
               setChatMessages(prev => [
                ...prev,
                {
                  id: `error-${Date.now()}`,
                  sender: 'ai',
                  text: choice.delta.parts[0].text || "An error occurred.",
                  type: 'text',
                  isLoading: false,
                },
              ]);
            }
          } else if (choice.finishReason === 'stop') {
             setChatMessages(prev =>
                prev.map(msg =>
                  msg.id === currentAiMessageId ? { ...msg, isLoading: false } : msg
                )
              );
          }
        }
      }
    } catch (error: any) {
      console.error('Error processing chat stream on client:', error);
      setChatMessages(prev => [
        ...prev.map(m => m.isLoading ? {...m, isLoading: false} : m), // Clear any existing loading states
        {
          id: `error-catch-${Date.now()}`,
          sender: 'ai',
          text: 'Sorry, I encountered an error processing the stream. Please try again.',
          type: 'text',
          isLoading: false,
        },
      ]);
    } finally {
      setIsAiTyping(false);
       // Ensure the very last AI message bubble (if any) has its loading indicator turned off.
      setChatMessages(prev => prev.map(msg => (msg.sender === 'ai' && msg.isLoading) ? { ...msg, isLoading: false } : msg));
    }
  };


  const formatTimestamp = (isoTimestamp: string) => {
    try {
      return formatDistanceToNowStrict(new Date(isoTimestamp), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-3 flex items-center px-4 pt-4 text-slate-700 dark:text-slate-300">
        <ChatIcon className="mr-2 h-5 w-5 text-primary" />
        AI Agent Activity
      </h3>
      <ScrollArea className="h-[250px] mb-2 px-4 border-b dark:border-slate-700">
        {aiToolActions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 p-3 text-center">No AI agent activity logged yet.</p>
        ) : (
          <ul className="space-y-2 pb-4">
            {aiToolActions.map((action) => (
              <li key={action.id} className="p-3 border rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  {getActionIcon(action.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{action.description}</p>
                    {action.details.targetName && (
                       <p className="text-xs text-slate-600 dark:text-slate-400 break-all">
                        Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{action.details.targetName}</span>
                       </p>
                    )}
                    {action.details.url && (
                       <p className="text-xs text-slate-600 dark:text-slate-400 break-all">
                        URL: <a href={action.details.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{action.details.url}</a>
                       </p>
                    )}
                     {action.details.query && (
                       <p className="text-xs text-slate-600 dark:text-slate-400">
                        Query: "{action.details.query}"
                       </p>
                    )}
                    {action.type === 'PerformingAction' && action.details.actionSummary && (
                       <p className="text-xs text-slate-600 dark:text-slate-400">
                         Summary: {action.details.actionSummary}
                       </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>{formatTimestamp(action.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      
      <div className="flex flex-col flex-grow p-4 space-y-4">
        <h3 className="text-lg font-semibold flex items-center text-slate-700 dark:text-slate-300">
          <ChatIcon className="mr-2 h-5 w-5 text-primary" />
          Chat with AI Assistant
        </h3>
        <ScrollArea className="flex-grow border rounded-lg p-4 bg-white dark:bg-slate-800 shadow-inner">
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start space-x-2.5 max-w-[85%]",
                  msg.sender === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : ""
                )}
              >
                {msg.sender === 'user' ? (
                  <User className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                )}
                <div
                  className={cn(
                    "px-4 py-2 rounded-lg shadow-sm",
                    msg.sender === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                    msg.type === 'tool_code' ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs italic" : "",
                    msg.type === 'tool_result' ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs" : ""
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.isLoading && msg.sender === 'ai' && msg.type === 'text' && (
                    <Loader2 className="h-4 w-4 animate-spin inline-block ml-2" />
                  )}
                </div>
              </div>
            ))}
            {isAiTyping && chatMessages.every(m => !m.isLoading) && ( // Show general "AI is thinking" only if no specific message is loading
              <div className="flex items-start space-x-2.5 text-sm p-3 rounded-lg bg-muted text-muted-foreground max-w-[85%]">
                 <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="px-4 py-2 rounded-lg shadow-sm bg-muted text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary inline-block mr-2" />
                    AI is thinking...
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        <div className="flex items-center space-x-2 pt-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isAiTyping && chatInput.trim()) {
                handleSendChatMessage();
              }
            }}
            disabled={isAiTyping}
            className="flex-grow bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"
          />
          <Button onClick={handleSendChatMessage} disabled={isAiTyping || !chatInput.trim()} className="bg-primary hover:bg-primary/90">
            {isAiTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

