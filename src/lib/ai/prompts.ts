export const scriptPrompt = `Write a {length}-second faceless short-form video script for {niche}.
Brand voice: {voice}. Content pillars: {pillars}.
Give 3 hook options, 1 CTA, plain language, short sentences, punchy pacing.
Output sections: HOOKS (3), SCRIPT (~110–160 words), CTA (1 line).`;

export const captionPrompt = `Generate a caption for TikTok about {topic}. Tone {voice}.
Add 10 SEO-relevant hashtags. Keep under 2,200 characters.`;

export const offerPrompt = `Given the niche {niche} and pillars {pillars}, propose 10 low-effort digital products
(guides, templates, checklists). For each: title, 1-line promise, format (PDF, Notion, Sheets).`;
