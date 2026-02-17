import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SiteData } from '../types/SiteData';

const SiteDataContext = createContext<SiteData | null>(null);

/**
 * 智能加载 site-data，优先使用压缩版本
 */
async function loadSiteData(): Promise<SiteData> {
  // 尝试加载 .gz 版本（更小）
  try {
    const response = await fetch('/site-data.json.gz');
    if (response.ok) {
      // 如果浏览器支持 CompressionStream，自动解压
      if ('CompressionStream' in globalThis) {
        const buffer = await response.arrayBuffer();
        const readable = new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
          },
        });
        const decompressed = await new Response(
          readable.pipeThrough(
            new (CompressionStream as any)('gzip', 'decompress')
          )
        ).json();
        return decompressed;
      }
      // 否则 CDN 已经自动解压（Content-Encoding: gzip）
      return response.json();
    }
  } catch {
    // .gz 版本不可用，继续使用原始版本
  }

  // 回退到原始 JSON
  const response = await fetch('/site-data.json');
  return response.json();
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);

  useEffect(() => {
    loadSiteData()
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="site-loading">
        <div className="site-loading-inner">
          <span className="pixel-text site-loading-text">
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
