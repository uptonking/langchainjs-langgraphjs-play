import '@dotenvx/dotenvx/config';
import './langfuse-instrumentation';

import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { CallbackHandler } from '@langfuse/langchain';

import { langfuseSpanProcessor } from './langfuse-instrumentation';

// Initialize the Langfuse callback handler with tracing configuration
const langfuseHandler = new CallbackHandler({
  sessionId: 'user-session-123', // Track user session
  userId: 'user-abc', // Track user identity
  tags: ['langchain-test'], // Add searchable tags
});

const model = new ChatOpenAI({
  model: 'qwen/qwen3-vl-4b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  // temperature: 0.5,
});

console.log(';; langfuse ', process.env['LANGFUSE_PUBLIC_KEY']);

const messages = [
  new HumanMessage('give an brief intro to codemirror in less than 80 words '),
];

const res = await model.invoke(messages, {
  callbacks: [langfuseHandler],
  // Name for the trace (if no active span)
  runName: 'joke-generator',
});
console.log(';; res ', res.content);

await langfuseSpanProcessor.forceFlush();
