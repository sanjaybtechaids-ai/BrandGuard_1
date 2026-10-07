/**
 * Logo.dev Integration & Domain-First Brand Asset Service
 * 
 * Securely resolves, caches, and falls back brand logos based on official domains.
 * The publishable key is used exclusively for client-facing img.logo.dev CDN URLs.
 * The secret key is strictly server-side for REST API lookups (e.g. brandmarks).
 */

import { Brand, LogoProvider } from '@/types/brand';

export interface LogoDevOptions {
  size?: number;
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'webp';
  greyscale?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  fallback?: string;
  token?: string;
}

export interface ResolvedBrandLogo {
  url: string;
  domain?: string;
  provider: LogoProvider;
  initials: string;
  isFallback: boolean;
}

/**
 * Known single-word canonical enterprise initials mapping
 * ensuring clean, recognizable brand acronyms (Apple -> A, Google -> G, etc.)
 */
const CANONICAL_INITIALS: Record<string, string> = {
  apple: 'A',
  google: 'G',
  microsoft: 'MS',
  nike: 'NI',
  tata: 'TA',
  amazon: 'AM',
  samsung: 'SA',
  adidas: 'AD',
  infosys: 'IN',
  flipkart: 'FL',
};

/**
 * Local verified official SVG assets map for instant fallback
 */
const LOCAL_BRAND_SVGS: Record<string, string> = {
  'nike.com': '/brands/nike.svg',
  'apple.com': '/brands/apple.svg',
  'microsoft.com': '/brands/microsoft.svg',
  'samsung.com': '/brands/samsung.svg',
  'tata.com': '/brands/tata.svg',
  'tatadigital.com': '/brands/tata-neu.svg',
  'infosys.com': '/brands/infosys.svg',
  'amazon.com': '/brands/amazon.svg',
  'flipkart.com': '/brands/flipkart.svg',
  'google.com': '/brands/google.svg',
  'adidas.com': '/brands/adidas.svg',
};

export class LogoService {
  /**
   * In-memory resolution cache keyed strictly by brand.id or canonical_domain (never brand name alone)
   */
  private static logoCache = new Map<string, ResolvedBrandLogo>();

  /**
   * Retrieves cached logo by brand.id or canonical domain
   */
  static getCachedLogo(key: string): ResolvedBrandLogo | undefined {
    if (!key) return undefined;
    return this.logoCache.get(key) || this.logoCache.get(`id:${key}`) || this.logoCache.get(`domain:${key}`);
  }

  /**
   * Stores resolved logo in cache under brand.id and/or canonical domain
   */
  static setCachedLogo(key: string, logo: ResolvedBrandLogo): void {
    if (!key) return;
    this.logoCache.set(key, logo);
  }

  /**
   * Clears the logo resolution cache
   */
  static clearCache(): void {
    this.logoCache.clear();
  }

