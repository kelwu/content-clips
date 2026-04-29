# ClipFrom — App Context & Feature Overview

> Last updated: 2026-04-28  
> Purpose: Privacy policy drafting + Instagram Graph API access application  
> Feed this file to a fresh Claude session for full working context.

---

## What ClipFrom Does

ClipFrom is an AI-powered article-to-short-form-video generator. Users paste an article URL or raw text, and ClipFrom automatically produces five ~5-second vertical video clips (9:16) stitched into a single ~25-second MP4 ready to post on Instagram Reels, TikTok, or YouTube Shorts — with no manual editing required.

Each output includes:
- AI-generated voiceover (ElevenLabs TTS)
- B-roll video footage (AI-generated via Kling AI, stock from Pexels, or a mix)
- Synchronized captions and transitions
- A ready-to-post Instagram caption with hashtags

Users can also publish the final video directly to a connected Instagram Business or Creator account via the Instagram Graph API.

**Target users:** Content creators, marketers, journalists, and small business owners repurposing written content as short-form video.

---

## User-Facing Flow

1. **Landing page (`/`)** — User pastes an article URL or raw text and enters their email. Submitting triggers the content agent.
2. **Login (`/login`)** — Email/password authentication or signup via Supabase Auth. Required before accessing the pipeline.
3. **Caption Editor (`/editor`)** — User reviews and edits 5 AI-generated captions, chooses caption style (pill / bold / lower-third / none), transition style (cut / fade / dissolve / wipe), and video source (AI / stock / mix).
4. **Video Results (`/results/:projectId`)** — Live status tracker while the pipeline runs. On completion: MP4 preview player, editable Instagram caption, download button, and Instagram post button.
5. **Studio (`/studio/:projectId`)** — Video composition preview using Remotion.

Protected routes (`/editor`, `/results`, `/studio`) require a valid Supabase Auth session.

---

## Architecture Overview

ClipFrom uses a **fire-and-forget agent pattern**:

```
User action → Supabase Edge Function → spawns Anthropic Managed Agent
                                         ↓ (runs async in Anthropic cloud)
                                       Agent orchestrates all API calls
                                         ↓
                                       Writes results to Supabase DB
                                         ↑
Frontend polls Supabase every 3s ────────┘
```

The Edge Function returns immediately after spawning the agent, avoiding timeout issues for long-running video generation. The frontend polls the `ai_generations` table for status changes.

---

## Pipeline Details

### Stage 1: Content Agent (`agent-content`)

**Trigger:** Form submission on landing page  
**Input:** `{ content, type: "url"|"text", project_id, user_email }`

- Spawns an Anthropic Managed Agent (Claude Sonnet 4.6) with web fetch toolset
- Fetches and parses article content if URL provided
- Generates 5 short-form caption hooks (15–25 words each)
- Generates 1 Instagram caption (150–200 words with hashtags)
- Writes to `ai_generations`: `caption_options`, `description`, status `captions_ready`

### Stage 2: Video Agent (`agent-video`)

**Trigger:** User clicks "Generate" in Caption Editor  
**Input:** `{ project_id, user_email, captionStyle, transitionStyle, videoSource }`

Phase-by-phase execution:

- **Phase 0** — Generate cinematic scene descriptions (one per caption). Rules: filmable physical scenes, no legible text, vertical 9:16 framing.
- **Phase 1 (parallel)**
  - **1a** — POST to `generate-voiceover-and-upload` → ElevenLabs TTS → MP3 stored in Supabase Storage → returns `AUDIO_URL`
  - **1b–1f** — Video clips based on `videoSource`:
    - `"ai"`: Submit 5 tasks to Kling AI (`kling-3.0/video`, 5s, 9:16 portrait)
    - `"stock"`: Pexels search by caption keywords → highest-resolution portrait MP4
    - `"mix"`: Kling for clips 1, 3, 5 — Pexels for clips 2, 4
- **Phase 2** — Poll Kling AI every 15s until `state === "completed"` (skipped for stock-only)
- **Phase 3** — PATCH `ai_generations` with `video_url_1` through `video_url_5`, status `videos_ready`
- **Phase 4** — POST to Remotion renderer with clips, audio, captions, caption style, and word-count-proportional timings → returns stitched MP4 URL → PATCH Supabase: `stitched_video_url`, status `complete`
- **Phase 5** — Send video-ready email via Resend (non-blocking)

### Stage 3: Instagram Publishing (`post-to-instagram`)

**Trigger:** User clicks "Post to Instagram" on Results page  
**Flow using Instagram Graph API v22.0:**
1. `POST /{ig-user-id}/media` — Create media container with video URL and caption
2. `GET /{ig-container-id}?fields=status_code` — Poll until container is `FINISHED`
3. `POST /{ig-user-id}/media_publish` — Publish the Reel

### Pipeline Status State Machine

```
processing → captions_ready → generating_videos → kling_tasks_created
  → kling_tasks_done → videos_ready → complete

Error states: kling_create_error, kling_all_failed, remotion_error
```

---

## Authentication & User Accounts

- **Supabase Auth** — email/password signup and login
- **AuthContext** — React context providing session state across the app
- **ProtectedRoute** — HOC that redirects unauthenticated users to `/login`
- JWT tokens used for all Supabase API calls
- User email is used for pipeline notification delivery

