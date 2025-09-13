import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

import type { CompanySchema, Company } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { resolveToken, verifyLinkToken } from '../services/discoveryLink';

type Props = NativeStackScreenProps<RootStackParamList, 'Consent'>;

export default function ConsentScreen({ route, navigation }: Props) {
  const token = route.params?.token ?? '';
  const [company, setCompany] = useState<Company | null>(null);
  const [schema, setSchema] = useState<CompanySchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await verifyLinkToken(token);
        if (!ok) throw new Error('TOKEN_INVALID');
        const resolved = await resolveToken(token);
        if (!mounted) return;
        setCompany(resolved.company);
        setSchema(resolved.schema);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'resolve_failed');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consent</Text>
      {loading ? (
        <Text>Loading…</Text>
      ) : error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : (
        <>
          <Text>Company: {company?.name ?? '-'}</Text>
          <Text>Schema: {schema?.title ?? '-'}</Text>
        </>
      )}
      <Button
        title="Agree and Continue"
        onPress={() => navigation.navigate('DynamicForm', { token })}
      />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  error: { color: 'red' },
});
