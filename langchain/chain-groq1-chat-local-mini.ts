import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

// refers to https://github.com/calcajack3/auto-tool-eval/blob/main/src/utils/utils.ts
const model = new ChatOpenAI({
  model: 'qwen/qwen3-4b-2507',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0.5,
});

const messages = [
  new HumanMessage('give an brief intro to langchain in less than 80 words '),
];

const res = await model.invoke(messages);
console.log(res);
