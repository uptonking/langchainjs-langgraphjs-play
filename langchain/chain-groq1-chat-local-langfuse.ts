// import '@dotenvx/dotenvx/config';
import './langfuse-instrumentation';

import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

import { startActiveObservation, startObservation } from '@langfuse/tracing';

// import { NodeSDK } from "@opentelemetry/sdk-node";
// import { LangfuseSpanProcessor } from "@langfuse/otel";

const model = new ChatOpenAI({
  model: 'qwen/qwen3-vl-4b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  // temperature: 0.5,
});

// import { CallbackHandler } from "@langfuse/langchain";
// const langfuseHandler = new CallbackHandler();

console.log(';; langfuse ', process.env['LANGFUSE_PUBLIC_KEY']);

// const sdk = new NodeSDK({
//   spanProcessors: [new LangfuseSpanProcessor()],
// });

// sdk.start();

// await startActiveObservation("user-request", async (span) => {
//   span.update({
//     input: { query: "What is the capital of France?" },
//   });

//   // This generation will automatically be a child of "user-request"
//   const generation = startObservation(
//     "llm-call",
//     {
//       model: "gpt-4",
//       input: [{ role: "user", content: "What is the capital of France?" }],
//     },
//     { asType: "generation" },
//   );

//   // ... LLM call logic ...
//   // refers to https://github.com/calcajack3/auto-tool-eval/blob/main/src/utils/utils.ts

//   const messages = [
//     new HumanMessage('give an brief intro to codemirror in less than 80 words '),
//   ];

//   const res = await model.invoke(messages, {
//     // callbacks: [langfuseHandler]
//   });
//   console.log('res');

//   generation
//     .update({
//       output: { content: "The capital of France is Paris." },
//     })
//     .end();

//   span.update({ output: "Successfully answered." });
// });

async function main() {
  await startActiveObservation('my-first-trace', async (span) => {
    span.update({
      input: 'Hello, Langfuse!',
      output: 'This is my first trace!',
    });
  });
}

main();
