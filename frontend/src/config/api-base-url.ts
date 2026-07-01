export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://pfe-maintenaceindustrielle.onrender.com'
    : 'http://localhost:3001';
}
