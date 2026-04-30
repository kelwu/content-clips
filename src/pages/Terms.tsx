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
} as const;

export default function Terms() {
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
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Terms of Service</h1>
        <p style={{ color: C.fgMuted, fontSize: 14, margin: 0 }}>
          Effective Date: April 29, 2026 &nbsp;·&nbsp; Last Updated: April 29, 2026 &nbsp;·&nbsp; Applies to: clipfrom.ai
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 96px" }}>

        <p style={{ color: C.fgMuted, lineHeight: 1.75, marginBottom: 48 }}>
          These Terms of Service ("Terms") govern your access to and use of ClipFrom ("we," "us," or "our"), operated at clipfrom.ai. By creating an account or using ClipFrom, you agree to be bound by these Terms. If you do not agree, do not use the service.
        </p>

        <Section title="1. Description of Service">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            ClipFrom is an AI-powered platform that converts articles and written content into short-form vertical videos. The service includes AI-generated captions, voiceover synthesis, video clip sourcing, video stitching, and optional direct publishing to Instagram via the Instagram Graph API.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            You must be at least 13 years old to use ClipFrom. By using the service, you represent that you meet this age requirement and that you have the legal capacity to enter into these Terms. If you are using ClipFrom on behalf of a business or organization, you represent that you have the authority to bind that entity to these Terms.
          </p>
        </Section>

        <Section title="3. Accounts">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            You must create an account to use ClipFrom. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to notify us immediately at privacy@clipfrom.ai if you suspect unauthorized access to your account.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            We reserve the right to suspend or terminate accounts that violate these Terms, are inactive for an extended period, or are associated with fraudulent activity.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>You agree not to use ClipFrom to:</p>
          <List items={[
            "Submit content that infringes any third-party intellectual property, copyright, trademark, or privacy rights",
            "Generate videos containing hate speech, harassment, explicit sexual content, or content that promotes violence",
            "Circumvent, disable, or interfere with security features of the service",
            "Use automated scripts or bots to access or scrape the service",
            "Resell or sublicense access to ClipFrom without our written consent",
            "Submit false, misleading, or defamatory content",
            "Violate any applicable local, national, or international law or regulation",
          ]} />
        </Section>

        <Section title="5. Content You Submit">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            You retain ownership of any article text or URLs you submit to ClipFrom. By submitting content, you grant us a limited, non-exclusive license to process, transform, and store that content solely for the purpose of providing the service to you.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            You represent that you have the right to submit any content you provide, including any articles sourced from third-party websites. You are solely responsible for ensuring your use of third-party content complies with applicable copyright and terms of service of the source.
          </p>
        </Section>

        <Section title="6. Generated Content & Ownership">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            Videos, captions, and other content generated by ClipFrom on your behalf are yours to use for personal and commercial purposes. We do not claim ownership of your generated output.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            Generated videos may incorporate footage sourced from third-party providers (Kling AI, Pexels). Your use of generated content is subject to the licensing terms of those providers. Stock footage sourced from Pexels is licensed under the Pexels License. AI-generated footage from Kling AI is subject to Kling AI's terms of service.
          </p>
        </Section>

        <Section title="7. Instagram Integration">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            ClipFrom optionally connects to your Instagram Business or Creator account via the Instagram Graph API to publish Reels on your behalf. By connecting your Instagram account, you authorize ClipFrom to publish content to Instagram when you explicitly initiate a post.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            You are solely responsible for all content posted to Instagram through ClipFrom. You agree that any content you publish via ClipFrom complies with Instagram's Community Guidelines and Terms of Use. We are not liable for any content moderation actions, account restrictions, or penalties imposed by Instagram.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            You may disconnect your Instagram account at any time. Upon disconnection, we will remove your stored Instagram access token.
          </p>
        </Section>

        <Section title="8. Third-Party Services">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            ClipFrom integrates with third-party services including Anthropic, ElevenLabs, Kling AI, Pexels, and Meta (Instagram). Your use of ClipFrom is also subject to the terms and privacy policies of these providers. We are not responsible for the availability, accuracy, or conduct of third-party services.
          </p>
        </Section>

        <Section title="9. Availability & Service Changes">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            We aim to provide a reliable service but do not guarantee uninterrupted availability. We reserve the right to modify, suspend, or discontinue any part of the service at any time, with or without notice. We will make reasonable efforts to notify users of material changes.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            ClipFrom is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the service will be error-free, that generated content will meet your expectations, or that any defects will be corrected.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            To the maximum extent permitted by law, ClipFrom and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service, including but not limited to loss of data, loss of revenue, or reputational harm.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            Our total liability to you for any claim arising out of these Terms or your use of the service shall not exceed the amount you paid to ClipFrom in the twelve months preceding the claim, or $50, whichever is greater.
          </p>
        </Section>

        <Section title="12. Indemnification">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            You agree to indemnify and hold harmless ClipFrom and its operators from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of the service, your violation of these Terms, or your infringement of any third-party rights.
          </p>
        </Section>

        <Section title="13. Termination">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            You may delete your account at any time by contacting us at privacy@clipfrom.ai. We may terminate or suspend your access to ClipFrom at any time if you violate these Terms or for any other reason at our discretion.
          </p>
          <p style={{ color: C.fgMuted, lineHeight: 1.75, marginTop: 12 }}>
            Upon termination, your right to use the service ceases immediately. We will delete your account data in accordance with our Privacy Policy.
          </p>
        </Section>

        <Section title="14. Governing Law">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            These Terms are governed by the laws of the United States. Any disputes arising from these Terms or your use of ClipFrom shall be resolved through binding arbitration in accordance with the American Arbitration Association rules, except that either party may seek injunctive relief in a court of competent jurisdiction.
          </p>
        </Section>

        <Section title="15. Changes to These Terms">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            We may update these Terms from time to time. When we do, we will update the "Last Updated" date at the top of this page. For material changes, we will notify you via email. Continued use of ClipFrom after changes are posted constitutes your acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="16. Contact Us">
          <p style={{ color: C.fgMuted, lineHeight: 1.75 }}>
            If you have questions about these Terms, please contact us:
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
          These Terms of Service were last reviewed and updated on April 29, 2026.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "oklch(96% 0.005 250)", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid oklch(100% 0 0 / 0.08)` }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </section>
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
