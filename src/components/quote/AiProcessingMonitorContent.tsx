
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
  type?: 'text' | 'tool_code' | 'tool_result' | 'error';
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

    const currentInput = chatInput.trim();
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: currentInput,
      type: 'text',
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsAiTyping(true);

    const loadingAiMessageId = `ai-loading-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      { id: loadingAiMessageId, sender: 'ai', text: '', isLoading: true, type: 'text' },
    ]);

    const genkitChatHistory: ChatHistoryItem[] = chatMessages
      .filter(msg => msg.id !== newUserMessage.id && !msg.isLoading)
      .map(msg => {
        let role: 'user' | 'model' | 'tool' = 'model';
        if (msg.sender === 'user') {
          role = 'user';
        } else if (msg.sender === 'ai') {
          role = 'model'; // For simplicity, all AI messages are 'model' text for history
        }

        // Ensure msg.text is a string, then trim. Provide a fallback if necessary.
        const textContent = (typeof msg.text === 'string' ? msg.text.trim() : '');
        
        return {
          role,
          parts: [{ text: textContent || " " }], // Ensure text is at least a space if empty after trim
        };
      })
      .filter(item => item.parts.length > 0 && item.parts[0].text.trim() !== ""); // Final check for non-empty content

    const chatInputPayload: ChatUnderwritingAssistantInput = {
      submissionId,
      insuredName,
      brokerName,
      attachments: attachmentsList,
      userQuery: currentInput,
      chatHistory: genkitChatHistory,
    };

    try {
      const response = await chatWithUnderwritingAssistant(chatInputPayload);
      setIsAiTyping(false);
      setChatMessages(prev => prev.filter(msg => msg.id !== loadingAiMessageId));

      if (response && response.aiResponse) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.aiResponse,
          type: 'text',
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const errorText = response && (response as any).error ? (response as any).error : 'The AI did not provide a response or an unknown error occurred.';
        const errorMessage: ChatMessage = {
          id: `ai-error-unknown-${Date.now()}`,
          sender: 'ai',
          text: errorText,
          type: 'error',
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error('Error in handleSendChatMessage (client-side catch):', error);
      setIsAiTyping(false);
      setChatMessages(prev => prev.filter(msg => msg.id !== loadingAiMessageId));
      
      const errorMsg = error.message || 'A client-side error occurred. Please try again.';
      const clientErrorMessage: ChatMessage = {
        id: `client-error-${Date.now()}`,
        sender: 'ai',
        text: errorMsg,
        type: 'error',
      };
      setChatMessages(prev => [...prev, clientErrorMessage]);
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
                    msg.type === 'tool_result' ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs" : "",
                    msg.type === 'error' ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400" : ""
                  )}
                >
                  {msg.isLoading && msg.sender === 'ai' && (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                      <span>AI is thinking...</span>
                    </div>
                  )}
                  {!msg.isLoading && <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
              </div>
            ))}
            {isAiTyping && !chatMessages.some(m => m.isLoading && m.sender === 'ai') && (
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
          <Button 
            onClick={handleSendChatMessage} 
            disabled={isAiTyping || !chatInput.trim()} 
            className="bg-primary hover:bg-primary/90"
          >
            {isAiTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
