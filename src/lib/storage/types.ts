export type ContentPlan = {
  id: string;
  date: string; // YYYY-MM-DD
  prompt: string;
  script: string;
  hooks: string[];
  caption: string;
  hashtags: string[];
  status: 'pending' | 'posted';
  metrics?: { views?: number; clicks?: number; sales?: number };
};
export type Product = { id: string; title: string; link: string; price?: number };
export type UserProfile = { userId: string; plan: 'free'|'pro'; voice: string; pillars: string[]; niche: string };
