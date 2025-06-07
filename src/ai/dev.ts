
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-underwriting-actions.ts';
import '@/ai/flows/monitor-ai-processing.ts';
import '@/ai/flows/chat-underwriting-assistant.ts'; // Added new flow
