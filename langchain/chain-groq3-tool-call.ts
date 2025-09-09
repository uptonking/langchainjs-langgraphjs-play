import '@dotenvx/dotenvx/config';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { ChatGroq } from '@langchain/groq';
import { z } from 'zod';

/**
 * Note that the descriptions here are crucial, as they will be passed along
 * to the model along with the class name.
 */
const calculatorSchema = z.object({
  operation: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('The type of operation to execute.'),
  number1: z.number().describe('The first number to operate on.'),
  number2: z.number().describe('The second number to operate on.'),
});

const calculatorTool = tool(
  async ({ operation, number1, number2 }) => {
    // 👀 Functions must return strings
    if (operation === 'add') {
      return `${number1 + number2}`;
    } else if (operation === 'subtract') {
      return `${number1 - number2}`;
    } else if (operation === 'multiply') {
      return `${number1 * number2}`;
    } else if (operation === 'divide') {
      return `${number1 / number2}`;
    } else {
      throw new Error('Invalid operation.');
    }
  },
  {
    name: 'calculator',
    description: 'Can perform mathematical operations.',
    schema: calculatorSchema,
  },
);

const llm = new ChatGroq({
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  temperature: 0,
});

const llmWithTools = llm.bindTools([calculatorTool]);

// const res = await llmWithTools.invoke("What is 11 * 22");
const res = await llmWithTools.invoke(
  'What is 11 * 22? Also, what is 33 + 44?',
);

console.log(res);
