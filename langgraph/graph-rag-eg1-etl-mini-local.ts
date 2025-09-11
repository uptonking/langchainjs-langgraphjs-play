import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI, OpenAIClient, OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { pull } from 'langchain/hub';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { z } from 'zod';
import { Document } from '@langchain/core/documents';

// 🧑‍🏫 [Build a RAG App: Part 1](https://js.langchain.com/docs/tutorials/rag/)

// const model = new ChatOpenAI({
//   model: 'gpt-4o',
//   temperature: 0,
// });
const model = new ChatOpenAI({
  // model: 'qwen/qwen3-4b-2507',
  model: 'google/gemma-3-12b',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-needed',
  },
  temperature: 0,
});

// const embeddings = new OpenAIEmbeddings({
//   model: "text-embedding-qwen3-embedding-0.6b",
//   // model: 'text-embedding-embeddinggemma-300m',
//   configuration: {
//     baseURL: 'http://localhost:1234/v1',
//     // check: false,
//     apiKey: 'not-needed',
//   },
// });

const urls = [
  'https://dev.to/nyxtom/introduction-to-crdts-for-realtime-collaboration-2eb1',
  'https://dev.to/foxgem/crdts-achieving-eventual-consistency-in-distributed-systems-296g',
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
  chunkSize: 500,
  chunkOverlap: 50,
});
const docSplits = await textSplitter.splitDocuments(docsList);
console.log(';; docSplits ', docSplits.length);
// console.log(';; docSplits ', docSplits.slice(0, 6))

// 🛢️ save embeddings to vectorDB
// const vectorStore = new MemoryVectorStore(embeddings);
// await vectorStore.addDocuments(docSplits)
// const vectorStore = await MemoryVectorStore.fromDocuments(
//   docSplits,
//   embeddings
// );
const openAiClient = new OpenAIClient({
  apiKey: 'not-needed',
  baseURL: 'http://localhost:1234/v1',
});

// Create a proper embeddings interface for OpenAIClient
class OpenAIClientEmbeddings {
  constructor(
    private client: OpenAIClient,
    private model: string,
  ) {}

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts,
      encoding_format: 'float',
    });
    return response.data.map((item) => item.embedding);
  }

  async embedQuery(text: string): Promise<number[]> {
    const embeddings = await this.embedDocuments([text]);
    return embeddings[0];
  }
}

// Create embeddings instance and use fromDocuments
const embeddingsInstance = new OpenAIClientEmbeddings(
  openAiClient,
  'text-embedding-qwen3-embedding-0.6b',
);
// const embeddingsInstance = new OpenAIClientEmbeddings(openAiClient, 'text-embedding-embeddinggemma-300m');
// const embeddingsInstance = new OpenAIClientEmbeddings(openAiClient, 'text-embedding-granite-embedding-278m-multilingual');
const vectorStore = await MemoryVectorStore.fromDocuments(
  docSplits,
  embeddingsInstance,
);

// const retrievedDocs = await vectorStore.similaritySearch('yjs');
// console.log(';; retrievedDocs ', retrievedDocs.length)
// console.log(';; retrievedDocs ', retrievedDocs)

// Define state for application
const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
});

// only used for types
const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>,
});

// retrieve node
const retrieve = async (state: typeof InputStateAnnotation.State) => {
  const retrievedDocs = await vectorStore.similaritySearch(state.question);
  console.log(';; retrievedDocs ', retrievedDocs.length);
  // console.log(';; retrievedDocs ', retrievedDocs)
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

let inputs = { question: 'What is CmRDTs ?' };
// let inputs = { question: "What is yjs  ?" };

const result = await graph.invoke(inputs);

console.log('\n👾');
console.log(result.answer);
