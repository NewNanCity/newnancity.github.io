import { useState, type KeyboardEvent } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import type { TVCard } from '../types/SiteData';
import './RetroTV.css';

const TYPE_CONFIG: Record<TVCard['type'], { icon: string; label: string }> = {
  event: { icon: '🗓', label: '事件' },
  person: { icon: '👤', label: '人物' },
  place: { icon: '📍', label: '地点' },
  meme: { icon: '💬', label: '名梗' },
};

export default function RetroTV() {
  const { tv } = useSiteData();
  const years = Object.keys(tv.channels).sort((a, b) => Number(a) - Number(b));
  const [activeYear, setActiveYear] = useState(years[years.length - 1] ?? '2026');
  const stories = tv.channels[activeYear] ?? [];

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % years.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + years.length) % years.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = years.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const nextYear = years[nextIndex];
    setActiveYear(nextYear);
    document.getElementById(`history-tab-${nextYear}`)?.focus();
  };

  return (
    <section id="history" className="section retrotv-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-tag pixel-text">HISTORY</span>
          <h2 className="section-title">六年历程</h2>
          <div className="section-line" />
          <p className="section-desc">选择年份，翻阅牛腩一路走来的社区档案</p>
        </div>

        <div className="tv-wrapper animate-on-scroll">
          <div className="tv-channel-tabs" role="tablist" aria-label="历史年份">
            {years.map((year, index) => (
              <button
                key={year}
                id={`history-tab-${year}`}
                type="button"
                role="tab"
                aria-selected={year === activeYear}
                aria-controls="history-panel"
                tabIndex={year === activeYear ? 0 : -1}
                className={`tv-channel-btn${year === activeYear ? ' tv-channel-btn--active' : ''}`}
                onClick={() => setActiveYear(year)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="tv-body">
            <div className="tv-bezel-top" aria-hidden="true">
              <span className="tv-power-light" />
              <span className="pixel-text">NEWNAN COMMUNITY ARCHIVE</span>
            </div>

            <div
              id="history-panel"
              className="tv-screen"
              role="tabpanel"
              aria-labelledby={`history-tab-${activeYear}`}
              tabIndex={0}
            >
              <header className="tv-screen-header">
                <div>
                  <span className="tv-screen-kicker pixel-text">CHANNEL</span>
                  <h3 className="pixel-text">{activeYear}</h3>
                </div>
                <span className="tv-story-count">{stories.length} 条档案</span>
              </header>

              <div className="tv-story-grid">
                {stories.map((story, index) => {
                  const config = TYPE_CONFIG[story.type];
                  return (
                    <article
                      key={`${story.title}-${story.date ?? index}`}
                      className={`tv-story tv-story--${story.type}`}
                    >
                      <div className="tv-story-meta">
                        <span className="tv-story-type">
                          <span aria-hidden="true">{config.icon}</span>
                          {config.label}
                        </span>
                        {story.date && <time>{story.date}</time>}
                      </div>
                      <h4>{story.title}</h4>
                      <p>{story.desc}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="tv-stand" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
