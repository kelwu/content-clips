import { useNavigate } from "react-router-dom";

const C = {
  bg: "oklch(14% 0.015 250)",
  accent: "oklch(72% 0.17 280)",
  fg: "oklch(96% 0.005 250)",
  fgMuted: "oklch(65% 0.01 250)",
  fgDim: "oklch(45% 0.01 250)",
  strokeSoft: "oklch(100% 0 0 / 0.08)",
  strokeMed: "oklch(100% 0 0 / 0.13)",
  surface: "oklch(18% 0.015 250)",
  surfaceRaised: "oklch(21% 0.015 250)",
} as const;

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{ background: C.bg, color: C.fg, fontFamily: '"Geist", system-ui, sans-serif', minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: "oklch(14% 0.015 250 / 0.85)", borderBottom: `1px solid ${C.strokeSoft}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: C.fg }}>
            <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="oklch(14% 0.015 250)"><polygon points="6,3 20,12 6,21" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>ClipFrom</span>
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "7px 18px", background: C.accent, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "oklch(14% 0.015 250)", cursor: "pointer" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Page header */}
      <div style={{ paddingTop: 112, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, pointerEvents: "none",
          background: "radial-gradient(ellipse at top, oklch(72% 0.17 280 / 0.07) 0%, transparent 65%)" }} />
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>
          Legal
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Privacy Policy</h1>
        <p style={{ color: C.fgMuted, fontSize: 14, margin: 0 }}>
          Effective Date: April 28, 2026 &nbsp;·&nbsp; Last Updated: April 28, 2026 &nbsp;·&nbsp; Applies to: clipfrom.ai
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 96px" }}>

        <p style={{ color: C.fgMuted, lineHeight: 1.75, marginBottom: 8 }}>
          ClipFrom ("we," "us," or "our") is an AI-powered platform that converts articles and written content into
          short-form vertical videos. This Privacy Policy explains what information we collect, how we use it, and your
          rights regarding that information.
        </p>
        <p style={{ color: C.fgMuted, lineHeight: 1.75, marginBottom: 48 }}>
          By using ClipFrom, you agree to the practices described in this policy.
        </p>

        <Section title="1. Information We Collect">
          <SubSection title="1.1 Account Information">
            <p>When you create a ClipFrom account, we collect:</p>
            <List items={[
              "Email address (used for login and notifications)",
              "Password (hashed and managed securely by Supabase Auth — we never store plaintext passwords)",
              "An internal user identifier (UUID)",
            ]} />
          </SubSection>
          <SubSection title="1.2 Content You Provide">
            <p>To use ClipFrom, you submit content for processing. We collect and store:</p>
            <List items={[
              "Article URLs or pasted article text submitted for video generation",
              "AI-generated captions (5 short-form hooks and 1 Instagram caption per project)",
              "Your edited or finalized Instagram caption",
              "Your style preferences (caption style, transition style, video source selection)",
            ]} />
          </SubSection>
          <SubSection title="1.3 Generated Content">
            <p>As part of the video generation pipeline, we store:</p>
            <List items={[
              "Individual video clip URLs (sourced from Kling AI or Pexels)",
              "The final stitched MP4 video URL",
              "Voiceover audio files (MP3) stored in Supabase Storage",
              "Pipeline status logs and error details",
            ]} />
          </SubSection>
          <SubSection title="1.4 Instagram Connection Data">
            <p>If you use ClipFrom's Instagram publishing feature:</p>
            <List items={[
              "Your Instagram access token is stored exclusively as a server-side environment variable. It is never stored in our database or exposed to the frontend.",
              "Your Instagram Business or Creator Account ID is stored as a server-side environment variable.",
              "We do not collect, store, or access your Instagram followers, direct messages, comments, audience analytics, or engagement metrics.",
            ]} />
          </SubSection>
          <SubSection title="1.5 Technical & Usage Data">
            <p>
              We may automatically collect limited technical data to operate and improve the service, including pipeline
              execution logs and error states associated with your projects.
            </p>
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            We use the information we collect solely to provide and improve the ClipFrom service:
          </p>
          <List items={[
            "To authenticate your account and protect access to your projects",
            "To generate AI-powered captions and video clips from your submitted content",
            "To deliver the final stitched video to you",
            "To publish Reels to your connected Instagram account when you explicitly request it",
            "To send transactional notifications (e.g., video-ready emails) to your email address",
            "To debug pipeline errors and maintain service reliability",
          ]} />
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 16 }}>
            We do not use your content or data to train AI models, sell data to third parties, or send unsolicited
            marketing communications.
          </p>
        </Section>

        <Section title="3. Third-Party Services">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            ClipFrom integrates with third-party services to deliver its core functionality. Each service receives only
            the minimum data necessary for its purpose:
          </p>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Anthropic Claude", "receives article text or URL content to generate captions and video scene descriptions"],
              ["ElevenLabs", "receives caption text to synthesize voiceover audio"],
              ["Kling AI", "receives scene description text and formatting parameters to generate AI video clips"],
              ["Pexels", "receives keyword strings derived from captions to search for stock video footage"],
              ["Instagram Graph API (Meta)", "receives your video URL, caption text, and access token to publish Reels to your account"],
              ["Supabase", "hosts our database, authentication, file storage, and backend functions"],
              ["Remotion", "receives clip URLs, audio, captions, and timing metadata to stitch the final video"],
              ["Resend", "receives your email address and video URL to deliver completion notifications"],
            ].map(([name, desc]) => (
              <div key={name} style={{ display: "flex", gap: 12, padding: "12px 14px", background: C.surface, borderRadius: 8, border: `1px solid ${C.strokeSoft}` }}>
                <span style={{ color: C.fg, fontWeight: 600, minWidth: 160, fontSize: 14 }}>{name}</span>
                <span style={{ color: C.fgMuted, fontSize: 14, lineHeight: 1.6 }}>{desc}</span>
              </div>
            ))}
          </div>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 16 }}>
            We do not sell, rent, or share your personal information with any third party for advertising, marketing, or
            any purpose beyond what is listed above.
          </p>
        </Section>

        <Section title="4. Instagram Graph API — Specific Disclosures">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            ClipFrom uses the Instagram Graph API exclusively to publish Reels on your behalf when you explicitly click
            "Post to Instagram." We use the following permissions:
          </p>
          <List items={[
            "instagram_basic — to verify the connected Instagram account",
            "instagram_content_publish — to submit and publish video content to your Instagram account",
            "pages_read_engagement — required when the Instagram account is linked via a Facebook Page",
          ]} />
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 16 }}>
            We do not use the Instagram API to read your messages, comments, follower lists, audience demographics, or
            any other account data beyond what is needed to complete a publish action.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            Your Instagram access token is handled exclusively server-side. It is stored as an environment variable and
            is never written to our database, logged, or transmitted to the frontend application.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            We retain your account and project data for as long as your account is active. If you delete your account,
            we will delete your personal information and associated project data within 30 days, except where retention
            is required by law.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            Voiceover audio files stored in Supabase Storage are associated with individual projects and are deleted
            upon account deletion.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            We take reasonable technical and organizational measures to protect your information, including:
          </p>
          <List items={[
            "Passwords are hashed by Supabase Auth and never stored in plaintext",
            "Access tokens are stored server-side only, never in the database or client",
            "All data transmission occurs over HTTPS",
            "Protected routes require a valid authenticated session",
          ]} />
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 16 }}>
            No method of data transmission or storage is 100% secure. If you have reason to believe your account has
            been compromised, please contact us immediately.
          </p>
        </Section>

        <Section title="7. Children's Privacy">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            ClipFrom is not directed at children under the age of 13. We do not knowingly collect personal information
            from children. If you believe we have inadvertently collected information from a child, please contact us
            and we will delete it promptly.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>Depending on your location, you may have the right to:</p>
          <List items={[
            "Access the personal information we hold about you",
            "Request correction of inaccurate data",
            "Request deletion of your account and associated data",
            "Withdraw consent for data processing where consent is the legal basis",
          ]} />
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 16 }}>
            To exercise any of these rights, contact us at the email address below. We will respond within 30 days.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at
            the top of this document. Continued use of ClipFrom after changes are posted constitutes your acceptance of
            the updated policy. For material changes, we will notify you via email.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            If you have questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <div style={{ marginTop: 16, padding: "20px 24px", background: C.surface, borderRadius: 10, border: `1px solid ${C.strokeMed}`, lineHeight: 1.8 }}>
            <p style={{ fontWeight: 700, color: C.fg, marginBottom: 4 }}>ClipFrom</p>
            <p style={{ color: C.fgMuted, fontSize: 14 }}>
              Website:{" "}
              <a href="https://clipfrom.ai" style={{ color: C.accent, textDecoration: "none" }}>clipfrom.ai</a>
            </p>
            <p style={{ color: C.fgMuted, fontSize: 14 }}>
              Email:{" "}
              <a href="mailto:privacy@clipfrom.ai" style={{ color: C.accent, textDecoration: "none" }}>privacy@clipfrom.ai</a>
            </p>
          </div>
        </Section>

        <p style={{ textAlign: "center", fontSize: 13, color: C.fgDim, marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.strokeSoft}` }}>
          This Privacy Policy was last reviewed and updated on April 28, 2026.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "oklch(96% 0.005 250)", marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid oklch(100% 0 0 / 0.08)` }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "oklch(72% 0.17 280)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </h3>
      <div style={{ color: "oklch(65% 0.01 250)", lineHeight: 1.75, fontSize: 15 }}>{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 20, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
        <li key={item} style={{ color: "oklch(65% 0.01 250)", lineHeight: 1.7, fontSize: 15 }}>{item}</li>
      ))}
    </ul>
  );
}
