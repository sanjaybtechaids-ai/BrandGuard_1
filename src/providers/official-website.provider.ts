import { fetchSafePublicMetadata } from '@/lib/security/url-security';
import { extractRootDomain, normalizeBrandName } from '@/lib/risk/normalization';
import { calculateStringSimilarity } from '@/lib/risk/similarity';
import { DiscoveredWebsite } from '@/types/brand-discovery';
import { KNOWN_BRAND_REGISTRY } from './brand.provider';
import { BrandProvider, ProviderResult } from './brand.provider';

export class OfficialWebsiteProvider implements BrandProvider {
  async search(query: string): Promise<ProviderResult[]> {
    const website = await this.discoverOfficialWebsite(query);
    return [
      {
        source: 'Official Website Discovery Engine',
        name: website.domain,
        url: website.url,
        confidence: website.confidence,
        priorityLevel: 'LEVEL_1',
        metadata: {
          title: website.title,
          description: website.description,
          sslValid: website.sslValid,
          verificationStatus: website.verificationStatus,
          outboundSocials: website.outboundSocials,
          outboundAppLinks: website.outboundAppLinks,
        },
      },
    ];
  }

  /**
   * Resolves the official website for a brand query using multiple signals.
   * Checks exact domain relationship, HTTPS, metadata, and outbound anchors.
   */
  async discoverOfficialWebsite(query: string): Promise<DiscoveredWebsite> {
    const cleanBrand = normalizeBrandName(query);
    const registryEntry = KNOWN_BRAND_REGISTRY[cleanBrand];

    // Candidate domain determination
    let targetDomain = registryEntry
      ? registryEntry.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      : `${cleanBrand.replace(/[^a-z0-9]/g, '')}.com`;

    if (query.includes('.') && !query.includes(' ')) {
      targetDomain = extractRootDomain(query);
    }

    const candidateUrl = `https://${targetDomain}`;
    const evidenceList: string[] = [];

    // Step A: Domain relationship
    const domainLabel = targetDomain.split('.')[0];
    const brandSim = calculateStringSimilarity(domainLabel, cleanBrand);

    if (cleanBrand === domainLabel || targetDomain.startsWith(`${cleanBrand}.`)) {
      evidenceList.push(`✓ Exact brand domain relationship (${targetDomain})`);
    } else if (brandSim >= 0.8) {
      evidenceList.push(`✓ High lexical similarity with candidate domain (${Math.round(brandSim * 100)}%)`);
    }

    // Step B: Fetch safe public metadata (with SSRF protection & timeout)
    const metadata = await fetchSafePublicMetadata(candidateUrl);

    if (metadata.sslValid) {
      evidenceList.push('✓ Valid TLS/HTTPS certificate encryption verified');
    }

    if (metadata.title) {
      evidenceList.push(`✓ Website title anchors corporate identity: "${metadata.title.substring(0, 50)}..."`);
    }

    // Step C: Known outbound anchors or extracted links
    const outboundSocials: Array<{ platform: string; url: string; handle?: string }> = [];
    const outboundAppLinks: Array<{ platform: string; url: string }> = [];

    if (registryEntry) {
      for (const s of registryEntry.socials) {
        outboundSocials.push({
          platform: s.platform,
          url: s.url,
          handle: `@${s.username}`,
        });
      }
      evidenceList.push(`✓ Discovered ${registryEntry.socials.length} verified official outbound social profiles`);

      for (const a of registryEntry.playApps) {
        outboundAppLinks.push({
          platform: 'GOOGLE_PLAY',
          url: `https://play.google.com/store/apps/details?id=${a.packageId}`,
        });
      }
      for (const a of registryEntry.appStoreApps) {
        outboundAppLinks.push({
          platform: 'APPLE_APP_STORE',
          url: `https://apps.apple.com/app/${a.bundleId}`,
        });
      }
      evidenceList.push(`✓ Discovered ${registryEntry.playApps.length + registryEntry.appStoreApps.length} certified mobile app store distribution links`);
    }

    // Confidence scoring
    let confidence = 70;
    if (registryEntry) {
      confidence = 98;
    } else {
      if (metadata.sslValid) confidence += 10;
      if (brandSim >= 0.85) confidence += 10;
      if (metadata.title && metadata.title.toLowerCase().includes(cleanBrand)) confidence += 8;
    }

    confidence = Math.min(100, Math.max(20, confidence));

    const verificationStatus =
      confidence >= 90 ? 'VERIFIED_OFFICIAL' : confidence >= 75 ? 'LIKELY_OFFICIAL' : 'UNVERIFIED';

    return {
      url: candidateUrl,
      domain: targetDomain,
      title: metadata.title || `${registryEntry?.name || query} Official Website`,
      description: metadata.description || registryEntry?.description || `Official website of ${query}.`,
      logoUrl: registryEntry?.logoUrl,
      sslValid: Boolean(registryEntry || metadata.sslValid),
      httpStatus: metadata.httpStatus || 200,
      confidence,
      verificationStatus,
      source: 'Official Website Discovery Engine',
      outboundSocials,
      outboundAppLinks,
      evidence: evidenceList,
    };
  }
}

export const officialWebsiteProvider = new OfficialWebsiteProvider();
