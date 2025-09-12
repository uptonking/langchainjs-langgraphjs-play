import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import {
  StateGraph,
  MessagesAnnotation,
  END,
  START,
} from '@langchain/langgraph';

// 🧑‍🏫 [How to call tools using ToolNode](https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling/)

const getWeather = tool(
  (input) => {
    if (['gz', 'guangzhou'].includes(input.location.toLowerCase())) {
      return "It's 60 degrees and foggy.";
    } else {
      return "It's 90 degrees and sunny.";
    }
  },
  {
    name: 'get_weather',
    description: 'Call to get the current weather.',
    schema: z.object({
      location: z.string().describe('Location to get the weather for.'),
    }),
  },
);

const getCoolestCities = tool(
  () => {
    return 'beijing, guangzhou';
  },
  {
    name: 'get_coolest_cities',
    description: 'Get a list of coolest cities',
    schema: z.object({
      noOp: z.string().optional().describe('No-op parameter.'),
    }),
  },
);

const tools = [getWeather, getCoolestCities];

const toolNode = new ToolNode(tools);

// 🌰 ToolNode operates on graph state with a list of messages.
// It expects the last message in the list to be an `AIMessage` with `tool_calls` parameter.
// You can also do parallel tool calling using ToolNode if you pass multiple tool calls to AIMessage's tool_calls parameter:

// const messageWithMultipleToolCalls = new AIMessage({
//   content: "",
//   tool_calls: [
//     {
//       name: "get_coolest_cities",
//       args: {},
//       id: "tool_call_id",
//       type: "tool_call",
//     },
//     {
//       name: "get_weather",
//       args: { location: "guangzhou" },
//       id: "tool_call_id_2",
//       type: "tool_call",
//     }
//   ]
// })
// // Manually call ToolNode
// await toolNode.invoke({ messages: [messageWithSingleToolCall] })

// 使用更大的模型在连续对话场景下tool call更合理
const llm = new ChatOpenAI({
  model: 'qwen/qwen3-4b-2507',
  // model: 'google/gemma-3-12b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});

// conversion from LangChain tool to our model provider’s specific format
const llmWithTools = llm.bindTools(tools);

// const res = await llmWithTools.invoke(
//   // 'what is the weather in guangzhou ?',
//   "what's the weather in the coolest cities?"
// );

// // await toolNode.invoke({ messages: [await modelWithTools.invoke("what's the weather in guangzhou?")] })
// console.log(res);

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    'tool_calls' in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls?.length
  ) {
    return 'tools';
  }
  return END;
};

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const response = await llmWithTools.invoke(messages);
  return { messages: response };
};

const workflow = new StateGraph(MessagesAnnotation)
  // Define the two nodes we will cycle between
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue, ['tools', END])
  .addEdge('tools', 'agent');

const app = workflow.compile();

// 🌰 example with a single tool call
// const stream = await app.stream(
//   {
//     messages: [{ role: "user", content: "what's the weather in guangzhou?" }],
//   },
//   {
//     streamMode: "values"
//   }
// )
// for await (const chunk of stream) {
//   const lastMessage = chunk.messages[chunk.messages.length - 1];
//   const type = lastMessage.getType();
//   const content = lastMessage.content;
//   const toolCalls = lastMessage['tool_calls'];
//   console.dir({
//     type,
//     content,
//     toolCalls
//   }, { depth: null });
// }

// 🌰 example with a multiple tool calls in succession
// 👷实测, 使用12b模型能执行2次tool call, 使用4b模型只能执行1次tool call
const streamWithMultiToolCalls = await app.stream(
  {
    messages: [
      { role: 'user', content: "what's the weather in the coolest cities?" },
    ],
  },
  {
    streamMode: 'values',
  },
);
for await (const chunk of streamWithMultiToolCalls) {
  const lastMessage = chunk.messages[chunk.messages.length - 1];
  const type = lastMessage.getType();
  const content = lastMessage.content;
  const toolCalls = lastMessage['tool_calls'];
  console.dir(
    {
      type,
      content,
      toolCalls,
    },
    { depth: null },
  );
}
