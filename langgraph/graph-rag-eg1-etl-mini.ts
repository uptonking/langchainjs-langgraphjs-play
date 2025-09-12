import '@dotenvx/dotenvx/config';

import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { Annotation, StateGraph } from '@langchain/langgraph';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';

// 🧑‍🏫 [Build a RAG App: Part 1](https://js.langchain.com/docs/tutorials/rag/)

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  temperature: 0,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'models/gemini-embedding-001',
});

const urls = [
  'https://dev.to/foxgem/crdts-achieving-eventual-consistency-in-distributed-systems-296g',
  // 'https://dev.to/nyxtom/introduction-to-crdts-for-realtime-collaboration-2eb1',
  // "https://lilianweng.github.io/posts/2023-06-23-agent/",
];

const docs = await Promise.all(
  urls.map((url) =>
    new CheerioWebBaseLoader(url, {
      selector: '.crayons-layout__content',
      // selector: 'p'
    }).load(),
  ),
);
const docsList = docs.flat();

// const cheerioLoader = new CheerioWebBaseLoader(
//   "https://lilianweng.github.io/posts/2023-06-23-agent/",
//   {
//     selector: 'p'
//   }
// );
// const docsList = await cheerioLoader.load();

console.log(';; docsList ', docsList[0].pageContent.length);
// console.log(';; docsList ', docsList[0].pageContent.slice(0, 2200))

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 700,
  chunkOverlap: 100,
});
const docSplits = await textSplitter.splitDocuments(docsList);
console.log(';; docSplits ', docSplits.length);
// console.log(';; docSplits ', docSplits.slice(0, 6))

const vectorStore = new MemoryVectorStore(embeddings);

// save embeddings to vectorDB
await vectorStore.addDocuments(docSplits);
// const vectorStore = await MemoryVectorStore.fromDocuments(
//   docSplits,
//   embeddings
// );

// const retrievedDocs = await vectorStore.similaritySearch('Short-Term Memory');
// console.log(';; retrievedDocs ', retrievedDocs.length)
// console.log(';; retrievedDocs ', retrievedDocs)

// Define state for application
const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
});

// used for types only
const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>,
});

// retrieve node
const retrieve = async (state: typeof InputStateAnnotation.State) => {
  const retrievedDocs = await vectorStore.similaritySearch(state.question);
  console.log(';; retrievedDocs ', retrievedDocs.length);
  console.log(';; retrievedDocs ', retrievedDocs);
  return { context: retrievedDocs };
};

const generate = async (state: typeof StateAnnotation.State) => {
  const docsContent = state.context.map((doc) => doc.pageContent).join('\n');

  // Define prompt for question-answering
  // const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  const promptTemplate = PromptTemplate.fromTemplate(
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
  Question: {question} 
  Context: {context} 
  Answer:
  `,
  );

  const messages = await promptTemplate.invoke({
    question: state.question,
    context: docsContent,
  });

  const response = await model.invoke(messages);
  return { answer: response.content };
};

// Compile application and test
const graph = new StateGraph(StateAnnotation)
  .addNode('retrieve', retrieve)
  .addNode('generate', generate)
  .addEdge('__start__', 'retrieve')
  .addEdge('retrieve', 'generate')
  .addEdge('generate', '__end__')
  .compile();

// -------

// let inputs = { question: "What is CmRDTs ?" };
console.log('\n👾');
const inputs = { question: 'What is yjs  ?' };

const result = await graph.invoke(inputs);

console.log(result.answer);

// 🤔 LangGraph is not required to build a RAG application.
// simple RAG is retrieve + gennerate
// const retrievedDocs = await vectorStore.similaritySearch(question);
// const docsContent = retrievedDocs.map((doc) => doc.pageContent).join("\n");
// const messages = await promptTemplate.invoke({
//   question: question,
//   context: docsContent,
// });
// const answer = await llm.invoke(messages);
