import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator } from 'react-native';
import { getProfile, savePlan, Plan } from '../lib/storage';
import { todayISO } from '../lib/date';

function genLocal(niche:string, pillars:string[], voice:string){
  const hooks = [
    `Stop scrolling if you care about ${niche}`,
    `Fastest way to level up your ${niche} game`,
    `${niche} myth that wastes time`,
  ];
  const script = `Quick ${niche} win. Focus on ${pillars[0]||'one simple step'}. Keep it simple. Take action today. (Voice: ${voice})`;
  const caption = `Try this ${niche} tip today. Save this!`;
  const hashtags = ['#' + niche.replace(/\W+/g,'').toLowerCase(), '#howto', '#tips', '#growth', '#sidehustle'];
  return { hooks, script, caption, hashtags };
}

export default function HomeScreen(){
  const [loading,setLoading]=useState(true);
  const [plan,setPlan]=useState<Plan|null>(null);

  useEffect(()=>{(async()=>{
    const prof = await getProfile();
    const niche = prof?.niche || 'AI side hustles';
    const pillars = prof?.pillars || ['Automation','Prompting','Monetization'];
    const voice = prof?.voice || 'friendly';
    const gen = genLocal(niche,pillars,voice);
    const doc: Plan = { id: todayISO(), date: todayISO(), prompt:`3 ${niche} tips for today`, status:'pending', ...gen };
    setPlan(doc); setLoading(false);
  })();},[]);

  async function addToPlanner(){
    if(!plan) return;
    await savePlan(plan);
    alert('Saved to Planner');
  }

  if(loading) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></View>;

  return (
    <ScrollView contentContainerStyle={{padding:16, gap:12}}>
      <Text style={{fontSize:22,fontWeight:'700'}}>Today</Text>
      <Text style={{fontWeight:'600'}}>Prompt</Text><Text>{plan?.prompt}</Text>
      <Text style={{fontWeight:'600'}}>Hooks</Text>{plan?.hooks.map((h,i)=><Text key={i}>• {h}</Text>)}
      <Text style={{fontWeight:'600'}}>Script</Text><Text>{plan?.script}</Text>
      <Text style={{fontWeight:'600'}}>Caption</Text><Text>{plan?.caption}</Text>
      <Text style={{fontWeight:'600'}}>Hashtags</Text><Text>{plan?.hashtags.join(' ')}</Text>
      <Button title="Add to Planner" onPress={addToPlanner}/>
    </ScrollView>
  );
}
