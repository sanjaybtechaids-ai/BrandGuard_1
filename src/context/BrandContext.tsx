'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Brand } from '@/types/brand';
import { Organization } from '@/types/user';
import { brands as fallbackBrands } from '@/data/brands';
import { availableOrganizations } from '@/data/users';
import { useUser } from './UserContext';

export type AppMode = 'user' | 'organization';

export type MonitoringContext = {
  mode: 'user' | 'organization';
  organizationId?: string;
  brandId?: string;
};

export interface BrandContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  selectedOrganizationId: string;
  selectedOrganization: Organization;
  availableOrganizations: Organization[];
  setSelectedOrganizationId: (id: string) => void;
  selectedBrandId: string | null;
  selectedBrand: Brand | null;
  availableBrands: Brand[];
  setSelectedBrandId: (id: string | null) => void;
  setSelectedBrand: (brand: Brand | null) => void;
  refreshBrands: () => Promise<void>;
  isLoading: boolean;
  monitoringContext: MonitoringContext;
}

const defaultMonitoringContext: MonitoringContext = {
  mode: 'user',
};

const defaultContextValue: BrandContextType = {
  mode: 'user',
  setMode: () => {},
  selectedOrganizationId: '',
  selectedOrganization: availableOrganizations[0],
  availableOrganizations,
  setSelectedOrganizationId: () => {},
  selectedBrandId: null,
  selectedBrand: null,
  availableBrands: fallbackBrands,
  setSelectedBrandId: () => {},
  setSelectedBrand: () => {},
  refreshBrands: async () => {},
  isLoading: false,
  monitoringContext: defaultMonitoringContext,
};

const BrandContext = createContext<BrandContextType>(defaultContextValue);

/**
 * Isolated query parameter listener that suspends cleanly without wrapping children.
 */
function SearchParamsSync({ onSync }: { onSync: (brand: string | null) => void }) {
  const searchParams = useSearchParams();
  const urlBrand = searchParams?.get('brand') || null;

  useEffect(() => {
    if (urlBrand) {
      onSync(urlBrand);
    }
  }, [urlBrand, onSync]);

  return null;
}

