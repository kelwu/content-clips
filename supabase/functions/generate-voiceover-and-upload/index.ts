import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const FPS = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { script, ai_gen_id, captions } = await req.json();

    // Use the with-timestamps endpoint to get character-level timing data
    const elevenResponse = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/KXOzch1bNSOicTxNAakl/with-timestamps",
      {
        method: "POST",
        headers: {
          "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY") ?? "85a53a50494da17fcbe2414ee4d25df063d791e6422c54dffbdf0d3075050092",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!elevenResponse.ok) {
      const errText = await elevenResponse.text();
      throw new Error(`ElevenLabs error ${elevenResponse.status}: ${errText}`);
    }

    const elevenData = await elevenResponse.json();

    // Decode base64 audio to binary
    const base64Audio: string = elevenData.audio_base64;
    const binaryStr = atob(base64Audio);
    const audioBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      audioBytes[i] = binaryStr.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fileName = `voiceover-${ai_gen_id}.mp3`;
    const { error } = await supabase.storage
      .from("voiceovers")
      .upload(fileName, audioBytes, { contentType: "audio/mpeg", upsert: true });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from("voiceovers")
      .getPublicUrl(fileName);

    // Derive per-caption frame offsets from ElevenLabs character timestamps
    let caption_timings: number[] = [0, 0, 0, 0, 0];

    const alignment = elevenData.alignment;
    if (captions && Array.isArray(captions) && captions.length === 5 && alignment?.character_start_times_seconds) {
      const startTimes: number[] = alignment.character_start_times_seconds;

      // The script is captions.join(" "), so caption boundaries are at known character offsets
      let charOffset = 0;
      for (let i = 0; i < 5; i++) {
        if (i === 0) {
          caption_timings[0] = 0;
        } else {
          // Clamp to valid range in case of any length mismatch
          const idx = Math.min(charOffset, startTimes.length - 1);
          caption_timings[i] = Math.round(startTimes[idx] * FPS);
        }
        charOffset += captions[i].length + 1; // +1 for the joining space
      }
    }

    return new Response(
      JSON.stringify({ success: true, audio_url: publicUrl, caption_timings }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
