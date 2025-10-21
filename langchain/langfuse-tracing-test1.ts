import './langfuse-instrumentation';

// Import necessary functions from the tracing package
import {
  startActiveObservation,
  startObservation,
  updateActiveTrace,
  updateActiveObservation,
} from '@langfuse/tracing';
import { langfuseSpanProcessor } from './langfuse-instrumentation';

// Start a new span with automatic context management
await startActiveObservation('context-manager', async (span) => {
  // Log the initial user query
  span.update({
    input: { query: 'What is the capital of France?' },
  });

  // Create a new generation span that will automatically be a child of "context-manager"
  const generation = startObservation(
    'llm-call',
    {
      model: 'gpt-4',
      input: [{ role: 'user', content: 'What is the capital of France?' }],
    },
    { asType: 'generation' },
  );

  // ... LLM call logic would go here ...

  // Update the generation with token usage statistics
  generation.update({
    usageDetails: {
      input: 10, // Number of input tokens
      output: 5, // Number of output tokens
      cache_read_input_tokens: 2, // Tokens read from cache
      some_other_token_count: 10, // Custom token metric
      total: 17, // Optional: automatically calculated if not provided
    },
  });

  // End the generation with the LLM response
  generation
    .update({
      output: { content: 'The capital of France is Paris.' },
    })
    .end();

  // Example user information
  const user = { id: 'user-5678', name: 'Jane Doe', sessionId: '123' };

  // Add an optional log level of type warning to the active span
  updateActiveObservation({
    level: 'WARNING',
    statusMessage: 'This is a warning',
  });

  // Update the trace with user context
  updateActiveTrace({
    userId: user.id,
    sessionId: user.sessionId,
    metadata: { userName: user.name },
  });

  // Mark the span as complete with final output
  span.update({ output: 'Successfully answered.' });
});

// Ensure all spans are sent to Langfuse
await langfuseSpanProcessor.forceFlush();
