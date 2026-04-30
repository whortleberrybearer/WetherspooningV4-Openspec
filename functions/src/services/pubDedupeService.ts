export interface SitemapPubEntry {
  url: string;
  imageUrl: string;
}

function getLastPathSegment(url: string): { segment: string; hasTrailingSlash: boolean; originAndPrefix: string } {
  try {
    const parsed = new URL(url);
    const hasTrailingSlash = parsed.pathname.endsWith('/');
    const path = parsed.pathname.replace(/\/+$/, '');
    const parts = path.split('/').filter(Boolean);
    const segment = parts.length > 0 ? parts[parts.length - 1] : '';
    const prefixPath = parts.length > 0 ? '/' + parts.slice(0, -1).join('/') : '';
    const originAndPrefix = `${parsed.origin}${prefixPath}`;
    return { segment, hasTrailingSlash, originAndPrefix };
  } catch {
    const trimmed = url.trim();
    const hasTrailingSlash = trimmed.endsWith('/');
    const noTrail = trimmed.replace(/\/+$/, '');
    const segment = noTrail.split('/').pop() ?? '';
    const originAndPrefix = noTrail.slice(0, Math.max(0, noTrail.length - segment.length - 1));
    return { segment, hasTrailingSlash, originAndPrefix };
  }
}

export function getBaseSlug(url: string): string {
  const { segment } = getLastPathSegment(url);
  return segment.replace(/-\d+$/, '');
}

export function isNumericSuffixVariant(url: string): boolean {
  const { segment } = getLastPathSegment(url);
  return /-\d+$/.test(segment);
}

export function toBaseUrl(url: string): string {
  const { segment, hasTrailingSlash, originAndPrefix } = getLastPathSegment(url);
  const baseSlug = segment.replace(/-\d+$/, '');

  if (!baseSlug) return url;

  const path = `${originAndPrefix}/${baseSlug}${hasTrailingSlash ? '/' : ''}`;

  // originAndPrefix may already include trailing slash; normalize
  return path.replace(/([^:]\/)(\/)+/g, '$1/');
}

export function pickCanonicalSitemapEntry(
  current: SitemapPubEntry,
  candidate: SitemapPubEntry
): SitemapPubEntry {
  const currentHasImage = Boolean(current.imageUrl && current.imageUrl.trim().length > 0);
  const candidateHasImage = Boolean(candidate.imageUrl && candidate.imageUrl.trim().length > 0);

  if (candidateHasImage && !currentHasImage) return candidate;
  if (currentHasImage && !candidateHasImage) return current;

  const currentIsSuffixed = isNumericSuffixVariant(current.url);
  const candidateIsSuffixed = isNumericSuffixVariant(candidate.url);

  if (candidateIsSuffixed !== currentIsSuffixed) {
    // Prefer non-suffixed
    return candidateIsSuffixed ? current : candidate;
  }

  // Tie-breaker: keep first processed (current)
  return current;
}
