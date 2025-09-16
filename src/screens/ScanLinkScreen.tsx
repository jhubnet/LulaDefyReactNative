import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, Camera, type BarcodeScanningResult } from 'expo-camera';
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
  const [scanned, setScanned] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const zoom = 0.02;
  const [scannerAvailable, setScannerAvailable] = useState<boolean | null>(null);

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
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setScanned(false);
      // Prefer the modern/native scanner if available (Google Code Scanner / iOS DataScanner)
      let useNative = false;
      try {
        const available = await (Camera as any).isModernBarcodeScannerAvailable?.();
        if (typeof available === 'boolean') {
          setScannerAvailable(available);
          useNative = available;
        }
      } catch {}

      if (useNative) {
        // Subscribe to the modern scanner event, then launch the scanner UI
        const sub = (Camera as any).onModernBarcodeScanned?.(async (evt: any) => {
          try {
            const payload = String(evt?.data ?? '');
            // eslint-disable-next-line no-console
            console.log('Modern scanner scanned', payload);
            setLastScan(payload);
            await (Camera as any).dismissScanner?.();
            if (!payload) return;
            const res = parseLulaLink(payload);
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
          } finally {
            // Remove the subscription after first scan
            try { sub?.remove?.(); } catch {}
          }
        });

        try {
          await (Camera as any).launchScanner?.({ barcodeTypes: ['qr'] });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Launch scanner failed, falling back to inline camera', e);
          setScannerVisible(true);
        }
        return;
      }

      // Fallback: show inline camera view
      setScannerVisible(true);
    } catch {
      setError('SCANNER_UNAVAILABLE');
    }
  }, []);

  const closeScanner = () => {
    setScannerVisible(false);
    setScanned(false);
  };

  const openNativeScanner = useCallback(async () => {
    try {
      const available = await (Camera as any).isModernBarcodeScannerAvailable?.();
      if (!available) {
        setScannerAvailable(false);
        setScannerVisible(true);
        return;
      }
      const sub = (Camera as any).onModernBarcodeScanned?.(async (evt: any) => {
        try {
          const payload = String(evt?.data ?? '');
          // eslint-disable-next-line no-console
          console.log('Modern scanner scanned', payload);
          setLastScan(payload);
          await (Camera as any).dismissScanner?.();
          if (!payload) return;
          const res = parseLulaLink(payload);
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
        } finally {
          try { sub?.remove?.(); } catch {}
        }
      });
      await (Camera as any).launchScanner?.({ barcodeTypes: ['qr'] });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Native scanner error', e);
      setError('SCANNER_UNAVAILABLE');
    }
  }, [navigation]);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    // Immediately stop scanning UI for a seamless experience
    setScannerVisible(false);
    // Debug: verify the scanner callback is firing
    try {
      // eslint-disable-next-line no-console
      console.log('Barcode scanned', data);
    } catch {}
    setLastScan(data ?? null);
    const res = parseLulaLink(data);
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
      <Text>Use camera to scan a Lula QR token, or paste a token/URL below</Text>
      {scannerVisible ? (
        <View style={styles.scannerBox}>
          {hasPermission ? (
            // Using expo-camera's CameraView for barcode scanning
            // See: https://docs.expo.dev/versions/latest/sdk/camera/
            <CameraView
              active
              facing="back"
              autofocus="on"
              zoom={zoom}
              onCameraReady={() => {
                try {
                  // eslint-disable-next-line no-console
                  console.log('Camera ready');
                } catch {}
              }}
              // Limit to QR for reliability; we can broaden later
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          ) : hasPermission === false ? (
            <Text style={styles.error}>Camera permission denied</Text>
          ) : (
            <Text>Preparing camera…</Text>
          )}
          <View style={styles.scannerActions}>
            <Button title="Close" onPress={closeScanner} />
            <Button title="Use System Scanner" onPress={openNativeScanner} />
          </View>
          {scannerAvailable === false ? (
            <View style={styles.scanInfo}>
              <Text style={{ color: '#fff' }}>Scanner engine not available on this device. Try "Use System Scanner" or a physical device.</Text>
            </View>
          ) : null}
          {lastScan ? (
            <View style={styles.scanInfo}>
              <Text numberOfLines={2}>Last scanned: {lastScan}</Text>
            </View>
          ) : null}
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
  scanInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 100,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
