
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Milestone, User, Send, Loader2 } from 'lucide-react';
import { chatWithUnderwritingAssistant, type ChatUnderwritingAssistantInput } from '@/ai/flows/chat-underwriting-assistant';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface AiProcessingMonitorContentProps {
  steps: string[];
  reasoning: string;
  submissionId: string;
}

export function AiProcessingMonitorContent({ steps, reasoning, submissionId }: AiProcessingMonitorContentProps) {
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
      
      // Add the current user message to the history being sent for context
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

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-2 flex items-center px-1 pt-4">
        <Milestone className="mr-2 h-5 w-5 text-primary" />
        Processing Steps
      </h3>
      <ScrollArea className="h-[150px] mb-1 pr-1 border rounded-md p-2 mx-1">
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No processing steps available.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary font-medium mr-2">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      
      <Separator className="my-3 mx-1" />
      
      <h3 className="text-lg font-semibold mb-2 flex items-center px-1">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        AI Reasoning
      </h3>
      <ScrollArea className="h-[150px] pr-1 border rounded-md p-2 mx-1">
        {reasoning ? (
          <p className="text-sm whitespace-pre-wrap">{reasoning}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No reasoning details available.</p>
        )}
      </ScrollArea>

      <Separator className="my-3 mx-1" />

      <h3 className="text-lg font-semibold mb-2 flex items-center px-1">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        Chat with AI Assistant
      </h3>
      <ScrollArea className="flex-grow border rounded-md p-3 space-y-3 mx-1 bg-background/30">
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
