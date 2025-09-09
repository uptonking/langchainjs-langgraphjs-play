import '@dotenvx/dotenvx/config';

import { HumanMessage } from '@langchain/core/messages';

import { initChatModel } from 'langchain/chat_models/universal';

const model = await initChatModel('llama-3.1-8b-instant', {
  modelProvider: 'groq',
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
