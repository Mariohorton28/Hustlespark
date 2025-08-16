import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentPlan, Product, UserProfile } from './types';

const key = (k: string) => `hs:${k}`;

export async function saveProfile(p: UserProfile) { await AsyncStorage.setItem(key('profile'), JSON.stringify(p)); }
export async function getProfile(): Promise<UserProfile | null> {
  const s = await AsyncStorage.getItem(key('profile')); return s ? JSON.parse(s) : null;
}
export async function savePlan(plan: ContentPlan) {
  const all = await getPlans(); const next = all.filter(p => p.id !== plan.id).concat(plan);
  await AsyncStorage.setItem(key('plans'), JSON.stringify(next));
}
export async function getPlans(): Promise<ContentPlan[]> {
  const s = await AsyncStorage.getItem(key('plans')); return s ? JSON.parse(s) : [];
}
export async function setPlanStatus(id: string, status: 'pending'|'posted') {
  const all = await getPlans(); const next = all.map(p => p.id === id ? { ...p, status } : p);
  await AsyncStorage.setItem(key('plans'), JSON.stringify(next));
}
export async function saveProduct(prod: Product) {
  const all = await getProducts(); const next = all.filter(p => p.id !== prod.id).concat(prod);
  await AsyncStorage.setItem(key('products'), JSON.stringify(next));
}
export async function getProducts(): Promise<Product[]> {
  const s = await AsyncStorage.getItem(key('products')); return s ? JSON.parse(s) : [];
}
