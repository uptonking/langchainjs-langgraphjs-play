import '@dotenvx/dotenvx/config';

import { z } from 'zod';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatGroq } from '@langchain/groq';

const computerTopic = z.object({
  // syntax: z.string().describe("The syntax"),
  briefDescription: z.string().describe('Brief description'),
  usageDetails: z.string().optional().describe('Usage details or examples'),
});

const model = new ChatGroq({
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  temperature: 0,
});

// 💡 we can pass a name for our schema in order to give the model additional context as to what our schema represents
// const structuredLlm = model.withStructuredOutput(computerTopic, { name: 'computerTopic' });
// const res = await structuredLlm.invoke("introduce sort algorithms");

// 💡 We can also pass in an OpenAI-style JSON schema dict if you prefer not to use Zod
const structuredLlm = model.withStructuredOutput({
  name: 'computerTopic',
  descripttion: 'knowledge about computer',
  parameters: {
    title: 'computerTopic',
    type: 'object',
    properties: {
      briefDescription: { type: 'string', description: 'Brief description' },
      details: { type: 'string', description: 'Usage details or examples' },
    },
    required: ['briefDescription', 'details'],
  },
});
const res = await structuredLlm.invoke('introduce sort algorithms', {
  // @ts-expect-error llm-topic
  name: 'computerTopic',
});

console.log(res);
