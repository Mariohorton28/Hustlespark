import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { getProfile } from '../lib/storage';

export default function TrendRemix(){
  const [trend,setTrend]=useState('Tell me you’re X without telling me you’re X');
  const [out,setOut]=useState<{hooks:string[]; script:string; caption:string; hashtags:string[]} | null>(null);
  const [loading,setLoading]=useState(false);

  async function remix(){
    setLoading(true);
    const p = await getProfile();
    const niche = p?.niche || 'AI side hustles';
    const voice = p?.voice || 'friendly';
    const pillars = p?.pillars || ['Automation','Prompting'];
    const hooks = [
      `${trend} — but for ${niche}`,
      `If you do ${niche}, try this: ${trend}`,
      `${niche} hack using this trend: ${trend}`,
    ];
    const script = `Hook: ${hooks[0]}\nIntro: adapt this trend to ${niche}.\nStep 1: tie it to ${pillars[0]}.\nStep 2: before vs after.\nCTA: Follow for daily ${niche} wins. (Voice: ${voice})`;
    const caption = `Remixing a trend for ${niche}. Try it and tell me how it goes.`;
    const hashtags = ['#trend','#remix','#howto','#content',`#${niche.replace(/\W+/g,'').toLowerCase()}`];
    setOut({ hooks, script, caption, hashtags });
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={{padding:16, gap:12}}>
      <Text style={{fontSize:22,fontWeight:'700'}}>Trend Remix</Text>
      <Text>Paste a trend:</Text>
      <TextInput value={trend} onChangeText={setTrend} style={input} multiline/>
      <Button title={loading?'Remixing…':'Remix for my niche'} onPress={remix} disabled={loading}/>
      {out && (
        <View style={{gap:8}}>
          <Text style={{fontWeight:'600'}}>Hooks</Text>{out.hooks.map((h,i)=><Text key={i}>• {h}</Text>)}
          <Text style={{fontWeight:'600'}}>Script</Text><Text>{out.script}</Text>
          <Text style={{fontWeight:'600'}}>Caption</Text><Text>{out.caption}</Text>
          <Text style={{fontWeight:'600'}}>Hashtags</Text><Text>{out.hashtags.join(' ')}</Text>
        </View>
      )}
    </ScrollView>
  );
}
const input = { backgroundColor:'#fff', borderColor:'#ddd', borderWidth:1, padding:12, borderRadius:8, minHeight:100, textAlignVertical:'top' as const };