  /**
   * Normalizes raw domain, URL, or website string to a clean FQDN root domain.
   * Uses standard URL parser to cleanly strip protocol, www, paths, queries, fragments, and ports.
   * Example: "https://www.nike.com/products?query=1#frag" -> "nike.com"
   */
  static cleanDomain(input?: string | null): string {
    if (!input || typeof input !== 'string') return '';
    let trimmed = input.trim();
    if (!trimmed) return '';

    // If protocol missing, prepend https:// so standard URL parser parses hostname, path, query
    if (!trimmed.includes('://')) {
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);
      let hostname = parsed.hostname.toLowerCase();
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      hostname = hostname.split(':')[0];
      return hostname;
    } catch {
      return trimmed
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0]
        .split('?')[0]
        .split('#')[0]
        .split(':')[0]
        .toLowerCase();
    }
  }

  /**
   * Generates standard Logo.dev CDN URL for a given domain using publishable key.
   * Format: https://img.logo.dev/{domain}?token={publishableKey}&size={size}&format={format}
   */
  static getBrandLogoUrl(domain: string, options?: LogoDevOptions): string {
    const clean = this.cleanDomain(domain);
    if (!clean) return '';

    const publishableKey =
      options?.token ||
      process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY ||
      '';

    const params = new URLSearchParams();

    // Use publishable key if provided and not default placeholder
    if (publishableKey && !publishableKey.includes('YOUR_LOGO_DEV_PUBLISHABLE_KEY')) {
      params.set('token', publishableKey);
    } else if (publishableKey) {
      params.set('token', publishableKey);
    }

    if (options?.size) {
      params.set('size', options.size.toString());
    } else {
      params.set('size', '128');
    }

    if (options?.format) {
      params.set('format', options.format);
    } else {
      params.set('format', 'png');
    }

    if (options?.greyscale) {
      params.set('greyscale', 'true');
    }

    if (options?.theme) {
      params.set('theme', options.theme);
    }

    if (options?.fallback) {
      params.set('fallback', options.fallback);
    }

    const queryString = params.toString();
    return `https://img.logo.dev/${encodeURIComponent(clean)}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Retrieves brand logo object with metadata.
   */
  static async getBrandLogo(
    domain: string,
    options?: LogoDevOptions
  ): Promise<{ url: string; domain: string; provider: LogoProvider }> {
    const clean = this.cleanDomain(domain);
    const url = this.getBrandLogoUrl(clean, options);
    return {
      url,
      domain: clean,
      provider: 'LOGO_DEV',
    };
  }

  /**
   * Server-side retrieval of brandmark asset using LOGO_DEV_SECRET_KEY.
   * Never invoked client-side to prevent exposing secret keys.
   */
  static async getBrandBrandmark(
    domain: string,
    options?: LogoDevOptions
  ): Promise<{ url: string; domain: string } | null> {
    const clean = this.cleanDomain(domain);
    if (!clean) return null;

    // Only run on server where secret key is available
    const secretKey = typeof window === 'undefined' ? process.env.LOGO_DEV_SECRET_KEY : undefined;

    if (secretKey && !secretKey.includes('YOUR_NEW_ROTATED_SECRET_KEY')) {
      try {
        const response = await fetch(`https://api.logo.dev/v2/brands/brandmark?domain=${encodeURIComponent(clean)}`, {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            Accept: 'application/json',
          },
          cache: 'force-cache',
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.brandmark || data?.url) {
            return {
              url: data.brandmark || data.url,
              domain: clean,
            };
          }
        }
      } catch {
        // Safe silent server error handling without leaking tokens
      }
    }

    // Default to Logo.dev CDN brand logo
    return {
      url: this.getBrandLogoUrl(clean, options),
      domain: clean,
    };
  }

  /**
   * Generates clean enterprise SaaS initials from brand name.
   * Examples:
   * Microsoft -> MS
   * Apple -> A
   * Nike -> NI
   * Tata -> TA
   * Amazon -> AM
   * Google -> G
   * Samsung -> SA
   */
  static getBrandInitials(brandName: string): string {
    const clean = (brandName || '').trim();
    if (!clean) return 'BG';

    const lower = clean.toLowerCase();
    if (CANONICAL_INITIALS[lower]) {
      return CANONICAL_INITIALS[lower];
    }

    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    if (clean.length >= 2) {
      return clean.substring(0, 2).toUpperCase();
    }

    return clean.charAt(0).toUpperCase();
  }

  /**
   * Resolves brand logo adhering to Domain-First Logo Resolution Priority:
   * 1. Verified official domain
   * 2. Trusted domain
   * 3. Organization-provided logo
   * 4. Previously cached Logo.dev logo
   * 5. Logo.dev domain lookup
   * 6. Existing official logo
   * 7. Brand initials fallback
   */
  static resolveBrandLogo(
    brand: Partial<Brand> & {
      name: string;
      id?: string;
      website?: string;
      official_website?: string;
      canonical_domain?: string;
      canonicalDomain?: string;
      logo?: string;
      logo_url?: string;
      logo_provider?: LogoProvider;
      logoProvider?: LogoProvider;
      logo_domain?: string;
      logoDomain?: string;
      trustedDomains?: Array<{ domain: string }>;
    }
  ): ResolvedBrandLogo {
    const initials = this.getBrandInitials(brand.name);

    // Identify primary official or trusted domain
    const candidateDomain =
      this.cleanDomain(brand.canonical_domain) ||
      this.cleanDomain(brand.canonicalDomain) ||
      this.cleanDomain(brand.logo_domain) ||
      this.cleanDomain(brand.logoDomain) ||
      this.cleanDomain(brand.official_website) ||
      this.cleanDomain(brand.website) ||
      this.cleanDomain(brand.trustedDomains?.[0]?.domain);

    // 0. Cache check (strictly keyed by brand.id or canonical_domain, never brand name alone)
    if (brand.id && this.logoCache.has(`id:${brand.id}`)) {
      return this.logoCache.get(`id:${brand.id}`)!;
    }
    if (candidateDomain && this.logoCache.has(`domain:${candidateDomain}`)) {
      return this.logoCache.get(`domain:${candidateDomain}`)!;
    }

    const saveAndReturn = (resolved: ResolvedBrandLogo): ResolvedBrandLogo => {
      if (brand.id) {
        this.logoCache.set(`id:${brand.id}`, resolved);
      }
      if (candidateDomain) {
        this.logoCache.set(`domain:${candidateDomain}`, resolved);
      }
      return resolved;
    };

    // 1 & 2: Verified official domain or trusted domain -> Logo.dev domain URL
    if (candidateDomain && candidateDomain.includes('.')) {
      const logoDevUrl = this.getBrandLogoUrl(candidateDomain);

      // Check if user has explicitly uploaded an organization-provided logo
      const isOrgLogo =
        (brand.logo_provider === 'ORGANIZATION' || brand.logoProvider === 'ORGANIZATION') &&
        (brand.logo_url || brand.logo);

      if (isOrgLogo) {
        return saveAndReturn({
          url: (brand.logo_url || brand.logo)!,
          domain: candidateDomain,
          provider: 'ORGANIZATION',
          initials,
          isFallback: false,
        });
      }

      return saveAndReturn({
        url: logoDevUrl,
        domain: candidateDomain,
        provider: 'LOGO_DEV',
        initials,
        isFallback: false,
      });
    }

    // 3: Organization-provided logo
    const directLogo = brand.logo_url || brand.logo;
    if (directLogo && !directLogo.includes('unsplash.com')) {
      const isCachedLogoDev = directLogo.includes('img.logo.dev');
      return saveAndReturn({
        url: directLogo,
        domain: candidateDomain,
        provider: isCachedLogoDev ? 'LOGO_DEV' : (brand.logo_provider || brand.logoProvider || 'ORGANIZATION'),
        initials,
        isFallback: false,
      });
    }

    // 4: Previously cached Logo.dev logo
    if (brand.logo_url && brand.logo_url.includes('img.logo.dev')) {
      return saveAndReturn({
        url: brand.logo_url,
        domain: candidateDomain,
        provider: 'LOGO_DEV',
        initials,
        isFallback: false,
      });
    }

    // 5 & 6: Existing official local SVG backup if domain matches
    if (candidateDomain && LOCAL_BRAND_SVGS[candidateDomain]) {
      return saveAndReturn({
        url: LOCAL_BRAND_SVGS[candidateDomain],
        domain: candidateDomain,
        provider: 'OFFICIAL_WEBSITE',
        initials,
        isFallback: false,
      });
    }

    // Check name-based local SVG backup
    const nameClean = (brand.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameDomain = `${nameClean}.com`;
    if (LOCAL_BRAND_SVGS[nameDomain]) {
      return saveAndReturn({
        url: LOCAL_BRAND_SVGS[nameDomain],
        domain: nameDomain,
        provider: 'OFFICIAL_WEBSITE',
        initials,
        isFallback: false,
      });
    }

    // 7: Brand initials fallback
    return saveAndReturn({
      url: '',
      domain: candidateDomain,
      provider: 'FALLBACK',
      initials,
      isFallback: true,
    });
  }

  /**
   * Resolves fallback image URL (verified local SVG) if primary image fails.
   * If none exists, returns null to trigger clean initials fallback (Section 24).
   */
  static getFallbackImageUrl(domain?: string, brandName?: string): string | null {
    const clean = this.cleanDomain(domain);
    if (clean && LOCAL_BRAND_SVGS[clean]) {
      return LOCAL_BRAND_SVGS[clean];
    }
    if (brandName) {
      const nameClean = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameDomain = `${nameClean}.com`;
      if (LOCAL_BRAND_SVGS[nameDomain]) {
        return LOCAL_BRAND_SVGS[nameDomain];
      }
    }
    return null;
  }
}

export const logoService = LogoService;
