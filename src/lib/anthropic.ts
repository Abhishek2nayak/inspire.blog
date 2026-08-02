import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/**
 * Returns a lazily-initialised Anthropic client.
 * Throws a clear error if the API key is missing so callers can surface it.
 */
export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your .env file (get a key at https://console.claude.com)."
    );
  }
  if (!client) {
    // The SDK reads ANTHROPIC_API_KEY from the environment automatically.
    client = new Anthropic();
  }
  return client;
}
