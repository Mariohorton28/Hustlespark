#!/usr/bin/env bash
set -euo pipefail

echo "==> HustleSpark overlay setup (safe mode with auto-backup)"

# 0) Sanity checks
if ! command -v npm >/dev/null 2>&1; then
  echo "✖ npm not found. Install Node.js first (brew install node)."
  exit 1
fi

# 1) Make a backup of anything that could conflict
TS=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backup-$TS"
mkdir -p "$BACKUP_DIR"

# These are common dirs/files in Expo templates that might conflict
CANDIDATES=( "App.js" "App.tsx" "app" "components" "constants" "hooks" "scripts" "assets"
             "README.md" "app.json" "eslint.config.js" "tsconfig.json" )
echo "==> Backing up existing files (if present) to: $BACKUP_DIR"
for item in "${CANDIDATES[@]}"; do
  if [ -e "$item" ]; then
    echo " • $item -> $BACKUP_DIR/$item"
    mv "$item" "$BACKUP_DIR/$item"
  fi
done

# 2) Install/ensure dependencies needed for our app
echo "==> Installing dependencies"
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
            react-native-screens react-native-safe-area-context \
            react-native-calendars \
            @react-native-async-storage/async-storage \
            firebase
npx expo install expo-notifications expo-constants expo-linking
npm i -D typescript @types/react @types/react-native @babel/core eslint @react-native/eslint-config

# 3) Project structure (our version)
echo "==> Creating project structure"
mkdir -p src/{screens,components,lib/{ai,storage,notifications,seed},theme,config,navigation} assets

# 4) tsconfig + babel
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowJs": false,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["react", "react-native"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["App.tsx", "src"]
}
EOF

cat > babel.config.js <<'EOF'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['module-resolver', { root: ['./'], alias: { '@': './src' } }]],
  };
};
EOF

# 5) App root (stack + tabs)
cat > App.tsx <<'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '@/screens/OnboardingScreen';
import Tabs from '@/navigation';
import { StatusBar } from 'react-native';

export type RootStackParamList = { Onboarding: undefined; Tabs: undefined; };
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Tabs" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
EOF

