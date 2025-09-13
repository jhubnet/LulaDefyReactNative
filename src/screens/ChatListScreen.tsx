import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const DEMO = [
  { id: '254700000001', name: 'Alice' },
  { id: '254700000002', name: 'Bob' },
];

export default function ChatListScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={DEMO}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('ChatRoom', {
                peerId: item.id,
                displayName: item.name,
              })
            }
          >
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemSub}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<Text style={styles.title}>Chats</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  item: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
  itemText: { fontSize: 18 },
  itemSub: { color: '#666' },
});
