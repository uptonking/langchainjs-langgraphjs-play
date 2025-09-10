import '@dotenvx/dotenvx/config';

import { AIMessage, HumanMessage } from '@langchain/core/messages';
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from '@langchain/langgraph';
import { createReactAgent, ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from '@langchain/tavily';

const tools = [new TavilySearch({ maxResults: 2 })];
// 👷👀 local qwen3-4b failed tool-call, local gemma3-12b succeeded
const llm = new ChatOpenAI({
  // model: 'qwen/qwen3-4b-2507',
  model: 'google/gemma-3-12b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});
const model = llm.bindTools(tools);

// Define the function that determines whether to call tools or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return 'tools';
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return '__end__';
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

const toolNode = new ToolNode(tools);

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge('__start__', 'agent') // __start__ is a special name for the entrypoint
  .addEdge('tools', 'agent')
  .addConditionalEdges('agent', shouldContinue);

const agentCheckpointer = new MemorySaver();
const graph = workflow.compile();
// 👀 不使用memory时, ai也能通过tool call查询beijing天气
// const graph = workflow.compile({checkpointer: agentCheckpointer});

const finalState = await graph.invoke({
  messages: [new HumanMessage('what is the weather in guangzhou ?')],
});
console.log(finalState.messages[finalState.messages.length - 1].content);

const nextState = await graph.invoke({
  // Including the messages from the previous run gives the LLM context.
  // This way it knows we're asking about the weather in NY
  messages: [...finalState.messages, new HumanMessage('what about Beijing ?')],
});
console.log(nextState.messages[nextState.messages.length - 1].content);
