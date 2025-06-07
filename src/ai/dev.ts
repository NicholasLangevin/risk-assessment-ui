
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-underwriting-actions.ts';
import '@/ai/flows/monitor-ai-processing.ts';
import '@/ai/flows/chat-underwriting-assistant.ts';
import '@/ai/flows/evaluate-coverage-risk.ts';
import '@/ai/flows/generate-underwriting-email.ts'; // Added new flow