# 6) Tabs navigation (includes Trend Remix tab)
cat > src/navigation/index.tsx <<'EOF'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/HomeScreen';
import ScriptStudio from '@/screens/ScriptStudio';
import PlannerScreen from '@/screens/PlannerScreen';
import MonetizeScreen from '@/screens/MonetizeScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import TrendRemix from '@/screens/TrendRemix';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Today' }} />
      <Stack.Screen name="ScriptStudio" component={ScriptStudio} options={{ title: 'Script Studio' }} />
    </Stack.Navigator>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Remix" component={TrendRemix} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Monetize" component={MonetizeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
EOF

# 7) Theme tokens
cat > src/theme/tokens.ts <<'EOF'
export const colors = {
  primary: '#7C3AED',
  accent: '#22D3EE',
  text: '#0F172A',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  muted: '#64748B',
  border: '#E5E7EB',
};
export const radius = 12;
export const spacing = (n: number) => n * 8;
EOF

# 8) UI components
cat > src/components/Button.tsx <<'EOF'
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

type Props = { title: string; onPress?: () => void; disabled?: boolean; };

export default function Button({ title, onPress, disabled }: Props) {
  return (
    <TouchableOpacity style={[s.btn, disabled && s.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={s.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { backgroundColor: colors.primary, paddingVertical: spacing(1.5), paddingHorizontal: spacing(2), borderRadius: radius, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
EOF

cat > src/components/Card.tsx <<'EOF'
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

export default function Card({ children }: React.PropsWithChildren) {
  return <View style={s.card}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius, padding: spacing(2),
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing(2),
  },
});
EOF

cat > src/components/Section.tsx <<'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export default function Section({ title, children }: { title: string } & React.PropsWithChildren) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: spacing(2) },
  title: { fontWeight: '700', color: colors.text, marginBottom: spacing(1) },
});
EOF

# 9) AI prompts + generator (incl. Remix)
cat > src/lib/ai/prompts.ts <<'EOF'
export const scriptPrompt = `Write a {length}-second faceless short-form video script for {niche}.
Brand voice: {voice}. Content pillars: {pillars}.
Give 3 hook options, 1 CTA, plain language, short sentences, punchy pacing.
Output sections: HOOKS (3), SCRIPT (~110–160 words), CTA (1 line).`;

export const captionPrompt = `Generate a caption for TikTok about {topic}. Tone {voice}.
Add 10 SEO-relevant hashtags. Keep under 2,200 characters.`;

export const offerPrompt = `Given the niche {niche} and pillars {pillars}, propose 10 low-effort digital products
(guides, templates, checklists). For each: title, 1-line promise, format (PDF, Notion, Sheets).`;
EOF

cat > src/lib/ai/generate.ts <<'EOF'
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
EOF

# 10) Storage: types, local mock, firebase client, switch
cat > src/lib/storage/types.ts <<'EOF'
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
EOF

cat > src/lib/storage/mock.ts <<'EOF'
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
EOF

cat > src/lib/storage/firebase.ts <<'EOF'
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
EOF

cat > src/lib/storage/index.ts <<'EOF'
// Flip this flag to 'firebase' when you want cloud sync
const MODE: 'mock' | 'firebase' = 'mock';
export * from (MODE === 'firebase' ? './firebase' : './mock');
EOF

# 11) Notifications + seeds/util
cat > src/lib/notifications/push.ts <<'EOF'
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
export async function registerForPush() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
EOF

cat > src/lib/seed/util.ts <<'EOF'
export function format(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
EOF

cat > src/lib/seed/seedData.ts <<'EOF'
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
EOF

# 12) Firebase config placeholder
cat > src/config/firebaseConfig.ts <<'EOF'
// Add your Firebase Web app config here if/when you enable cloud sync
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
EOF

# 13) Screens (Onboarding, Home, ScriptStudio, Planner, Monetize, Settings, TrendRemix)
cat > src/screens/OnboardingScreen.tsx <<'EOF'
import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, View } from 'react-native';
import Button from '@/components/Button';
import { colors, spacing } from '@/theme/tokens';
import { saveProfile } from '@/lib/storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function OnboardingScreen({ navigation }: Props) {
  const [niche, setNiche] = useState('AI side hustles');
  const [pillars, setPillars] = useState('Automation, Prompting, Monetization');
  const [voice, setVoice] = useState('friendly');

  async function next() {
    await saveProfile({ userId: 'demo', plan: 'free', niche, pillars: pillars.split(',').map(s=>s.trim()).filter(Boolean), voice });
    navigation.replace('Tabs');
  }

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Let’s build your content engine.</Text>
      <View style={s.field}>
        <Text style={s.label}>Niche</Text>
        <TextInput style={s.input} value={niche} onChangeText={setNiche} placeholder="e.g., BBQ tips, HR advice, AI hustles" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>3–5 Content Pillars</Text>
        <TextInput style={s.input} value={pillars} onChangeText={setPillars} placeholder="Comma-separated" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>Brand Voice</Text>
        <TextInput style={s.input} value={voice} onChangeText={setVoice} placeholder="casual, authority, friendly..." />
      </View>
      <Button title="Create my daily plan" onPress={next} />
    </ScrollView>
  );
}
const s = StyleSheet.create({ wrap:{ padding:spacing(2), rowGap:spacing(2) }, h1:{ fontSize:24, fontWeight:'800', color:colors.text, marginBottom:spacing(1) }, field:{ rowGap:6 }, label:{ color:colors.muted }, input:{ backgroundColor:'#fff', borderWidth:1, borderColor:colors.border, padding:spacing(1.5), borderRadius:10 } });
EOF

cat > src/screens/HomeScreen.tsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import Section from '@/components/Section';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { colors, spacing } from '@/theme/tokens';
import { getProfile, savePlan } from '@/lib/storage';
import { generatePlanLocal } from '@/lib/ai/generate';
import { format } from '@/lib/seed/util';

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);

  async function createPlan() {
    setLoading(true);
    const profile = await getProfile();
    const niche = profile?.niche || 'AI side hustles';
    const pillars = profile?.pillars || ['Automation','Prompting','Monetization'];
    const voice = profile?.voice || 'friendly';
    const p = await generatePlanLocal(niche, pillars, voice);
    const today = format(new Date());
    const doc = { id: today, date: today, status: 'pending', ...p };
    await savePlan(doc as any);
    setPlan(doc);
    setLoading(false);
  }

  useEffect(() => { createPlan(); }, []);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.title}>Today</Text>
      {!plan ? <Text>Generating...</Text> : (
        <>
          <Section title="Your prompt"><Card><Text>{plan.prompt}</Text></Card></Section>
          <Section title="Hooks"><Card><Text>• {plan.hooks[0]}</Text><Text>• {plan.hooks[1]}</Text><Text>• {plan.hooks[2]}</Text></Card></Section>
          <Section title="Script (45s)"><Card><Text>{plan.script}</Text></Card></Section>
          <Section title="Caption"><Card><Text>{plan.caption}</Text></Card></Section>
          <Section title="Hashtags"><Card><Text>{plan.hashtags.join(' ')}</Text></Card></Section>
          <Button title="Open Script Studio" onPress={() => navigation.navigate('ScriptStudio', { plan })} />
        </>
      )}
      <View style={{ height: spacing(3) }} />
      <Button title={loading ? 'Working…' : 'Regenerate'} onPress={createPlan} disabled={loading} />
    </ScrollView>
  );
}
const s = StyleSheet.create({ wrap:{ padding:spacing(2) }, title:{ fontSize:22, fontWeight:'800', color:colors.text, marginBottom:spacing(2) } });
EOF

