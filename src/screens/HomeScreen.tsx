import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useBranding } from '../theme/branding';
import { todayId } from '../lib/date';
import { upsertPlan } from '../lib/planStore';

type Profile = { niche: string; pillars: string[]; voice: string };
const PROFILE_KEY = 'hs:profile';

export default function HomeScreen() {
  const nav = useNavigation();
  const { brand } = useBranding();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) setProfile(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  async function quickSave() {
    setSaving(true);
    const idBase = todayId();
    await upsertPlan({
      id: `${idBase}-quick-${Date.now()}`,
      date: idBase,
      prompt: `Daily plan for ${profile?.niche || 'your niche'}`,
      hooks: [
        `A quick win for ${profile?.niche || 'your niche'}`,
        `Stop doing this in ${profile?.niche || 'your niche'}`,
      ],
      caption: `Daily push for ${profile?.niche || 'your niche'}`,
      hashtags: ['#daily', '#content', '#planner'],
      status: 'pending',
    });
    setSaving(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={s.wrap}>
      {/* Profile banner */}
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.title}>Your Profile</Text>
          <TouchableOpacity onPress={() => nav.navigate('Settings' as never)}>
            <Text style={[s.link, { color: brand.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={s.row}>
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

        {profile?.pillars?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 8 }}>
            {profile.pillars.map((p, i) => (
              <View key={i} style={s.chip}>
                <Text style={s.chipText}>{p}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* Quick actions */}
      <View style={s.row}>
        <TouchableOpacity style={[s.action, { borderColor: brand.primary }]}>
          <Text style={s.actionTitle}>Idea Starter</Text>
          <Text style={s.muted}>3 hooks for today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.action, { borderColor: '#22C55E' }]}>
          <Text style={s.actionTitle}>Checklist</Text>
          <Text style={s.muted}>Prep → Record → Post</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[s.btnPrimary, { backgroundColor: brand.primary }]} onPress={quickSave} disabled={saving}>
        <Text style={s.btnText}>{saving ? 'Saving…' : 'Save to Planner (Today)'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  link: { fontWeight: '800' },

  title: { fontWeight: '800', color: '#0F172A' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },

  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontWeight: '700' },
  bold: { fontWeight: '900', color: '#0F172A' },

  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: '#3730A3', fontWeight: '700', fontSize: 12 },

  action: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderRadius: 14, padding: 16 },
  actionTitle: { fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  muted: { color: '#64748B' },

  btnPrimary: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800' },
});