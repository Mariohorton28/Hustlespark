import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Branding = {
  primary: string;          // hex like #7C3AED
  logoUrl?: string;         // global app logo (header)
  monetizeLogoUrl?: string; // special logo for Monetize tab
};

const DEFAULT_BRAND: Branding = {
  primary: '#7C3AED',
  // ✅ Set your provided PNG as the default for both
  logoUrl: 'https://i.imgur.com/PkgyaIc.png',
  monetizeLogoUrl: 'https://i.imgur.com/PkgyaIc.png',
};

const KEY = 'hs:branding';

const BrandingContext = createContext<{
  brand: Branding;
  setBrand: (b: Branding) => Promise<void>;
}>({
  brand: DEFAULT_BRAND,
  setBrand: async () => {},
});

export function BrandingProvider({ children }: React.PropsWithChildren<{}>) {
  const [brand, setBrandState] = useState<Branding>(DEFAULT_BRAND);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setBrandState({ ...DEFAULT_BRAND, ...JSON.parse(raw) });
      } catch {}
    })();
  }, []);

  async function setBrand(next: Branding) {
    setBrandState(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  return (
    <BrandingContext.Provider value={{ brand, setBrand }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}