export function BrandContextProvider({ children }: { children: React.ReactNode }) {
  // Mode from global UserContext
  const { mode, setMode } = useUser();

  // Organization state: Only active when in organization mode.
  // In user mode: No organization automatically selected per requirements.
  const [storedOrgId, setStoredOrgId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedOrg = localStorage.getItem('brandguard_selected_org');
      if (savedOrg && availableOrganizations.some((o) => o.id === savedOrg)) {
        return savedOrg;
      }
    }
    return availableOrganizations[0]?.id || 'a0000000-0000-0000-0000-000000000001';
  });

  const [availableBrands, setAvailableBrands] = useState<Brand[]>(() =>
    fallbackBrands.filter((b) => !b.organizationId || b.organizationId === 'a0000000-0000-0000-0000-000000000001')
  );

  const [selectedBrandId, setSelectedBrandIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setSelectedOrganizationId = useCallback((orgId: string) => {
    setStoredOrgId(orgId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('brandguard_selected_org', orgId);
    }
  }, []);

  const selectedOrganizationId = mode === 'organization' ? storedOrgId : '';

  const selectedOrganization = useMemo(() => {
    return (
      availableOrganizations.find((o) => o.id === storedOrgId) ||
      availableOrganizations[0]
    );
  }, [storedOrgId]);

  // Fetch available brands from server
  const refreshBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/brands');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAvailableBrands(json.data);
          return;
        }
      }
    } catch {
      // Use fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBrands();

    const handleBrandCreated = (e: Event) => {
      const customEvent = e as CustomEvent<{ id?: string }>;
      refreshBrands().then(() => {
        if (customEvent.detail?.id) {
          setSelectedBrandIdState(customEvent.detail.id);
        }
      });
    };

    window.addEventListener('brandguard:brand-created', handleBrandCreated);
    return () => {
      window.removeEventListener('brandguard:brand-created', handleBrandCreated);
    };
  }, [refreshBrands]);

  // Initial brand selection from localStorage if valid
  useEffect(() => {
    if (!selectedBrandId && availableBrands.length > 0) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('brandguard_selected_brand') : null;
      if (
        stored &&
        availableBrands.some(
          (b) =>
            b.id.toLowerCase() === stored.toLowerCase() ||
            b.name.toLowerCase() === stored.toLowerCase()
        )
      ) {
        setSelectedBrandIdState(stored);
      }
    }
  }, [availableBrands, selectedBrandId]);

  // Handle brand deletion: if selected brand was removed, clear context
  useEffect(() => {
    if (selectedBrandId && availableBrands.length > 0) {
      const clean = selectedBrandId.toLowerCase().trim();
      const stillExists = availableBrands.some(
        (b) =>
          b.id.toLowerCase() === clean ||
          b.name.toLowerCase() === clean ||
          (b.canonicalDomain && b.canonicalDomain.toLowerCase() === clean)
      );
      if (!stillExists) {
        setSelectedBrandIdState(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('brandguard_selected_brand');
        }
      }
    }
  }, [availableBrands, selectedBrandId]);

  const handleUrlSync = useCallback(
    (urlBrand: string | null) => {
      if (urlBrand && availableBrands.length > 0) {
        const clean = urlBrand.toLowerCase().trim();
        const found = availableBrands.find(
          (b) =>
            b.id.toLowerCase() === clean ||
            b.name.toLowerCase() === clean ||
            (b.canonicalDomain && b.canonicalDomain.toLowerCase() === clean)
        );
        if (found) {
          setSelectedBrandIdState(found.id);
        } else {
          setSelectedBrandIdState(urlBrand);
        }
      }
    },
    [availableBrands]
  );

  // Compute selectedBrand object: returns null if no valid brand selected
  const selectedBrand = useMemo<Brand | null>(() => {
    if (!selectedBrandId) {
      return null;
    }
    const clean = selectedBrandId.toLowerCase().trim();
    const found = availableBrands.find(
      (b) =>
        b.id.toLowerCase() === clean ||
        b.name.toLowerCase() === clean ||
        (b.canonicalDomain && b.canonicalDomain.toLowerCase() === clean)
    );
    return found || null;
  }, [selectedBrandId, availableBrands]);

  const setSelectedBrandId = useCallback(
    (id: string | null) => {
      setSelectedBrandIdState(id);
      if (typeof window !== 'undefined') {
        if (id) {
          localStorage.setItem('brandguard_selected_brand', id);
        } else {
          localStorage.removeItem('brandguard_selected_brand');
        }
      }
    },
    []
  );

  const setSelectedBrand = useCallback(
    (brand: Brand | null) => {
      if (brand) {
        setSelectedBrandId(brand.id);
      } else {
        setSelectedBrandId(null);
      }
    },
    [setSelectedBrandId]
  );

  // Canonical MonitoringContext: selectedBrandId is the single canonical brand context
  const monitoringContext = useMemo<MonitoringContext>(
    () => ({
      mode,
      organizationId: mode === 'organization' ? storedOrgId : undefined,
      brandId: selectedBrand?.id || selectedBrandId || undefined,
    }),
    [mode, storedOrgId, selectedBrand?.id, selectedBrandId]
  );

  const value = useMemo(
    () => ({
      mode,
      setMode,
      selectedOrganizationId,
      selectedOrganization,
      availableOrganizations,
      setSelectedOrganizationId,
      selectedBrandId: selectedBrand?.id || selectedBrandId,
      selectedBrand,
      availableBrands,
      setSelectedBrandId,
      setSelectedBrand,
      refreshBrands,
      isLoading,
      monitoringContext,
    }),
    [
      mode,
      setMode,
      selectedOrganizationId,
      selectedOrganization,
      setSelectedOrganizationId,
      selectedBrandId,
      selectedBrand,
      availableBrands,
      setSelectedBrandId,
      setSelectedBrand,
      refreshBrands,
      isLoading,
      monitoringContext,
    ]
  );

  return (
    <BrandContext.Provider value={value}>
      <Suspense fallback={null}>
        <SearchParamsSync onSync={handleUrlSync} />
      </Suspense>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrandContext() {
  const context = useContext(BrandContext);
  return context || defaultContextValue;
}
