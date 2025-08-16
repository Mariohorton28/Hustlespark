import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Image } from 'expo-image';
import { useBranding } from '../theme/branding';

type Profile = { niche: string; pillars: string[]; voice: string };
const PROFILE_KEY = 'hs:profile';

export default function SettingsScreen() {
  // Profile
  const [niche, setNiche] = useState('');
  const [pillars, setPillars] = useState('');
  const [voice, setVoice] = useState('');

  // Branding
  const { brand, setBrand } = useBranding();
  const [primary, setPrimary] = useState(brand.primary || '#7C3AED');
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || '');
  const [monetizeLogoUrl, setMonetizeLogoUrl] = useState(brand.monetizeLogoUrl || '');

  useEffect(() => {
    (async () => {
      // hydrate profile
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) {
          const p: Profile = JSON.parse(raw);
          setNiche(p.niche || '');
          setPillars((p.pillars || []).join(', '));
          setVoice(p.voice || '');
        }
      } catch {}

      // hydrate branding (in case provider loaded after)
      setPrimary(brand.primary || '#7C3AED');
      setLogoUrl(brand.logoUrl || '');
      setMonetizeLogoUrl(brand.monetizeLogoUrl || '');
    })();
  }, [brand.primary, brand.logoUrl, brand.monetizeLogoUrl]);

  function isHex(x: string) {
    return /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(x.trim());
  }

  async function saveProfile() {
    const profile: Profile = {
      niche: niche.trim(),
      pillars: pillars.split(',').map(p => p.trim()).filter(Boolean),
      voice: voice.trim(),
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    Toast.show({ type: 'success', text1: 'Profile updated' });
  }

  async function saveBranding() {
    if (!isHex(primary)) {
      Toast.show({ type: 'error', text1: 'Invalid color (use hex like #7C3AED)' });
      return;
    }
    await setBrand({
      primary: primary.trim(),
      logoUrl: logoUrl.trim(),
      monetizeLogoUrl: monetizeLogoUrl.trim(),
    });
    Toast.show({ type: 'success', text1: 'Branding updated' });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Settings</Text>

      {/* Profile section */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Profile</Text>

        <Text style={s.label}>Your Niche</Text>
        <TextInput style={s.input} value={niche} onChangeText={setNiche} placeholder="BBQ, HR tips, finance…" />

        <Text style={s.label}>Content Pillars (comma separated)</Text>
        <TextInput style={s.input} value={pillars} onChangeText={setPillars} placeholder="How-to, Motivation, Trends…" />

        <Text style={s.label}>Voice</Text>
        <TextInput style={s.input} value={voice} onChangeText={setVoice} placeholder="friendly, expert, casual…" />

        <TouchableOpacity style={[s.btn, { backgroundColor: primary || '#7C3AED' }]} onPress={saveProfile}>
          <Text style={s.btnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Branding section */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Branding</Text>

        <Text style={s.label}>Primary color (hex)</Text>
        <TextInput style={s.input} value={primary} onChangeText={setPrimary} placeholder="#7C3AED" autoCapitalize="none" />

        <Text style={s.label}>App logo URL (PNG/JPG)</Text>
        <TextInput style={s.input} value={logoUrl} onChangeText={setLogoUrl} placeholder="https://your-cdn.com/logo.png" autoCapitalize="none" />
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={{ height: 40, width: 200 }} contentFit="contain" />
          ) : (
            <View style={s.noImg}><Text style={s.noImgText}>No app logo set</Text></View>
          )}
        </View>

        <Text style={[s.label, { marginTop: 12 }]}>Monetize tab logo URL (PNG/JPG)</Text>
        <TextInput
          style={s.input}
          value={monetizeLogoUrl}
          onChangeText={setMonetizeLogoUrl}
          placeholder="https://your-cdn.com/money-logo.png"
          autoCapitalize="none"
        />
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          {monetizeLogoUrl ? (
            <Image source={{ uri: monetizeLogoUrl }} style={{ height: 40, width: 200 }} contentFit="contain" />
          ) : (
            <View style={s.noImg}><Text style={s.noImgText}>No Monetize logo set</Text></View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity style={[s.btn, { backgroundColor: primary || '#7C3AED' }]} onPress={saveBranding}>
            <Text style={s.btnText}>Save Branding</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 10 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    gap: 10,
  },
  sectionTitle: { fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  label: { color: '#64748B', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff',
    padding: 12, borderRadius: 10, marginBottom: 4,
  },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  noImg: { height: 40, width: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 },
  noImgText: { color: '#94A3B8' },
});