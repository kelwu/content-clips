export type CaptionStyle = "pill" | "bold" | "lower-third" | "none";

export interface ContentWebhookPayload {
  content: string;
  type: "url" | "text";
  project_id: string;
  user_email: string;
}

export type VideoSource = "ai" | "stock" | "mix";

export interface VideoWebhookPayload {
  project_id: string;
  user_email: string;
  captionStyle?: CaptionStyle;
  transitionStyle?: string;
  videoSource?: VideoSource;
}
