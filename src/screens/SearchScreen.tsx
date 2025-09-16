import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [companyId, setCompanyId] = useState('co_demo');
  const [schemaId, setSchemaId] = useState('schema_demo');
  const [error, setError] = useState<string | null>(null);

  const continueToConsent = () => {
    setError(null);
    if (!companyId || !schemaId) {
      setError('Please enter both companyId and schemaId');
      return;
    }
    navigation.navigate('Consent', { companyId, schemaId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Company Form</Text>
      <Text>Enter Company ID and Schema ID to proceed without a token</Text>
      <TextInput
        style={styles.input}
        placeholder="companyId"
        value={companyId}
        onChangeText={setCompanyId}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="schemaId"
        value={schemaId}
        onChangeText={setSchemaId}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Continue" onPress={continueToConsent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  error: { color: 'red' },
});
