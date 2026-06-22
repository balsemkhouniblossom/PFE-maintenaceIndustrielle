export const ALL_FIELDS_TOKEN = '__all_fields__';

const DEFAULT_MAX_DEPTH = 3;
const DEFAULT_SAMPLE_SIZE = 50;

function isPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function getByPath(value: unknown, path: string): unknown {
  if (!path) return value;

  return path.split('.').reduce<unknown>((current, key) => {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, value);
}

function stringifyValue(value: unknown, depth = 0, maxDepth = DEFAULT_MAX_DEPTH): string {
  if (value == null) return '';
  if (isPrimitive(value)) return String(value).toLowerCase();

  if (Array.isArray(value)) {
    return value
      .map((entry) => stringifyValue(entry, depth + 1, maxDepth))
      .filter(Boolean)
      .join(' ');
  }

  if (value instanceof Date) {
    return value.toISOString().toLowerCase();
  }

  if (typeof value === 'object') {
    if (depth >= maxDepth) return '';

    return Object.values(value as Record<string, unknown>)
      .map((entry) => stringifyValue(entry, depth + 1, maxDepth))
      .filter(Boolean)
      .join(' ');
  }

  return String(value).toLowerCase();
}

function collectFieldPaths(
  value: unknown,
  prefix = '',
  depth = 0,
  maxDepth = DEFAULT_MAX_DEPTH,
  collector: Set<string>,
): void {
  if (value == null) return;

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (isPrimitive(entry)) {
        if (prefix) collector.add(prefix);
      } else if (depth < maxDepth) {
        collectFieldPaths(entry, prefix, depth + 1, maxDepth, collector);
      }
    });
    return;
  }

  if (typeof value !== 'object') {
    if (prefix) collector.add(prefix);
    return;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (entry == null) return;

    if (isPrimitive(entry) || entry instanceof Date) {
      collector.add(path);
      return;
    }

    if (Array.isArray(entry)) {
      if (entry.some((item) => isPrimitive(item))) {
        collector.add(path);
      }
      if (depth < maxDepth) {
        entry.forEach((item) => collectFieldPaths(item, path, depth + 1, maxDepth, collector));
      }
      return;
    }

    if (depth < maxDepth) {
      collectFieldPaths(entry, path, depth + 1, maxDepth, collector);
    }
  });
}

export function getSearchableFields<T>(
  items: T[],
  options?: { maxDepth?: number; sampleSize?: number; exclude?: string[] },
): string[] {
  const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
  const sampleSize = options?.sampleSize ?? DEFAULT_SAMPLE_SIZE;
  const exclude = new Set(options?.exclude ?? []);

  const collector = new Set<string>();
  items.slice(0, sampleSize).forEach((item) => {
    collectFieldPaths(item, '', 0, maxDepth, collector);
  });

  return Array.from(collector)
    .filter((field) => !exclude.has(field))
    .sort((a, b) => a.localeCompare(b));
}

export function matchesDynamicSearch<T>(
  item: T,
  searchTerm: string,
  selectedField = ALL_FIELDS_TOKEN,
  maxDepth = DEFAULT_MAX_DEPTH,
): boolean {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (!normalizedTerm) return true;

  if (selectedField === ALL_FIELDS_TOKEN) {
    return stringifyValue(item, 0, maxDepth).includes(normalizedTerm);
  }

  const value = getByPath(item, selectedField);
  return stringifyValue(value, 0, maxDepth).includes(normalizedTerm);
}
