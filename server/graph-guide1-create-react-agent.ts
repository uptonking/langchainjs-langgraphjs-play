import '@dotenvx/dotenvx/config';

import { HumanMessage } from '@langchain/core/messages';
import { ChatGroq } from '@langchain/groq';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from '@langchain/tavily';

// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
// const agentTools = [new TavilySearchResults({ maxResults: 2 })];
// const agentModel = new ChatOpenAI({ temperature: 0 });

const agentTools = [new TavilySearch({ maxResults: 2 })];
const agentModel = new ChatGroq({
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  temperature: 0,
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

const agentFinalState = await agent.invoke(
  { messages: [new HumanMessage('what is the current weather in guangzhou')] },
  { configurable: { thread_id: '42' } },
);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

const agentNextState = await agent.invoke(
  { messages: [new HumanMessage('what about Beijing')] },
  { configurable: { thread_id: '42' } },
);

console.log(
  agentNextState.messages[agentNextState.messages.length - 1].content,
);
