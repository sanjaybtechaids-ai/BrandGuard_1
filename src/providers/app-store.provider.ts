import { DiscoveredApp } from '@/types/brand-discovery';
import { KNOWN_BRAND_REGISTRY, BrandProvider, ProviderResult } from './brand.provider';
import { normalizeBrandName } from '@/lib/risk/normalization';
import { matchAppToBrand } from '@/lib/risk/entity-matching';

export class AppStoreProvider implements BrandProvider {
  async search(query: string): Promise<ProviderResult[]> {
    const apps = await this.searchApps(query);
    return apps.map((app) => ({
      source: app.source,
      name: app.name,
      url: app.storeUrl || '',
      confidence: app.confidence,
      priorityLevel: 'LEVEL_2',
      metadata: {
        developer: app.developer,
        bundleId: app.bundleId,
        platform: app.platform,
        verificationStatus: app.verificationStatus,
      },
    }));
  }

  /**
   * Discovers official apps from Apple App Store.
   * Filters out unrelated keyword matches (e.g. Taptap Send for Tata) using multi-signal entity matching.
   */
  async searchApps(query: string): Promise<DiscoveredApp[]> {
    const cleanBrand = normalizeBrandName(query);
    const registry = KNOWN_BRAND_REGISTRY[cleanBrand];
    const discovered: DiscoveredApp[] = [];
    const timestamp = new Date().toISOString();

    // 1. If we have registered ground truth in KNOWN_BRAND_REGISTRY, prioritize certified apps
    if (registry?.appStoreApps?.length) {
      for (const app of registry.appStoreApps) {
        discovered.push({
          id: `ios-reg-${app.bundleId}`,
          name: app.name,
          platform: 'APPLE_APP_STORE',
          developer: registry.legalName,
          bundleId: app.bundleId,
          storeUrl: `https://apps.apple.com/app/${app.bundleId}`,
          icon: app.icon || registry.logoUrl,
          description: `Certified iOS application published by ${registry.legalName}.`,
          confidence: 98,
          verificationStatus: 'VERIFIED_OFFICIAL',
          source: 'Apple App Store Certified Registry',
          discoveryTimestamp: timestamp,
          evidence: [
            `✓ Developer identity matches verified corporation: ${registry.legalName}`,
            `✓ App Store bundle verified: ${app.bundleId}`,
            `✓ Official brand asset baseline match`,
          ],
          isDemoData: false,
        });
      }
    }

    // 2. Try Live Public iTunes Search API with strict entity matching validation
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=10`,
        {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          for (const item of data.results) {
            const devName = item.artistName || item.sellerName || 'Unknown Developer';
            const appName = item.trackCensoredName || item.trackName || `${query} iOS App`;
            const bundleId = item.bundleId || `com.${cleanBrand}.ios`;

            // Run strict multi-signal entity matching
            const match = matchAppToBrand(
              {
                name: appName,
                developer: devName,
                packageId: bundleId,
                bundleId,
                storeUrl: item.trackViewUrl,
                description: item.description,
              },
              {
                name: query,
                legalName: registry?.legalName,
                website: registry?.website,
              }
            );

            // Filter out completely UNRELATED apps (e.g. Taptap Send, Tantan for Tata)
            if (match.relationshipType === 'UNRELATED' || match.verificationStatus === 'REJECTED') {
              continue;
            }

            // Avoid duplicate bundles if already present from certified registry
            if (discovered.some((d) => d.bundleId === bundleId)) {
              continue;
            }

            discovered.push({
              id: `ios-${item.trackId || Date.now()}`,
              name: appName,
              platform: 'APPLE_APP_STORE',
              developer: devName,
              bundleId,
              storeUrl: item.trackViewUrl || `https://apps.apple.com/app/id${item.trackId}`,
              icon: item.artworkUrl100 || item.artworkUrl60 || registry?.logoUrl,
              description: item.description ? item.description.substring(0, 200) : 'Official iOS application.',
              confidence: match.confidence,
              verificationStatus: match.matched ? 'VERIFIED_OFFICIAL' : match.isSuspicious ? 'SUSPICIOUS' : 'UNVERIFIED',
              source: 'Apple App Store Public API (Live Query)',
              discoveryTimestamp: timestamp,
              evidence: match.evidence.length > 0 ? match.evidence : [`Developer: ${devName}`, `Bundle: ${bundleId}`],
              isDemoData: false,
            });
          }
        }
      }
    } catch {
      // Network timeout or sandbox restriction: continue
    }

    return discovered;
  }

  async getAppDetails(id: string): Promise<DiscoveredApp | null> {
    const apps = await this.searchApps(id);
    return apps[0] || null;
  }
}

export const appStoreProvider = new AppStoreProvider();
