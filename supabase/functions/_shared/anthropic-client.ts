import Anthropic from "npm:@anthropic-ai/sdk";

// The SDK sets the managed-agents beta header automatically — do not duplicate it
// in defaultHeaders or the doubled value causes a 500 from Anthropic's API.
export const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});
