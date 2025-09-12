import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { ToolCall } from '@langchain/core/messages/tool';
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

const weatherSearch = tool(
  (input: { city: string }) => {
    console.log('----');
    console.log(`Searching for: ${input.city}`);
    console.log('----');
    return 'Sunny!';
  },
  {
    name: 'weather_search',
    description: 'Search for the weather',
    schema: z.object({
      city: z.string(),
    }),
  },
);

const tools = [weatherSearch];

const llm = new ChatOpenAI({
  model: 'qwen/qwen3-4b-2507',
  // model: 'google/gemma-3-12b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});

const model = llm.bindTools([...tools]);

const callLLM = async (state: typeof MessagesAnnotation.State) => {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};

const humanReviewNode = async (
  state: typeof MessagesAnnotation.State,
): Promise<Command> => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  const toolCall = lastMessage.tool_calls![lastMessage.tool_calls!.length - 1];

  type ReviewDisplayUI = {
    question: string;
    toolCall: ToolCall;
  };
  type ReviewResult = {
    action: string;
    data: any;
  };
  // 👷 waiting for feedback
  const humanReview = interrupt<ReviewDisplayUI, ReviewResult>({
    question: 'Is this correct?',
    toolCall: toolCall,
  });

  const reviewAction = humanReview.action;
  const reviewData = humanReview.data;

  if (reviewAction === 'continue') {
    // 🧩 resume
    return new Command({ goto: 'run_tool' });
  } else if (reviewAction === 'update') {
    const updatedMessage = {
      role: 'ai',
      content: lastMessage.content,
      tool_calls: [
        {
          id: toolCall.id,
          name: toolCall.name,
          args: reviewData,
        },
      ],
      id: lastMessage.id,
    };
    // 🧩 resume
    return new Command({
      goto: 'run_tool',
      update: { messages: [updatedMessage] },
    });
  } else if (reviewAction === 'feedback') {
    const toolMessage = new ToolMessage({
      name: toolCall.name,
      content: reviewData,
      // @ts-expect-error fix-types
      tool_call_id: toolCall.id,
    });
    // 🧩 resume
    return new Command({
      goto: 'call_llm',
      update: { messages: [toolMessage] },
    });
  }
  throw new Error('Invalid review action');
};

const runTool = async (state: typeof MessagesAnnotation.State) => {
  const newMessages: ToolMessage[] = [];
  const tools = { weather_search: weatherSearch };
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  const toolCalls = lastMessage.tool_calls!;

  for (const toolCall of toolCalls) {
    const tool = tools[toolCall.name as keyof typeof tools];
    // @ts-expect-error fix-types
    const result = await tool.invoke(toolCall.args);
    newMessages.push(
      new ToolMessage({
        name: toolCall.name,
        // @ts-expect-error fix-types
        content: result,
        // @ts-expect-error fix-types
        tool_call_id: toolCall.id,
      }),
    );
  }
  return { messages: newMessages };
};

const routeAfterLLM = (
  state: typeof MessagesAnnotation.State,
): typeof END | 'human_review_node' => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (!lastMessage.tool_calls?.length) {
    return END;
  }
  return 'human_review_node';
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('call_llm', callLLM)
  .addNode('run_tool', runTool)
  .addNode('human_review_node', humanReviewNode, {
    ends: ['run_tool', 'call_llm'],
  })
  .addEdge(START, 'call_llm')
  .addConditionalEdges('call_llm', routeAfterLLM, ['human_review_node', END])
  .addEdge('run_tool', 'call_llm');

const memory = new MemorySaver();

const graph = workflow.compile({ checkpointer: memory });

// -------

// 🌰 an example when no review is required (because no tools are called)

let inputs = { messages: [{ role: 'user', content: 'hi!' }] };
let config = {
  configurable: { thread_id: '1' },
  streamMode: 'values' as const,
};

let stream: any;
// let stream = await graph.stream(inputs, config);

// for await (const event of stream) {
//     const recentMsg = event.messages[event.messages.length - 1];
//     console.log(`================================ ${recentMsg._getType()} Message (1) =================================`)
//     console.log(recentMsg.content);
// }

// 🌰 an example to approve a tool call

inputs = {
  messages: [{ role: 'user', content: "what's the weather in guangzhou?" }],
};
config = { configurable: { thread_id: '2' }, streamMode: 'values' as const };

stream = await graph.stream(inputs, config);

for await (const event of stream) {
  if (event.messages) {
    const recentMsg = event.messages[event.messages.length - 1];
    console.log(
      `================================ ${recentMsg._getType()} Message (1) =================================`,
    );
    console.log(recentMsg.content);
  }
}

for await (const event of await graph.stream(
  // ✅ provide resume value of { action: "continue" } to navigate to run_tool node
  new Command({ resume: { action: 'continue' } }),
  config,
)) {
  const recentMsg = event.messages[event.messages.length - 1];
  console.log(`============ ${recentMsg.getType()} Message (1) ===========`);
  console.log(recentMsg.content);
}
