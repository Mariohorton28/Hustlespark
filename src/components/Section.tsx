import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export default function Section({ title, children }: { title: string } & React.PropsWithChildren) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: spacing(2) },
  title: { fontWeight: '700', color: colors.text, marginBottom: spacing(1) },
});
