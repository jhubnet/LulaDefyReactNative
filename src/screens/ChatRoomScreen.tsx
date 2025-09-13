import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button } from 'react-native';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

type Message = { id: string; text: string; fromSelf: boolean };

export default function ChatRoomScreen({ route }: Props) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! This will be E2E encrypted later.', fromSelf: false },
  ]);

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), text, fromSelf: true }]);
    setText('');
  };

  const title = route.params?.displayName ?? route.params?.peerId ?? 'Chat';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.fromSelf ? styles.self : styles.peer]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type message"
          value={text}
          onChangeText={setText}
        />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  bubble: { padding: 10, borderRadius: 8, maxWidth: '80%' },
  self: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  peer: { alignSelf: 'flex-start', backgroundColor: '#eee' },
  bubbleText: { fontSize: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8 },
});
