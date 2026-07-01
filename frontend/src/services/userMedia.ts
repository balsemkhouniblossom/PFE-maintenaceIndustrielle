import { getApiBaseUrl } from '@/config/api-base-url';

export const API_BASE_URL = getApiBaseUrl();

export function resolveUserPhotoUrl(photoPath?: string | null): string {
  if (!photoPath) return '';

  const normalized = photoPath
    .trim()
    .replace(/^['\"]+|['\"]+$/g, '')
    .replace(/\\/g, '/');

  if (!normalized) return '';

  if (/^https?:\/\//i.test(normalized)) {
    return encodeURI(normalized);
  }

  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return encodeURI(`${API_BASE_URL}${path}`);
}

export function getAvatarInitial(name?: string | null): string | null {
  if (!name) return null;

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const first = parts[0]?.charAt(0)?.toUpperCase();
  if (first) {
    return first;
  }

  const last = parts[parts.length - 1]?.charAt(0)?.toUpperCase();
  return last || null;
}
