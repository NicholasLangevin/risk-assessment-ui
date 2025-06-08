
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, FileText, Search, ListChecks, Zap, ClockIcon, MessageSquare as ChatIcon } from 'lucide-react';
import { chatWithUnderwritingAssistant } from '@/ai/flows/chat-underwriting-assistant';
import { cn } from '@/lib/utils';
import type { AiToolAction, AiToolActionType, ChatUnderwritingAssistantInput, ChatHistoryItem, ChatAttachmentInfo } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  type?: 'text' | 'tool_code' | 'tool_result'; // 'tool_code' for showing tool call, 'tool_result' for showing tool output
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
  attachmentsList: ChatAttachmentInfo[];
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
  const [isAiTyping, setIsAiTyping] = useState(false); // General AI thinking indicator
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
    setIsAiTyping(true); // Show general AI typing indicator

    const genkitChatHistory: ChatHistoryItem[] = chatMessages
      .filter(msg => msg.id !== newUserMessage.id)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }], // Assuming simple text parts for history for now
      }));

    const chatInputPayload: ChatUnderwritingAssistantInput = {
      submissionId,
      insuredName,
      brokerName,
      attachments: attachmentsList,
      userQuery: currentInput,
      chatHistory: genkitChatHistory,
    };

    let currentAiMessageId = `ai-${Date.now()}`;
    let accumulatedText = "";
    let inToolPhase = false; // True if a tool call has been made and we are waiting for AI's text response using the tool's output

    // Add initial placeholder for the AI's response message
    setChatMessages(prev => [
      ...prev,
      { id: currentAiMessageId, sender: 'ai', text: '', type: 'text', isLoading: true },
    ]);

    try {
      const stream = chatWithUnderwritingAssistant(chatInputPayload);

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const choice = chunk.choices[0];
          let partProcessedInChunk = false;

          if (choice.delta && choice.delta.parts && choice.delta.parts.length > 0) {
            for (const part of choice.delta.parts) {
              if (part.text) {
                if (inToolPhase) {
                  // This text is part of a new AI message segment following a tool call/result
                  // The currentAiMessageId should already be for the new placeholder.
                  accumulatedText += part.text;
                   setChatMessages(prev =>
                    prev.map(msg =>
                      msg.id === currentAiMessageId ? { ...msg, text: accumulatedText, isLoading: !(choice.finishReason && choice.finishReason !== 'unknown') } : msg
                    )
                  );
                } else {
                  // Standard text accumulation for the current AI message
                  accumulatedText += part.text;
                  setChatMessages(prev =>
                    prev.map(msg =>
                      msg.id === currentAiMessageId ? { ...msg, text: accumulatedText, isLoading: !(choice.finishReason && choice.finishReason !== 'unknown') } : msg
                    )
                  );
                }
                // If text is received after a tool phase, it means the tool phase is over for this text segment
                if (inToolPhase && accumulatedText.trim() !== '') {
                    inToolPhase = false; 
                }
                partProcessedInChunk = true;
              } else if (part.toolCall) {
                const toolCallInfo = part.toolCall;
                const toolMessageText = `Using tool: ${toolCallInfo.name}${toolCallInfo.args ? ` with input ${JSON.stringify(toolCallInfo.args)}` : ''}...`;
                // Update the current AI message to show the tool call
                setChatMessages(prev =>
                  prev.map(msg =>
                    msg.id === currentAiMessageId
                      ? { ...msg, text: toolMessageText, type: 'tool_code', toolName: toolCallInfo.name, toolInput: toolCallInfo.args, isLoading: false }
                      : msg
                  )
                );
                // Prepare for a new AI message that will contain the model's text response *after* this tool call
                currentAiMessageId = `ai-after-tool-${toolCallInfo.ref || Date.now()}`;
                accumulatedText = "";
                inToolPhase = true;
                // Add a new placeholder for the AI's subsequent response
                setChatMessages(prev => [
                  ...prev,
                  { id: currentAiMessageId, sender: 'ai', text: '', type: 'text', isLoading: true },
                ]);
                partProcessedInChunk = true;
              } else if (part.toolResult) {
                const toolResultInfo = part.toolResult;
                const toolResultMessageText = `Tool ${toolResultInfo.name} executed.`; // Simplified, actual result processing may be complex
                // Update the current AI message (which might be the placeholder after a tool call)
                 setChatMessages(prev =>
                  prev.map(msg =>
                    msg.id === currentAiMessageId
                      ? { ...msg, text: toolResultMessageText, type: 'tool_result', toolName: toolResultInfo.name, toolOutput: toolResultInfo.content, isLoading: false }
                      : msg
                  )
                );
                // Prepare for a new AI message that will contain the model's text response
                currentAiMessageId = `ai-after-tool-result-${toolResultInfo.ref || Date.now()}`;
                accumulatedText = "";
                inToolPhase = true;
                // Add a new placeholder for the AI's subsequent response
                setChatMessages(prev => [
                  ...prev,
                  { id: currentAiMessageId, sender: 'ai', text: '', type: 'text', isLoading: true },
                ]);
                partProcessedInChunk = true;
              }
            }
          }

          // Handle finish reason for the current active AI message
          if (choice.finishReason && choice.finishReason !== 'unknown') {
            setChatMessages(prev =>
              prev.map(msg =>
                msg.id === currentAiMessageId ? { ...msg, isLoading: false } : msg
              )
            );
            if (choice.finishReason === 'error' && !partProcessedInChunk) {
              const errorText = (choice.custom as any)?.error || (choice.delta?.parts?.[0]?.text) || "An error occurred with the AI response.";
              setChatMessages(prev =>
                prev.map(msg =>
                  msg.id === currentAiMessageId ? { ...msg, text: errorText, isLoading: false } : msg
                ).filter(m => !(m.id === currentAiMessageId && m.text === '' && !m.isLoading)) // Clean up empty error bubbles if text exists
              );
            } else if (choice.finishReason !== 'error' && accumulatedText.trim() === '' && !inToolPhase) {
                // If finished but current message is empty and not in a tool phase, remove it (it might be an empty placeholder)
                setChatMessages(prev => prev.filter(msg => msg.id !== currentAiMessageId || msg.text.trim() !== '' || msg.isLoading));
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error in handleSendChatMessage (outer catch):', error);
      const errorMsg = error.message || 'An unrecoverable client-side error occurred. Please try again.';
      setChatMessages(prev => {
        const updatedMessages = prev.map(m => (m.isLoading && m.sender === 'ai') ? { ...m, isLoading: false, text: m.text || errorMsg } : m);
        if (!updatedMessages.find(m => m.id === currentAiMessageId && m.sender === 'ai')) {
          return [...updatedMessages, { id: `error-catch-${Date.now()}`, sender: 'ai', text: errorMsg, type: 'text', isLoading: false }];
        }
        return updatedMessages;
      });
    } finally {
      setIsAiTyping(false); // Hide general AI typing indicator
      // Ensure any final AI message bubble has its loading indicator turned off
      setChatMessages(prev =>
        prev.map(msg => (msg.sender === 'ai' && msg.isLoading) ? { ...msg, isLoading: false } : msg)
      );
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
                  {msg.isLoading && msg.sender === 'ai' && (msg.type === 'text' || !msg.type) && (
                    <Loader2 className="h-4 w-4 animate-spin inline-block ml-2" />
                  )}
                </div>
              </div>
            ))}
            {isAiTyping && !chatMessages.some(m => m.sender === 'ai' && m.isLoading) && (
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
            disabled={isAiTyping && chatMessages.some(m => m.sender === 'ai' && m.isLoading)}
            className="flex-grow bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"
          />
          <Button 
            onClick={handleSendChatMessage} 
            disabled={(isAiTyping && chatMessages.some(m => m.sender === 'ai' && m.isLoading)) || !chatInput.trim()} 
            className="bg-primary hover:bg-primary/90"
          >
            {(isAiTyping && chatMessages.some(m => m.sender === 'ai' && m.isLoading)) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
