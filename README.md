# langchainjs-langgraphjs-play

> quickstart boilerplate for langchainjs/langgraphjs

## features

- examples(mostly with langgraph)
  - llm with groq api
  - ✨ llm with local llm, tested with LM Studio
  - tool call: tavily api
  - structured output

- RAG
  - simple
  - generate_query_or_respond
  - memory: chat history
  - docs grading

## quickstart

```shell
npm i

# Option 1: use local llm, configure the `baseURL` in code then run
npx tsx ./langchain/chain-groq1-chat-local-mini.ts

# Option 2: use groq api, configure the `GROQ_API_KEY` first
cp .env.example .env
npx tsx ./server/chain-groq1-starter.ts
```

# roadmap
- [ ] `graph.stream` not work with local llm
# notes
- examples in python: https://github.com/uptonking/langchain-langgraph-play

# license
MIT
