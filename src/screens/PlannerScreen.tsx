import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { loadPlans, setStatus, PlanDoc } from '../lib/planStore';
import { exportPlansCsv } from '../lib/csv';
import { useBranding } from '../theme/branding';

export default function PlannerScreen() {
  const [plans, setPlans] = useState<PlanDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { brand } = useBranding();

  async function refresh() {
    setLoading(true);
    const all = await loadPlans();
    setPlans(all);
    setLoading(false);
  }

  async function markPosted(id: string) {
    await setStatus(id, 'posted');
    await refresh();
  }

  async function exportCsv() {
    try {
      setExporting(true);
      await exportPlansCsv(plans);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={s.wrap}>
      <View style={s.headerRow}>
        <Text style={s.h1}>Planner</Text>
        <View style={s.headerActions}>
          <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={refresh} disabled={loading}>
            <Text style={[s.btnText, s.btnGhostText]}>{loading ? 'Refreshing…' : 'Refresh'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { backgroundColor: brand.primary }]} onPress={exportCsv} disabled={exporting || plans.length === 0}>
            <Text style={s.btnText}>{exporting ? 'Exporting…' : 'Export CSV'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {plans.length === 0 && !loading ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>Nothing saved yet</Text>
          <Text style={s.muted}>
            Go to <Text style={s.bold}>Today</Text> or <Text style={s.bold}>Remix</Text> and tap “Save to Planner”.
          </Text>
        </View>
      ) : null}

      {plans.map(p => (
        <View key={p.id} style={s.card}>
          <View style={s.row}>
            <Text style={s.date}>{p.date}</Text>
            <View style={[s.badge, p.status === 'posted' ? s.badgePosted : null, p.status !== 'posted' ? { backgroundColor: brand.primary } : null]}>
              <Text style={s.badgeText}>{p.status}</Text>
            </View>
          </View>

          <Text style={s.prompt}>{p.prompt}</Text>

          {p.hooks?.length ? (
            <View style={{ marginTop: 10, gap: 6 }}>
              {p.hooks.slice(0, 3).map((h, i) => (
                <View key={i} style={s.hookRow}>
                  <View style={[s.dot, { backgroundColor: brand.primary }]} />
                  <Text style={s.hookText}>{h}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={s.divider} />

          <View style={s.footerRow}>
            {p.status !== 'posted' ? (
              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: brand.primary }]} onPress={() => markPosted(p.id)}>
                <Text style={s.btnText}>Mark posted</Text>
              </TouchableOpacity>
            ) : (
              <View style={[s.badge, s.badgeSoftGreen]}>
                <Text style={[s.badgeText, { color: '#065F46' }]}>Posted</Text>
              </View>
            )}
            {p.hashtags?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {p.hashtags.slice(0, 4).map((t, i) => (
                  <View key={i} style={s.chip}>
                    <Text style={s.chipText}>{t}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerActions: { flexDirection: 'row', gap: 10 },
  h1: { fontSize: 22, fontWeight: '800', color: '#0F172A' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 12,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: '#64748B' },

  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#7C3AED' },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  badgePosted: { backgroundColor: '#10B981' },
  badgeSoftGreen: { backgroundColor: '#D1FAE5' },

  prompt: { color: '#0F172A', fontWeight: '700', marginTop: 8 },

  hookRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#7C3AED', marginRight: 8 },
  hookText: { color: '#0F172A' },

  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: '#3730A3', fontWeight: '700', fontSize: 12 },

  btn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  btnText: { color: '#fff', fontWeight: '800' },
  btnGhost: { backgroundColor: '#EEF2FF' },
  btnGhostText: { color: '#3730A3' },

  btnPrimary: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },

  empty: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: { fontWeight: '800', fontSize: 16, marginBottom: 4, color: '#0F172A' },

  muted: { color: '#64748B' },
  bold: { fontWeight: '800', color: '#0F172A' },
});
