import { createClient } from "npm:@supabase/supabase-js";
import { anthropic } from "../_shared/anthropic-client.ts";
import type { ContentWebhookPayload } from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: ContentWebhookPayload = await req.json();
    const { content, type, project_id } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Mark processing started so the frontend polling sees activity
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    await supabaseAdmin.from("ai_generations").upsert({
      project_id,
      status: "processing",
    });

    // Create the agent, environment, and session — then fire and forget.
    // The agent runs in Anthropic's cloud and writes results directly to
    // Supabase when done. The frontend is already polling for those results.
    const agent = await anthropic.beta.agents.create({
      name: `caption-agent-${project_id}`,
      model: "claude-sonnet-4-6",
      system: buildCaptionSystemPrompt(project_id, supabaseUrl, supabaseServiceKey),
      tools: [{ type: "agent_toolset_20260401" }],
    });

    const environment = await anthropic.beta.environments.create({
      name: `caption-env-${project_id}`,
      config: {
        type: "cloud",
        networking: { type: "unrestricted" },
      },
    });

    const session = await anthropic.beta.sessions.create({
      agent: agent.id,
      environment_id: environment.id,
      title: `Caption generation — ${project_id}`,
    });

    await anthropic.beta.sessions.events.send(session.id, {
      events: [
        {
          type: "user.message",
          content: [
            {
              type: "text",
              text:
                type === "url"
                  ? `Generate 5 short-form video captions from this article URL: ${content}`
                  : `Generate 5 short-form video captions from this article text:\n\n${content}`,
            },
          ],
        },
      ],
    });

    return new Response(
      JSON.stringify({ ok: true, project_id, session_id: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("agent-content error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildCaptionSystemPrompt(
  projectId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): string {
  return `You are a social media content writer that transforms articles into viral short-form video captions.

## Your Task
You will receive either an article URL or article text. Complete these steps in order:

### Step 1: Get the article content
- If given a URL: use your web fetch tool to retrieve the full article text
- If given text directly: use it as-is

### Step 2: Write 5 short-form video captions
Each caption must be:
- 8–12 words maximum — short, punchy, designed to be read in under 4 seconds
- A hook or insight designed for vertical video (TikTok/Reels)
- Present tense, active voice
- No hashtags, no emojis

### Step 3: Write 1 Instagram caption
- 150–200 words, conversational and engaging
- Summarizes the key insight from the article
- 10–15 relevant hashtags at the very end

### Step 4: Write results to Supabase
Make an HTTP PATCH request:

URL: ${supabaseUrl}/rest/v1/ai_generations?project_id=eq.${projectId}

Headers:
  apikey: ${supabaseServiceKey}
  Authorization: Bearer ${supabaseServiceKey}
  Content-Type: application/json
  Prefer: return=minimal

Body (JSON):
{
  "caption_options": ["caption 1 text", "caption 2 text", "caption 3 text", "caption 4 text", "caption 5 text"],
  "description": "your full instagram caption with #hashtags at the end",
  "status": "captions_ready"
}

## Rules
- Write captions to Supabase only — do NOT return them as text in your reply
- Confirm success after the PATCH returns a 2xx status
- If the PATCH fails, log the error and retry once`;
}
