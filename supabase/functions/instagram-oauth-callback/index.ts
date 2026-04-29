import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify the calling user
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { code, state } = await req.json();

  // State must match the authenticated user's ID (CSRF guard)
  if (state !== user.id) {
    return new Response(JSON.stringify({ error: "Invalid state parameter" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const appId = Deno.env.get("INSTAGRAM_APP_ID")!;
  const appSecret = Deno.env.get("INSTAGRAM_APP_SECRET")!;
  const redirectUri = Deno.env.get("INSTAGRAM_OAUTH_REDIRECT_URI") ?? "https://clipfrom.ai/auth/instagram/callback";

  // Step 1: Exchange code for short-lived user access token
  const tokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("Short-lived token exchange failed:", tokenData);
    return new Response(JSON.stringify({ error: "Token exchange failed", details: tokenData }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const shortLivedToken: string = tokenData.access_token;

  // Step 2: Exchange for long-lived token (60 days)
  const longTokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  longTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
  longTokenUrl.searchParams.set("client_id", appId);
  longTokenUrl.searchParams.set("client_secret", appSecret);
  longTokenUrl.searchParams.set("fb_exchange_token", shortLivedToken);

  const longTokenRes = await fetch(longTokenUrl.toString());
  const longTokenData = await longTokenRes.json();
  if (!longTokenData.access_token) {
    console.error("Long-lived token exchange failed:", longTokenData);
    return new Response(JSON.stringify({ error: "Long-lived token exchange failed", details: longTokenData }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const longLivedToken: string = longTokenData.access_token;
  const expiresIn: number = longTokenData.expires_in ?? 5184000; // default 60 days
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  // Step 3: Get the user's Facebook Pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v22.0/me/accounts?access_token=${longLivedToken}`
  );
  const pagesData = await pagesRes.json();
  const pages: { id: string; access_token: string }[] = pagesData.data ?? [];

  // Step 4: Find the Instagram Business Account linked to any Page
  let igAccountId: string | null = null;
  let igUsername: string | null = null;

  for (const page of pages) {
    const igRes = await fetch(
      `https://graph.facebook.com/v22.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    );
    const igData = await igRes.json();
    if (igData.instagram_business_account?.id) {
      igAccountId = igData.instagram_business_account.id;
      break;
    }
  }

  // If no Page-linked IG account, try fetching via the user token directly
  // (works for Creator accounts using new Instagram Login)
  if (!igAccountId) {
    const meRes = await fetch(
      `https://graph.instagram.com/v22.0/me?fields=user_id,username&access_token=${longLivedToken}`
    );
    const meData = await meRes.json();
    if (meData.user_id) {
      igAccountId = meData.user_id;
      igUsername = meData.username ?? null;
    }
  }

  if (!igAccountId) {
    return new Response(
      JSON.stringify({ error: "No Instagram Business or Creator account found linked to this Facebook account." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Step 5: Get Instagram username (if we don't have it yet)
  if (!igUsername) {
    const igDetailRes = await fetch(
      `https://graph.instagram.com/v22.0/${igAccountId}?fields=username&access_token=${longLivedToken}`
    );
    const igDetailData = await igDetailRes.json();
    igUsername = igDetailData.username ?? null;
  }

  // Step 6: Persist to user_profiles using the service role client
  const adminSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error: upsertError } = await adminSupabase
    .from("user_profiles")
    .upsert({
      id: user.id,
      instagram_account_id: igAccountId,
      instagram_access_token: longLivedToken,
      instagram_token_expires_at: expiresAt,
      instagram_username: igUsername,
      updated_at: new Date().toISOString(),
    });

  if (upsertError) {
    console.error("Failed to save Instagram credentials:", upsertError);
    return new Response(JSON.stringify({ error: "Failed to save Instagram connection" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, username: igUsername, account_id: igAccountId }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
