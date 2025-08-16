import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { PlanDoc } from './planStore';

function toCsv(plans: PlanDoc[]) {
  const esc = (s: any) => {
    const str = (s ?? '').toString().replace(/"/g, '""');
    return `"${str}"`;
  };
  const header = ['date','status','prompt','hooks','script','caption','hashtags'];
  const rows = plans.map(p => [
    p.date,
    p.status,
    p.prompt,
    (p.hooks || []).join(' | '),
    p.script,
    p.caption,
    (p.hashtags || []).join(' '),
  ].map(esc).join(','));
  return [header.join(','), ...rows].join('\n');
}

export async function exportPlansCsv(plans: PlanDoc[]) {
  const csv = toCsv(plans);
  const filename = `hustlespark_plans_${new Date().toISOString().slice(0,10)}.csv`;
  const uri = FileSystem.documentDirectory! + filename;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });

  // share if available; otherwise just return the path
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Planner CSV',
      UTI: 'public.comma-separated-values-text',
    });
  }
  return uri;
}
