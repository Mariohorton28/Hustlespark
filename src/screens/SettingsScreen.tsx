import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import { getProfile, saveProfile } from '../lib/storage';

export default function SettingsScreen(){
  const [niche,setNiche]=useState('');
  const [pillarsStr,setPillarsStr]=useState('');
  const [voice,setVoice]=useState('');

  useEffect(()=>{(async()=>{
    const p = await getProfile();
    if(p){ setNiche(p.niche); setPillarsStr(p.pillars.join(', ')); setVoice(p.voice); }
  })();},[]);

  async function save(){
    await saveProfile({ niche, pillars: pillarsStr.split(',').map(s=>s.trim()).filter(Boolean), voice });
    Alert.alert('Saved','Settings updated');
  }

  return (
    <ScrollView contentContainerStyle={{padding:16, gap:12}}>
      <Text style={{fontSize:22,fontWeight:'700'}}>Settings</Text>
      <Text>Niche</Text><TextInput value={niche} onChangeText={setNiche} style={input}/>
      <Text>Pillars</Text><TextInput value={pillarsStr} onChangeText={setPillarsStr} style={input}/>
      <Text>Voice</Text><TextInput value={voice} onChangeText={setVoice} style={input}/>
      <Button title="Save" onPress={save}/>
    </ScrollView>
  );
}
const input = { backgroundColor:'#fff', borderColor:'#ddd', borderWidth:1, padding:12, borderRadius:8 };
