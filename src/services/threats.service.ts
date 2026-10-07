import { threats } from '@/data/threats';
import { Threat } from '@/types/threat';
import { recordAuditLog } from '@/lib/security/audit';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { normalizeBrandLookupKey } from '@/lib/risk/normalization';
import { getBrandById } from './brands.service';

type DbThreat = Record<string, unknown>;

function mapRiskLevel(value: unknown): Threat['riskLevel'] {
  const level = String(value || 'MEDIUM').toLowerCase();
  return level === 'critical' ? 'Critical' : level === 'high' ? 'High' : level === 'low' ? 'Low' : 'Medium';
}

function mapThreatStatus(value: unknown): Threat['status'] {
  const status = String(value || 'NEW').toUpperCase();
  return status === 'RESOLVED' ? 'Resolved' : status === 'INVESTIGATING' ? 'Investigating' : status === 'FALSE_POSITIVE' ? 'False Positive' : 'New';
}

function mapDatabaseThreat(row: DbThreat): Threat {
  const brand = Array.isArray(row.brands) ? row.brands[0] as DbThreat | undefined : row.brands as DbThreat | undefined;
  return {
    id: String(row.id),
    organizationId: String(row.organization_id || ''),
    brandId: String(row.brand_id || ''),
    brandName: String(brand?.name || 'Protected brand'),
    name: String(row.title || row.candidate_name || 'Threat incident'),
    candidateId: typeof row.candidate_id === 'string' ? row.candidate_id : undefined,
    candidateName: String(row.candidate_name || row.title || 'Unknown candidate'),
    candidateDeveloper: 'Unknown',
    candidateWebsite: String(row.url || ''),
    candidateLogo: String(row.candidate_logo || ''),
    officialLogo: typeof brand?.logo_url === 'string' ? brand.logo_url : '',
    officialName: String(brand?.legal_name || brand?.name || 'Protected brand'),
    officialDeveloper: String(brand?.legal_name || brand?.name || 'Protected brand'),
    officialWebsite: String(brand?.official_website || ''),
    platform: String(row.platform || 'Web APK'),
    url: String(row.url || ''),
    riskScore: typeof row.risk_score === 'number' ? row.risk_score : 0,
    riskLevel: mapRiskLevel(row.severity),
    status: mapThreatStatus(row.status),
    nameSimilarity: 0,
    logoSimilarity: 0,
    descriptionSimilarity: 0,
    developerMatch: false,
    domainMatch: false,
    packageMatch: false,
    detectedAt: typeof row.created_at === 'string' ? row.created_at : '',
    type: String(row.type || 'BRAND_IMPERSONATION') as Threat['type'],
    backendType: String(row.type || 'BRAND_IMPERSONATION') as Threat['backendType'],
    aiExplanation: String(row.summary || ''),
    impersonationTactics: [],
    recommendedActions: [],
    createdAt: typeof row.created_at === 'string' ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  };
}

function toDbSeverity(level: Threat['riskLevel']): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  return level.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export async function getThreats(organizationId?: string): Promise<Threat[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    let query = supabase.from('threats').select('*, brands(name, legal_name, logo_url, official_website)').order('created_at', { ascending: false });
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { data, error } = await query;
    if (error) throw new Error(`Unable to load threats: ${error.message}`);
    return (data || []).map((row) => mapDatabaseThreat(row as DbThreat));
  }
  return Promise.resolve([...threats]);
}

