import { ChatOpenAI } from '@langchain/openai';

import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from '@langchain/langgraph';

import { ulid } from 'ulid';

const llm = new ChatOpenAI({
  model: 'qwen/qwen3-4b-2507',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.invoke(state.messages);
  return { messages: response };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

const config = { configurable: { thread_id: ulid() } };

const input = [
  {
    role: 'user',
    content: "Hi! I'm York.",
  },
];
// The `output` contains all messages in the state.
const output = await app.invoke({ messages: input }, config);

console.log('\n👾');
console.log(output.messages[output.messages.length - 1]);

const input2 = [
  {
    role: 'user',
    content: "What's my name?",
  },
];
const output2 = await app.invoke({ messages: input2 }, config);
console.log('\n👾');
console.log(output2.messages[output2.messages.length - 1]);

const config2 = { configurable: { thread_id: ulid() } };
const input3 = [
  {
    role: 'user',
    content: "What's my name?",
  },
];
const output3 = await app.invoke({ messages: input3 }, config2);
console.log('\n👾');
console.log(output3.messages[output3.messages.length - 1]);
