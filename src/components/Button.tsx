import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

type Props = { title: string; onPress?: () => void; disabled?: boolean; };

export default function Button({ title, onPress, disabled }: Props) {
  return (
    <TouchableOpacity style={[s.btn, disabled && s.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={s.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { backgroundColor: colors.primary, paddingVertical: spacing(1.5), paddingHorizontal: spacing(2), borderRadius: radius, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
