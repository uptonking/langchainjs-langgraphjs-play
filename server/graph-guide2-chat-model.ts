import '@dotenvx/dotenvx/config';

import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatGroq } from '@langchain/groq';
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from '@langchain/tavily';

const agentTools = [new TavilySearch({ maxResults: 2 })];
const toolNode = new ToolNode(agentTools); // will be added as a graph node

const agentModel = new ChatGroq({
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  temperature: 0,
});
const model = agentModel.bindTools(agentTools);

// Define the function that determines whether to continue or not
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

// Define a new graph, Annotations are how graph state is represented in LangGraph
// MessagesAnnotation, a helper that implements a common pattern: keeping the message history in an array.
const graphFLow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addEdge('__start__', 'agent') // __start__ is a special name for the entrypoint
  .addNode('tools', toolNode)
  .addEdge('tools', 'agent')
  .addConditionalEdges('agent', shouldContinue);

// Finally, we compile it into a LangChain Runnable.
const app = graphFLow.compile();

// Use the agent
const finalState = await app.invoke({
  messages: [new HumanMessage('what is the weather in guangzhou')],
});
console.log(finalState.messages[finalState.messages.length - 1].content);

const nextState = await app.invoke({
  // Including the messages from the previous run gives the LLM context.
  // This way it knows we're asking about the weather in NY
  messages: [...finalState.messages, new HumanMessage('what about Beijing')],
});
console.log(nextState.messages[nextState.messages.length - 1].content);
