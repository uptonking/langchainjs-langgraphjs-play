import { PromptTemplate } from '@langchain/core/prompts';

const promptTemplate = PromptTemplate.fromTemplate(
  `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
  Question: {question} 
  Context: {context} 
  Answer:
  `,
);

const messages = await promptTemplate.invoke({
  question: '%% state.question',
  context: '%% docsContent',
});

console.log(messages);
