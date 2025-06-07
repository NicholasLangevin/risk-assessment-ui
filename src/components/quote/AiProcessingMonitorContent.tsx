
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, FileText, Search, ListChecks, Zap, ClockIcon } from 'lucide-react';
import { chatWithUnderwritingAssistant, type ChatUnderwritingAssistantInput } from '@/ai/flows/chat-underwriting-assistant';
import { cn } from '@/lib/utils';
import type { AiToolAction, AiToolActionType } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface AiProcessingMonitorContentProps {
  aiToolActions: AiToolAction[];
  submissionId: string;
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

export function AiProcessingMonitorContent({ aiToolActions, submissionId }: AiProcessingMonitorContentProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: chatInput.trim(),
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const genkitChatHistory: ChatUnderwritingAssistantInput['chatHistory'] = chatMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      
      genkitChatHistory.push({
        role: 'user',
        parts: [{text: newUserMessage.text}]
      });

      const response = await chatWithUnderwritingAssistant({
        submissionId,
        userQuery: newUserMessage.text,
        chatHistory: genkitChatHistory,
      });

      const newAiMessage: ChatMessage = {
        id: Date.now().toString() + '-ai',
        sender: 'ai',
        text: response.aiResponse,
      };
      setChatMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error chatting with AI:', error);
      const errorAiMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setChatMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsChatLoading(false);
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
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3 flex items-center px-1 pt-4">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        AI Agent Activity
      </h3>
      <ScrollArea className="h-[250px] mb-2 pr-1 border rounded-md p-1 mx-1">
        {aiToolActions.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 text-center">No AI agent activity logged yet.</p>
        ) : (
          <ul className="space-y-1">
            {aiToolActions.map((action) => (
              <li key={action.id} className="p-2.5 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <div className="flex items-start space-x-3">
                  {getActionIcon(action.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground/90">{action.description}</p>
                    {action.details.targetName && (
                       <p className="text-xs text-muted-foreground break-all">
                        Target: <span className="font-medium text-foreground/70">{action.details.targetName}</span>
                       </p>
                    )}
                    {action.details.url && (
                       <p className="text-xs text-muted-foreground break-all">
                        URL: <a href={action.details.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{action.details.url}</a>
                       </p>
                    )}
                     {action.details.query && (
                       <p className="text-xs text-muted-foreground">
                        Query: "{action.details.query}"
                       </p>
                    )}
                    {action.type === 'PerformingAction' && action.details.actionSummary && (
                       <p className="text-xs text-muted-foreground">
                         Summary: {action.details.actionSummary}
                       </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end text-xs text-muted-foreground mt-1.5">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>{formatTimestamp(action.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      
      <Separator className="my-3 mx-1" />

      <h3 className="text-lg font-semibold mb-2 flex items-center px-1">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        Chat with AI Assistant
      </h3>
      <ScrollArea className="flex-grow border rounded-md p-3 space-y-3 mx-1 bg-background/30 min-h-[200px]">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start space-x-2 text-sm p-2 rounded-lg max-w-[85%]",
              msg.sender === 'user' ? "ml-auto bg-primary text-primary-foreground flex-row-reverse space-x-reverse" : "bg-muted text-muted-foreground"
            )}
          >
            {msg.sender === 'user' ? <User className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <Bot className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />}
            <p className="break-words whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex items-center space-x-2 text-sm p-2 rounded-lg bg-muted text-muted-foreground max-w-[85%]">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p>AI is thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="mt-auto p-2 border-t flex items-center space-x-2 mx-1">
        <Input
          type="text"
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleSendChatMessage()}
          disabled={isChatLoading}
          className="flex-grow"
        />
        <Button onClick={handleSendChatMessage} disabled={isChatLoading || !chatInput.trim()} size="icon">
          {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
