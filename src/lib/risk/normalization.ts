/**
 * Domain and Brand Normalization
 * Robust handling of URLs, hostnames, TLDs, and legal brand names.
 */

// Common two-level TLD suffixes for accurate root domain parsing without heavy external deps
const SECOND_LEVEL_TLDS = new Set([
  'co.uk',
  'org.uk',
  'me.uk',
  'com.au',
  'net.au',
  'org.au',
  'co.in',
  'net.in',
  'org.in',
  'gen.in',
  'co.nz',
  'net.nz',
  'co.za',
  'com.br',
  'com.sg',
  'com.mx',
  'co.jp',
  'ne.jp',
]);

/**
 * Normalizes a URL and extracts the canonical hostname and clean domain.
 */
export function normalizeUrlToDomain(rawUrl: string): {
  normalizedUrl: string;
  hostname: string;
  rootDomain: string;
} {
  let cleaned = rawUrl.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    // Basic fallback for malformed input
    cleaned = cleaned.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
    return {
      normalizedUrl: `https://${cleaned}`,
      hostname: cleaned.toLowerCase(),
      rootDomain: extractRootDomain(cleaned.toLowerCase()),
    };
  }

  // Remove standard default ports
  let hostname = parsed.hostname.toLowerCase();

  // Strip trailing dot if present in FQDN
  if (hostname.endsWith('.')) {
    hostname = hostname.slice(0, -1);
  }

  const rootDomain = extractRootDomain(hostname);

  // Canonical normalized URL (https, stripped www, stripped trailing slash if root)
  const displayHost = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  const path = parsed.pathname === '/' ? '' : parsed.pathname;
  const normalizedUrl = `https://${displayHost}${path}${parsed.search}`;

  return {
    normalizedUrl,
    hostname,
    rootDomain,
  };
}

/**
 * Extracts root domain (e.g. nike.com from shop.sub.nike.com or nike.co.uk from login.nike.co.uk)
 */
export function extractRootDomain(hostname: string): string {
  let host = hostname.toLowerCase().trim();
  if (host.startsWith('www.')) {
    host = host.slice(4);
  }

  const parts = host.split('.');
  if (parts.length <= 2) {
    return host;
  }

  // Check if the last two parts match a known two-level TLD (e.g., co.uk, com.au)
  const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  if (SECOND_LEVEL_TLDS.has(lastTwo)) {
    if (parts.length >= 3) {
      return `${parts[parts.length - 3]}.${lastTwo}`;
    }
    return host;
  }

  // Otherwise, take the last two parts
  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
}

/**
 * Normalizes a brand name for similarity comparison.
 * Strips legal suffixes (Inc., LLC, Ltd., Corp.) and punctuation.
 */
export function normalizeBrandName(name: string): string {
  if (!name) return '';

  let normalized = name
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // remove punctuation
    .trim();

  // Strip common corporate legal entity suffixes
  const legalSuffixes = [
    /\b(incorporated|inc)\b/g,
    /\b(corporation|corp)\b/g,
    /\b(limited|ltd)\b/g,
    /\b(llc|llp|gmbh|ag|sa|plc|pvt|private)\b/g,
    /\b(co|company)\b/g,
    /\b(technologies|tech|solutions|group)\b/g,
  ];

  for (const suffix of legalSuffixes) {
    normalized = normalized.replace(suffix, '');
  }

  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Replaces common leetspeak character substitutions for homoglyph / lookalike detection.
 * (e.g. 'n1ke' -> 'nike', 'nik3' -> 'nike', 'n!ke' -> 'nike')
 */
export function canonicalizeLookalikeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0oóòöô]/g, 'o')
    .replace(/[1l!|íìïî]/g, 'i')
    .replace(/[3eéèëê]/g, 'e')
    .replace(/[4aàáâä@]/g, 'a')
    .replace(/[5s$]/g, 's')
    .replace(/[7t+]/g, 't')
    .replace(/[-_.]/g, '');
}

/**
 * Normalizes a brand lookup key (ID, slug, or name) for resilient matching across services.
 * Handles identifiers like 'br-nike-001' -> 'nike', 'nike-01' -> 'nike', or raw strings.
 */
export function normalizeBrandLookupKey(key: string): string {
  if (!key) return '';
  return key
    .toLowerCase()
    .trim()
    .replace(/^br-/, '')
    .replace(/-\d+$/, '')
    .replace(/[^a-z0-9]/g, '');
}

