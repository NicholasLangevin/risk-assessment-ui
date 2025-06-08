import { config } from 'dotenv';
config();

import '@/ai/flows/chat-underwriting-assistant.ts';
import '@/ai/flows/generate-underwriting-email.ts';
import '@/ai/flows/generate-overall-risk-statement.ts'; // Added this line
// Removed: import '@/ai/flows/suggest-underwriting-actions.ts';
// Removed: import '@/ai/flows/monitor-ai-processing.ts';
// Removed: import '@/ai/flows/evaluate-coverage-risk.ts';