import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';

import { useBranding } from '../theme/branding';
import { upsertPlan } from '../lib/planStore';
import { todayId } from '../lib/date';

type Profile = { niche: string; pillars: string[]; voice: string };
const PROFILE_KEY = 'hs:profile';

function isUrl(str: string) {
  try {
    const u = new URL(str.trim());
    return /^https?:$/.test(u.protocol);
  } catch {
    return false;
  }
}

export default function MonetizeScreen() {
  const { brand } = useBranding();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Form state
  const [title, setTitle] = useState('My #1 Recommended Tool');
  const [link, setLink] = useState('');
  const [why, setWhy] = useState('Saves me hours each week and is beginner-friendly.');
  const [cta, setCta] = useState('Grab it here →');

  // UI state
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) setProfile(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const niche = profile?.niche || 'AI side hustles';
  const voice = profile?.voice || 'friendly';
  const pillars = profile?.pillars || ['Automation', 'Prompting', 'Monetization'];

  const preview = useMemo(() => {
    const tag = niche.replace(/[^a-z0-9]+/gi, '').toLowerCase() || 'niche';
    const hashtags = ['#affiliate', '#recommendation', '#tools', '#productivity', `#${tag}`];

    const hooks = [
      `Stop wasting time — try this for ${niche}`,
      `${niche}: the tool I wish I had sooner`,
      `If you do ${niche}, this is a must`,
    ];

    const caption =
      `${title}\n\n` +
      `Why I like it: ${why}\n` +
      `How I use it (${pillars[0] || 'Quick win'}): 1) Start small 2) Apply daily 3) Track results\n\n` +
      `${cta} ${link}\n\n` +
      hashtags.join(' ');

    return { hooks, caption, hashtags };
  }, [title, link, why, cta, niche, pillars]);

  async function saveToPlanner() {
    if (!isUrl(link)) {
      Toast.show({ type: 'error', text1: 'Please paste a valid URL (https://...)' });
      return;
    }
    setSaving(true);
    try {
      const idBase = todayId();
      await upsertPlan({
        id: `${idBase}-offer-${Date.now()}`,
        date: idBase,
        prompt: `Affiliate: ${title}`,
        hooks: preview.hooks,
        caption: preview.caption,
        hashtags: preview.hashtags,
        link,
        status: 'pending',
      });
      Toast.show({ type: 'success', text1: 'Offer saved to Planner' });
    } finally {
      setSaving(false);
    }
  }

  async function copy(text: string, label: string) {
    await Clipboard.setStringAsync(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
    Toast.show({ type: 'success', text1: `Copied ${label}` });
  }

  async function testLink() {
    if (!isUrl(link)) {
      Toast.show({ type: 'error', text1: 'Enter a valid URL before testing' });
      return;
    }
    try {
      setTesting(true);
      await WebBrowser.openBrowserAsync(link.trim(), {
        enableBarCollapsing: true,
        readerMode: false,
        showTitle: true,
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Could not open the link' });
    } finally {
      setTesting(false);
    }
  }

  const bgUri =
    brand.monetizeLogoUrl && brand.monetizeLogoUrl.length > 4
      ? brand.monetizeLogoUrl!
      : 'https://i.imgur.com/PkgyaIc.png';

  return (
    <ImageBackground source={{ uri: bgUri }} style={{ flex: 1 }} imageStyle={s.bgImage}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.wrap}>
        <View style={s.cardHeader}>
          <Text style={s.h1}>Monetize</Text>
          <Text style={s.sub}>Paste an affiliate/referral link. We’ll generate posts that drive clicks.</Text>
        </View>

        {/* Profile banner (compact) */}
        <View style={s.banner}>
          <View style={[s.pill, { backgroundColor: '#EEF2FF' }]}>
            <Text style={[s.pillText, { color: '#3730A3' }]}>
              Niche: <Text style={s.bold}>{niche}</Text>
            </Text>
          </View>
          <View style={[s.pill, { backgroundColor: '#EDE9FE' }]}>
            <Text style={[s.pillText, { color: '#6D28D9' }]}>
              Voice: <Text style={s.bold}>{voice}</Text>
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.label}>Offer title</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Best mic under $50"
          />

          <View style={{ gap: 8, marginTop: 6 }}>
            <Text style={s.label}>Affiliate / referral URL</Text>
            <TextInput
              style={s.input}
              value={link}
              onChangeText={setLink}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.btnGhost]} onPress={testLink} disabled={testing}>
                <Text style={[s.btnGhostText]}>{testing ? 'Opening…' : 'Test Link'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnFilled, { backgroundColor: '#22C55E' }]}
                onPress={() => copy(link, 'Link')}
                disabled={!link}
              >
                <Text style={s.btnText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[s.label, { marginTop: 8 }]}>Why this link?</Text>
          <TextInput
            style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={why}
            onChangeText={setWhy}
            multiline
            placeholder="What makes this great? How does it help your audience?"
          />

          <Text style={s.label}>Call to action</Text>
          <TextInput
            style={s.input}
            value={cta}
            onChangeText={setCta}
            placeholder="Grab it here →"
          />
        </View>

        {/* Preview */}
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.title}>Hooks</Text>
            <TouchableOpacity onPress={() => copy(preview.hooks.join('\n'), 'Hooks')}>
              <Text style={s.link}>Copy</Text>
            </TouchableOpacity>
          </View>
          {preview.hooks.map((h, i) => (
            <Text key={i}>• {h}</Text>
          ))}

          <View style={[s.row, { marginTop: 12 }]}>
            <Text style={s.title}>Caption</Text>
            <TouchableOpacity onPress={() => copy(preview.caption, 'Caption')}>
              <Text style={s.link}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ marginTop: 4 }}>{preview.caption}</Text>
        </View>

        <TouchableOpacity
          style={[s.btnFilled, { backgroundColor: brand.primary || '#7C3AED' }]}
          onPress={saveToPlanner}
          disabled={saving}
        >
          <Text style={s.btnText}>{saving ? 'Saving…' : 'Save to Planner'}</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  bgImage: { resizeMode: 'cover', opacity: 0.12 },

  cardHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  h1: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  sub: { color: '#475569', marginTop: 6 },

  banner: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontWeight: '700' },
  bold: { fontWeight: '900', color: '#0F172A' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  label: { color: '#64748B', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '800', color: '#0F172A' },
  link: { color: '#7C3AED', fontWeight: '800' },

  btnFilled: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnGhost: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
  },
  btnGhostText: { color: '#0F172A', fontWeight: '800' },
  btnText: { color: '#fff', fontWeight: '800' },
});