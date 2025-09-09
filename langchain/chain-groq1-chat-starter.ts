import '@dotenvx/dotenvx/config';

import {
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatGroq } from '@langchain/groq';

const model = new ChatGroq({
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  temperature: 0,
});

const messages = [
  new SystemMessage('Translate the following from English into Chinese'),
  new HumanMessage('what day is it today?'),
];

// const res = await model.invoke(messages);
// console.log(res);

const stream = await model.stream(messages);

const chunks: AIMessageChunk[] = [];
for await (const chunk of stream) {
  chunks.push(chunk);
  console.log(`${chunk.content}`);
}
