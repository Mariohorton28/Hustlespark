import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { upsertPlan } from '../lib/planStore';
import { todayId } from '../lib/date';
import { useBranding } from '../theme/branding';

type Profile = { niche: string; pillars: string[]; voice: string };
type RemixOut = { hooks: string[]; script: string; caption: string; hashtags: string[] };

const PROFILE_KEY = 'hs:profile';

function remixTrendLocal({ niche, voice, pillars, trend }:{ niche:string; voice:string; pillars:string[]; trend:string; }): RemixOut {
  const hooks = [
    `${trend} — but for ${niche}`,
    `If you do ${niche}, try this twist: ${trend}`,
    `${niche} hack using this trend: ${trend}`,
  ];
  const script =
    `Hook: ${hooks[0]}\n` +
    `Intro: Here’s how to adapt this trend to ${niche}.\n` +
    `Step 1: Tie it to ${pillars[0] || 'a quick win'}.\n` +
    `Step 2: Show a before vs after using the trend format.\n` +
    `Step 3: Add 1 actionable tip.\n` +
    `CTA: Follow for daily ${niche} boosts. (Voice: ${voice})`;
  const caption = `Remixing a trend for ${niche}. Try this and tell me how it goes.`;
  const tag = niche.replace(/[^a-z0-9]+/gi, '').toLowerCase() || 'niche';
  const hashtags = ['#trend', '#remix', '#tutorial', '#howto', '#content', `#${tag}`];
  return { hooks, script, caption, hashtags };
}

export default function TrendRemix() {
  const { brand } = useBranding();
  const nav = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [trend, setTrend] = useState('POV: you’re still doing [thing] the old way');
  const [out, setOut] = useState<RemixOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) setProfile(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  async function remix() {
    setLoading(true);
    const niche = profile?.niche ?? 'AI side hustles';
    const voice = profile?.voice ?? 'friendly';
    const pillars = profile?.pillars ?? ['Automation', 'Prompting', 'Monetization'];
    const result = remixTrendLocal({ niche, voice, pillars, trend });
    setOut(result);
    setLoading(false);
  }

  async function saveToPlanner() {
    if (!out) return;
    setSaving(true);
    const idBase = todayId();
    await upsertPlan({
      id: `${idBase}-remix-${Date.now()}`,
      date: idBase,
      prompt: `Remix: ${trend}`,
      hooks: out.hooks,
      script: out.script,
      caption: out.caption,
      hashtags: out.hashtags,
      status: 'pending',
    });
    setSaving(false);
    Alert.alert('Saved', 'Remix added to Planner.');
  }

  async function copy(text: string, label: string) {
    await Clipboard.setStringAsync(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
  }

  function combinedText() {
    if (!out) return '';
    return [
      `HOOKS:\n- ${out.hooks.join('\n- ')}`,
      `\nSCRIPT:\n${out.script}`,
      `\nCAPTION:\n${out.caption}`,
      `\nHASHTAGS:\n${out.hashtags.join(' ')}`,
    ].join('\n\n');
  }

  return (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.wrap}>
        <Text style={s.h1}>Trend Remix</Text>

        {/* Profile banner */}
        <View style={s.cardSoft}>
          <View style={s.bannerRow}>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', flex: 1 }}>
              <View style={[s.pill, { backgroundColor: '#EEF2FF' }]}>
                <Text style={[s.pillText, { color: '#3730A3' }]}>
                  Niche: <Text style={s.bold}>{profile?.niche || '—'}</Text>
                </Text>
              </View>
              <View style={[s.pill, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[s.pillText, { color: '#6D28D9' }]}>
                  Voice: <Text style={s.bold}>{profile?.voice || '—'}</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => nav.navigate('Settings' as never)}>
              <Text style={[s.link, { color: brand.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Paste a trend (hook, meme, sound idea, or caption):</Text>
          <TextInput
            style={s.input}
            multiline
            value={trend}
            onChangeText={setTrend}
            placeholder='e.g., “Tell me you’re X without telling me you’re X”'
          />
          <TouchableOpacity style={[s.btnPrimary, { backgroundColor: brand.primary }]} onPress={remix} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Remixing…' : 'Remix for my niche'}</Text>
          </TouchableOpacity>
        </View>

        {out && (
          <View style={{ gap: 12, marginTop: 12 }}>
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.title}>Hooks</Text>
                <TouchableOpacity onPress={() => copy(out.hooks.join('\n'), 'Hooks')}>
                  <Text style={s.copyLink}>Copy</Text>
                </TouchableOpacity>
              </View>
              {out.hooks.map((h, i) => (<Text key={i}>• {h}</Text>))}
            </View>

            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.title}>Script (~45s)</Text>
                <TouchableOpacity onPress={() => copy(out.script, 'Script')}>
                  <Text style={s.copyLink}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text>{out.script}</Text>
            </View>

            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.title}>Caption</Text>
                <TouchableOpacity onPress={() => copy(`${out.caption}\n\n${out.hashtags.join(' ')}`, 'Caption')}>
                  <Text style={s.copyLink}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text>{out.caption}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 10 }}>
                {out.hashtags.map((t, i) => (
                  <View key={i} style={s.chip}>
                    <Text style={s.chipText}>{t}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={[s.btn, { backgroundColor: brand.primary }]} onPress={saveToPlanner} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Saving…' : 'Save to Planner'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {out && (
        <TouchableOpacity
          style={[s.fab, { backgroundColor: brand.primary }]}
          onPress={() => copy(combinedText(), 'All')}
          activeOpacity={0.9}
        >
          <Text style={s.fabText}>{copied ? `✓ ${copied}` : 'Copy All'}</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 12, backgroundColor: '#F8FAFC' },
  h1: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  label: { color: '#64748B', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    padding: 12, borderRadius: 10, minHeight: 100, textAlignVertical: 'top',
    marginBottom: 8,
  },
  title: { fontWeight: '700', color: '#0F172A' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  cardSoft: {
    backgroundColor: '#fff', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  copyLink: { color: '#7C3AED', fontWeight: '700' },
  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: '#3730A3', fontWeight: '700', fontSize: 12 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontWeight: '700' },
  bold: { fontWeight: '900', color: '#0F172A' },
  btnPrimary: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  fab: {
    position: 'absolute', right: 16, bottom: 16,
    borderRadius: 9999, paddingVertical: 14, paddingHorizontal: 20,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    zIndex: 999, elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '800' },
  link: { fontWeight: '800' },
});