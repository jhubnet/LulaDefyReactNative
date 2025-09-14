import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { parseLulaLink, verifyLinkToken } from '../services/discoveryLink';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanLink'>;

export default function ScanLinkScreen({ navigation }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [Scanner, setScanner] = useState<any>(null);
  const [scanned, setScanned] = useState(false);

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

  const openScanner = useCallback(async () => {
    setError(null);
    try {
      const mod = await import('expo-barcode-scanner');
      const { status } = await mod.BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      setScanner(() => mod.BarCodeScanner);
      setScanned(false);
      setScannerVisible(true);
    } catch {
      setError('SCANNER_UNAVAILABLE');
    }
  }, []);

  const closeScanner = () => {
    setScannerVisible(false);
    setScanned(false);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const res = parseLulaLink(data);
    if (res.errors || !res.token) {
      setError(res.errors?.join(',') ?? 'PARSE_FAILED');
      setScanned(false);
      return;
    }
    const ok = await verifyLinkToken(res.token);
    if (!ok) {
      setError('TOKEN_INVALID');
      setScanned(false);
      return;
    }
    setScannerVisible(false);
    navigation.navigate('Consent', { token: res.token });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR / Tap Link</Text>
      <Text>Use camera to scan a Lula QR token, or paste a token/URL below</Text>
      {scannerVisible ? (
        <View style={styles.scannerBox}>
          {Scanner && hasPermission ? (
            <Scanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          ) : hasPermission === false ? (
            <Text style={styles.error}>Camera permission denied</Text>
          ) : (
            <Text>Preparing camera…</Text>
          )}
          <View style={styles.scannerActions}>
            <Button title="Close" onPress={closeScanner} />
          </View>
        </View>
      ) : (
        <Button title="Open Scanner" onPress={openScanner} />
      )}
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
  scannerBox: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    position: 'relative',
  },
  scannerActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  error: { color: 'red' },
});
