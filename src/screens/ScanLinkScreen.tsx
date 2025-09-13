import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { parseLulaLink, verifyLinkToken } from '../services/discoveryLink';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanLink'>;

export default function ScanLinkScreen({ navigation }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseAndContinue = async () => {
    setError(null);
    const res = parseLulaLink(url.trim());
    if (res.errors) {
      setError(res.errors.join(','));
      return;
    }
    const ok = await verifyLinkToken(res.token!);
    if (!ok) {
      setError('TOKEN_INVALID');
      return;
    }
    navigation.navigate('Consent', { token: res.token! });
  };

  const simulateScan = async () => {
    const input = url.trim();
    if (!input) {
      setError('Provide a token or URL to simulate');
      return;
    }
    const res = parseLulaLink(input);
    if (res.errors || !res.token) {
      setError(res.errors?.join(',') ?? 'PARSE_FAILED');
      return;
    }
    const ok = await verifyLinkToken(res.token);
    if (!ok) {
      setError('TOKEN_INVALID');
      return;
    }
    navigation.navigate('Consent', { token: res.token });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR / Tap Link</Text>
      <Text>TODO: Integrate expo-barcode-scanner and deep linking</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste lula:// link or https://... with token param"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Parse & Continue" onPress={parseAndContinue} />
      <Button title="Simulate Scan" onPress={simulateScan} />
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
