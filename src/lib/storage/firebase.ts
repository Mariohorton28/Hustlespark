import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/config/firebaseConfig';
import type { ContentPlan, Product, UserProfile } from './types';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as any);
const db = getFirestore(app);
const uid = 'demo'; // replace with Firebase Auth uid when added

export async function saveProfile(p: UserProfile) { await setDoc(doc(db, 'users', uid), p, { merge: true }); }
export async function getProfile(): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid)); return snap.exists() ? (snap.data() as UserProfile) : null;
}
export async function savePlan(plan: ContentPlan) {
  await setDoc(doc(db, 'content_plans', `${uid}_${plan.id}`), { ...plan, userId: uid }, { merge: true });
}
export async function getPlans(): Promise<ContentPlan[]> {
  const snaps = await getDocs(collection(db, 'content_plans'));
  const all: ContentPlan[] = []; snaps.forEach(s => { const d:any = s.data(); if (d.userId === uid) all.push(d as ContentPlan); });
  return all.sort((a,b)=> (a.date<b.date?1:-1));
}
export async function setPlanStatus(id: string, status: 'pending'|'posted') {
  const ref = doc(db, 'content_plans', `${uid}_${id}`); const snap = await getDoc(ref);
  if (snap.exists()) await setDoc(ref, { ...snap.data(), status }, { merge: true });
}
export async function saveProduct(prod: Product) {
  await setDoc(doc(db, 'products', `${uid}_${prod.id}`), { ...prod, userId: uid }, { merge: true });
}
export async function getProducts(): Promise<Product[]> {
  const snaps = await getDocs(collection(db, 'products'));
  const all: Product[] = []; snaps.forEach(s => { const d:any = s.data(); if (d.userId === uid) all.push(d as Product); });
  return all;
}
