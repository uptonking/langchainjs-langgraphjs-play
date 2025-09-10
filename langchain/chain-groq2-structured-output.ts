// import '@dotenvx/dotenvx/config';

import { z } from 'zod';

import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';

// const model = new ChatGroq({
//   model: 'meta-llama/llama-4-scout-17b-16e-instruct',
//   temperature: 0,
// });
const model = new ChatOpenAI({
  // model: 'qwen/qwen3-4b-2507',
  model: 'google/gemma-3-12b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0.5,
});

const phoneDevice = z.object({
  name: z.string().describe('Device name'),
  description: z.string().describe('Brief description'),
  details: z.string().describe('Device details or use cases'),
});

// 💡 Option 1: we can pass a name for our schema in order to give the model additional context as to what our schema represents
const structuredLlm = model.withStructuredOutput(phoneDevice, {
  name: 'phoneDevice',
});
const res = await structuredLlm.invoke(
  'give a brief intro to a popular mobile phone',
);

// 💡 Option 2: We can also pass in an OpenAI-style JSON schema dict if you prefer not to use Zod
// 👀 大多数本地模型不支持类似下面json schema的方式，但线上模型支持
// const structuredLlm = model.withStructuredOutput({
//   name: 'phoneDevice',
//   descripttion: 'cellphone device intro',
//   parameters: {
//     name: 'phoneDevice',
//     type: 'object',
//     properties: {
//       name: { type: 'string', description: 'Device name' },
//       description: { type: 'string', description: 'Brief description to device' },
//       details: { type: 'string', description: 'Device details or use cases' },
//     },
//     required: ['name', 'description'],
//   },
// });
// const res = await structuredLlm.invoke('give a brief intro to a popular mobile phone', {
//   // @ts-expect-error llm-topic
//   name: 'phoneDevice',
// });

console.log(res);
