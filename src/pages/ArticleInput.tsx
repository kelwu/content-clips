import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import HeroSection from "@/components/landing/HeroSection";
import InputCard from "@/components/landing/InputCard";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import HowItWorks from "@/components/landing/HowItWorks";
import SocialProof from "@/components/landing/SocialProof";
import BenefitsCarousel from "@/components/landing/BenefitsCarousel";
import SecondaryCTA from "@/components/landing/SecondaryCTA";
import Footer from "@/components/landing/Footer";
import LoadingScreen from "@/components/landing/LoadingScreen";
import BackgroundIcons from "@/components/landing/BackgroundIcons";

const ArticleInput = () => {
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [articleUrl, setArticleUrl] = useState("");
  const [articleText, setArticleText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoStages = [
    "📖 Analyzing your content...",
    "✨ Extracting key insights...",
    "🎬 Generating video descriptions...",
    "🤖 Processing with AI...",
    "🔍 Polishing and optimizing...",
    "✅ Almost ready...",
  ];

  useEffect(() => {
    if (!isLoading) return;

    setProgress(0);
    setStage(0);
    setTimeRemaining(300);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 0.4, 95));
    }, 1000);

    const stageInterval = setInterval(() => {
      setStage((prev) => (prev + 1) % videoStages.length);
    }, 30000);

    const timeInterval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(timeInterval);
    };
  }, [isLoading]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = inputMode === "url" ? articleUrl.trim() : articleText.trim();

    if (!content) {
      toast.error(
        inputMode === "url"
          ? "Please enter an article URL"
          : "Please enter article text"
      );
      return;
    }

    if (inputMode === "url") {
      try {
        new URL(content);
      } catch {
        toast.error("Please enter a valid URL");
        return;
      }
    }

    if (!userEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    if (!isValidEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Call N8N Content-Automation webhook
      const n8nWebhook = import.meta.env.VITE_N8N_CONTENT_WEBHOOK;

      if (!n8nWebhook) {
        throw new Error("N8N webhook URL not configured");
      }

      // Step 1: Create a project in Supabase first to get a real project_id
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          article_url: inputMode === "url" ? content : `text:${content.substring(0, 200)}`,
          status: "processing",
        })
        .select("id")
        .single();

      if (projectError) {
        console.error("Failed to create project:", projectError);
        throw new Error("Failed to initialize project. Please try again.");
      }

      const projectId = projectData.id;

      // Step 2: Send to N8N with the real project_id
      const response = await fetch(n8nWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content,
          type: inputMode,
          project_id: projectId,
          user_email: userEmail,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("N8N error response:", errorText);
        throw new Error(`N8N workflow failed: ${response.statusText}`);
      }

      // N8N acknowledges immediately but processes async
      // Poll via N8N polling webhook (avoids RLS issues with direct Supabase access)
      toast.success("Processing started! Analyzing your content...");

      pollingRef.current = setInterval(async () => {
        try {
          const { data: aiData } = await supabase
            .from("ai_generations")
            .select("caption_options, text_content, status")
            .eq("project_id", projectId)
            .maybeSingle();

          if (!aiData) return; // row not created yet

          const captions = aiData.caption_options || aiData.text_content;
          if (!captions) return; // captions not ready yet

          const captionObj = typeof captions === "string" ? JSON.parse(captions) : captions;

          // caption_options may be stored as an array ["text1...", "text2..."...]
          // OR as an object {text1: "...", text2: "..."} — handle both
          const hasContent = Array.isArray(captionObj)
            ? captionObj.length > 0
            : captionObj?.text1;

          if (hasContent) {
            clearInterval(pollingRef.current!);

            // Normalize to {text1, text2, ...} format for CaptionEditor
            const captionForEditor = Array.isArray(captionObj)
              ? captionObj.reduce(
                  (acc: Record<string, string>, text: string, i: number) => ({
                    ...acc,
                    [`text${i + 1}`]: text,
                  }),
                  {}
                )
              : captionObj;

            navigate("/editor", {
              state: {
                projectId,
                userEmail,
                content,
                inputMode,
                captions: captionForEditor,
              },
            });
          }
        } catch {
          // Silently continue polling
        }
      }, 5000); // poll every 5 seconds
    } catch (error) {
      console.error("Error submitting to N8N:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process your content. Please try again."
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen stage={videoStages[stage]} progress={progress} timeRemaining={timeRemaining} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative">
      <BackgroundIcons />

      <div className="relative z-10">
        <HeroSection
          inputMode={inputMode}
          setInputMode={setInputMode}
          articleUrl={articleUrl}
          setArticleUrl={setArticleUrl}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        <div className="max-w-6xl mx-auto px-4 py-20">
          {inputMode === "text" && (
            <InputCard
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste your article text here..."
            />
          )}
        </div>

        <FeatureHighlights />
        <HowItWorks />
        <SocialProof />
        <BenefitsCarousel />
        <SecondaryCTA onCtaClick={handleSubmit} />
        <Footer />
      </div>
    </div>
  );
};

export default ArticleInput;
