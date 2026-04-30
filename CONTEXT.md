# ClipFrom — App Context & Feature Overview

> Last updated: 2026-04-30
> Purpose: Brainstorming and product context for Claude Chat sessions.
> Feed this file to a fresh Claude session for full working context.

---

## What ClipFrom Does

ClipFrom is an AI-powered article-to-short-form-video generator. Users paste an article URL or raw text, and ClipFrom automatically produces five ~5-second vertical video clips (9:16) stitched into a single ~25-second MP4 ready to post on Instagram Reels, TikTok, or YouTube Shorts — with no manual editing required.

Each output includes:
- AI-generated voiceover (ElevenLabs TTS, synced to captions via real character-level timestamps)
- B-roll video footage (AI-generated via Kling AI, stock from Pexels, or a mix)
- Synchronized captions and transitions
- A ready-to-post Instagram caption with hashtags

Users can also publish the final video directly to their connected Instagram Business or Creator account via the Instagram Graph API (per-user OAuth).

**Target users:** Content creators, marketers, journalists, and small business owners repurposing written content as short-form video.

**Domain:** clipfrom.ai | **GitHub:** kelwu/clipfrom | **Stack:** React + Supabase + Vercel

---

## Monetization

### Pricing Tiers
| Plan | Price | Credits | Cost/video |
|---|---|---|---|
| Free | $0 | 2 (on signup, one-time) | — |
| Starter | $12/mo | 5 | $2.40 |
| Pro | $29/mo | 20 | $1.45 |
| Creator | $59/mo | 50 | $1.18 |

### Cost Per Generation (estimated)
- Kling AI (5 clips): ~$1.40
- ElevenLabs TTS: ~$0.05–0.10
- Remotion (Railway): ~$0.10–0.20
- Claude API (Managed Agents): ~$0.10–0.20
- **Total: ~$1.65–1.90 per generation**

Note: Pro tier ($29/20 gen) has thin margin — $35 in costs vs $29 revenue at full usage. Watch this.

### Infrastructure Baseline
~$30–60/month fixed costs before any user generates a video. 2–3 Starter subscribers covers it.

---

## User-Facing Flow

1. **Landing page (`/`)** — Paste an article URL or text. Requires login. Shows credit balance.
2. **Login (`/login`)** — Email/password auth + forgot password flow.
3. **Caption Editor (`/editor`)** — Review/edit 5 AI-generated captions. Choose caption style (pill / bold / lower-third / none), transition style (cut / fade / dissolve / wipe), and video source (AI / stock / mix).
4. **Video Results (`/results/:projectId`)** — Live pipeline status tracker. On completion: MP4 preview, editable Instagram caption, download button, and "Post to Instagram" button.
5. **Studio (`/studio/:projectId`)** — Remotion-powered video composition preview.
6. **Dashboard (`/dashboard`)** — Video library: all past projects grouped as Generating / Failed / Ready. Retry button on failed videos. Thumbnail previews.
7. **Settings (`/settings`)** — Account info, Instagram connect/disconnect (with token expiry warning), caption outro editor.
8. **Upgrade (`/upgrade/success`)** — Post-Stripe-checkout success page, polls for credit delivery.
9. **Privacy Policy (`/privacy`)** — Required for Instagram Graph API review.
10. **Terms of Service (`/terms`)** — Full TOS.
11. **Instagram OAuth callback (`/auth/instagram/callback`)** — Handles redirect after user connects Instagram account.
12. **Password reset (`/update-password`)** — Set new password after clicking reset email link.

Protected routes require a valid Supabase Auth session.

---

## Architecture

ClipFrom uses a **fire-and-forget Managed Agent pattern**:

```
User action → Supabase Edge Function → spawns Anthropic Managed Agent
                                         ↓ (runs async in Anthropic cloud)
                                       Agent orchestrates all API calls
                                         ↓
                                       Writes results to Supabase DB
                                         ↑
Frontend polls Supabase every 3s ────────┘
```

The Edge Function returns immediately. The frontend polls `ai_generations.status` for changes.

---

## Pipeline Details

### Stage 1: Content Agent (`agent-content`)
- Spawns Claude Sonnet 4.6 Managed Agent
- Fetches and parses article (if URL)
- Generates 5 short-form caption hooks + 1 Instagram caption
- Writes to `ai_generations`: `caption_options`, `description`, status `captions_ready`

### Stage 2: Video Agent (`agent-video`)
- **Credit gate**: verifies JWT, checks `credits_remaining` in `user_profiles`, decrements before pipeline starts. Returns 402 if no credits. Admins (`is_admin=true`) bypass entirely.

