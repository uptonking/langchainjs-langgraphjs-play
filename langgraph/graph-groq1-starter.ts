import '@dotenvx/dotenvx/config';

import { tool } from '@langchain/core/tools';
import { ChatGroq } from '@langchain/groq';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { z } from 'zod';

const search = tool(
  async ({ query }) => {
    if (
      query.toLowerCase().includes('gz') ||
      query.toLowerCase().includes('guangzhou')
    ) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'search',
    description: 'Call to surf the web.',
    schema: z.object({
      query: z.string().describe('The query to use in your search.'),
    }),
  },
);

const model = new ChatGroq({
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  temperature: 0,
});

const agent = createReactAgent({
  llm: model,
  tools: [search],
});

const result = await agent.invoke({
  messages: [
    {
      role: 'user',
      content: 'what is the weather in guangzhou',
    },
  ],
});

console.log('#### -------- ####');
console.log(result);
