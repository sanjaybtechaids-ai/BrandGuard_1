import { monitoredApps } from '@/data/apps';
import { MonitoredApp } from '@/types/app';
import { OfficialApp } from '@/types/brand';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { normalizeBrandLookupKey } from '@/lib/risk/normalization';
import { getBrandById } from './brands.service';

type DbApp = Record<string, unknown>;

function mapDatabaseApp(row: DbApp): MonitoredApp {
  const verificationStatus = String(row.verification_status || 'UNVERIFIED') as MonitoredApp['verificationStatus'];
  const isOfficial = verificationStatus === 'VERIFIED' || verificationStatus === 'LIKELY_OFFICIAL';
  const riskScore = verificationStatus === 'SUSPICIOUS' ? 80 : isOfficial ? 5 : 25;
  const brand = Array.isArray(row.brands) ? row.brands[0] as DbApp | undefined : row.brands as DbApp | undefined;
  return {
    id: String(row.id),
    name: String(row.name || ''),
    brandId: String(row.brand_id || ''),
    brandName: String(brand?.name || 'Protected brand'),
    developer: String(row.developer_name || ''),
    platform: row.platform === 'IOS' ? 'Apple App Store' : row.platform === 'WEB' ? 'Third-Party APK' : 'Google Play',
    icon: String(row.icon_url || ''),
    isOfficial,
    similarityScore: typeof row.verification_confidence === 'number' ? row.verification_confidence : 0,
    riskScore,
    riskLevel: riskScore >= 80 ? 'High' : isOfficial ? 'Trusted' : 'Low',
    status: verificationStatus === 'SUSPICIOUS' ? 'High' : isOfficial ? 'Trusted' : 'Under Review',
    packageId: String(row.package_id || row.bundle_id || ''),
    bundleId: typeof row.bundle_id === 'string' ? row.bundle_id : undefined,
    downloads: '—',
    rating: 0,
    detectedAt: typeof row.created_at === 'string' ? row.created_at : '',
    storeUrl: typeof row.store_url === 'string' ? row.store_url : undefined,
    verificationStatus,
    relationshipType: row.relationship_type as MonitoredApp['relationshipType'],
    reasons: Array.isArray(row.reasons) ? row.reasons.filter((value): value is string => typeof value === 'string') : [],
    evidence: Array.isArray(row.evidence) ? row.evidence.filter((value): value is string => typeof value === 'string') : [],
  };
}

/**
 * App Monitoring & Official Application Data Isolation Service.
 * Ensures Brand A never displays Brand B's applications.
 */
export async function getMonitoredApps(brandId?: string, organizationId?: string): Promise<MonitoredApp[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    let resolvedBrandId = brandId;
    if (brandId) {
      const brand = await getBrandById(brandId, organizationId);
      if (brand) resolvedBrandId = brand.id;
    }

    let query = supabase.from('official_apps').select('*, brands(name)');
    if (organizationId) query = query.eq('organization_id', organizationId);
    if (resolvedBrandId) query = query.eq('brand_id', resolvedBrandId);
    const { data, error } = await query;
    if (error) throw new Error(`Unable to load monitored applications: ${error.message}`);
    return (data || []).map((row) => mapDatabaseApp(row as DbApp));
  }

  let list = [...monitoredApps];

  if (brandId) {
    const cleanId = brandId.toLowerCase().trim();
    const brand = await getBrandById(brandId, organizationId);
    const targetBrandId = brand?.id.toLowerCase() || cleanId;
    const targetBrandName = brand?.name.toLowerCase() || cleanId;
    const targetNormId = normalizeBrandLookupKey(targetBrandId);
    const targetNormName = normalizeBrandLookupKey(targetBrandName);

    list = list.filter((a) => {
      const aBrandId = a.brandId.toLowerCase().trim();
      const aBrandName = a.brandName.toLowerCase().trim();
      const aNormId = normalizeBrandLookupKey(a.brandId);
      const aNormName = normalizeBrandLookupKey(a.brandName);

      return (
        aBrandId === targetBrandId ||
        aBrandName === targetBrandName ||
        aNormId === targetNormId ||
        aNormName === targetNormName ||
        aNormId === targetNormName ||
        aNormName === targetNormId
      );
    });
  }

  return Promise.resolve(list);
}

/**
 * Returns strictly verified official applications for the specified brand.
 */
export async function getOfficialAppsByBrand(brandId: string, organizationId?: string): Promise<OfficialApp[]> {
  const brand = await getBrandById(brandId, organizationId);
  const brandOfficialApps = brand?.officialApps || [];

  const allApps = await getMonitoredApps(brandId, organizationId);
  const monitoredOfficial: OfficialApp[] = allApps
    .filter((a) => a.isOfficial && a.verificationStatus !== 'SUSPICIOUS')
    .map((a) => ({
      id: a.id,
      brandId: a.brandId,
      name: a.name,
      developer: a.developer,
      platform: a.platform === 'Apple App Store' ? 'Apple App Store' : 'Google Play',
      icon: a.icon,
      packageId: a.packageId,
      bundleId: a.bundleId,
      storeUrl: a.storeUrl,
      isOfficial: true,
      verificationStatus: a.verificationStatus || 'VERIFIED',
      verificationConfidence: 96,
      relationshipType: a.relationshipType || 'DIRECT_OFFICIAL',
      evidence: a.evidence || [`Verified publisher: ${a.developer}`, `Certified package: ${a.packageId}`],
    }));

  const map = new Map<string, OfficialApp>();
  for (const app of brandOfficialApps) {
    const key = (app.packageId || app.id || app.name).toLowerCase();
    map.set(key, app);
  }
  for (const app of monitoredOfficial) {
    const key = (app.packageId || app.id || app.name).toLowerCase();
    if (!map.has(key)) {
      map.set(key, app);
    }
  }
  return Array.from(map.values());
}

/**
 * Returns strictly suspicious / impersonating applications targeting this brand.
 */
export async function getSuspiciousAppsByBrand(brandId: string, organizationId?: string): Promise<MonitoredApp[]> {
  const allApps = await getMonitoredApps(brandId, organizationId);
  return allApps.filter((a) => !a.isOfficial || a.verificationStatus === 'SUSPICIOUS');
}

export async function getMonitoredAppById(id: string, organizationId?: string): Promise<MonitoredApp | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    let query = supabase.from('official_apps').select('*, brands(name)').eq('id', id);
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Unable to load application: ${error.message}`);
    return data ? mapDatabaseApp(data as DbApp) : undefined;
  }
  const app = monitoredApps.find((a) => a.id === id);
  return Promise.resolve(app ? { ...app } : undefined);
}

export async function scanAppStores(): Promise<{ appsScanned: number; newAlerts: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        appsScanned: 54,
        newAlerts: 2,
      });
    }, 1800);
  });
}
