import '@dotenvx/dotenvx/config';

import { HumanMessage } from '@langchain/core/messages';
import { ChatGroq } from '@langchain/groq';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from '@langchain/tavily';

const agentTools = [new TavilySearch({ maxResults: 2 })];
// const model = new ChatGroq({
//   model: 'meta-llama/llama-4-scout-17b-16e-instruct',
//   temperature: 0,
// });
// 👷👀 local qwen3-4b failed tool-call, local gemma3-12b succeeded
const model = new ChatOpenAI({
  // model: 'qwen/qwen3-4b-2507',
  model: 'google/gemma-3-12b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: model,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

const agentFinalState = await agent.invoke(
  {
    messages: [new HumanMessage('what is the current weather in guangzhou ?')],
  },
  { configurable: { thread_id: '42' } },
);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

const agentNextState = await agent.invoke(
  { messages: [new HumanMessage('what about Beijing ?')] },
  { configurable: { thread_id: '42' } },
);

console.log(
  agentNextState.messages[agentNextState.messages.length - 1].content,
);
