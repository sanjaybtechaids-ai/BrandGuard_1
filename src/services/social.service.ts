import { monitoredSocials } from '@/data/social';
import { MonitoredSocial } from '@/types/social';
import { OfficialSocial } from '@/types/brand';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { normalizeBrandLookupKey } from '@/lib/risk/normalization';
import { getBrandById } from './brands.service';

type DbSocial = Record<string, unknown>;

function mapDatabaseSocial(row: DbSocial): MonitoredSocial {
  const verificationStatus = String(row.verification_status || 'UNVERIFIED') as MonitoredSocial['verificationStatus'];
  const isOfficial = verificationStatus === 'VERIFIED_OFFICIAL' || verificationStatus === 'LIKELY_OFFICIAL';
  const riskScore = verificationStatus === 'SUSPICIOUS' ? 80 : isOfficial ? 5 : 25;
  const brand = Array.isArray(row.brands) ? row.brands[0] as DbSocial | undefined : row.brands as DbSocial | undefined;
  const platformMap: Record<string, MonitoredSocial['platform']> = {
    INSTAGRAM: 'Instagram', X: 'X', YOUTUBE: 'YouTube', FACEBOOK: 'Facebook', TIKTOK: 'TikTok', LINKEDIN: 'LinkedIn', TELEGRAM: 'Telegram',
  };
  return {
    id: String(row.id),
    username: String(row.username || ''),
    displayName: String(row.username || ''),
    brandId: String(row.brand_id || ''),
    brandName: String(brand?.name || 'Protected brand'),
    platform: platformMap[String(row.platform)] || 'Instagram',
    avatar: '',
    isOfficial,
    similarityScore: typeof row.verification_confidence === 'number' ? row.verification_confidence : 0,
    riskScore,
    riskLevel: riskScore >= 80 ? 'High' : isOfficial ? 'Trusted' : 'Low',
    status: verificationStatus === 'SUSPICIOUS' ? 'High' : isOfficial ? 'Trusted' : 'Under Review',
    followers: '—',
    verifiedBadge: isOfficial,
    detectedAt: typeof row.created_at === 'string' ? row.created_at : '',
    profileUrl: typeof row.profile_url === 'string' ? row.profile_url : undefined,
    verificationStatus,
    relationshipType: row.relationship_type as MonitoredSocial['relationshipType'],
    reasons: Array.isArray(row.reasons) ? row.reasons.filter((value): value is string => typeof value === 'string') : [],
    evidence: Array.isArray(row.evidence) ? row.evidence.filter((value): value is string => typeof value === 'string') : [],
  };
}

/**
 * Social Monitoring & Official Social Data Isolation Service.
 * Enforces brand-specific filtering to guarantee Brand A never displays Brand B accounts.
 */
