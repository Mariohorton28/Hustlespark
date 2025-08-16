import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

export default function Card({ children }: React.PropsWithChildren) {
  return <View style={s.card}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius, padding: spacing(2),
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing(2),
  },
});