cat > src/screens/ScriptStudio.tsx <<'EOF'
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import Card from '@/components/Card';
import Section from '@/components/Section';
import { colors, spacing } from '@/theme/tokens';
import Button from '@/components/Button';

export default function ScriptStudio({ route }: any) {
  const plan = route.params?.plan;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.title}>Script Studio</Text>
      <Section title="Faceless shotlist">
        <Card>
          <Text>• Hook over b-roll</Text>
          <Text>• Tip 1 on text overlay</Text>
          <Text>• Tip 2 over screen recording</Text>
          <Text>• CTA + end card</Text>
        </Card>
      </Section>
      <Section title="Options">
        <Card><Row label="Swap CTA" /><Row label="Make spicier" /><Row label="Make PG-13 → PG" /></Card>
      </Section>
      <Section title="Current Script"><Card><Text>{plan?.script}</Text></Card></Section>
      <Button title="Save to Planner" onPress={() => {}} />
    </ScrollView>
  );
}
function Row({ label }: { label: string }) {
  const [v, setV] = React.useState(false);
  return (<View style={s.row}><Text style={s.rowLabel}>{label}</Text><Switch value={v} onValueChange={setV} /></View>);
}
const s = StyleSheet.create({ wrap:{ padding:spacing(2), rowGap:spacing(2) }, title:{ fontSize:22, fontWeight:'800', color:colors.text }, row:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:spacing(0.5) }, rowLabel:{ color:colors.text } });
EOF

cat > src/screens/PlannerScreen.tsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getPlans, setPlanStatus } from '@/lib/storage';
import { colors, spacing } from '@/theme/tokens';
import Card from '@/components/Card';

export default function PlannerScreen() {
  const [plans, setPlans] = useState<any[]>([]);
  async function load() { setPlans(await getPlans()); }
  useEffect(() => { load(); }, []);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.title}>Planner</Text>
      {plans.map(p => (
        <Card key={p.id}>
          <View style={s.row}>
            <Text style={s.date}>{p.date}</Text>
            <Text style={{ color: p.status === 'posted' ? 'green' : colors.muted }}>{p.status}</Text>
          </View>
          <Text style={s.prompt}>{p.prompt}</Text>
          <View style={s.actions}>
            <TouchableOpacity onPress={async () => { await setPlanStatus(p.id, 'posted'); load(); }}>
              <Text style={s.link}>Mark posted</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
      {plans.length === 0 && <Text>No posts yet — generate from Today.</Text>}
    </ScrollView>
  );
}
const s = StyleSheet.create({ wrap:{ padding:spacing(2) }, title:{ fontSize:22, fontWeight:'800', color:colors.text, marginBottom:spacing(2) }, row:{ flexDirection:'row', justifyContent:'space-between', marginBottom:spacing(1) }, date:{ color:colors.muted }, prompt:{ color:colors.text, marginBottom:spacing(1) }, actions:{ flexDirection:'row', gap:spacing(2) }, link:{ color:colors.primary, fontWeight:'600' } });
EOF

cat > src/screens/MonetizeScreen.tsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { getProducts, saveProduct } from '@/lib/storage';

export default function MonetizeScreen() {
  const [title, setTitle] = useState('AI-Boosted Side Hustle Starter Kit');
  const [link, setLink] = useState('https://example.com/your-product');
  const [products, setProducts] = useState<any[]>([]);
  async function load() { setProducts(await getProducts()); }
  useEffect(() => { load(); }, []);

  async function add() {
    await saveProduct({ id: Date.now().toString(), title, link });
    setTitle(''); setLink(''); load();
  }

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.title}>Monetize</Text>
      <Card>
        <Text style={s.label}>Add product/link</Text>
        <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Product title" />
        <TextInput style={s.input} value={link} onChangeText={setLink} placeholder="https://..." autoCapitalize="none" />
        <Button title="Save" onPress={add} />
      </Card>
      <Text style={s.subtitle}>Your products</Text>
      {products.map(p => (<Card key={p.id}><Text style={s.prod}>{p.title}</Text><Text style={s.link}>{p.link}</Text></Card>))}
    </ScrollView>
  );
}
const s = StyleSheet.create({ wrap:{ padding:spacing(2) }, title:{ fontSize:22, fontWeight:'800', color:colors.text, marginBottom:spacing(2) },
subtitle:{ fontSize:16, fontWeight:'700', marginTop:spacing(1), marginBottom:spacing(1) },
label:{ color:colors.muted, marginBottom:spacing(1) },
input:{ backgroundColor:'#fff', borderWidth:1, borderColor:colors.border, padding:spacing(1.5), borderRadius:10, marginBottom:spacing(1) },
prod:{ fontWeight:'700', color:colors.text }, link:{ color:colors.muted } });
EOF

