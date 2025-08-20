import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { saveProfile } from '../lib/storage';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen(){
  const [niche,setNiche]=useState('AI side hustles');
  const [pillarsStr,setPillarsStr]=useState('Automation, Prompting, Monetization');
  const [voice,setVoice]=useState('friendly');
  const nav = useNavigation<any>();

  async function save(){
    const pillars = pillarsStr.split(',').map(s=>s.trim()).filter(Boolean);
    await saveProfile({ niche, pillars, voice });
    Alert.alert('Saved','Profile saved. Opening Today…');
    // jump to Today tab
    nav.navigate('Today');
  }

  return (
    <ScrollView contentContainerStyle={{padding:16,gap:12}}>
      <Text style={{fontSize:22,fontWeight:'700'}}>Let’s build your content engine</Text>
      <Text>Niche</Text>
      <TextInput value={niche} onChangeText={setNiche} placeholder="e.g., BBQ tips" style={input}/>
      <Text>3–5 Content Pillars (comma-separated)</Text>
      <TextInput value={pillarsStr} onChangeText={setPillarsStr} placeholder="Automation, …" style={input}/>
      <Text>Brand Voice</Text>
      <TextInput value={voice} onChangeText={setVoice} placeholder="friendly / authority / casual" style={input}/>
      <Button title="Create my daily plan" onPress={save}/>
    </ScrollView>
  );
}
const input = { backgroundColor:'#fff', borderColor:'#ddd', borderWidth:1, padding:12, borderRadius:8 };
