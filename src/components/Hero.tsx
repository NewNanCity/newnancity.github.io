import { useEffect, useMemo, useRef } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import type { HeroStat } from '../types/SiteData';
import './Hero.css';

const START_DATE = new Date('2020-02-02');
const MIN_NOW_DATE = new Date('2026-02-10');

interface ResolvedHeroStat extends HeroStat {
  value: number;
}

function getServerStats() {
  const systemNow = new Date();
  const now = systemNow < MIN_NOW_DATE ? MIN_NOW_DATE : systemNow;
  const days = Math.floor((now.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));

  let years = now.getFullYear() - START_DATE.getFullYear();
  const monthDiff = now.getMonth() - START_DATE.getMonth();
  const dayDiff = now.getDate() - START_DATE.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }

  return { years, days };
}

export default function Hero() {
  const { hero, join } = useSiteData();
  const statsRef = useRef<HTMLDivElement>(null);
  const { years, days } = useMemo(() => getServerStats(), []);
  const backgroundImage = hero.slides[0];

  const displayedStats = useMemo<ResolvedHeroStat[]>(
    () => hero.stats.map((stat) => {
      if (stat.id === 'years') return { ...stat, value: years };
      if (stat.id === 'days') return { ...stat, value: days };
      return { ...stat, value: stat.value ?? 0 };
    }),
    [days, hero.stats, years],
  );

  useEffect(() => {
    const target = statsRef.current;
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      target.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
        element.textContent = element.dataset.count ?? '0';
      });
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
        animateCount(element, Number(element.dataset.count));
      });
      observer.disconnect();
    }, { threshold: 0.45 });

    observer.observe(target);
    return () => observer.disconnect();
  }, [displayedStats]);

  return (
    <>
      <section className="hero" id="hero">
        {backgroundImage && (
          <img
            className="hero-background"
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
          />
        )}
        <div className="hero-overlay" aria-hidden="true" />

        <div className="hero-content container">
          <div className="hero-copy">
            <div className="hero-badge">{hero.badge}</div>
            <h1 className="hero-title">
              <span className="hero-title-welcome">{hero.titleWelcome}</span>
              <span className="hero-title-name pixel-text">{hero.titleName}</span>
            </h1>
            <p className="hero-subtitle">{hero.subtitle}</p>

            <div className="hero-stats" ref={statsRef}>
              {displayedStats.map((stat) => (
                <div key={stat.id ?? stat.description} className="stat-group">
                  <span className="stat-value">
                    <span className="stat-number pixel-text" data-count={stat.value}>0</span>
                    <span className="stat-unit">{stat.unit}</span>
                  </span>
                  <span className="stat-desc">{stat.description}</span>
                </div>
              ))}
            </div>

            <div className="hero-actions">
              <a href="#/join" className="mc-btn mc-btn-primary">
                <span className="btn-icon" aria-hidden="true">▶</span>
                开始旅程
              </a>
              <a href="#/world" className="mc-btn">探索世界</a>
            </div>
          </div>
        </div>
      </section>

      <aside className="hero-status-strip" aria-label="入服小提醒">
        <div className="container hero-status-inner">
          <div className="hero-status-copy">
            <span className="hero-status-live pixel-text">HELLO</span>
            <span>
              <strong>开门之前，先认识一下彼此</strong>
              <small>{join.notice}</small>
            </span>
          </div>
          <a className="hero-status-link" href="#/join">
            看看怎么加入 <span aria-hidden="true">↓</span>
          </a>
        </div>
      </aside>
    </>
  );
}

function animateCount(element: HTMLElement, target: number) {
  const duration = 1400;
  const start = performance.now();

  function update(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
