import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnboardingDone } from '../lib/onboardingStore';

type Profile = {
  niche: string;
  pillars: string[];   // parsed from comma-separated input
  voice: string;
};

const PROFILE_KEY = 'hs:profile';

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [niche, setNiche] = useState('');
  const [pillarsInput, setPillarsInput] = useState(''); // comma-separated
  const [voice, setVoice] = useState('');
  const [saving, setSaving] = useState(false);

  function parsePillars(raw: string): string[] {
    return raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 6); // cap to 6 pillars
  }

  async function handleFinish() {
    if (!niche.trim() || !pillarsInput.trim() || !voice.trim()) {
      Alert.alert('Almost there', 'Please fill in all three fields to personalize your plan.');
      return;
    }

    try {
      setSaving(true);

      const profile: Profile = {
        niche: niche.trim(),
        pillars: parsePillars(pillarsInput),
        voice: voice.trim(),
      };

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      await setOnboardingDone();

      // Optional toast UX could go here
      // Navigate to main tab
      // @ts-ignore - route name as configured in App.tsx
      navigation.navigate('Today');
    } catch (e: any) {
      Alert.alert('Save error', e?.message ?? 'Something went wrong saving your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={s.wrap}>
      <Text style={s.h1}>Let’s personalize your plan</Text>

      <Text style={s.label}>Your niche</Text>
      <TextInput
        style={s.input}
        value={niche}
        onChangeText={setNiche}
        placeholder="e.g., BBQ tips, HR advice, fitness for dads"
        autoCapitalize="sentences"
      />

      <Text style={s.label}>Content pillars (comma-separated)</Text>
      <TextInput
        style={s.input}
        value={pillarsInput}
        onChangeText={setPillarsInput}
        placeholder="e.g., Automation, Prompting, Monetization"
        autoCapitalize="sentences"
      />

      <Text style={s.label}>Voice</Text>
      <TextInput
        style={s.input}
        value={voice}
        onChangeText={setVoice}
        placeholder="e.g., friendly, authoritative, casual"
        autoCapitalize="none"
      />

      <TouchableOpacity style={s.btn} onPress={handleFinish} disabled={saving}>
        <Text style={s.btnText}>{saving ? 'Saving…' : 'Finish'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 16, color: '#0F172A' },
  label: { color: '#64748B', marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff',
    padding: 12, borderRadius: 10, marginBottom: 4,
  },
  btn: {
    backgroundColor: '#7C3AED',
    padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16,
  },
  btnText: { color: '#fff', fontWeight: '800' },
});