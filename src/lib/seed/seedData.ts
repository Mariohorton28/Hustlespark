import { ContentPlan, UserProfile } from '@/lib/storage/types';
import { format } from './util';
export function seedProfile(): UserProfile {
  return { userId: 'demo', plan: 'free', voice: 'friendly', niche: 'AI side hustles', pillars: ['Automation','Prompting','Monetization'] };
}
export function seedPlan(): ContentPlan {
  return { id: 'demo-' + Date.now(), date: format(new Date()), prompt: '3 automation ideas you can start this week',
    script: 'Here are three…', hooks: ['Stop trading hours for dollars','Automate this today','Spend 10 minutes, save 10 hours'],
    caption: 'Save this for later!', hashtags: ['#ai','#sidehustle'], status: 'pending' };
}
export function formatDate(d: Date) { return format(d); }
