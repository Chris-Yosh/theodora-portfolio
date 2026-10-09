import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { AddRoutine } from './src/screens/AddRoutine';
import { Today } from './src/screens/Today';
import { theme } from './src/theme';
import { useStore } from './src/useStore';

export default function App() {
  const { state, ready, addRoutine, removeRoutine, toggle } = useStore();
  const [adding, setAdding] = useState(false);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <Today state={state} onToggle={toggle} onRemove={removeRoutine} onAdd={() => setAdding(true)} />
      <Modal visible={adding} animationType="slide" transparent onRequestClose={() => setAdding(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#000a' }}>
          <View style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 }}>
            <AddRoutine
              onCancel={() => setAdding(false)}
              onSave={(r) => {
                addRoutine(r);
                setAdding(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
