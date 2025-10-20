import { LMStudioClient } from '@lmstudio/sdk';
const client = new LMStudioClient();

// const model = await client.llm.model("qwen/qwen3-vl-4b");
const model = await client.llm.model('nanonets-ocr2-3b');
// const model = await client.llm.model("mistralai/magistral-small-2509");

const imagePath =
  '/Users/yaoo/Pictures/seeds/imgsets/firefox-glazing-512px.jpg';
const image = await client.files.prepareImage(imagePath);

// const result = await model.respond("Tell me a short and funny story in less than 60 words");

console.log('\n👾');
// console.info(result.content);

for await (const fragment of model.respond([
  { role: 'user', content: 'Describe this image please', images: [image] },
])) {
  process.stdout.write(fragment.content);
}

console.info(); // Write a new line to prevent text from being overwritten by your shell.
