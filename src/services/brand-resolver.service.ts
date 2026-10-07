import { Brand } from '@/types/brand';
import { normalizeUrlToDomain, extractRootDomain } from '@/lib/risk/normalization';
import { calculateStringSimilarity } from '@/lib/risk/similarity';
import { getBrands } from '@/services/brands.service';

export interface ResolvedBrand {
  brandId?: string;
  brandName: string;
  domain: string;
  matchType: 'EXACT_MATCH' | 'TRUSTED_DOMAIN_MATCH' | 'LOOKALIKE' | 'CONTENT_SIMILARITY' | 'UNRESOLVED';
  confidence: number;
  officialDomain: string;
  trustedDomains: string[];
}

export class BrandResolverService {
  /**
   * Resolves a URL or hostname against known trusted brands in the organization.
   */
  async resolveBrandFromUrl(
    rawUrl: string,
    explicitBrandId?: string,
    organizationId?: string
  ): Promise<ResolvedBrand> {
    const { hostname, rootDomain } = normalizeUrlToDomain(rawUrl);
    const availableBrands = await getBrands(organizationId);

    // 1. If explicit brandId is provided, resolve directly against it
    if (explicitBrandId) {
      const brand = availableBrands.find((b) => b.id.toLowerCase() === explicitBrandId.toLowerCase());
      if (brand) {
        return this.compareUrlAgainstBrand(hostname, rootDomain, brand);
      }
    }

    // 2. Check for exact or trusted domain match across all brands
    for (const brand of availableBrands) {
      const officialRoot = extractRootDomain(brand.website);
      if (rootDomain === officialRoot) {
        return {
          brandId: brand.id,
          brandName: brand.name,
          domain: rootDomain,
          matchType: 'EXACT_MATCH',
          confidence: 99,
          officialDomain: brand.website,
          trustedDomains: [officialRoot, brand.website],
        };
      }
    }

    // 3. Check for brand name substring in hostname (e.g. nike-support-example.com, nikeofficial.com)
    for (const brand of availableBrands) {
      const bName = brand.name.toLowerCase();
      if (hostname.includes(bName) || rootDomain.includes(bName)) {
        return {
          brandId: brand.id,
          brandName: brand.name,
          domain: rootDomain,
          matchType: 'LOOKALIKE',
          confidence: 88,
          officialDomain: brand.website,
          trustedDomains: [extractRootDomain(brand.website), brand.website],
        };
      }
    }

    // 4. Lexical similarity comparison
    let highestSim = 0;
    let closestBrand: Brand | null = null;
    const domainLabel = rootDomain.split('.')[0];

    for (const brand of availableBrands) {
      const sim = calculateStringSimilarity(domainLabel, brand.name);
      if (sim > highestSim) {
        highestSim = sim;
        closestBrand = brand;
      }
    }

    if (closestBrand && highestSim >= 0.7) {
      return {
        brandId: closestBrand.id,
        brandName: closestBrand.name,
        domain: rootDomain,
        matchType: 'LOOKALIKE',
        confidence: Math.round(highestSim * 100),
        officialDomain: closestBrand.website,
        trustedDomains: [extractRootDomain(closestBrand.website), closestBrand.website],
      };
    }

    // 5. Default/Generic unresolved (Unknown external domain)
    return {
      brandName: domainLabel.charAt(0).toUpperCase() + domainLabel.slice(1),
      domain: rootDomain,
      matchType: 'UNRESOLVED',
      confidence: 40,
      officialDomain: '',
      trustedDomains: [],
    };
  }

  private compareUrlAgainstBrand(hostname: string, rootDomain: string, brand: Brand): ResolvedBrand {
    const officialRoot = extractRootDomain(brand.website);
    const trustedDomains = [officialRoot, brand.website];

    if (rootDomain === officialRoot || hostname === brand.website) {
      return {
        brandId: brand.id,
        brandName: brand.name,
        domain: rootDomain,
        matchType: 'EXACT_MATCH',
        confidence: 99,
        officialDomain: brand.website,
        trustedDomains,
      };
    }

    const bName = brand.name.toLowerCase();
    const isSubstring = hostname.includes(bName) || rootDomain.includes(bName);
    const sim = calculateStringSimilarity(rootDomain.split('.')[0], bName);

    return {
      brandId: brand.id,
      brandName: brand.name,
      domain: rootDomain,
      matchType: isSubstring || sim > 0.65 ? 'LOOKALIKE' : 'UNRESOLVED',
      confidence: isSubstring ? 88 : Math.round(sim * 100),
      officialDomain: brand.website,
      trustedDomains,
    };
  }
}

export const brandResolverService = new BrandResolverService();
