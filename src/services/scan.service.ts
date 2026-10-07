import { BrandScan, ScanCandidate, ScanType, ScanEvent } from '@/types/scan';
import { getBrandById } from './brands.service';
import { googlePlayProvider, appStoreProvider, socialProvider } from '@/providers';
import { createThreat } from './threats.service';
import { recordAuditLog } from '@/lib/security/audit';

// In-memory scans and candidates storage
const scansStore = new Map<string, BrandScan>();
const candidatesStore = new Map<string, ScanCandidate[]>();

export class ScanService {
  /**
   * Executes brand-specific BrandGuard Scan Pipeline (Section 49).
   * Scans strictly for the specified brandId. Never scans all brands.
   */
  async startScan(
    brandId: string,
    scanType: ScanType = 'FULL',
    startedBy: string = 'usr-sanjay-analyst',
    organizationId: string = 'a0000000-0000-0000-0000-000000000001'
  ): Promise<BrandScan> {
    if (!brandId || typeof brandId !== 'string' || brandId.trim() === '') {
      throw new Error('BRAND_REQUIRED: Select a brand before starting a scan.');
    }

    const brand = await getBrandById(brandId.trim(), organizationId);
    if (!brand) {
      throw new Error(`INVALID_BRAND: The selected brand "${brandId}" could not be found.`);
    }

    if (organizationId && brand.organizationId && brand.organizationId !== organizationId) {
      throw new Error(`FORBIDDEN: Brand "${brand.name}" does not belong to organization "${organizationId}".`);
    }

    const scanId = `scan-${Date.now()}`;

    const newScan: BrandScan = {
      id: scanId,
      organizationId,
      brandId: brand.id,
      brandName: brand.name,
      startedBy,
      status: 'RUNNING',
      scanType,
      progress: 10,
      startedAt: new Date().toISOString(),
      events: [
        {
          id: `evt-1`,
          scanId,
          eventType: 'PIPELINE_INIT',
          message: `Querying official brand profile & verified assets for ${brand.name}...`,
          progress: 10,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    scansStore.set(scanId, newScan);

    await recordAuditLog({
      organizationId,
      action: 'SCAN_STARTED',
      entityType: 'SCAN',
      entityId: scanId,
      metadata: { brandName: brand.name, brandId: brand.id, scanType },
    });

    // Execute background steps asynchronously
    this.runPipelineExecution(scanId, brand, scanType, organizationId).catch((err) => {
      console.error('[ScanPipeline] Error during scan execution:', err);
    });

    return newScan;
  }

  private async runPipelineExecution(scanId: string, brand: any, scanType: ScanType, organizationId: string) {
    const scan = scansStore.get(scanId);
    if (!scan) return;

    // Step 2: Collect available candidate data from providers based on scanType
    const allCandidates: ScanCandidate[] = [];

    const shouldScanApps = scanType === 'FULL' || scanType === 'APPS' || scanType === 'QUICK';
    const shouldScanSocial = scanType === 'FULL' || scanType === 'SOCIAL' || scanType === 'QUICK';

    if (shouldScanApps) {
      const playApps = await googlePlayProvider.searchApps(brand.name);
      const iosApps = await appStoreProvider.searchApps(brand.name);
      for (const app of [...playApps, ...iosApps]) {
        allCandidates.push({
          id: app.id || `cand-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          organizationId,
          brandId: brand.id,
          candidateType: 'APP',
          name: app.name,
          developerName: app.developer,
          platform: app.platform === 'APPLE_APP_STORE' ? 'Apple App Store' : 'Google Play',
          packageId: app.packageId || app.bundleId,
          logoUrl: app.icon || brand.logo_url || brand.logo,
          source: app.source,
          discoveryStatus: app.verificationStatus,
          isDemoData: Boolean(app.isDemoData),
          createdAt: app.discoveryTimestamp || new Date().toISOString(),
        });
      }
    }

    if (shouldScanSocial) {
      const socials = await socialProvider.searchAccounts(brand.name);
      for (const soc of socials) {
        allCandidates.push({
          id: soc.id || `cand-soc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          organizationId,
          brandId: brand.id,
          candidateType: 'SOCIAL',
          name: soc.displayName || soc.username,
          username: soc.username,
          platform: soc.platform,
          url: soc.profileUrl,
          logoUrl: brand.logo_url || brand.logo,
          source: soc.source,
          discoveryStatus: soc.verificationStatus,
          isDemoData: Boolean(soc.isDemoData),
          createdAt: soc.discoveryTimestamp || new Date().toISOString(),
        });
      }
    }

    candidatesStore.set(scanId, allCandidates);

    // Update progress
    scan.progress = 50;
    scan.events?.push({
      id: `evt-2`,
      scanId,
      eventType: 'CANDIDATES_COLLECTED',
      message: `Discovered ${allCandidates.length} candidate entities across app stores & social channels for ${brand.name}.`,
      progress: 50,
      createdAt: new Date().toISOString(),
    });

    // Step 3: Compare candidates & evaluate risk
    let threatsDetected = 0;
    for (const cand of allCandidates) {
      if (cand.discoveryStatus === 'SUSPICIOUS_CANDIDATE') {
        threatsDetected++;
        await createThreat({
          brandId: brand.id,
          brandName: brand.name,
          organizationId,
          name: `Rogue Candidate: ${cand.name}`,
          candidateName: cand.name,
          candidateDeveloper: cand.developerName || 'Unknown Entity',
          candidateLogo: cand.logoUrl || brand.logo_url || brand.logo,
          platform: cand.platform || 'Third-Party APK',
          url: cand.url || '',
          riskScore: 89,
          riskLevel: 'High',
          status: 'New',
          type: cand.candidateType === 'APP' ? 'FAKE_APP' : 'FAKE_SOCIAL',
          aiExplanation: `Discovered during scheduled brand scan #${scanId} for ${brand.name}. Implements unauthorized asset copying.`,
        });
      }
    }

    // Step 4: Complete scan
    scan.progress = 100;
    scan.status = 'COMPLETED';
    scan.completedAt = new Date().toISOString();
    scan.candidatesCount = allCandidates.length;
    scan.threatsCount = threatsDetected;
    scan.events?.push({
      id: `evt-3`,
      scanId,
      eventType: 'SCAN_FINISHED',
      message: `Scan finished successfully for ${brand.name}. Scanned: ${allCandidates.length}, Flagged Threats: ${threatsDetected}.`,
      progress: 100,
      createdAt: new Date().toISOString(),
    });

    await recordAuditLog({
      organizationId,
      action: 'SCAN_COMPLETED',
      entityType: 'SCAN',
      entityId: scanId,
      metadata: { brandName: brand.name, brandId: brand.id, candidatesCount: allCandidates.length, threatsCount: threatsDetected },
    });
  }

  getScan(scanId: string): BrandScan | undefined {
    return scansStore.get(scanId);
  }

  getScanCandidates(scanId: string): ScanCandidate[] {
    return candidatesStore.get(scanId) || [];
  }

  getScansByBrand(brandId: string, organizationId?: string): BrandScan[] {
    const cleanId = (brandId || '').toLowerCase().trim();
    return Array.from(scansStore.values())
      .filter((s) => {
        const matchesBrand = s.brandId.toLowerCase() === cleanId;
        if (!matchesBrand) return false;
        if (organizationId && s.organizationId && s.organizationId !== organizationId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  getAllScans(organizationId?: string): BrandScan[] {
    const list = Array.from(scansStore.values());
    if (!organizationId) return list;
    return list.filter((s) => !s.organizationId || s.organizationId === organizationId);
  }
}

export const scanService = new ScanService();
