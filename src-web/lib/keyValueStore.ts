import { invoke } from '@tauri-apps/api';
import type { KeyValue } from './models';

const DEFAULT_NAMESPACE = 'app';

export async function setKeyValue<T>({
  namespace = DEFAULT_NAMESPACE,
  key,
  value,
}: {
  namespace?: string;
  key: string | string[];
  value: T;
}): Promise<void> {
  await invoke('set_key_value', {
    namespace,
    key: buildKeyValueKey(key),
    value: JSON.stringify(value),
  });
}

export async function getKeyValue<T>({
  namespace = DEFAULT_NAMESPACE,
  key,
  fallback,
}: {
  namespace?: string;
  key: string | string[];
  fallback: T;
}) {
  const kv = (await invoke('get_key_value', {
    namespace,
    key: buildKeyValueKey(key),
  })) as KeyValue | null;
  return extractKeyValueOrFallback(kv, fallback);
}

export function extractKeyValue<T>(kv: KeyValue | null): T | undefined {
  if (kv === null) return undefined;
  try {
    return JSON.parse(kv.value) as T;
  } catch (err) {
    return undefined;
  }
}

export function extractKeyValueOrFallback<T>(kv: KeyValue | null, fallback: T): T {
  const v = extractKeyValue<T>(kv);
  if (v === undefined) return fallback;
  return v;
}

export function buildKeyValueKey(key: string | string[]): string {
  if (typeof key === 'string') return key;
  return key.join('::');
}
