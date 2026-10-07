import { Brand } from '@/types/brand';
import { KNOWN_BRAND_REGISTRY } from '@/providers/brand.provider';
import { normalizeBrandName } from '@/lib/risk/normalization';

import { LogoService } from '@/services/logo.service';

export class BrandAssetService {
  /**
   * Returns the canonical official logo for a brand using domain-first Logo.dev resolution.
   * Priority:
   * 1. Verified official domain (Logo.dev)
   * 2. Trusted domain
   * 3. Organization-provided logo
   * 4. Previously cached Logo.dev logo
   * 5. Logo.dev domain lookup
   * 6. Existing official logo
   * 7. Brand initials fallback
   */
  static getOfficialLogo(brand: Partial<Brand> & { name: string; logo?: string; website?: string; official_website?: string }): {
    url?: string;
    initials: string;
    isFallback: boolean;
  } {
    const resolved = LogoService.resolveBrandLogo(brand);
    return {
      url: resolved.url || undefined,
      initials: resolved.initials,
      isFallback: resolved.isFallback,
    };
  }

  /**
   * Returns a brand-relevant hero image.
   * Never returns random stock visuals. Uses brand hero image, registry hero, or deterministic branded visual.
   */
  static getBrandHeroImage(brand: Partial<Brand> & { name: string; heroImage?: string; brandVisual?: string }): string | undefined {
    if (brand.heroImage && this.validateImageSource(brand.heroImage)) {
      return brand.heroImage;
    }
    if (brand.brandVisual && this.validateImageSource(brand.brandVisual)) {
      return brand.brandVisual;
    }

    const brandKey = normalizeBrandName(brand.name);
    const registryEntry = KNOWN_BRAND_REGISTRY[brandKey];
    if (registryEntry?.heroImage && this.validateImageSource(registryEntry.heroImage)) {
      return registryEntry.heroImage;
    }

    return undefined;
  }

  /**
   * Generates clean 1-2 character initials for the fallback avatar.
   * Example:
   * "Microsoft" -> "MS"
   * "Apple" -> "AP"
   * "Nike" -> "NI"
   * "Tata" -> "TA"
   * "Tata Neu" -> "TN"
   */
  static getFallbackLogo(brandName: string): string {
    return LogoService.getBrandInitials(brandName);
  }

  /**
   * Validates if the image source URL is syntactically safe and stable.
   */
  static validateImageSource(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.length < 3) return false;
    if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return true;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Reject broken or suspicious localhost hotlinks
      return !trimmed.includes('localhost:9999');
    }
    return false;
  }
}
