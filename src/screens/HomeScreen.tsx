import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lula Vault + Chat</Text>
      <Button title="Search Company Forms" onPress={() => navigation.navigate('Search')} />
      <Button title="Scan Company Link" onPress={() => navigation.navigate('ScanLink')} />
      <Button title="Open Chats" onPress={() => navigation.navigate('ChatList')} />
      <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  title: { fontSize: 22, fontWeight: '600' },
});
