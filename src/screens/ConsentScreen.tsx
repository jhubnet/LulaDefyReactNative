import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Consent'>;

export default function ConsentScreen({ route, navigation }: Props) {
  const { companyId, schemaId } = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consent</Text>
      <Text>Company: {companyId ?? '-'}</Text>
      <Text>Schema: {schemaId ?? '-'}</Text>
      <Button
        title="Agree and Continue"
        onPress={() => navigation.navigate('DynamicForm', { schemaId: schemaId ?? 'schema_v1' })}
      />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  title: { fontSize: 20, fontWeight: '600' },
});
