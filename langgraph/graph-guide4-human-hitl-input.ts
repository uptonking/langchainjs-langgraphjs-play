import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import {
  Command,
  END,
  interrupt,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const search = tool(
  () => {
    return "It's sunny, but you better look out.";
  },
  {
    name: 'search',
    description: 'Call to surf the web.',
    schema: z.string(),
  },
);
const tools = [search];

const model = new ChatOpenAI({
  model: 'qwen/qwen3-4b-2507',
  // model: 'google/gemma-3-12b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});

const askHumanTool = tool(
  () => {
    return 'The human said XYZ';
  },
  {
    name: 'askHuman',
    description: 'Ask the human for input.',
    schema: z.string(),
  },
);
const modelWithTools = model.bindTools([...tools, askHumanTool]);

// Define the function that determines whether to continue or not
function shouldContinue(
  state: typeof MessagesAnnotation.State,
): 'action' | 'askHuman' | typeof END {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  // If there is no function call, then we finish
  if (lastMessage && !lastMessage.tool_calls?.length) {
    return END;
  }
  // If tool call is askHuman, we return that node
  // You could also add logic here to let some system know that there's something that requires Human input
  // For example, send a slack message, etc
  if (lastMessage.tool_calls?.[0]?.name === 'askHuman') {
    console.log('--- ASKING HUMAN ---');
    return 'askHuman';
  }
  // Otherwise if it isn't, we continue with the action node
  return 'action';
}

// 👾 Define the function that calls the model
async function callModel(
  state: typeof MessagesAnnotation.State,
): Promise<Partial<typeof MessagesAnnotation.State>> {
  const messages = state.messages;
  const response = await modelWithTools.invoke(messages);
  // We return an object with a messages property, because this will get added to the existing list
  return { messages: [response] };
}

// We define a fake node to ask the human
function askHuman(
  state: typeof MessagesAnnotation.State,
): Partial<typeof MessagesAnnotation.State> {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  const toolCallId = lastMessage.tool_calls?.[0].id;
  // 👷 Call interrupt() inside the human_feedback node
  const location: string = interrupt('Please provide your location:');
  const newToolMessage = new ToolMessage({
    tool_call_id: toolCallId!,
    content: location,
  });
  return { messages: [newToolMessage] };
}

const toolNode = new ToolNode<typeof MessagesAnnotation.State>(tools);

const workflow = new StateGraph(MessagesAnnotation)
  // Define the two nodes we will cycle between
  .addNode('agent', callModel)
  .addNode('action', toolNode)
  .addNode('askHuman', askHuman)
  // We now add a conditional edge
  .addConditionalEdges(
    // First, we define the start node. We use `agent`.
    // This means these are the edges taken after the `agent` node is called.
    'agent',
    // Next, we pass in the function that will determine which node is called next.
    shouldContinue,
  )
  // We now add a normal edge from `action` to `agent`.
  // This means that after `action` is called, `agent` node is called next.
  .addEdge('action', 'agent')
  // After we get back the human response, we go back to the agent
  .addEdge('askHuman', 'agent')
  // Set the entrypoint as `agent`
  // This means that this node is the first one called
  .addEdge(START, 'agent');

const messagesMemory = new MemorySaver();
// const graph = workflow.compile();
const messagesApp = workflow.compile({
  checkpointer: messagesMemory,
});

// -------

// ask the user where they are, then tell them the weather.

const input = {
  role: 'user',
  content:
    'Use the search tool to ask the user where they are, then look up the weather there',
};

const config2 = {
  configurable: { thread_id: '3' },
  streamMode: 'values' as const,
};

for await (const event of await messagesApp.stream(
  {
    messages: [input],
  },
  config2,
)) {
  console.log('\n---===---');
  console.log(event);
  if (event.messages?.length) {
    const recentMsg = event.messages[event.messages.length - 1];
    console.log(
      `================================ ${recentMsg.getType()} Message =================================`,
    );
    console.log(recentMsg.content);
  }
}

// Continue the graph execution
for await (const event of await messagesApp.stream(
  // 🧩 provide the requested value to the human_feedback node and resume execution
  new Command({ resume: 'guangzhou' }),
  config2,
)) {
  console.log(event);
  console.log('\n====\n');
}
