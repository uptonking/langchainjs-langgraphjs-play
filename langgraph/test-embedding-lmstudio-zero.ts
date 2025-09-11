import { OpenAIClient, OpenAIEmbeddings } from '@langchain/openai';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: 'not needed for lm studio',
  configuration: {
    baseURL: 'http://localhost:1234/v1',
  },
  model: 'text-embedding-qwen3-embedding-0.6b',
});

// 🐛 https://github.com/langchain-ai/langchainjs/issues/8221
// [Embeddings OpenAI node returns zero values with LM studio API · Issue · n8n-io/n8n](https://github.com/n8n-io/n8n/issues/16985)
async function main() {
  try {
    const text = 'hello world';
    const embedding = await embeddings.embedQuery(text);
    console.log('Embedding for:', text);
    console.log(embedding);

    const documents = ['sentence1', 'sentence2', 'sentence3'];
    const docEmbeddings = await embeddings.embedDocuments(documents);
    console.log('\\nEmbeddings for documents:');
    docEmbeddings.forEach((emb, i) => {
      console.log(`  Document ${i + 1}:`, emb);
    });
  } catch (error) {
    console.error('error message:', error.message);
  }
}

main();

const openAiClient = new OpenAIClient({
  apiKey: 'sk-your-api-key',
  baseURL: 'http://localhost:1234/v1',
});

async function getEmbeddings(text) {
  const response = await openAiClient.embeddings.create({
    model: 'text-embedding-qwen3-embedding-8b',
    input: text,
    encoding_format: 'base64', // the value doesn't matter, just manually set the encoding_format is enough
  });

  return response.data[0].embedding;
}

const embedded = await getEmbeddings('editor');
console.log(';; embedded with OpenAIClient ;;', embedded);
