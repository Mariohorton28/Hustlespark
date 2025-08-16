import Constants from 'expo-constants';

type Plan = { prompt: string; script: string; hooks: string[]; caption: string; hashtags: string[]; };

const sampleHooks = (niche: string) => [
  `Stop scrolling if you care about ${niche} in 2025`,
  `The fastest way to level up your ${niche} game`,
  `${niche} myth that’s costing you time`,
];

const sampleScript = (niche: string, pillars: string[], voice: string) =>
  `Here’s a quick ${niche} tip. First, focus on ${pillars[0] || 'one simple win'}.` +
  ` Keep it simple, avoid overthinking, and take one action today.` +
  ` If this helped, save for later and share with a friend. (Voice: ${voice}).`;

const sampleCaption = (niche: string) => `Quick ${niche} win you can try today. Save this!`;

const sampleHashtags = (niche: string) => {
  const base = niche.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return [
    `#${base}`, '#hustle', '#contentcreator', '#learnontiktok', '#howto',
    '#sidehustle', '#marketing', '#tutorial', '#tips', '#growth',
  ];
};

export async function generatePlanLocal(niche: string, pillars: string[], voice: string): Promise<Plan> {
  return {
    prompt: `3 ${niche} tips you can use today`,
    script: sampleScript(niche, pillars, voice),
    hooks: sampleHooks(niche),
    caption: sampleCaption(niche),
    hashtags: sampleHashtags(niche),
  };
}

export async function generatePlanOpenAI(niche: string, pillars: string[], voice: string): Promise<Plan> {
  const key = (Constants as any).expoConfig?.extra?.OPENAI_API_KEY || (process as any).env.OPENAI_API_KEY;
  if (!key) return generatePlanLocal(niche, pillars, voice);
  const prompt = `Create hooks(3), a 45s script (~140 words), CTA, caption, and 10 hashtags for niche "${niche}" with pillars ${pillars.join(', ')} and voice ${voice}. Return as JSON with keys: hooks, script, cta, caption, hashtags.`;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.8 }),
  });
  const data = await res.json();
  let content = data?.choices?.[0]?.message?.content ?? '';
  try {
    const j = JSON.parse(content);
    return {
      prompt: `3 ${niche} tips you can use today`,
      script: j.script || sampleScript(niche, pillars, voice),
      hooks: j.hooks || sampleHooks(niche),
      caption: j.caption || sampleCaption(niche),
      hashtags: j.hashtags || sampleHashtags(niche),
    };
  } catch {
    return generatePlanLocal(niche, pillars, voice);
  }
}

export async function remixTrendLocal(args: { niche:string; voice:string; pillars:string[]; trend:string }) {
  const { niche, voice, pillars, trend } = args;
  const hooks = [
    `${trend} — but for ${niche}`,
    `If you do ${niche}, try this twist: ${trend}`,
    `${niche} hack using this trend: ${trend}`,
  ];
  const script =
    `Hook: ${hooks[0]}\n` +
    `Intro: Here’s how to adapt this trend to ${niche}.\n` +
    `Step 1: Tie it to ${pillars[0] || 'a quick win'}.\n` +
    `Step 2: Show the before vs after.\n` +
    `Step 3: Add a fast CTA.\n` +
    `CTA: Follow for daily ${niche} boosts. (Voice: ${voice})`;
  const caption = `Remixing a trend for ${niche}. Try this and tell me how it goes.`;
  const hashtags = ['#trend', '#remix', '#tutorial', '#howto', '#content', `#${niche.replace(/\W+/g,'').toLowerCase()}`];
  return { hooks, script, caption, hashtags };
}
