import { createClient } from "npm:@supabase/supabase-js";
import Anthropic from "npm:@anthropic-ai/sdk";
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
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark processing immediately
    await supabase.from("ai_generations").upsert(
      { project_id, status: "processing", caption_options: [] },
      { onConflict: "project_id" }
    );

    // Fetch article text if URL was given
    let articleText = content;
    if (type === "url") {
      const resp = await fetch(content, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ClipFrom/1.0)" },
      });
      const html = await resp.text();
      // Extract main content: remove boilerplate then grab densest text block
      const cleaned = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      // Take up to 12000 chars to give Claude more article context
      articleText = cleaned.slice(0, 12000);
    }

    // Generate captions via Claude
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: `You are an expert viral short-form video scriptwriter. You create captions that stop people mid-scroll. Your captions are specific, surprising, and make the viewer feel like they're about to learn something they can't afford to miss. You never write generic summaries — you write hooks that create curiosity gaps, reveal counter-intuitive truths, or surface the single most shocking or valuable insight from the content.`,
      messages: [
        {
          role: "user",
          content: `Transform this article into 5 short-form video captions and 1 Instagram caption.

Article:
${articleText}

Return ONLY valid JSON — no explanation, no markdown fences:
{
  "caption_options": ["caption 1", "caption 2", "caption 3", "caption 4", "caption 5"],
  "description": "instagram caption here"
}

Rules for caption_options (exactly 5 items):
- Each caption is the TEXT OVERLAY shown on screen during a vertical video clip — it must be readable in under 4 seconds
- 8–12 words max, but make every word earn its place
- Write the HOOK or KEY INSIGHT, not a description of the article
- Use one of these proven formats:
  • Curiosity gap: "The one thing [experts/doctors/scientists] won't tell you about X"
  • Counter-intuitive: "Why doing X actually makes Y worse"
  • Specific stat or claim: "X% of people do Y — here's why that's a problem"
  • Bold statement: "This changed how I think about X forever"
  • Stakes: "If you're doing X, you need to see this"
- Present tense, active voice, no hashtags, no emojis
- Each of the 5 captions should take a DIFFERENT angle on the article — don't repeat the same idea

Rules for description:
- 150–200 words, conversational and direct
- Opens with the strongest hook from the article
- Explains the key insight or finding in plain language
- Ends with a call to action and 10–15 relevant hashtags`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`No JSON in Claude response: ${text.slice(0, 200)}`);

    const data = JSON.parse(jsonMatch[0]) as {
      caption_options: string[];
      description: string;
    };

    // Write captions to DB
    await supabase
      .from("ai_generations")
      .update({
        caption_options: data.caption_options,
        description: data.description,
        status: "captions_ready",
      })
      .eq("project_id", project_id);

    // Return captions directly — frontend can navigate immediately
    return new Response(
      JSON.stringify({ ok: true, project_id, caption_options: data.caption_options, description: data.description }),
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
