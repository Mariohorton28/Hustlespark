import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { getProducts, saveProduct } from '../lib/storage';

export default function MonetizeScreen(){
  const [title,setTitle]=useState('AI-Boosted Side Hustle Starter Kit');
  const [link,setLink]=useState('https://example.com/your-product');
  const [items,setItems]=useState<any[]>([]);
  async function load(){ setItems(await getProducts()); }
  useEffect(()=>{ load(); },[]);

  async function add(){
    await saveProduct({ id: Date.now().toString(), title, link });
    setTitle(''); setLink(''); load();
  }

  return (
    <ScrollView contentContainerStyle={{padding:16, gap:12}}>
      <Text style={{fontSize:22,fontWeight:'700'}}>Monetize</Text>
      <Text>Product title</Text>
      <TextInput value={title} onChangeText={setTitle} style={input}/>
      <Text>Link</Text>
      <TextInput value={link} onChangeText={setLink} style={input} autoCapitalize="none"/>
      <Button title="Save" onPress={add}/>
      <Text style={{fontWeight:'600',marginTop:8}}>Your products</Text>
      {items.map(p=>(
        <View key={p.id} style={{padding:12,borderWidth:1,borderColor:'#ddd',borderRadius:8}}>
          <Text style={{fontWeight:'600'}}>{p.title}</Text>
          <Text>{p.link}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const input = { backgroundColor:'#fff', borderColor:'#ddd', borderWidth:1, padding:12, borderRadius:8 };