cat > src/screens/SettingsScreen.tsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import Button from '@/components/Button';
import { colors, spacing } from '@/theme/tokens';
import { getProfile, saveProfile } from '@/lib/storage';

export default function SettingsScreen() {
  const [niche, setNiche] = useState('');
  const [pillars, setPillars] = useState('');
  const [voice, setVoice] = useState('');

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p) { setNiche(p.niche); setPillars(p.pillars.join(', ')); setVoice(p.voice); }
    })();
  }, []);

  async function save() {
    await saveProfile({ userId:'demo', plan:'free', niche, pillars: pillars.split(',').map(s=>s.trim()).filter(Boolean), voice });
    Alert.alert('Saved', 'Settings updated');
  }

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.title}>Settings</Text>
      <Text style={s.label}>Niche</Text>
      <TextInput style={s.input} value={niche} onChangeText={setNiche} />
      <Text style={s.label}>Pillars</Text>
      <TextInput style={s.input} value={pillars} onChangeText={setPillars} />
      <Text style={s.label}>Voice</Text>
      <TextInput style={s.input} value={voice} onChangeText={setVoice} />
      <Button title="Save" onPress={save} />
    </ScrollView>
  );
}
const s = StyleSheet.create({ wrap:{ padding:spacing(2) }, title:{ fontSize:22, fontWeight:'800', color:colors.text, marginBottom:spacing(2) },
label:{ color:colors.muted, marginBottom:spacing(1), marginTop:spacing(1) },
input:{ backgroundColor:'#fff', borderWidth:1, borderColor:colors.border, padding:spacing(1.5), borderRadius:10 } });
EOF

cat > src/screens/TrendRemix.tsx <<'EOF'
import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { getProfile } from '@/lib/storage';
import { remixTrendLocal } from '@/lib/ai/generate';

export default function TrendRemix() {
  const [trend, setTrend] = useState('POV: you’re still doing [thing] the old way');
  const [result, setResult] = useState<{hooks:string[], script:string, caption:string, hashtags:string[]}|null>(null);
  const [loading, setLoading] = useState(false);

  async function remix() {
    setLoading(true);
    const profile = await getProfile();
    const niche = profile?.niche || 'AI side hustles';
    const voice = profile?.voice || 'friendly';
    const pillars = profile?.pillars || [];
    const out = await remixTrendLocal({ niche, voice, pillars, trend });
    setResult(out);
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.title}>Trend Remix</Text>
      <Card>
        <Text style={s.label}>Paste a trend (hook, meme, sound idea, or caption):</Text>
        <TextInput style={s.input} multiline value={trend} onChangeText={setTrend} placeholder='e.g., “Tell me you’re X without telling me you’re X”' />
        <Button title={loading ? 'Remixing…' : 'Remix for my niche'} onPress={remix} disabled={loading} />
      </Card>
      {result && (
        <>
          <Card><Text style={s.section}>Hooks</Text>{result.hooks.map((h,i)=>(<Text key={i}>• {h}</Text>))}</Card>
          <Card><Text style={s.section}>Script (~45s)</Text><Text>{result.script}</Text></Card>
          <Card><Text style={s.section}>Caption</Text><Text>{result.caption}</Text><Text style={{ marginTop: spacing(1) }}>{result.hashtags.join(' ')}</Text></Card>
        </>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({ wrap:{ padding:spacing(2), rowGap:spacing(2) }, title:{ fontSize:22, fontWeight:'800', color:colors.text }, label:{ color:colors.muted, marginBottom:spacing(1) }, input:{ backgroundColor:'#fff', borderWidth:1, borderColor:colors.border, padding:spacing(1.5), borderRadius:10, minHeight:100, textAlignVertical:'top' }, section:{ fontWeight:'700', color:colors.text, marginBottom:spacing(1) } });
EOF

# 14) Basic README + .env.example
cat > README.md <<'EOF'
# HustleSpark – AI Hustle Coach (overlay setup)
- Start: npm start
- i = iOS Simulator (needs Xcode), a = Android (Android Studio), or scan QR in Expo Go
- Optional: add OPENAI_API_KEY in .env; add Firebase config in src/config/firebaseConfig.ts and flip MODE in src/lib/storage/index.ts to 'firebase'
EOF

cat > .env.example <<'EOF'
OPENAI_API_KEY=sk-...
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=
EOF

echo "==> Done."
echo "Backup folder: $BACKUP_DIR"
echo "Next steps:"
echo "  1) npm start"
echo "  2) Press i for iOS simulator (or scan QR in Expo Go)"

