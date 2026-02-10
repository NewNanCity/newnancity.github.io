import { useState, useEffect, useRef, useCallback } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import type { TVCard } from '../types/SiteData';
import './RetroTV.css';

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  event:  { color: '#f6a623', label: '🗓 事件' },
  person: { color: '#5dba4f', label: '👤 人物' },
  place:  { color: '#5b9aff', label: '📍 地点' },
  meme:   { color: '#ff7b9c', label: '😂 名梗' },
};

interface DanmakuItem {
  id: number;
  card: TVCard;
  lane: number;
  duration: number;
  createdAt: number;
}

export default function RetroTV() {
  const { tv } = useSiteData();
  const years = Object.keys(tv.channels).sort();
  const [activeYear, setActiveYear] = useState(years[years.length - 1] || '2026');
  const [danmakuItems, setDanmakuItems] = useState<DanmakuItem[]>([]);
  const [switching, setSwitching] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [screenW, setScreenW] = useState(800);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Track screen width for danmaku travel distance
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScreenW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const LANES = 5;

  const spawnDanmaku = useCallback((cards: TVCard[]) => {
    if (cards.length === 0) return;
    const card = cards[Math.floor(Math.random() * cards.length)];
    const lane = Math.floor(Math.random() * LANES);
    const duration = 10 + Math.random() * 6; // 10-16s
    const id = ++idRef.current;
    const createdAt = Date.now();
    setDanmakuItems((prev) => {
      // Keep max 15 items to prevent memory bloat
      const trimmed = prev.length > 14 ? prev.slice(-10) : prev;
      return [...trimmed, { id, card, lane, duration, createdAt }];
    });
  }, []);

  // Switch channel — guard against same-year clicks
  const switchChannel = useCallback((year: string) => {
    if (year === activeYear) return;
    setSwitching(true);
    setDanmakuItems([]);
    setExpanded(null);
    setTimeout(() => {
      setActiveYear(year);
      setSwitching(false);
    }, 400);
  }, [activeYear]);

  // Spawn danmaku periodically
  useEffect(() => {
    const cards = tv.channels[activeYear] || [];
    if (switching || cards.length === 0) return;

    // Immediate first few
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      setTimeout(() => spawnDanmaku(cards), i * 600);
    }

    timerRef.current = setInterval(() => {
      spawnDanmaku(cards);
    }, 2000 + Math.random() * 1500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeYear, switching, tv.channels, spawnDanmaku]);

  // Clean up finished animations using real timestamps
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDanmakuItems((prev) =>
        prev.filter((item) => (now - item.createdAt) / 1000 < item.duration + 2)
      );
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <section id="history" className="section retrotv-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-tag pixel-text">HISTORY</span>
          <h2 className="section-title">六年历程</h2>
          <div className="section-line" />
          <p className="section-desc">切换频道，回顾牛腩每一年的故事</p>
        </div>

        <div className="tv-wrapper animate-on-scroll">
          {/* TV body */}
          <div className="tv-body">
            {/* Screen */}
            <div
              className="tv-screen"
              ref={screenRef}
              style={{ '--screen-w': `${screenW}px` } as React.CSSProperties}
              onClick={() => setExpanded(null)}
            >
              {/* Scanline overlay */}
              <div className="tv-scanlines" />
              {/* Noise overlay for channel switch */}
              {switching && <div className="tv-noise" />}
              {/* CRT vignette */}
              <div className="tv-vignette" />

              {/* Year indicator */}
              <div className="tv-year-display pixel-text">{activeYear}</div>

              {/* Danmaku layer */}
              <div className="tv-danmaku-layer">
                {danmakuItems.map((item) => {
                  const cfg = TYPE_CONFIG[item.card.type] || TYPE_CONFIG.event;
                  const top = (item.lane / LANES) * 80 + 5;
                  return (
                    <div
                      key={item.id}
                      className={`tv-danmaku-card${expanded === item.id ? ' tv-danmaku-card--expanded' : ''}`}
                      style={{
                        top: `${top}%`,
                        animationDuration: `${item.duration}s`,
                        borderColor: cfg.color,
                      } as React.CSSProperties}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(expanded === item.id ? null : item.id);
                      }}
                    >
                      <span className="tv-danmaku-type" style={{ color: cfg.color } as React.CSSProperties}>
                        {cfg.label}
                      </span>
                      <span className="tv-danmaku-title">{item.card.title}</span>
                      {item.card.date && (
                        <span className="tv-danmaku-date">{item.card.date}</span>
                      )}
                      {expanded === item.id && (
                        <div className="tv-danmaku-desc">{item.card.desc}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {!switching && danmakuItems.length === 0 && (
                <div className="tv-empty">
                  <span className="pixel-text">📡 调台中...</span>
                </div>
              )}
            </div>

            {/* Channel dial on the right */}
            <div className="tv-channels">
              <div className="tv-channels-label pixel-text">CH</div>
              {years.map((year) => (
                <button
                  key={year}
                  className={`tv-channel-btn${year === activeYear ? ' tv-channel-btn--active' : ''}`}
                  onClick={() => switchChannel(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* TV stand */}
          <div className="tv-stand">
            <div className="tv-stand-leg" />
            <div className="tv-stand-leg" />
          </div>
        </div>
      </div>
    </section>
  );
}
