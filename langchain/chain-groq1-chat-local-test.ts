import '@dotenvx/dotenvx/config';

import { HumanMessage } from '@langchain/core/messages';

import { initChatModel } from 'langchain/chat_models/universal';

// ❌ not working
const model = await initChatModel('qwen/qwen3-4b-2507', {
  modelProvider: 'openai',
  baseUrl: 'http://localhost:1234/v1',
  apiKey: 'not-needed',
  temperature: 0,
});

const messages = [
  // new SystemMessage('Translate the following from English into Chinese'),
  // new HumanMessage('what day is it today?'),
  new HumanMessage('give an brief intro to reactjs in less than 80 words '),
];

const res = await model.invoke(messages);
console.log(res);

// const stream = await model.stream(messages);

// const chunks: AIMessageChunk[] = [];
// for await (const chunk of stream) {
//   chunks.push(chunk);
//   console.log(`${chunk.content}`);
// }