Phase-by-phase:
- **Phase 0** — Generate cinematic scene descriptions (one per caption)
- **Phase 1 (parallel)**
  - **1a** — POST to `generate-voiceover-and-upload` → ElevenLabs `/with-timestamps` endpoint → MP3 uploaded to Supabase Storage → returns `audio_url` + `caption_timings` (real frame offsets from character-level timestamp data)
  - **1b–1f** — Video clips via Kling AI (AI), Pexels (stock), or mix
- **Phase 2** — Poll Kling AI every 15s until clips are ready
- **Phase 3** — PATCH `ai_generations` with clip URLs, status `videos_ready`
- **Phase 4** — POST to Remotion renderer with clips, audio, captions, and real `captionTimings` → returns stitched MP4 URL → PATCH status `complete`
- **Phase 5** — Send video-ready email via Resend

### Stage 3: Instagram Publishing (`post-to-instagram`)
- Looks up user's `instagram_access_token` and `instagram_account_id` from `user_profiles`
- Creates media container → polls until FINISHED → publishes Reel

### Stage 4: Stripe Payments
- `stripe-checkout` Edge Function: verifies JWT, creates/reuses Stripe customer, creates subscription Checkout session, returns hosted URL
- `stripe-webhook` Edge Function: handles `checkout.session.completed` (adds credits, saves customer/subscription IDs) and `invoice.payment_succeeded` (monthly renewals, skips first invoice to avoid double-credit)
- Plans stored in Stripe with `credits` in subscription metadata for webhook to read

### Caption Timing (important implementation detail)
- ElevenLabs `/with-timestamps` returns character-level start times for the full script
- Caption boundaries are located at known character offsets in `captions.join(" ")`
- Frame offset = `Math.round(startTimeSeconds × 30)`
- These real frame numbers are passed directly to Remotion

---

## Credit System

- New users: 2 free credits (auto-provisioned by Supabase DB trigger on `auth.users` insert)
- `is_admin = true` in `user_profiles` → bypasses all credit checks, AppShell shows "∞ Admin"
- Credit deducted at the start of `agent-video` before pipeline runs
- Failed generations do NOT automatically refund credits (manual refund via SQL for now)
- Credit balance shown in AppShell sidebar with color-coded progress bar (violet → amber → red)
- AppShell "Upgrade" button opens pricing modal

### Admin Account
- Email: kelwu@gmail.com
- `is_admin = true`, `credits_remaining = 999`
- To reset manually: `UPDATE user_profiles SET credits_remaining = 999 WHERE id = (SELECT id FROM auth.users WHERE email = 'kelwu@gmail.com');`

---

## Instagram OAuth Flow (per-user)

