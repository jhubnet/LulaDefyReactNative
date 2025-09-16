import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Platform } from 'react-native';

import type { CompanySchema, Envelope, IngestDescriptor } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { fetchSchema } from '../services/companyDirectory';
import { Config } from '../services/config';
import { resolveToken } from '../services/discoveryLink';
import { mapVaultToEnvelope } from '../services/mappingEngine';
import { sendViaIngest } from '../services/transport/orchestrator';
import { getIdentitySnapshot } from '../services/vault';

type Props = NativeStackScreenProps<RootStackParamList, 'DynamicForm'>;

export default function DynamicFormScreen({ route, navigation }: Props) {
  const token = route.params?.token;
  const schemaIdParam = route.params?.schemaId;
  const [schema, setSchema] = useState<CompanySchema | null>(null);
  const [ingest, setIngest] = useState<IngestDescriptor | null>(null);
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (token) {
          const resolved = await resolveToken(token);
          if (!mounted) return;
          setSchema(resolved.schema);
          setIngest(resolved.ingest);
          const vault = getIdentitySnapshot();
          const env = mapVaultToEnvelope(resolved.schema, { vault });
          setEnvelope(env);
        } else if (schemaIdParam) {
          const s = await fetchSchema(schemaIdParam);
          if (!mounted) return;
          setSchema(s);
          // Synthesize a basic ingest descriptor for now
          const ing: IngestDescriptor = {
            transport: 'REST_JSON',
            endpoint: `${Config.vendorBaseUrl}/ingest`,
            headers: {},
            auth: { type: 'Bearer', token: 'stub_token' },
            encryption: { type: 'NONE' },
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          };
          setIngest(ing);
          const vault = getIdentitySnapshot();
          const env = mapVaultToEnvelope(s, { vault });
          setEnvelope(env);
        } else {
          throw new Error('missing_params');
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'resolve_failed');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token, schemaIdParam]);

  const preview = useMemo(() => JSON.stringify(envelope, null, 2), [envelope]);

  const submit = async () => {
    if (!envelope || !ingest) return;
    setSubmitting(true);
    try {
      const receipt = await sendViaIngest(envelope, ingest);
      console.log('Receipt', receipt);
      navigation.navigate('Home');
    } catch (e) {
      console.warn('Submit failed', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dynamic Form</Text>
      {loading ? (
        <Text>Loading…</Text>
      ) : error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : (
        <>
          <Text>Schema: {schema?.title}</Text>
          <Text>Fields: {schema?.fields.length ?? 0}</Text>
        </>
      )}
      <Text style={styles.subtitle}>Envelope Preview</Text>
      <View style={styles.previewBox}>
        <Text style={styles.code}>{preview}</Text>
      </View>
      <Button
        title={submitting ? 'Submitting…' : 'Submit to Company (simulate)'}
        onPress={submit}
        disabled={submitting}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: 12,
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: '600' },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  previewBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
  },
  error: { color: 'red' },
});
