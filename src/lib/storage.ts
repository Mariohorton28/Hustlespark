import AsyncStorage from '@react-native-async-storage/async-storage';

const k = (x: string) => `hs:${x}`;

export type Profile = { niche: string; pillars: string[]; voice: string };
export type Plan = { id: string; date: string; prompt: string; hooks: string[]; script: string; caption: string; hashtags: string[]; status: 'pending'|'posted' };
export type Product = { id: string; title: string; link: string };

export async function saveProfile(p: Profile){ await AsyncStorage.setItem(k('profile'), JSON.stringify(p)); }
export async function getProfile(): Promise<Profile|null>{
  const s = await AsyncStorage.getItem(k('profile')); return s? JSON.parse(s): null;
}

export async function getPlans(): Promise<Plan[]>{
  const s = await AsyncStorage.getItem(k('plans')); return s? JSON.parse(s): [];
}
export async function savePlan(plan: Plan){
  const all = await getPlans();
  const next = all.filter(p=>p.id!==plan.id).concat(plan);
  await AsyncStorage.setItem(k('plans'), JSON.stringify(next));
}
export async function setPlanStatus(id: string, status: Plan['status']){
  const all = await getPlans();
  await AsyncStorage.setItem(k('plans'), JSON.stringify(all.map(p=>p.id===id?{...p,status}:p)));
}

export async function getProducts(): Promise<Product[]>{
  const s = await AsyncStorage.getItem(k('products')); return s? JSON.parse(s): [];
}
export async function saveProduct(prod: Product){
  const all = await getProducts();
  await AsyncStorage.setItem(k('products'), JSON.stringify(all.concat(prod)));
}