export async function getThreatById(id: string, organizationId?: string): Promise<Threat | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    let query = supabase.from('threats').select('*, brands(name, legal_name, logo_url, official_website)').eq('id', id);
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Unable to load threat: ${error.message}`);
    return data ? mapDatabaseThreat(data as DbThreat) : undefined;
  }
  const threat = threats.find((t) => t.id === id);
  return Promise.resolve(threat ? { ...threat } : undefined);
}

export async function createThreat(threatData: Partial<Threat>): Promise<Threat> {
  const newThreat: Threat = {
    id: threatData.id || `thr-${Date.now()}`,
    organizationId: threatData.organizationId || 'a0000000-0000-0000-0000-000000000001',
    brandId: threatData.brandId || 'nike',
    brandName: threatData.brandName || 'Nike',
    name: threatData.name || 'Suspected Threat Entity',
    candidateName: threatData.candidateName || 'Candidate Target',
    candidateDeveloper: threatData.candidateDeveloper || 'Unknown',
    candidateWebsite: threatData.candidateWebsite || '',
    candidateLogo: threatData.candidateLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=96&auto=format&fit=crop&q=80',
    officialLogo: threatData.officialLogo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=96&auto=format&fit=crop&q=80',
    officialName: threatData.officialName || 'Nike, Inc.',
    officialDeveloper: threatData.officialDeveloper || 'Nike, Inc.',
    officialWebsite: threatData.officialWebsite || 'https://nike.com',
    platform: threatData.platform || 'Web APK',
    url: threatData.url || '',
    riskScore: threatData.riskScore ?? 85,
    riskLevel: threatData.riskLevel || 'High',
    status: threatData.status || 'New',
    nameSimilarity: threatData.nameSimilarity ?? 90,
    logoSimilarity: threatData.logoSimilarity ?? 85,
    descriptionSimilarity: threatData.descriptionSimilarity ?? 70,
    developerMatch: false,
    domainMatch: false,
    packageMatch: false,
    detectedAt: 'Just now',
    type: threatData.type || 'FAKE_WEBSITE',
    aiExplanation: threatData.aiExplanation || 'Flagged for forensic investigation.',
    impersonationTactics: threatData.impersonationTactics || ['Domain Spoofing'],
    recommendedActions: threatData.recommendedActions || ['Investigate and issue cease and desist'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    if (!threatData.organizationId || !threatData.brandId) {
      throw new Error('An organization and brand are required to create a threat.');
    }
    const supabase = await createServerClient();

    // Check for existing threat with same brand and url
    if (newThreat.url) {
      const { data: existingDb } = await supabase
        .from('threats')
        .select('*, brands(name, legal_name, logo_url, official_website)')
        .eq('organization_id', threatData.organizationId)
        .eq('brand_id', threatData.brandId)
        .eq('url', newThreat.url)
        .maybeSingle();
      if (existingDb) {
        return mapDatabaseThreat(existingDb as DbThreat);
      }
    }

    const { data, error } = await supabase
      .from('threats')
      .insert({
        organization_id: threatData.organizationId,
        brand_id: threatData.brandId,
        candidate_id: threatData.candidateId || null,
        type: (threatData.backendType || threatData.type || 'BRAND_IMPERSONATION') as string,
        severity: toDbSeverity(newThreat.riskLevel),
        risk_score: newThreat.riskScore,
        status: newThreat.status === 'Resolved' ? 'RESOLVED' : newThreat.status === 'Investigating' ? 'INVESTIGATING' : newThreat.status === 'False Positive' ? 'FALSE_POSITIVE' : 'NEW',
        title: newThreat.name,
        summary: newThreat.aiExplanation,
        url: newThreat.url || null,
        candidate_name: newThreat.candidateName || null,
        candidate_logo: newThreat.candidateLogo || null,
        platform: newThreat.platform || null,
      })
      .select('*, brands(name, legal_name, logo_url, official_website)')
      .single();
    if (error) throw new Error(`Unable to create threat: ${error.message}`);
    return mapDatabaseThreat(data as DbThreat);
  }

  // Deduplicate in-memory threats by ID or brand + (URL / candidateName)
  const existingIndex = threats.findIndex((t) => {
    if (threatData.id && t.id === threatData.id) return true;
    const sameBrand = (t.brandId || '').toLowerCase() === (newThreat.brandId || '').toLowerCase();
    const sameUrl = newThreat.url && t.url && t.url.toLowerCase() === newThreat.url.toLowerCase();
    const sameCandidate = newThreat.candidateName && t.candidateName && t.candidateName.toLowerCase() === newThreat.candidateName.toLowerCase();
    return sameBrand && (sameUrl || sameCandidate);
  });

  if (existingIndex !== -1) {
    threats[existingIndex] = {
      ...threats[existingIndex],
      ...newThreat,
      id: threats[existingIndex].id,
      updatedAt: new Date().toISOString(),
    };
    return threats[existingIndex];
  }

  threats.unshift(newThreat);

  await recordAuditLog({
    organizationId: 'a0000000-0000-0000-0000-000000000001',
    action: 'THREAT_CREATED',
    entityType: 'THREAT',
    entityId: newThreat.id,
    metadata: { name: newThreat.name, riskScore: newThreat.riskScore },
  });

  return newThreat;
}

export async function updateThreatStatus(
  id: string,
  status: 'New' | 'Investigating' | 'Resolved',
  organizationId?: string
): Promise<Threat | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    let query = supabase
      .from('threats')
      .update({ status: status === 'Resolved' ? 'RESOLVED' : status === 'Investigating' ? 'INVESTIGATING' : 'NEW' })
      .eq('id', id);
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { data, error } = await query.select('*, brands(name, legal_name, logo_url, official_website)').maybeSingle();
    if (error) throw new Error(`Unable to update threat: ${error.message}`);
    return data ? mapDatabaseThreat(data as DbThreat) : undefined;
  }
  const index = threats.findIndex((t) => t.id === id);
  if (index !== -1) {
    threats[index].status = status;
    threats[index].updatedAt = new Date().toISOString();

    await recordAuditLog({
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      action: status === 'Resolved' ? 'THREAT_RESOLVED' : 'THREAT_UPDATED',
      entityType: 'THREAT',
      entityId: id,
      metadata: { newStatus: status },
    });

    return Promise.resolve({ ...threats[index] });
  }
  return Promise.resolve(undefined);
}

export async function filterThreats(filters: {
  brand?: string;
  platform?: string;
  riskLevel?: string;
  status?: string;
  search?: string;
}, organizationId?: string): Promise<Threat[]> {
  if (isSupabaseConfigured()) {
    const allThreats = await getThreats(organizationId);
    return filterThreatRows(allThreats, filters);
  }
  return filterThreatRows([...threats], filters);
}

function filterThreatRows(result: Threat[], filters: {
  brand?: string;
  platform?: string;
  riskLevel?: string;
  status?: string;
  search?: string;
}): Threat[] {

  if (filters.brand && filters.brand !== 'all') {
    result = result.filter(
      (t) =>
        t.brandId.toLowerCase() === filters.brand?.toLowerCase() ||
        t.brandName.toLowerCase() === filters.brand?.toLowerCase()
    );
  }

  if (filters.platform && filters.platform !== 'all') {
    result = result.filter((t) => t.platform.toLowerCase() === filters.platform?.toLowerCase());
  }

  if (filters.riskLevel && filters.riskLevel !== 'all') {
    result = result.filter((t) => t.riskLevel.toLowerCase() === filters.riskLevel?.toLowerCase());
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter((t) => t.status.toLowerCase() === filters.status?.toLowerCase());
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.candidateName.toLowerCase().includes(q) ||
        t.brandName.toLowerCase().includes(q) ||
        t.candidateDeveloper.toLowerCase().includes(q) ||
        (t.url && t.url.toLowerCase().includes(q))
    );
  }

  return result;
}

/**
 * Returns threats strictly contextual to the specified brand with organization isolation.
 */
export async function getThreatsByBrand(brandId: string, organizationId?: string): Promise<Threat[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    let resolvedBrandId = brandId;
    const brand = await getBrandById(brandId, organizationId);
    if (brand) resolvedBrandId = brand.id;

    let query = supabase
      .from('threats')
      .select('*, brands(name, legal_name, logo_url, official_website)')
      .eq('brand_id', resolvedBrandId)
      .order('created_at', { ascending: false });
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { data, error } = await query;
    if (error) throw new Error(`Unable to load brand threats: ${error.message}`);
    return (data || []).map((row) => mapDatabaseThreat(row as DbThreat));
  }
  const allThreats = await getThreats();
  const cleanId = brandId.toLowerCase().trim();
  const brand = await getBrandById(brandId, organizationId);
  const targetBrandId = brand?.id.toLowerCase() || cleanId;
  const targetBrandName = brand?.name.toLowerCase() || cleanId;
  const targetNormId = normalizeBrandLookupKey(targetBrandId);
  const targetNormName = normalizeBrandLookupKey(targetBrandName);

  const matchedThreats = allThreats.filter((t) => {
    if (organizationId && t.organizationId && t.organizationId !== organizationId) {
      return false;
    }
    const tBrandId = (t.brandId || '').toLowerCase().trim();
    const tBrandName = (t.brandName || '').toLowerCase().trim();
    const tNormId = normalizeBrandLookupKey(tBrandId);
    const tNormName = normalizeBrandLookupKey(tBrandName);

    return (
      tBrandId === targetBrandId ||
      tBrandName === targetBrandName ||
      tNormId === targetNormId ||
      tNormName === targetNormName ||
      tNormId === targetNormName ||
      tNormName === targetNormId
    );
  });

  // Deduplicate matched threats by ID or candidate URL / name
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const deduplicated: Threat[] = [];

  for (const t of matchedThreats) {
    if (seenIds.has(t.id)) continue;
    const dedupeKey = `${t.brandId.toLowerCase()}|${(t.url || t.candidateWebsite || t.candidateName || t.name).toLowerCase()}`;
    if (seenKeys.has(dedupeKey)) continue;

    seenIds.add(t.id);
    seenKeys.add(dedupeKey);
    deduplicated.push(t);
  }

  return deduplicated;
}
