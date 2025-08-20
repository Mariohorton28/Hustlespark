import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  ImageBackground,
  Switch,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Target = 'Home' | 'Onboarding';

export default function IntroScreen({ onDone }: { onDone: (target: Target) => void }) {
  const insets = useSafeAreaInsets();

  const steps = useMemo(
    () => [
      {
        key: 'welcome',
        icon: 'sparkles' as const,
        title: 'Welcome to HustleSpark',
        lines: [
          'Plan, remix, and monetize content in minutes.',
          'We’ll walk you through the basics.',
        ],
      },
      {
        key: 'onboarding',
        icon: 'person-circle' as const,
        title: 'Onboarding',
        lines: [
          'Tell us your niche, pillars, and voice.',
          'This personalizes Remix ideas and Monetize copy.',
        ],
      },
      {
        key: 'remix',
        icon: 'flash' as const,
        title: 'Trend Remix',
        lines: [
          'Generate hooks & captions fast.',
          'Share or Save sections directly to your Planner.',
        ],
      },
      {
        key: 'planner',
        icon: 'calendar' as const,
        title: 'Planner',
        lines: [
          'Everything in one place, grouped by day.',
          'Filter by Pending/Posted and mark Posted when you publish.',
        ],
      },
      {
        key: 'monetize',
        icon: 'cash' as const,
        title: 'Monetize',
        lines: [
          'Paste an affiliate/referral link.',
          'Auto-generate captions & hooks to drive clicks.',
        ],
      },
      {
        key: 'done',
        icon: 'checkmark-circle' as const,
        title: 'You’re ready to go',
        lines: [
          'Tip: Start with Remix to batch ideas, then Monetize.',
          'Use the Planner to stay consistent and organized.',
        ],
      },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  // Animations
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const progressPct = (idx: number) => (idx + 1) / steps.length;

  useEffect(() => {
    animateIn(0);
    Animated.timing(progress, {
      toValue: progressPct(0),
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function animateIn(from: number) {
    fade.setValue(0);
    slide.setValue(from);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }

  function animateOut(to: number, onEnd: () => void) {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: to, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(onEnd);
  }

  async function markSeen() {
    if (dontShowAgain) {
      try { await AsyncStorage.setItem('introSeen', 'true'); } catch {}
    }
  }

  const goNext = async () => {
    await Haptics.selectionAsync();
    if (isLast) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await markSeen();
      return onDone('Onboarding'); // Done → Onboarding
    }
    animateOut(-16, () => {
      setStep((s) => {
        const next = Math.min(s + 1, steps.length - 1);
        Animated.timing(progress, {
          toValue: progressPct(next),
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
        requestAnimationFrame(() => animateIn(16));
        return next;
      });
    });
  };

  const goBack = async () => {
    if (isFirst) return;
    await Haptics.selectionAsync();
    animateOut(16, () => {
      setStep((s) => {
        const prev = Math.max(0, s - 1);
        Animated.timing(progress, {
          toValue: progressPct(prev),
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
        requestAnimationFrame(() => animateIn(-16));
        return prev;
      });
    });
  };

  const onSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markSeen();
    onDone('Home'); // Skip → Home
  };

  const bgUri = 'https://i.imgur.com/PkgyaIc.png'; // watermark

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      {/* Header */}
      <View style={[s.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={{ width: 64 }} />
        <Text style={s.headerTitle}>Introduction</Text>
        <TouchableOpacity onPress={onSkip} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Text style={s.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, {
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }]} />
      </View>

      <ImageBackground
        source={{ uri: bgUri }}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.06, resizeMode: 'contain' }}
      >
        {/* Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{ opacity: fade, transform: [{ translateY: slide }], alignItems: 'center', width: '100%' }}
          >
            <Ionicons name={steps[step].icon} size={48} color="#7C3AED" style={{ marginBottom: 10 }} />
            <Text style={s.h1}>{steps[step].title}</Text>
            <View style={{ gap: 10, marginTop: 8, maxWidth: 560, width: '100%', paddingHorizontal: 8 }}>
              {steps[step].lines.map((t, i) => (
                <Text key={i} style={s.line}>• {t}</Text>
              ))}
            </View>

            {/* Don’t show again */}
            <View style={s.toggleRow}>
              <Switch value={dontShowAgain} onValueChange={setDontShowAgain} />
              <Text style={s.toggleText}>Don’t show this again</Text>
            </View>

            {/* Need help? — only on last step */}
            {isLast && (
              <TouchableOpacity style={{ marginTop: 16 }} onPress={() => setHelpOpen(true)}>
                <Text style={s.helpLink}>
                  <Ionicons name="help-circle" size={16} color="#7C3AED" /> Need help?
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btnGhost, isFirst && s.btnDisabled]}
            onPress={goBack}
            disabled={isFirst}
          >
            <Text style={[s.btnGhostText, isFirst && s.btnDisabledText]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btnPrimary} onPress={goNext}>
            <Text style={s.btnPrimaryText}>{isLast ? 'Done' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Tips Modal */}
      <Modal
        visible={helpOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setHelpOpen(false)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setHelpOpen(false)}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Quick Tips</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              <Text style={s.modalLine}>• Start in <Text style={s.bold}>Remix</Text> to batch ideas fast.</Text>
              <Text style={s.modalLine}>• Save to <Text style={s.bold}>Home (Planner)</Text> to stay consistent.</Text>
              <Text style={s.modalLine}>• Use <Text style={s.bold}>Monetize</Text> to add an affiliate/referral link.</Text>
              <Text style={s.modalLine}>• Mark items <Text style={s.bold}>Posted</Text> after publishing.</Text>
              <Text style={s.modalLine}>• Reopen this tour in <Text style={s.bold}>Settings → Introduction</Text>.</Text>
            </View>

            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalBtnGhost} onPress={() => setHelpOpen(false)}>
                <Text style={s.modalBtnGhostText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.modalBtnPrimary}
                onPress={() => {
                  Linking.openURL('mailto:support@hustlespark.app?subject=HustleSpark%20Help');
                }}
              >
                <Text style={s.modalBtnPrimaryText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  skip: { color: '#7C3AED', fontWeight: '800' },

  progressTrack: {
    height: 6,
    marginHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
  },

  content: { padding: 20, alignItems: 'center' },
  h1: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  line: { color: '#0F172A', fontSize: 16, lineHeight: 22, textAlign: 'center' },

  toggleRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleText: { fontWeight: '700', color: '#0F172A' },

  helpLink: { color: '#7C3AED', fontWeight: '800' },

  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  btnGhost: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
  },
  btnGhostText: { color: '#0F172A', fontWeight: '800' },
  btnPrimary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
  btnDisabledText: { color: '#94A3B8' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalLine: { color: '#0F172A', fontSize: 15, lineHeight: 20 },
  bold: { fontWeight: '800' },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBtnGhost: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnGhostText: { color: '#0F172A', fontWeight: '800' },
  modalBtnPrimary: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '800' },
});