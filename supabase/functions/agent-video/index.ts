import { createClient } from "npm:@supabase/supabase-js";
import { anthropic } from "../_shared/anthropic-client.ts";
import type { VideoWebhookPayload } from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: VideoWebhookPayload = await req.json();
    const { project_id, user_email = "", captionStyle = "pill", transitionStyle = "cut", videoSource = "ai" } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const klingApiKey = Deno.env.get("KLING_API_KEY")!;
    const pexelsApiKey = Deno.env.get("PEXELS_API_KEY") ?? "";

    // Fetch the approved captions that were stored in Step 1
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: gen, error } = await supabaseAdmin
      .from("ai_generations")
      .select("id, caption_options")
      .eq("project_id", project_id)
      .single();

    if (error || !gen?.caption_options) {
      return new Response(
        JSON.stringify({ error: "No captions found for project" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const captions: string[] = Array.isArray(gen.caption_options)
      ? gen.caption_options
      : Object.values(gen.caption_options);

    const aiGenId: string = gen.id;

    // Mark as generating immediately so duplicate triggers are blocked
    await supabaseAdmin
      .from("ai_generations")
      .update({ status: "generating_videos" })
      .eq("project_id", project_id);

    // Create the agent, environment, and session — fire and forget.
    // Video generation takes 10–15 min; the frontend polls Supabase for results.
    const agent = await anthropic.beta.agents.create({
      name: `video-agent-${project_id}`,
      model: "claude-sonnet-4-6",
      system: buildVideoSystemPrompt(project_id, aiGenId, captions, supabaseUrl, supabaseServiceKey, supabaseAnonKey, klingApiKey, pexelsApiKey, captionStyle, transitionStyle, videoSource, user_email),
      tools: [{ type: "agent_toolset_20260401" }],
    });

    const environment = await anthropic.beta.environments.create({
      name: `video-env-${project_id}`,
      config: {
        type: "cloud",
        networking: { type: "unrestricted" },
      },
    });

    const session = await anthropic.beta.sessions.create({
      agent: agent.id,
      environment_id: environment.id,
      title: `Video generation — ${project_id}`,
    });

    await anthropic.beta.sessions.events.send(session.id, {
      events: [
        {
          type: "user.message",
          content: [
            {
              type: "text",
              text: `Execute all phases in order for project ${project_id}: Phase 0 (write scene descriptions), Phase 1 (voiceover + kie.ai tasks), Phase 2 (poll for clips), Phase 3 (write URLs to Supabase), Phase 4 (Remotion stitch), Phase 5 (email notification). Do not skip any phase.`,
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
    console.error("agent-video error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildVideoSystemPrompt(
  projectId: string,
  aiGenId: string,
  captions: string[],
  supabaseUrl: string,
  supabaseServiceKey: string,
  supabaseAnonKey: string,
  klingApiKey: string,
  pexelsApiKey: string,
  captionStyle: string,
  transitionStyle: string,
  videoSource: string,
  userEmail: string
): string {
  const captionsJson = JSON.stringify(captions);

  const useKling = videoSource === "ai" || videoSource === "mix";
  const usePexels = videoSource === "stock" || videoSource === "mix";

  // Which clip indices use which source (1-based)
  // mix: Kling = 1,3,5 · Pexels = 2,4
  const klingClips = videoSource === "mix" ? [1, 3, 5] : videoSource === "ai" ? [1, 2, 3, 4, 5] : [];
  const pexelsClips = videoSource === "mix" ? [2, 4] : videoSource === "stock" ? [1, 2, 3, 4, 5] : [];

  const klingPhase = useKling ? `
### ${videoSource === "mix" ? `1b, 1d, 1f — Submit Kling AI tasks for clips ${klingClips.join(", ")}` : "1b–1f — Submit 5 kie.ai video tasks (one per caption, all at the same time)"}
Use SCENE_N (from Phase 0) as the prompt — NOT the raw caption text.

POST https://api.kie.ai/api/v1/jobs/createTask
Headers: Authorization: Bearer ${klingApiKey} / Content-Type: application/json
Body for each (replace N with the clip number and SCENE_N with the scene description):
{
  "model": "kling-3.0/video",
  "input": { "aspect_ratio": "9:16", "duration": "5", "sound": false, "mode": "std", "multi_shots": false, "prompt": "SCENE_N" }
}
→ Save the taskId from each response as TASK_ID_N (for clips ${klingClips.join(", ")}).

If createTask returned an error for any task, write the error text into debug_log and set status to "kling_create_error". Then STOP.` : "";

  const pexelsPhase = usePexels ? `
### ${videoSource === "mix" ? `1c, 1e — Search Pexels for stock clips ${pexelsClips.join(", ")}` : "1b–1f — Search Pexels for all 5 clips (in parallel)"}
For each clip N in [${pexelsClips.join(", ")}], extract 2–3 meaningful keywords from caption N.

GET https://api.pexels.com/videos/search?query=KEYWORDS&per_page=3&orientation=portrait&size=medium
Headers: Authorization: ${pexelsApiKey}

From the response JSON, pick videos[0].video_files[] where the "link" property ends in ".mp4" and has the largest "height" value.
Save that URL as VIDEO_URL_N.
If videos array is empty, try a simpler single-word fallback query (pick the most concrete noun from the caption).
Pexels URLs are available immediately — no polling needed for these clips.` : "";

  const phase2 = useKling ? `
## PHASE 2 — Poll kie.ai until Kling clips are ready (clips ${klingClips.join(", ")})

For each TASK_ID_N (clips ${klingClips.join(", ")}), poll every 15 seconds:
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=TASK_ID_N
Headers: Authorization: Bearer ${klingApiKey}

Keep polling while data.state is "waiting" OR "generating".
Stop when data.state is "completed" OR anything else.

When state is "completed":
- Parse data.resultJson (JSON string) to extract the video URL.
- Write the raw data object to Supabase for debugging: PATCH ... Body: { "debug_log": "<raw JSON string>" }
- Save the video URL as VIDEO_URL_N.

When state is anything other than "waiting", "generating", or "completed" (e.g. "failed"), record null for that VIDEO_URL_N and continue.
${usePexels ? `\nPexels clips (${pexelsClips.join(", ")}) are already available from Phase 1 — no polling needed for them.` : ""}
After all Kling polls finish, write a Supabase checkpoint:
PATCH ${supabaseUrl}/rest/v1/ai_generations?project_id=eq.${projectId}
Body: { "status": "kling_tasks_done" }

---` : `
## PHASE 2 — (Skipped — all clips are from Pexels, no polling needed)

Write a Supabase checkpoint:
PATCH ${supabaseUrl}/rest/v1/ai_generations?project_id=eq.${projectId}
Body: { "status": "kling_tasks_done" }

---`;

  const klingCheckpoint = useKling ? `
After all Phase 1 responses arrive (voiceover + ${videoSource === "mix" ? "Kling tasks for clips " + klingClips.join(", ") : "all 5 Kling tasks"}${usePexels ? " + Pexels URLs for clips " + pexelsClips.join(", ") : ""}), write a Supabase checkpoint:
PATCH ${supabaseUrl}/rest/v1/ai_generations?project_id=eq.${projectId}
Body: { "kling_task_ids": [${klingClips.map(n => `"TASK_ID_${n}"`).join(",")}], "status": "kling_tasks_created" }` : `
After all Phase 1 responses arrive, write a Supabase checkpoint:
PATCH ${supabaseUrl}/rest/v1/ai_generations?project_id=eq.${projectId}
Body: { "status": "kling_tasks_created" }`;

  return `You are a video production agent. Follow these phases IN ORDER. Do NOT skip ahead. Do NOT start a later phase until the earlier phase is fully done.

## Project ID
${projectId}

## Approved Captions (5 total)
${captionsJson}

## Video source mode: ${videoSource}
${videoSource === "ai" ? "All 5 clips generated by Kling AI." : videoSource === "stock" ? "All 5 clips fetched from Pexels stock footage." : "Clips 1, 3, 5 from Kling AI · Clips 2, 4 from Pexels stock footage."}

## Supabase headers (use for ALL Supabase REST calls)
  apikey: ${supabaseServiceKey}
  Authorization: Bearer ${supabaseServiceKey}
  Content-Type: application/json
  Prefer: return=minimal

---

## PHASE 0 — Generate visual scene descriptions (do this before any HTTP calls)

For each of the 5 captions, write a SHORT cinematic scene description (1–2 sentences max) that a video generator can film. Rules:
- Describe a PHYSICAL, FILMABLE scene — real environments, objects, people, motion, light
- Screens, monitors, holograms, and futuristic UI are allowed and encouraged for tech/future topics — they add visual context
- CRITICAL constraint: any text or characters shown on screens must be ILLEGIBLE — blurred, glowing, out of focus, stylized, or abstracted so that no individual letters or words can be read by a viewer
- NEVER show sharp, clearly readable alphanumeric text — this looks AI-generated and breaks immersion
- For competitive/comparison topics: two distinct forces, contrasting colors, parallel paths converging
- Append to every description: "cinematic vertical 9:16, photorealistic, no legible text, no readable characters, any on-screen text must be blurred or stylized"
- These descriptions also serve as keyword inspiration for Pexels searches — make them concrete and searchable

Save these as SCENE_1 … SCENE_5.

---

## PHASE 1 — Generate voiceover AND fetch/submit video clips (run all in parallel, then STOP and wait)

### 1a. Voiceover
POST ${supabaseUrl}/functions/v1/generate-voiceover-and-upload
Headers: Content-Type: application/json
Body: { "script": "${captions.join(" ")}", "ai_gen_id": "${aiGenId}" }
→ Save response.audio_url as AUDIO_URL.
${klingPhase}${pexelsPhase}
${klingCheckpoint}

---
${phase2}

## PHASE 3 — Write video URLs to Supabase (DO NOT proceed to Phase 4 until this PATCH succeeds)

CRITICAL: You must have at least 1 non-null video URL before proceeding. If all 5 are null, write status "kling_all_failed" and STOP.

PATCH ${supabaseUrl}/rest/v1/ai_generations?project_id=eq.${projectId}
Body:
{
  "video_url_1": VIDEO_URL_1_OR_NULL,
  "video_url_2": VIDEO_URL_2_OR_NULL,
  "video_url_3": VIDEO_URL_3_OR_NULL,
  "video_url_4": VIDEO_URL_4_OR_NULL,
  "video_url_5": VIDEO_URL_5_OR_NULL,
  "status": "videos_ready"
}

Confirm the PATCH returned 204. If it failed, write the error to debug_log and STOP.

---

## PHASE 4 — Stitch with Remotion (only after Phase 3 PATCH is confirmed)

First, compute captionTimings based on word counts so captions sync with the voiceover:
- Count words in each of the 5 captions: wordCount_1 … wordCount_5
- total_words = wordCount_1 + wordCount_2 + wordCount_3 + wordCount_4 + wordCount_5
- captionTimings = [
    0,
    round(wordCount_1 / total_words * 670),
    round((wordCount_1 + wordCount_2) / total_words * 670),
    round((wordCount_1 + wordCount_2 + wordCount_3) / total_words * 670),
    round((wordCount_1 + wordCount_2 + wordCount_3 + wordCount_4) / total_words * 670)
  ]

POST https://clipfrom-remotion-production.up.railway.app/render
Headers: Content-Type: application/json
Body:
{
  "clips": [VIDEO_URL_1_OR_NULL, VIDEO_URL_2_OR_NULL, VIDEO_URL_3_OR_NULL, VIDEO_URL_4_OR_NULL, VIDEO_URL_5_OR_NULL],
  "audioUrl": "AUDIO_URL",
  "captions": ${captionsJson},
  "captionStyle": "${captionStyle}",
  "captionTimings": [CAPTION_TIMING_1, CAPTION_TIMING_2, CAPTION_TIMING_3, CAPTION_TIMING_4, CAPTION_TIMING_5]
}

On success, PATCH Supabase:
Body: { "stitched_video_url": "<returned URL>", "status": "complete" }

On error, PATCH Supabase:
Body: { "debug_log": "<full error response>", "status": "remotion_error" }

---

## PHASE 5 — Send email notification (only after Phase 4 success PATCH is confirmed)

${userEmail ? `User email: ${userEmail}

POST ${supabaseUrl}/functions/v1/send-notification-email
Headers: Content-Type: application/json, Authorization: Bearer ${supabaseAnonKey}, apikey: ${supabaseAnonKey}
Body: { "to": "${userEmail}", "video_url": "<stitched_video_url from Remotion response>" }

If this call fails or returns an error, write the error text to debug_log but do NOT change the status field — the video is already complete and the user can still access it.` : `No user email provided — skip this phase entirely.`}

---

## ABSOLUTE RULES
1. Execute phases in order: 0 → 1 → 2 → 3 → 4. Never skip a phase.
2. Phase 2 MUST complete before Phase 3. Phase 3 MUST complete before Phase 4.
3. Never call Remotion (Phase 4) if video_url_1 through video_url_5 have not been written to Supabase in Phase 3.
4. After each Supabase PATCH, confirm it returned HTTP 204 before continuing.`;
}
