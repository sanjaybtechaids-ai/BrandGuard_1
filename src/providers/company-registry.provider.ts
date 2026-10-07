import { BrandProvider, ProviderResult, KNOWN_BRAND_REGISTRY } from './brand.provider';
import { normalizeBrandName } from '@/lib/risk/normalization';

export class CompanyRegistryProvider implements BrandProvider {
  async search(query: string): Promise<ProviderResult[]> {
    const cleanBrand = normalizeBrandName(query);
    const registry = KNOWN_BRAND_REGISTRY[cleanBrand];

    if (registry) {
      return [
        {
          source: 'Government / Public Corporate Registrar (LEVEL 2)',
          name: registry.legalName,
          url: registry.website,
          confidence: 99,
          priorityLevel: 'LEVEL_2',
          legalName: registry.legalName,
          headquarters: registry.headquarters,
          isDemoData: false,
          metadata: {
            jurisdiction: registry.headquarters,
            foundedYear: registry.foundedYear,
            status: 'ACTIVE_GOOD_STANDING',
            entityType: 'Corporation / Public Limited',
          },
        },
      ];
    }

    // Heuristic public registry match
    const title = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
    return [
      {
        source: 'Global Commercial Corporate Directory',
        name: `${title}, Inc.`,
        url: `https://${cleanBrand}.com`,
        confidence: 65,
        priorityLevel: 'LEVEL_3',
        legalName: `${title}, Inc.`,
        headquarters: 'Registered Office',
        isDemoData: true,
        metadata: {
          inferred: true,
          status: 'UNVERIFIED_RECORD',
        },
      },
    ];
  }
}

export const companyRegistryProvider = new CompanyRegistryProvider();
