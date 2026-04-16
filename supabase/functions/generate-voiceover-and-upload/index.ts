import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { script, ai_gen_id } = await req.json();

    // Call ElevenLabs
    const elevenResponse = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/KXOzch1bNSOicTxNAakl",
      {
        method: "POST",
        headers: {
          "xi-api-key": "85a53a50494da17fcbe2414ee4d25df063d791e6422c54dffbdf0d3075050092",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    const audioBuffer = await elevenResponse.arrayBuffer();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fileName = `voiceover-${ai_gen_id}.mp3`;
    const { error } = await supabase.storage
      .from("voiceovers")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from("voiceovers")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ success: true, audio_url: publicUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
