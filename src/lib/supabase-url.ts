export function normalizeSupabaseUrl(url?: string) {
  if (!url) return undefined;

  const trimmedUrl = url.trim().replace(/\/+$/, "");
  return trimmedUrl.replace(/\/rest\/v1$/, "");
}
