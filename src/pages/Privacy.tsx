import { useNavigate } from "react-router-dom";
import BackgroundIcons from "@/components/landing/BackgroundIcons";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <BackgroundIcons />

      {/* Nav */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Clip<span className="text-emerald-400">From</span>
          </span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
        >
          Create Your First Clip
        </button>
      </header>

      {/* Page title */}
      <div className="relative z-10 text-center pt-10 pb-2 px-4">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">
          Legal
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-400">
          Effective Date: April 28, 2026 &nbsp;|&nbsp; Last Updated: April 28, 2026
        </p>
        <p className="text-sm text-gray-400">Applies to: clipfrom.ai</p>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 space-y-10">
        <p className="text-gray-300 leading-relaxed">
          ClipFrom ("we," "us," or "our") is an AI-powered platform that converts articles and written content into
          short-form vertical videos. This Privacy Policy explains what information we collect, how we use it, and your
          rights regarding that information.
        </p>
        <p className="text-gray-300 leading-relaxed">By using ClipFrom, you agree to the practices described in this policy.</p>

        <Section title="1. Information We Collect">
          <SubSection title="1.1 Account Information">
            <p>When you create a ClipFrom account, we collect:</p>
            <ul>
              <li>Email address (used for login and notifications)</li>
              <li>Password (hashed and managed securely by Supabase Auth — we never store plaintext passwords)</li>
              <li>An internal user identifier (UUID)</li>
            </ul>
          </SubSection>

          <SubSection title="1.2 Content You Provide">
            <p>To use ClipFrom, you submit content for processing. We collect and store:</p>
            <ul>
              <li>Article URLs or pasted article text submitted for video generation</li>
              <li>AI-generated captions (5 short-form hooks and 1 Instagram caption per project)</li>
              <li>Your edited or finalized Instagram caption</li>
              <li>Your style preferences (caption style, transition style, video source selection)</li>
            </ul>
          </SubSection>

          <SubSection title="1.3 Generated Content">
            <p>As part of the video generation pipeline, we store:</p>
            <ul>
              <li>Individual video clip URLs (sourced from Kling AI or Pexels)</li>
              <li>The final stitched MP4 video URL</li>
              <li>Voiceover audio files (MP3) stored in Supabase Storage</li>
              <li>Pipeline status logs and error details</li>
            </ul>
          </SubSection>

          <SubSection title="1.4 Instagram Connection Data">
            <p>If you use ClipFrom's Instagram publishing feature:</p>
            <ul>
              <li>
                Your Instagram access token is stored exclusively as a server-side environment variable. It is never
                stored in our database or exposed to the frontend.
              </li>
              <li>Your Instagram Business or Creator Account ID is stored as a server-side environment variable.</li>
              <li>
                We do not collect, store, or access your Instagram followers, direct messages, comments, audience
                analytics, or engagement metrics.
              </li>
            </ul>
          </SubSection>

          <SubSection title="1.5 Technical & Usage Data">
            <p>
              We may automatically collect limited technical data to operate and improve the service, including pipeline
              execution logs and error states associated with your projects.
            </p>
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <p className="text-gray-300 leading-relaxed">
            We use the information we collect solely to provide and improve the ClipFrom service:
          </p>
          <ul>
            <li>To authenticate your account and protect access to your projects</li>
            <li>To generate AI-powered captions and video clips from your submitted content</li>
            <li>To deliver the final stitched video to you</li>
            <li>To publish Reels to your connected Instagram account when you explicitly request it</li>
            <li>To send transactional notifications (e.g., video-ready emails) to your email address</li>
            <li>To debug pipeline errors and maintain service reliability</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            We do not use your content or data to train AI models, sell data to third parties, or send unsolicited
            marketing communications.
          </p>
        </Section>

        <Section title="3. Third-Party Services">
          <p className="text-gray-300 leading-relaxed">
            ClipFrom integrates with third-party services to deliver its core functionality. Each service receives only
            the minimum data necessary for its purpose:
          </p>
          <ul>
            <li><strong className="text-white">Anthropic Claude</strong> — receives article text or URL content to generate captions and video scene descriptions</li>
            <li><strong className="text-white">ElevenLabs</strong> — receives caption text to synthesize voiceover audio</li>
            <li><strong className="text-white">Kling AI</strong> — receives scene description text and formatting parameters to generate AI video clips</li>
            <li><strong className="text-white">Pexels</strong> — receives keyword strings derived from captions to search for stock video footage</li>
            <li><strong className="text-white">Instagram Graph API (Meta)</strong> — receives your video URL, caption text, and access token to publish Reels to your account</li>
            <li><strong className="text-white">Supabase</strong> — hosts our database, authentication, file storage, and backend functions</li>
            <li><strong className="text-white">Remotion</strong> — receives clip URLs, audio, captions, and timing metadata to stitch the final video</li>
            <li><strong className="text-white">Resend</strong> — receives your email address and video URL to deliver completion notifications</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            We do not sell, rent, or share your personal information with any third party for advertising, marketing, or
            any purpose beyond what is listed above.
          </p>
        </Section>

        <Section title="4. Instagram Graph API — Specific Disclosures">
          <p className="text-gray-300 leading-relaxed">
            ClipFrom uses the Instagram Graph API exclusively to publish Reels on your behalf when you explicitly click
            "Post to Instagram." We use the following permissions:
          </p>
          <ul>
            <li><strong className="text-white">instagram_basic</strong> — to verify the connected Instagram account</li>
            <li><strong className="text-white">instagram_content_publish</strong> — to submit and publish video content to your Instagram account</li>
            <li><strong className="text-white">pages_read_engagement</strong> — required when the Instagram account is linked via a Facebook Page</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            We do not use the Instagram API to read your messages, comments, follower lists, audience demographics, or
            any other account data beyond what is needed to complete a publish action.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Your Instagram access token is handled exclusively server-side. It is stored as an environment variable and
            is never written to our database, logged, or transmitted to the frontend application.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p className="text-gray-300 leading-relaxed">
            We retain your account and project data for as long as your account is active. If you delete your account,
            we will delete your personal information and associated project data within 30 days, except where retention
            is required by law.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Voiceover audio files stored in Supabase Storage are associated with individual projects and are deleted
            upon account deletion.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p className="text-gray-300 leading-relaxed">
            We take reasonable technical and organizational measures to protect your information, including:
          </p>
          <ul>
            <li>Passwords are hashed by Supabase Auth and never stored in plaintext</li>
            <li>Access tokens are stored server-side only, never in the database or client</li>
            <li>All data transmission occurs over HTTPS</li>
            <li>Protected routes require a valid authenticated session</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            No method of data transmission or storage is 100% secure. If you have reason to believe your account has
            been compromised, please contact us immediately.
          </p>
        </Section>

        <Section title="7. Children's Privacy">
          <p className="text-gray-300 leading-relaxed">
            ClipFrom is not directed at children under the age of 13. We do not knowingly collect personal information
            from children. If you believe we have inadvertently collected information from a child, please contact us and
            we will delete it promptly.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p className="text-gray-300 leading-relaxed">Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for data processing where consent is the legal basis</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            To exercise any of these rights, contact us at the email address below. We will respond within 30 days.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p className="text-gray-300 leading-relaxed">
            We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at
            the top of this document. Continued use of ClipFrom after changes are posted constitutes your acceptance of
            the updated policy. For material changes, we will notify you via email.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p className="text-gray-300 leading-relaxed">
            If you have questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-800 text-gray-300 space-y-1">
            <p className="font-semibold text-white">ClipFrom</p>
            <p>Website: <a href="https://clipfrom.ai" className="text-emerald-400 hover:underline">clipfrom.ai</a></p>
            <p>Email: <a href="mailto:privacy@clipfrom.ai" className="text-emerald-400 hover:underline">privacy@clipfrom.ai</a></p>
          </div>
        </Section>

        <p className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
          This Privacy Policy was last reviewed and updated on April 28, 2026.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-gray-300">
      <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-2">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-emerald-400">{title}</h3>
      <div className="text-gray-300 leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">{children}</div>
    </div>
  );
}
