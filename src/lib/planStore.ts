import AsyncStorage from '@react-native-async-storage/async-storage';

// Types used by PlannerScreen
export type PlanItem = { key: string; label: string; text: string };
export type Plan = {
  id: string; // always present
  title: string;
  createdAt: number;
  status: 'pending' | 'posted';
  source?: string;
  items: PlanItem[];
  meta?: { scheduledAt?: number; postedAt?: number } | Record<string, any>;
};

const KEY = 'plans:v1';

function genId() {
  // Prefer crypto if available; fallback to timestamp+rand
  // @ts-ignore
  if (globalThis.crypto?.randomUUID) {
    // @ts-ignore
    return globalThis.crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function coercePlan(raw: any): Plan {
  const id = (raw?.id && String(raw.id)) || genId();
  const createdAt = Number(raw?.createdAt) || Date.now();
  const status: 'pending' | 'posted' = raw?.status === 'posted' ? 'posted' : 'pending';
  const items: PlanItem[] = Array.isArray(raw?.items)
    ? raw.items.map((it: any, idx: number) => ({
        key: String(it?.key ?? `item${idx}`),
        label: String(it?.label ?? 'Caption'),
        text:
          typeof it?.text === 'string'
            ? it.text
            : typeof it === 'string'
            ? it
            : it?.toString
            ? it.toString()
            : '',
      }))
    : [];
  const first = (items.find(i => (i.text ?? '').trim())?.text ?? '').trim();
  const title: string = String(raw?.title ?? raw?.name ?? (first || 'Untitled')).slice(0, 120);
  const meta = (raw?.meta && typeof raw.meta === 'object') ? raw.meta : {};
  const source = raw?.source ? String(raw.source) : undefined;
  return { id, title, createdAt, status, source, items, meta };
}

async function readAll(): Promise<Plan[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Ensure every item has a valid id
    return arr.map(coercePlan);
  } catch {
    return [];
  }
}

async function writeAll(list: Plan[]) {
  const safe = list.map(coercePlan);
  await AsyncStorage.setItem(KEY, JSON.stringify(safe));
}

/** Public API used by PlannerScreen **/

export async function loadPlans(): Promise<Plan[]> {
  const list = await readAll();
  // Persist back if we had to add any missing ids
  await writeAll(list);
  return list;
}

export async function savePlanItem(plan: Omit<Plan, 'id'> & Partial<Pick<Plan, 'id'>>): Promise<Plan> {
  const list = await readAll();
  const withId: Plan = coercePlan(plan);
  // Insert newest first
  const next = [withId, ...list];
  await writeAll(next);
  return withId;
}

export async function updatePlan(id: string, patch: Partial<Plan>): Promise<Plan | null> {
  const list = await readAll();
  const idx = list.findIndex(p => p.id === id);
  // Fallback: try by createdAt if id somehow missing (legacy)
  let updated: Plan | null = null;
  if (idx >= 0) {
    const merged = coercePlan({ ...list[idx], ...patch, id });
    list[idx] = merged;
    updated = merged;
  } else if (patch.createdAt) {
    const j = list.findIndex(p => p.createdAt === patch.createdAt);
    if (j >= 0) {
      const merged = coercePlan({ ...list[j], ...patch });
      list[j] = merged;
      updated = merged;
    }
  }
  await writeAll(list);
  return updated;
}

export async function deletePlan(id: string): Promise<void> {
  const list = await readAll();
  const next = list.filter(p => p.id !== id);
  await writeAll(next);
}