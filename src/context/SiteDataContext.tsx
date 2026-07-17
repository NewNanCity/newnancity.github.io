import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SiteData } from '../types/SiteData';
import { parseSiteData } from '../types/site-data-validator.js';

const SiteDataContext = createContext<SiteData | null>(null);

async function loadSiteData(signal: AbortSignal): Promise<SiteData> {
  const response = await fetch('/site-data.json', { signal });
  if (!response.ok) {
    throw new Error(`site-data 请求失败: ${response.status}`);
  }
  const payload: unknown = await response.json();
  return parseSiteData(payload);
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);

    loadSiteData(controller.signal)
      .then(setData)
      .catch((loadError: unknown) => {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return;
        }
        console.error('站点数据加载失败', loadError);
        setError(true);
      });

    return () => controller.abort();
  }, [attempt]);

  if (error) {
    return (
      <main className="site-error" role="alert">
        <div className="site-error-inner">
          <p className="pixel-text">连接小镇档案失败</p>
          <button type="button" className="mc-btn mc-btn-primary" onClick={() => setAttempt((value) => value + 1)}>
            重新加载
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <div className="site-loading" role="status" aria-live="polite">
        <div className="site-loading-inner">
          <span className="pixel-text site-loading-text">
            正在读取小镇档案...
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