1. User clicks "Connect Instagram" on VideoResults or Settings page
2. Frontend calls `instagram-oauth-start` Edge Function → gets Facebook OAuth URL
3. Browser redirects to Facebook login with scopes: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`, `pages_show_list`
4. Facebook redirects to `clipfrom.ai/auth/instagram/callback?code=XXX&state={user_id}`
5. `InstagramCallback` page calls `instagram-oauth-callback` Edge Function:
   - Exchanges code → short-lived token → long-lived token (60 days)
   - Finds Instagram Business Account via Facebook Pages
   - Stores `instagram_account_id`, `instagram_access_token`, `instagram_token_expires_at`, `instagram_username` in `user_profiles`
6. Settings page shows connected account with token expiry warning (amber if < 7 days)

**Pending Instagram Graph API review** — app is built but not yet submitted to Meta for Live mode approval. Needs: screencast demo, app icon, switch to Live mode.

---

## Pages & Routes

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Landing page — article input |
| `/login` | Public | Email/password login + signup + forgot password |
| `/update-password` | Public | Set new password after reset email |
| `/editor` | Protected | Caption review + style pickers |
| `/results/:projectId` | Protected | Pipeline status + video preview |
| `/studio/:projectId` | Protected | Remotion composition preview |
| `/dashboard` | Protected | Video library with retry, thumbnails, status |
| `/settings` | Protected | Account, Instagram, caption outro |
| `/upgrade/success` | Protected | Post-Stripe checkout confirmation |
| `/features` | Public | Marketing page |
| `/privacy` | Public | Privacy policy |
| `/terms` | Public | Terms of service |
| `/auth/instagram/callback` | Public | Instagram OAuth callback handler |

---

## External Services

| Service | Purpose | Data Sent |
|---|---|---|
| **Anthropic Claude Sonnet 4.6** | Caption + video script generation (Managed Agents) | Article text/URL |
| **ElevenLabs** | TTS voiceover with character-level timestamps | Caption text |
| **Kling AI** | AI video clip generation (5s, 9:16) | Scene descriptions |
| **Pexels** | Stock footage search | Caption keywords |
| **Instagram Graph API v22.0** | Publishing Reels | Video URL, caption, access token |
| **Supabase** | PostgreSQL + storage + Edge Functions + Auth | All user/project data |
| **Remotion** (Railway) | Video stitching | Clip URLs, audio, captions, timings |
| **Resend** | Email notifications | User email, video URL |
| **Stripe** | Subscription payments | Email, plan selection |

---

## Database Schema

### `user_profiles`
| Column | Description |
|---|---|
| `id` | UUID → `auth.users` |
| `caption_outro` | Persistent outro appended to every Instagram caption |
| `instagram_account_id` | Connected IG Business Account ID |
| `instagram_access_token` | Long-lived token (60 days) |
| `instagram_token_expires_at` | Expiry timestamp |
| `instagram_username` | e.g. "clipfrom_ai" |
| `credits_remaining` | INT, default 2, decremented per generation |
| `is_admin` | BOOLEAN, default false — bypasses credit gate |
| `stripe_customer_id` | Stripe customer ID |
| `stripe_subscription_id` | Active subscription ID |
| `updated_at` | Last modified |

### `projects`
| Column | Notes |
|---|---|
| `id` | UUID |
| `user_id` | FK → `auth.users` |
| `article_url` | Source URL (null if text input) |
| `created_at` | Timestamp |

### `ai_generations`
| Column | Notes |
|---|---|
| `caption_options` | jsonb — 5 short-form hooks |
| `description` | AI-generated Instagram caption |
| `final_caption` | User-edited caption |
| `video_url_1–5` | Individual clip URLs |
| `stitched_video_url` | Final MP4 URL |
| `kling_task_ids` | jsonb — for polling |
| `status` | Pipeline stage |
| `debug_log` | Error details |
| `caption_timings` | Real frame offsets from ElevenLabs timestamps |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, TypeScript, Vite 7 |
| Styling | Tailwind CSS (violet accent `#8b5cf6`) + shadcn/ui + inline oklch styles |
| Backend | Supabase Edge Functions (Deno) |
| AI Agents | Anthropic Managed Agents SDK (claude-sonnet-4-6) |
| Auth | Supabase Auth (email/password) |
| Payments | Stripe (subscription, hosted checkout) |
| Video | Remotion renderer on Railway |
| Hosting | Vercel (frontend, auto-deploys from GitHub main) |
| Domain | clipfrom.ai (purchased via Porkbun) |

---

## What's Built ✅

- Article → video pipeline (URL or text input)
- AI caption generation (Claude Managed Agents)
- Caption editor with style/transition/source pickers
- ElevenLabs voiceover with real timestamp-based caption sync
- Kling AI video generation + Pexels stock footage
- Remotion video stitching
- Supabase Auth (email/password, protected routes, forgot password)
- Per-user Instagram OAuth (connect account, post Reels, disconnect in Settings)
- Caption outro (persistent per-user text)
- Email notifications on video completion (Resend)
- **Video dashboard/library** (`/dashboard`) — all past videos, status grouping, retry failed
- **Settings page** (`/settings`) — account, Instagram, caption outro
- **Onboarding modal** — shown once to new users with 0 projects
- **Credit system** — free tier (2 credits), admin bypass, balance in sidebar, gate in agent-video
- **Stripe payments** — Starter/Pro/Creator plans, hosted checkout, webhook for credit delivery
- Privacy policy + Terms of Service pages
- Purple/violet color scheme throughout

---

## What's NOT Built Yet (v2 Roadmap)

- **Instagram Graph API approval** — app is ready but not yet submitted for Meta Live mode
- **Instagram token refresh** — tokens expire after 60 days; needs cron job or refresh-on-use
- **Credit refund on failed generation** — currently manual (SQL); no automatic refund
- **Stripe customer portal** — users can't manage/cancel subscriptions from within the app
- **Scheduling / TikTok / YouTube posting**
- **Burned-in animated captions** (SubMagic-style) — currently captions are overlaid by Remotion
- **Hook text overlay** for first 2–3 seconds
- **Multi-language support**
- **Remotion renderer scaling** (currently single Railway instance)
- **Team/agency accounts**

---

## Immediate Next Priorities

1. **Instagram Graph API submission** — submit to Meta for Live mode approval (screencast demo needed)
2. **Instagram token refresh** — 60-day expiry cron job
3. **Stripe customer portal** — let users manage/cancel subscriptions
4. **Credit refund on failure** — automatic refund when pipeline errors
