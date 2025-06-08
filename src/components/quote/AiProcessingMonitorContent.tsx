
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, FileText, Search, ListChecks, Zap, ClockIcon, MessageSquare, Activity } from 'lucide-react';
import { chatWithUnderwritingAssistant } from '@/ai/flows/chat-underwriting-assistant';
import { cn } from '@/lib/utils';
import type { AiToolAction, AiToolActionType, Attachment, ChatUnderwritingAssistantInput, ChatHistoryItem } from '@/types'; // Updated import
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


interface ChatAttachmentInfoForContext {
  fileName: string;
  fileType: Attachment['fileType'];
}

interface AiProcessingMonitorContentProps {
  aiToolActions: AiToolAction[];
  submissionId: string;
  insuredName: string;
  brokerName: string;
  attachmentsList: ChatAttachmentInfoForContext[];
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
    setChatInput('');
    setIsAiTyping(true);

    const genkitChatHistory: ChatHistoryItem[] = chatMessages
        .filter(msg => msg.id !== newUserMessage.id)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
          parts: [{ text: msg.text }],
      }));


    const chatInputPayload: ChatUnderwritingAssistantInput = {
      submissionId,
      insuredName,
      brokerName,
      attachments: attachmentsList,
      userQuery: newUserMessage.text,
      chatHistory: genkitChatHistory,
    };

    try {
      const stream = await chatWithUnderwritingAssistant(chatInputPayload);
      let currentAiMessageId = `ai-${Date.now()}`;
      let accumulatedText = "";
      let firstChunk = true;

      // @ts-ignore
      for await (const chunk of stream) {
        if (firstChunk) {
          setChatMessages(prev => [
            ...prev,
            { id: currentAiMessageId, sender: 'ai', text: '', type: 'text', isLoading: true },
          ]);
          firstChunk = false;
        }

        if (chunk.choice?.delta?.content) {
          // @ts-ignore // content can be Part[] or string. Assuming text content.
          const textContent = Array.isArray(chunk.choice.delta.content) ? chunk.choice.delta.content.map(c => c.text || '').join('') : chunk.choice.delta.content;
          accumulatedText += textContent;
          setChatMessages(prev =>
            prev.map(msg =>
              msg.id === currentAiMessageId ? { ...msg, text: accumulatedText, isLoading: false } : msg
            )
          );
        } else if (chunk.choice?.toolCall) {
            setChatMessages(prev => [
              ...prev,
              {
                id: `tool-call-${Date.now()}`,
                sender: 'ai',
                text: `Using tool: ${chunk.choice.toolCall.name}...`,
                type: 'tool_code',
                toolName: chunk.choice.toolCall.name,
                toolInput: chunk.choice.toolCall.args,
                isLoading: true,
              },
            ]);
        } else if (chunk.choice?.toolResult) {
            setChatMessages(prev => prev.map(msg =>
                msg.type === 'tool_code' && msg.toolName === chunk.choice?.toolResult?.name && msg.isLoading
                // @ts-ignore
                ? { ...msg, text: `Tool ${chunk.choice.toolResult.name} executed. Result: ${JSON.stringify(chunk.choice.toolResult.content)?.substring(0,100)}...`, isLoading: false, toolOutput: chunk.choice.toolResult.content }
                : msg
            ));
        }
      }
    } catch (error: any) {
      console.error('Error chatting with AI:', error);
      setChatMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'ai',
          text: 'Sorry, I encountered an error. Please try again.',
          type: 'text',
        },
      ]);
    } finally {
      setIsAiTyping(false);
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
        <Activity className="mr-2 h-5 w-5 text-primary" />
        AI Agent Activity
      </h3>
      <ScrollArea className="h-[250px] mb-2 px-4 border-b dark:border-slate-700">
        {aiToolActions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 p-3 text-center">No AI agent activity logged yet.</p>
        ) : (
          <ul className="space-y-2 pb-4">
            {aiToolActions.map((action) => (
              <li key={action.id} className="p-3 border rounded-lg bg-white dark:bg-slate-800 shadow-sm">
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
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
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
                    msg.type === 'tool_code' ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs italic" : ""
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex items-center space-x-2.5 text-sm p-3 rounded-lg bg-muted text-muted-foreground max-w-[85%]">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p>AI is thinking...</p>
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
