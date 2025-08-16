import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlanDoc = {
  id: string;            // usually YYYY-MM-DD
  date: string;          // YYYY-MM-DD
  prompt: string;
  hooks: string[];
  script: string;
  caption: string;
  hashtags: string[];
  status: 'pending' | 'posted';
};

const KEY = 'hs:plans';

export async function loadPlans(): Promise<PlanDoc[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as PlanDoc[]; } catch { return []; }
}

async function saveAll(plans: PlanDoc[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(plans));
}

export async function upsertPlan(newPlan: PlanDoc) {
  const all = await loadPlans();
  const without = all.filter(p => p.id !== newPlan.id);
  await saveAll([newPlan, ...without].sort((a,b)=> (a.date < b.date ? 1 : -1)));
}

export async function setStatus(id: string, status: 'pending' | 'posted') {
  const all = await loadPlans();
  const next = all.map(p => p.id === id ? { ...p, status } : p);
  await saveAll(next);
}