**Not yet implemented:** OAuth (Google/GitHub), user dashboard/history, subscription tiers, payment integration, per-user Instagram OAuth (currently single connected account via server env vars).

---

## External Services & APIs

| Service | Purpose | Data Sent |
|---|---|---|
| **Anthropic Claude Sonnet 4.6** | Caption + video script generation via Managed Agents | Article text or URL content |
| **ElevenLabs** | Text-to-speech voiceover synthesis | Caption text |
| **Kling AI** (`api.kie.ai`) | AI video clip generation | Scene description text, aspect ratio |
| **Pexels** | Stock video footage search and retrieval | Caption keyword strings |
| **Instagram Graph API v22.0** | Publishing Reels to Instagram business accounts | Video URL, caption text, access token |
| **Supabase** | PostgreSQL database + file storage + Edge Functions runtime | User account data, project data, voiceover MP3s |
| **Remotion** (self-hosted on Railway) | Video stitching and rendering | Clip URLs, audio URL, captions, timing metadata |
| **Resend** | Transactional email notifications | User email address, video URL |

---

## Data Collected & Stored

### User Account Data
- Email address (login + notifications)
- Hashed password (managed entirely by Supabase Auth)
- Internal user UUID

### Project Data (per video)
- Article URL or pasted article text
- AI-generated captions (5 hooks + 1 Instagram caption)
- User-edited final Instagram caption
- Style preferences (caption style, transition style, video source)
- Video clip URLs (from Kling AI or Pexels CDN)
- Final stitched MP4 URL (hosted on Remotion renderer)
- Pipeline status and error logs
- Kling AI task IDs (for polling during generation)

### Files Stored
- Voiceover MP3 files in Supabase Storage (`voiceovers/voiceover-{ai_gen_id}.mp3`)

### Instagram Data
- Instagram user access token — stored as a server-side environment variable only; never stored in the database or exposed to the frontend
- Instagram Business Account ID — stored as environment variable
- No Instagram audience data, analytics, follower lists, DMs, or engagement metrics are collected or stored

---

## Database Schema

### `projects`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `article_url` | text | Original article URL (null if text input) |
| `status` | text | Overall project status |
| `user_id` | uuid | FK → `auth.users` |

### `ai_generations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `project_id` | uuid | FK → `projects` |
| `caption_options` | jsonb | Array of 5 short-form captions |
| `description` | text | AI-generated Instagram caption |
| `final_caption` | text | User-edited Instagram caption |
| `video_url_1` – `video_url_5` | text | Individual clip URLs |
| `stitched_video_url` | text | Final rendered MP4 URL |
| `kling_task_ids` | jsonb | Kling AI task IDs |
| `status` | text | Pipeline stage |
| `debug_log` | text | Error details on failure |

### Storage Buckets
- `voiceovers/` — `voiceover-{ai_gen_id}.mp3`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, TypeScript, Vite 7 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI primitives) |
| Data fetching | TanStack Query v5 |
| Backend | Supabase Edge Functions (Deno runtime) |
| Agent framework | Anthropic Managed Agents SDK (`anthropic.beta.agents`) |
| Auth | Supabase Auth (email/password) |
| Video rendering | Remotion (self-hosted on Railway) |
| Frontend hosting | Vercel |
| Backend hosting | Supabase |
| Domain | clipfrom.ai |

---

## Key Files

```
src/
  App.tsx                          — Route definitions + ProtectedRoute
  contexts/
    AuthContext.tsx                — Supabase Auth session management
  pages/
    ArticleInput.tsx               — Landing page + article form
    CaptionEditor.tsx              — Caption review + style pickers
    VideoResults.tsx               — Status tracker + video preview + download
    Login.tsx                      — Email/password login + signup
    Features.tsx                   — /features marketing page
  lib/
    supabase.ts                    — Supabase client (anon key)

supabase/functions/
  agent-content/index.ts           — Caption generation Managed Agent
  agent-video/index.ts             — Video orchestration Managed Agent
  post-to-instagram/index.ts       — Instagram Graph API publishing
  generate-voiceover-and-upload/   — ElevenLabs TTS + Supabase storage
  send-notification-email/         — Resend transactional email
  _shared/
    types.ts                       — Shared TypeScript interfaces
    anthropic-client.ts            — Shared Anthropic SDK instance
```

---

## Instagram Graph API — Summary for App Review

**What ClipFrom uses the API for:**  
Publishing Reels to a connected Instagram Business or Creator account on behalf of the user. This is the only use of the Instagram Graph API.

**What ClipFrom does NOT use the API for:**  
Reading messages, comments, follower data, analytics, audience insights, or any other Instagram account data.

**Permissions required:**
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement` (if account linked via Facebook Page)

**Data handling:**
- Instagram access token stored server-side only (environment variable), never in the database or client
- No Instagram user profile data is stored beyond what is necessary to publish a video
- No data is shared with third parties

**Current architecture note:**  
ClipFrom currently supports a single connected Instagram Business account via server-side environment variables. Per-user Instagram OAuth (allowing each user to connect their own account) is planned but not yet implemented.