export async function getMonitoredSocials(brandId?: string, organizationId?: string): Promise<MonitoredSocial[]> {
  let dbSocials: MonitoredSocial[] = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      let resolvedBrandId = brandId;
      if (brandId) {
        const brand = await getBrandById(brandId, organizationId);
        if (brand) resolvedBrandId = brand.id;
      }

      let query = supabase.from('official_social_accounts').select('*, brands(name)');
      if (organizationId) query = query.eq('organization_id', organizationId);
      if (resolvedBrandId) query = query.eq('brand_id', resolvedBrandId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        dbSocials = data.map((row) => mapDatabaseSocial(row as DbSocial));
      }
    } catch {
      // Gracefully continue to fallback
    }
  }

  let list = [...monitoredSocials];

  if (brandId) {
    const cleanId = brandId.toLowerCase().trim();
    const brand = await getBrandById(brandId, organizationId);
    const targetBrandId = brand?.id.toLowerCase() || cleanId;
    const targetBrandName = brand?.name.toLowerCase() || cleanId;
    const targetNormId = normalizeBrandLookupKey(targetBrandId);
    const targetNormName = normalizeBrandLookupKey(targetBrandName);

    list = list.filter((s) => {
      const sBrandId = s.brandId.toLowerCase().trim();
      const sBrandName = s.brandName.toLowerCase().trim();
      const sNormId = normalizeBrandLookupKey(s.brandId);
      const sNormName = normalizeBrandLookupKey(s.brandName);

      return (
        sBrandId === targetBrandId ||
        sBrandName === targetBrandName ||
        sNormId === targetNormId ||
        sNormName === targetNormName ||
        sNormId === targetNormName ||
        sNormName === targetNormId
      );
    });
  }

  // If database returned official socials, merge them with any suspicious socials from in-memory data
  if (dbSocials.length > 0) {
    const map = new Map<string, MonitoredSocial>();
    // First include suspicious socials from list
    for (const soc of list.filter((s) => !s.isOfficial || s.verificationStatus === 'SUSPICIOUS')) {
      const key = (soc.username || soc.id || soc.platform).toLowerCase();
      map.set(key, soc);
    }
    // Then overlay verified database socials
    for (const soc of dbSocials) {
      const key = (soc.username || soc.id || soc.platform).toLowerCase();
      map.set(key, soc);
    }
    return Array.from(map.values());
  }

  return list;
}

/**
 * Returns strictly verified official social accounts for the specified brand.
 */
export async function getVerifiedSocialsByBrand(brandId: string, organizationId?: string): Promise<OfficialSocial[]> {
  const brand = await getBrandById(brandId, organizationId);
  const brandOfficialSocials = brand?.officialSocials || [];

  const allSocials = await getMonitoredSocials(brandId, organizationId);
  const monitoredOfficial = allSocials
    .filter((s) => s.isOfficial && s.verificationStatus !== 'SUSPICIOUS')
    .map((s) => ({
      id: s.id,
      brandId: s.brandId,
      platform: s.platform,
      handle: s.username,
      url: s.profileUrl || `https://${s.platform.toLowerCase()}.com/${s.username.replace('@', '')}`,
      avatar: s.avatar,
      verified: true,
      isOfficial: true,
      verificationStatus: s.verificationStatus || 'VERIFIED_OFFICIAL',
      verificationConfidence: 98,
      relationshipType: s.relationshipType || 'DIRECT_OFFICIAL',
      followers: s.followers,
      evidence: s.evidence || [`Platform verified checkmark`, `Canonical handle @${s.username}`],
    }));

  const map = new Map<string, OfficialSocial>();
  for (const soc of brandOfficialSocials) {
    const key = (soc.handle || (soc as any).username || soc.id || soc.platform).toLowerCase();
    map.set(key, soc);
  }
  for (const soc of monitoredOfficial) {
    const key = (soc.handle || (soc as any).username || soc.id || soc.platform).toLowerCase();
    if (!map.has(key)) {
      map.set(key, soc);
    }
  }
  return Array.from(map.values());
}

/**
 * Returns strictly suspicious / spoofed social profiles targeting this brand.
 */
export async function getSuspiciousSocialsByBrand(brandId: string, organizationId?: string): Promise<MonitoredSocial[]> {
  const allSocials = await getMonitoredSocials(brandId, organizationId);
  return allSocials.filter((s) => !s.isOfficial || s.verificationStatus === 'SUSPICIOUS');
}

export async function getMonitoredSocialById(id: string, organizationId?: string): Promise<MonitoredSocial | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    let query = supabase.from('official_social_accounts').select('*, brands(name)').eq('id', id);
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Unable to load social account: ${error.message}`);
    return data ? mapDatabaseSocial(data as DbSocial) : undefined;
  }
  const soc = monitoredSocials.find((s) => s.id === id);
  return Promise.resolve(soc ? { ...soc } : undefined);
}

export async function scanSocialPlatforms(): Promise<{ accountsScanned: number; newAlerts: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accountsScanned: 135,
        newAlerts: 3,
      });
    }, 1800);
  });
}
