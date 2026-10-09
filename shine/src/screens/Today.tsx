import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Diamond } from '../components/Diamond';
import { computeShine, dateKey, dueOn, shineLabel } from '../core/shine';
import { AppState } from '../core/types';
import { theme } from '../theme';

type Props = {
  state: AppState;
  onToggle: (id: string, day: Date) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

export function Today({ state, onToggle, onRemove, onAdd }: Props) {
  const today = useMemo(() => new Date(), []);
  const shine = computeShine(state.routines, state.completions, today);
  const due = dueOn(state.routines, today);
  const done = new Set(state.completions[dateKey(today)] ?? []);

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Diamond energy={shine.energy} />
          <Text style={s.label}>{shineLabel(shine.energy)}</Text>
          <Text style={s.sub}>
            {shine.streak > 0 ? `🔥 ${shine.streak}-day streak` : 'Complete today to start your light'}
          </Text>
        </View>

        <Text style={s.section}>Today</Text>
        {state.routines.length === 0 && (
          <Text style={s.empty}>Add your first routine to wake the diamond.</Text>
        )}
        {state.routines.length > 0 && due.length === 0 && (
          <Text style={s.empty}>Nothing due today — rest well.</Text>
        )}
        {due.map((r) => {
          const on = done.has(r.id);
          return (
            <Pressable
              key={r.id}
              style={[s.item, on && s.itemDone]}
              onPress={() => onToggle(r.id, today)}
              onLongPress={() =>
                Alert.alert(r.name, 'Delete this routine?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => onRemove(r.id) },
                ])
              }
            >
              <Text style={s.itemEmoji}>{r.emoji}</Text>
              <Text style={[s.itemName, on && s.itemNameDone]}>{r.name}</Text>
              <View style={[s.check, on && s.checkOn]}>{on && <Text style={s.tick}>✓</Text>}</View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable style={s.fab} onPress={onAdd}><Text style={s.fabText}>+</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: 20, paddingTop: 56, paddingBottom: 120 },
  hero: { alignItems: 'center', marginBottom: 12 },
  label: { color: theme.text, fontSize: 26, fontWeight: '700', marginTop: 4 },
  sub: { color: theme.dim, marginTop: 4 },
  section: { color: theme.dim, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 10 },
  empty: { color: theme.dim, textAlign: 'center', marginTop: 12 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 14, padding: 16, marginBottom: 10, gap: 12 },
  itemDone: { opacity: 0.6 },
  itemEmoji: { fontSize: 22 },
  itemName: { flex: 1, color: theme.text, fontSize: 16 },
  itemNameDone: { textDecorationLine: 'line-through' },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: theme.dim, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  tick: { color: theme.bg, fontWeight: '800' },
  fab: { position: 'absolute', right: 24, bottom: 36, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: theme.bg, fontSize: 32, lineHeight: 34 },
});
