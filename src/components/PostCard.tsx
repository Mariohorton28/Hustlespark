import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  caption?: string;
  hashtags?: string;
  scheduledDate?: string;
  postedDate?: string;
};

export default function PostCard({
  title,
  caption,
  hashtags,
  scheduledDate,
  postedDate,
}: Props) {
  return (
    <View style={s.card}>
      {postedDate ? (
        <View style={s.postedRow}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          <Text style={s.postedText}>Posted on {postedDate}</Text>
        </View>
      ) : null}

      <Text style={s.title}>{title}</Text>

      {!!caption && (
        <>
          <Text style={s.label}>Caption</Text>
          <Text style={s.body}>{caption}</Text>
        </>
      )}

      {!!hashtags && (
        <>
          <Text style={[s.label, { marginTop:6 }]}>Hashtags</Text>
          <Text style={s.body}>{hashtags}</Text>
        </>
      )}

      {!!scheduledDate && !postedDate && (
        <View style={s.metaRow}>
          <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
          <Text style={s.metaText}>{scheduledDate}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor:'#fff',
    borderRadius:14,
    padding:14,
    borderWidth:1,
    borderColor:'#E5E7EB',
    shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6, shadowOffset:{width:0,height:2},
  },
  postedRow:{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:6 },
  postedText:{ color:'#16A34A', fontWeight:'800' },
  title:{ fontSize:16, fontWeight:'900', color:'#0F172A', marginBottom:6 },
  label:{ fontSize:12, fontWeight:'800', color:'#475569' },
  body:{ color:'#0F172A' },
  metaRow:{ flexDirection:'row', alignItems:'center', gap:6, marginTop:8 },
  metaText:{ color:'#5B21B6', fontWeight:'800' },
});