// import '@dotenvx/dotenvx/config';

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';

import { ChatOpenAI, OpenAIClient, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import type { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/ollama';

// 🧑‍🏫 [Build a RAG App: Part 1](https://js.langchain.com/docs/tutorials/rag/)

// const model = new ChatOpenAI({
//   // model: 'qwen/qwen3-4b-2507',
//   model: 'google/gemma-3-12b',
//   configuration: {
//     baseURL: 'http://localhost:1234/v1',
//     apiKey: 'not-needed',
//   },
//   temperature: 0,
// });

// const embeddings = new OpenAIEmbeddings({
//   model: "text-embedding-qwen3-embedding-0.6b",
//   // model: 'text-embedding-embeddinggemma-300m',
//   configuration: {
//     baseURL: 'http://localhost:1234/v1',
//     // check: false,
//     apiKey: 'not-needed',
//     // checkEmbeddingCtxLength: false,
//   },
// });
// const embeddings = new OllamaEmbeddings({
//   model: "text-embedding-qwen3-embedding-0.6b",
//   baseUrl: "http://localhost:1234/v1",
// });
// const embeddings = new OllamaEmbeddings({
//   // model: "nomic-embed-text",
//   model: "granite-embedding:278m",
//   // model: "embeddinggemma",
//   baseUrl: "http://localhost:11434",
// });

// const embeddings = new GoogleGenerativeAIEmbeddings({
//   model: "models/gemini-embedding-001"
// });

const document1: Document = {
  pageContent:
    'Counters are one of the simplest forms of CRDTs, used for incrementing and decrementing values across multiple replicas. They can be implemented as grow-only counters (increment-only) or using more complex strategies to handle both increments and decrements.',
  metadata: { source: 'https://example.com' },
};
const document2: Document = {
  pageContent:
    'CRDT sets allow elements to be added and removed without conflicts. Common implementations include: Add-wins sets: Adds always succeed, and removals are ignored if the element has been re-added. Remove-wins sets: Removals take precedence over adds, ensuring that an element is removed if a remove operation has been seen by a replica.',
  metadata: { source: 'https://example.com' },
};
const document3: Document = {
  pageContent:
    'Delta-state CRDTs are an optimization over state-based CRDTs, where only the changes (deltas) to the state are propagated instead of the entire state. This reduces the amount of data that needs to be transferred, improving performance in high-update scenarios.',
  metadata: { source: 'https://example.com' },
};

// const document1: Document = {
//   pageContent: "The powerhouse of the cell is the mitochondria",
//   metadata: { source: "https://example.com" },
// };
// const document2: Document = {
//   pageContent: "Buildings are made out of brick",
//   metadata: { source: "https://example.com" },
// };
// const document3: Document = {
//   pageContent: "Mitochondria are made out of lipids",
//   metadata: { source: "https://example.com" },
// };

const documents = [document1, document2, document3];

// Option 1: create embedding by adding documents to vector store
// const vectorStore = new MemoryVectorStore(embeddings);
// await vectorStore.addDocuments(documents);

// Option 2: create embedding and vector store manually using OpenAIClient
const openAiClient = new OpenAIClient({
  apiKey: 'not-needed',
  baseURL: 'http://localhost:1234/v1',
});

// async function getEmbeddings(texts: string[]) {
//   const response = await openAiClient.embeddings.create({
//     model: 'text-embedding-qwen3-embedding-0.6b',
//     // model: 'text-embedding-embeddinggemma-300m',
//     // model: 'text-embedding-granite-embedding-278m-multilingual',
//     input: texts,
//     encoding_format: 'float',
//   });
//   return response.data.map(item => item.embedding);
// }

// // Create embeddings for all documents
// const texts = documents.map(doc => doc.pageContent);
// // const embeddings = await getEmbeddings(texts);

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
  documents,
  embeddingsInstance,
);

console.log(
  ';; vectorStore ',
  vectorStore.memoryVectors[0].content.slice(0, 60),
  vectorStore.memoryVectors[0].embedding,
);

const filter = (doc) => doc.metadata.source === 'https://example.com';

// const similaritySearchResults = await vectorStore.similaritySearch(
const similaritySearchResults = await vectorStore.similaritySearchWithScore(
  'Delta',
  // "biology",
  // 2,
  // filter
);
console.log(';; vectorSearch ', similaritySearchResults.length);

// for (const doc of similaritySearchResults) {
for (const [doc, score] of similaritySearchResults) {
  console.log(
    `* [SIM=${score.toFixed(3)}] ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`,
  );
}

// const result = await embeddings.embedQuery(
//   "And I am content that this will be my first and last voyage. I have not been truly happy at any time since we set sail. If I am not seasick, I am cold. If I am not cold, I am exhausted. When I am none of those things, I am frightened. Yet if there is one part of it that I shall not regret, it is our acquaintance."
// );
// console.log(result.length);
