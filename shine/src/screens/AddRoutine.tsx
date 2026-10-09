import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

const LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const EMOJIS = ['🏃', '🥗', '📚', '🧘', '🎸', '💧', '😴', '✍️'];

type Props = {
  onSave: (r: { name: string; emoji: string; days: number[] }) => void;
  onCancel: () => void;
};

export function AddRoutine({ onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const valid = name.trim().length > 0 && days.length > 0;

  return (
    <View style={s.wrap}>
      <Text style={s.title}>New routine</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Run 5 km, Read 20 pages…"
        placeholderTextColor={theme.dim}
        value={name}
        onChangeText={setName}
        autoFocus
        maxLength={40}
      />
      <View style={s.row}>
        {EMOJIS.map((e) => (
          <Pressable key={e} onPress={() => setEmoji(e)} style={[s.chip, emoji === e && s.chipOn]}>
            <Text style={s.emoji}>{e}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.label}>Repeat on</Text>
      <View style={s.row}>
        {LABELS.map((l, i) => {
          const on = days.includes(i);
          return (
            <Pressable
              key={i}
              onPress={() => setDays(on ? days.filter((d) => d !== i) : [...days, i])}
              style={[s.day, on && s.chipOn]}
            >
              <Text style={[s.dayText, on && { color: theme.bg }]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={s.actions}>
        <Pressable onPress={onCancel}><Text style={s.cancel}>Cancel</Text></Pressable>
        <Pressable
          disabled={!valid}
          onPress={() => onSave({ name: name.trim(), emoji, days: [...days].sort() })}
          style={[s.save, !valid && { opacity: 0.4 }]}
        >
          <Text style={s.saveText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 16 },
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
  input: { backgroundColor: theme.card, color: theme.text, borderRadius: 12, padding: 14, fontSize: 16 },
  label: { color: theme.dim, fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: theme.accent },
  emoji: { fontSize: 20 },
  day: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' },
  dayText: { color: theme.text, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cancel: { color: theme.dim, fontSize: 16, padding: 8 },
  save: { backgroundColor: theme.accent, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  saveText: { color: theme.bg, fontWeight: '700', fontSize: 16 },
});
