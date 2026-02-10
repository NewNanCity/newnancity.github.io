import { useEffect, useRef, useMemo } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import './Hero.css';

const START_DATE = new Date('2020-02-02');
const MIN_NOW_DATE = new Date('2026-02-10');

function getServerStats() {
  let now = new Date();
  // 防止系统时间错误，不早于 2026.2.10
  if (now < MIN_NOW_DATE) {
    now = MIN_NOW_DATE;
  }

  // 计算天数差
  const daysDiff = Math.floor((now.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));

  // 计算年数 (实际日期差)
  let years = now.getFullYear() - START_DATE.getFullYear();
  const monthDiff = now.getMonth() - START_DATE.getMonth();
  const dayOfMonthDiff = now.getDate() - START_DATE.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayOfMonthDiff < 0)) {
    years--;
  }

  console.log({ years, days: daysDiff });

  return { years, days: daysDiff };
}

export default function Hero() {
  const { hero } = useSiteData();
  const statsRef = useRef<HTMLDivElement>(null);
  const { years, days } = useMemo(() => getServerStats(), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll<HTMLElement>('span > [data-count]').forEach((el) => {
              animateCount(el, Number(el.dataset.count));
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Parallax on scroll
  const bgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 构建转换后的 stats 数据
  const displayedStats = hero.stats.map((s: any) => {
    if (s.id === 'years') return { ...s, value: years };
    if (s.id === 'days') return { ...s, value: days };
    return s;
  });

  return (
    <section className="hero" id="hero">
      {/* Animated gradient layers */}
      <div className="hero-bg-layers" ref={bgRef}>
        <div className="hero-bg-layer hero-bg-layer--1" />
        <div className="hero-bg-layer hero-bg-layer--2" />
        <div className="hero-bg-layer hero-bg-layer--3" />
      </div>
      <div className="hero-bg-grid" />

      <div className="hero-content">
        <div className="hero-badge animate-on-scroll">{hero.badge}</div>
        <h1 className="hero-title animate-on-scroll">
          <span className="hero-title-welcome">{hero.titleWelcome}</span>
          <span className="hero-title-name">{hero.titleName}</span>
        </h1>
        <p className="hero-subtitle animate-on-scroll">{hero.subtitle}</p>

        <div className="hero-stats animate-on-scroll" ref={statsRef}>
          {displayedStats.map((s: any, i: number) => (
            <div key={i} className="stat-group">
              <span><span className="stat-number pixel-text" data-count={s.value}>0</span>
              <span className="stat-unit">{s.unit}</span></span>
              <span className="stat-desc">{s.description}</span>
            </div>
          ))}
        </div>

        <div className="hero-actions animate-on-scroll">
          <a href="#join" className="mc-btn mc-btn-primary">
            <span className="btn-icon">▶</span> 开始旅程
          </a>
          <a href="#showcase" className="mc-btn">了解更多 ↓</a>
        </div>

        <div className="hero-server-status animate-on-scroll">
          <img
            src="https://api.mcstatus.io/v2/widget/java/minecraft.newnan.city?dark=true&rounded=true"
            alt="服务器状态"
            loading="lazy"
            className="server-widget"
          />
        </div>
      </div>

      <div className="hero-scroll-hint">
        <div className="scroll-mouse"><div className="scroll-wheel" /></div>
      </div>
    </section>
  );
}

function animateCount(el: HTMLElement, target: number) {
  const duration = 2000;
  const start = performance.now();
  function update(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
