import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Platform } from 'react-native';

import type { CompanySchema, Envelope } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { fetchSchema } from '../services/companyDirectory';
import { mapVaultToEnvelope } from '../services/mappingEngine';
import { queueAndRetry, sendEnvelope } from '../services/transport/orchestrator';
import { getIdentitySnapshot } from '../services/vault';

type Props = NativeStackScreenProps<RootStackParamList, 'DynamicForm'>;

export default function DynamicFormScreen({ route, navigation }: Props) {
  const schemaId = route.params?.schemaId ?? 'schema_v1';
  const [schema, setSchema] = useState<CompanySchema | null>(null);
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const sch = await fetchSchema(schemaId);
      if (!mounted) return;
      setSchema(sch);
      const vault = getIdentitySnapshot();
      const env = mapVaultToEnvelope(sch, { vault });
      setEnvelope(env);
    })();
    return () => {
      mounted = false;
    };
  }, [schemaId]);

  const preview = useMemo(() => JSON.stringify(envelope, null, 2), [envelope]);

  const submit = async () => {
    if (!envelope) return;
    setSubmitting(true);
    try {
      const result = await queueAndRetry(() =>
        sendEnvelope(envelope, 'REST_JSON', 'https://example.com/ingest'),
      );
      if (result.ok) {
        navigation.navigate('Home');
      } else {
        // TODO: better error UI
        console.warn('Submit failed', result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dynamic Form</Text>
      <Text>Schema: {schemaId}</Text>
      <Text>Fields: {schema?.fields.length ?? 0}</Text>
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
});
