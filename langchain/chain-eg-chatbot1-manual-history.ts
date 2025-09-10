import { ChatOpenAI } from '@langchain/openai';

const llm = new ChatOpenAI({
  model: 'qwen/qwen3-4b-2507',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});

const res = await llm.invoke([{ role: 'user', content: "hello, I'm York." }]);
console.log(res);

// 👀 The model on its own does not have any concept of state. response: I don't know who you are
// const res2 = await llm.invoke([{ role: "user", content: "What's my name?" }]);
// console.log(res2);

// ✅ To get around this, we need to pass the entire conversation history into the model.
const res3 = await llm.invoke([
  { role: 'user', content: "Hello, I'm York" },
  { role: 'assistant', content: 'Hello York! How can I assist you today?' },
  { role: 'user', content: "What's my name?" },
]);
console.log(res3);
