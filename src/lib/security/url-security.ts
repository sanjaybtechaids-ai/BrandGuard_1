import dns from 'dns';
import net from 'net';
import { SafeMetadata } from '@/types/verification';

export class SecurityUrlError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SecurityUrlError';
  }
}

/**
 * Checks if an IPv4 or IPv6 address is private, loopback, link-local, or cloud metadata.
 * Critical SSRF defense barrier.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;

  // Handle IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  const isV4 = net.isIPv4(ip);
  const isV6 = net.isIPv6(ip);

  if (!isV4 && !isV6) {
    return true; // Invalid format treated as unsafe
  }

  if (isV4) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const [a, b] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;

    // 10.0.0.0/8 (Private)
    if (a === 10) return true;

    // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;

    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata: 169.254.169.254)
    if (a === 169 && b === 254) return true;

    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;

    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET documentation)
    if (a === 192 && b === 0 && parts[2] === 2) return true;
    if (a === 198 && b === 51 && parts[2] === 100) return true;
    if (a === 203 && b === 0 && parts[2] === 113) return true;

    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (a >= 224) return true;

    return false;
  }

  if (isV6) {
    const lower = ip.toLowerCase();
    // Loopback
    if (lower === '::1' || lower === '0000:0000:0000:0000:0000:0000:0000:0001') return true;
    // Unspecified
    if (lower === '::') return true;
    // Unique local (fc00::/7)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    // Link-local (fe80::/10)
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;

    return false;
  }

  return true;
}

/**
 * Validates and normalizes an input URL. Enforces protocol, hostname, and basic sanity.
 */
export function sanitizeAndValidateUrl(rawInput: string): { parsed: URL; normalized: string } {
  let trimmed = rawInput.trim();
  if (!trimmed) {
    throw new SecurityUrlError('URL cannot be empty.', 'EMPTY_URL');
  }

  // Prepend protocol if omitted
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new SecurityUrlError('The provided string is not a valid RFC-compliant URL.', 'INVALID_FORMAT');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SecurityUrlError('Only HTTP and HTTPS protocols are permitted.', 'DISALLOWED_PROTOCOL');
  }

  if (parsed.username || parsed.password) {
    throw new SecurityUrlError('URLs containing embedded credentials are not permitted.', 'EMBEDDED_CREDENTIALS');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Reject local hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan')
  ) {
    throw new SecurityUrlError('Access to localhost or internal network names is blocked.', 'BLOCKED_HOSTNAME');
  }

  if (!hostname || hostname.length < 3 || !hostname.includes('.')) {
    throw new SecurityUrlError('Invalid hostname: Must contain a valid top-level domain.', 'INVALID_HOSTNAME');
  }

  return { parsed, normalized: parsed.toString() };
}

/**
 * Resolves the hostname via DNS and checks whether any resolved IP is private/SSRF-prone.
 */
export async function assertSafeDnsResolution(hostname: string): Promise<string> {
  // If the hostname is already an IP address
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new SecurityUrlError(`Target IP ${hostname} is in a private or restricted address space.`, 'SSRF_BLOCKED_IP');
    }
    return hostname;
  }

  try {
    const lookupResult = await dns.promises.lookup(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      throw new SecurityUrlError(`DNS resolution failed for hostname "${hostname}".`, 'DNS_NOT_FOUND');
    }

    for (const record of lookupResult) {
      if (isPrivateOrReservedIp(record.address)) {
        throw new SecurityUrlError(
          `SSRF Protection: Hostname "${hostname}" resolved to restricted IP address (${record.address}).`,
          'SSRF_BLOCKED_DNS'
        );
      }
    }

    return lookupResult[0].address;
  } catch (err: unknown) {
    if (err instanceof SecurityUrlError) throw err;
    throw new SecurityUrlError(`DNS lookup failed for hostname: ${hostname}`, 'DNS_RESOLUTION_FAILURE');
  }
}

/**
 * Safe, SSRF-protected metadata fetcher with strict timeouts and redirect validation.
 */
export async function fetchSafePublicMetadata(targetUrl: string): Promise<SafeMetadata> {
  const MAX_REDIRECTS = 3;
  const TIMEOUT_MS = 3500;
  const MAX_BYTES = 512 * 1024; // 512 KB max HTML buffer

  let currentUrl = targetUrl;
  let redirectsCount = 0;
  let finalResponseUrl = targetUrl;
  let httpStatus = 200;
  let sslValid = targetUrl.startsWith('https://');

  while (redirectsCount <= MAX_REDIRECTS) {
    const { parsed } = sanitizeAndValidateUrl(currentUrl);
    await assertSafeDnsResolution(parsed.hostname);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'BrandGuard-RiskScanner/1.0 (+https://brandguard.ai/bot; security-audit)',
          Accept: 'text/html,application/xhtml+xml;q=0.9',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'manual', // We inspect every redirect hop manually for SSRF
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timeoutId);
      throw new SecurityUrlError('The public website could not be reached safely.', 'PUBLIC_FETCH_FAILED');
    } finally {
      clearTimeout(timeoutId);
    }

    httpStatus = res.status;
    finalResponseUrl = currentUrl;
    sslValid = currentUrl.startsWith('https://');

    // Handle redirects manually to validate destination
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get('location');
      if (!location) break;

      const nextUrl = new URL(location, currentUrl).toString();
      currentUrl = nextUrl;
      redirectsCount++;
      continue;
    }

    // Process HTML body safely
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return {
        httpStatus,
        finalUrl: finalResponseUrl,
        sslValid,
        contentType,
      };
    }

    // Read limited bytes
    const reader = res.body?.getReader();
    let receivedBytes = 0;
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (receivedBytes < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          const remaining = MAX_BYTES - receivedBytes;
          if (remaining <= 0) break;
          const accepted = value.length > remaining ? value.slice(0, remaining) : value;
          chunks.push(accepted);
          receivedBytes += accepted.length;
        }
      }
      await reader.cancel();
    }

    const html = new TextDecoder('utf-8').decode(
      concatUint8Arrays(chunks, receivedBytes)
    );

    return extractHtmlMetadata(html, finalResponseUrl, httpStatus, sslValid);
  }

  return {
    httpStatus,
    finalUrl: finalResponseUrl,
    sslValid,
  };
}

function concatUint8Arrays(arrays: Uint8Array[], totalLength: number): Uint8Array {
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Regular-expression based metadata extraction without executing scripts.
 */
function extractHtmlMetadata(
  html: string,
  finalUrl: string,
  httpStatus: number,
  sslValid: boolean
): SafeMetadata {
  const getTagContent = (regex: RegExp): string | undefined => {
    const match = regex.exec(html);
    return match ? cleanText(match[1]) : undefined;
  };

  const title = getTagContent(/<title[^>]*>([^<]+)<\/title>/i);
  const description =
    getTagContent(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    getTagContent(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);

  const ogTitle =
    getTagContent(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    getTagContent(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

  const ogDescription =
    getTagContent(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
    getTagContent(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

  const ogImage =
    getTagContent(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    getTagContent(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

  const faviconMatch =
    getTagContent(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
    getTagContent(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

  const canonical =
    getTagContent(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
    getTagContent(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);

  return {
    title: title || ogTitle,
    description: description || ogDescription,
    ogTitle,
    ogDescription,
    ogImage,
    favicon: resolveRelativeUrl(faviconMatch, finalUrl),
    canonicalUrl: resolveRelativeUrl(canonical, finalUrl),
    finalUrl,
    httpStatus,
    sslValid,
  };
}

function cleanText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveRelativeUrl(path: string | undefined, baseUrl: string): string | undefined {
  if (!path) return undefined;
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}
