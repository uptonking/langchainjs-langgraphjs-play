import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';

// Export the processor to be able to flush it later
// This is important for ensuring all spans are sent to Langfuse
export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_HOST ?? 'https://us.cloud.langfuse.com', // Default to cloud if not specified
  environment: process.env.NODE_ENV ?? 'development', // Default to development if not specified
});

// Initialize the OpenTelemetry SDK with our Langfuse processor
const sdk = new NodeSDK({
  spanProcessors: [langfuseSpanProcessor],
});

sdk.start();
