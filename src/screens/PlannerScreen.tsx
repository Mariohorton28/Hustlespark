import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import { getPlans, setPlanStatus, Plan } from '../lib/storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function toCSV(plans: Plan[]) {
  const esc = (s: any) =>
    `"${String(s ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  const header = [
    'id','date','status','prompt','hooks','script','caption','hashtags'
  ].join(',');
  const rows = plans.map(p =>
    [
      p.id,
      p.date,
      p.status,
      p.prompt,
      (p.hooks || []).join(' | '),
      p.script,
      p.caption,
      (p.hashtags || []).join(' ')
    ].map(esc).join(',')
  );
  return [header, ...rows].join('\n');
}

export default function PlannerScreen(){
  const [plans,setPlans]=useState<Plan[]>([]);
  async function load(){ setPlans(await getPlans()); }
  useEffect(()=>{ load(); },[]);

  async function exportCSV(){
    if(plans.length === 0){ Alert.alert('Nothing to export','Add a plan first.'); return; }
    const csv = toCSV(plans);
    const filename = `planner_export_${new Date().toISOString().slice(0,10)}.csv`;
    const uri = FileSystem.documentDirectory! + filename;
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export Planner CSV' });
    } else {
      Alert.alert('Saved', `File written to:\n${uri}`);
    }
  }

  return (
    <ScrollView contentContainerStyle={{padding:16, gap:12}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
        <Text style={{fontSize:22,fontWeight:'700'}}>Planner</Text>
        <Button title="Export CSV" onPress={exportCSV} />
      </View>

      {plans.length===0 && <Text>No posts yet — save one from Today.</Text>}

      {plans.map(p=>(
        <View key={p.id} style={{padding:12,borderWidth:1,borderColor:'#ddd',borderRadius:8}}>
          <Text style={{fontWeight:'600'}}>{p.date} • {p.status}</Text>
          <Text numberOfLines={2} style={{marginVertical:6}}>{p.prompt}</Text>
          <Button title="Mark posted" onPress={async()=>{ await setPlanStatus(p.id,'posted'); load(); }}/>
        </View>
      ))}
    </ScrollView>
  );
}