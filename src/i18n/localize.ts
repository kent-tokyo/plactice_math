import type { LocalizedStrings } from '@/types';

/**
 * Resolve a localized string from labels map, falling back to default label.
 */
export function localize(
  locale: string,
  defaultValue: string,
  localized?: LocalizedStrings,
): string {
  if (!localized) return defaultValue;
  return (localized as Record<string, string>)[locale] ?? defaultValue;
}
