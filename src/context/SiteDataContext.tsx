import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SiteData } from '../types/SiteData';

const SiteDataContext = createContext<SiteData | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);

  useEffect(() => {
    fetch('/site-data.json')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="site-loading">
        <div className="site-loading-inner">
          <span className="pixel-text" style={{ color: 'var(--color-primary)', fontSize: '0.7rem' }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteData {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider');
  return ctx;
}
