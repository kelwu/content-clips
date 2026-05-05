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
      articleText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 10000);
    }

    // Generate captions via Claude
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a social media content writer. Generate captions from this article.

Article:
${articleText}

Return ONLY valid JSON — no explanation, no markdown fences:
{
  "caption_options": ["caption 1", "caption 2", "caption 3", "caption 4", "caption 5"],
  "description": "instagram caption here"
}

Rules for caption_options (exactly 5 items):
- Each 8–12 words, punchy hook designed for TikTok/Reels
- Present tense, active voice, no hashtags, no emojis

Rules for description:
- 150–200 words, conversational tone
- Ends with 10–15 relevant hashtags`,
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
