import { useSiteData } from '../context/SiteDataContext';
import type { JoinStep } from '../types/SiteData';
import './Join.css';

interface JoinPhase {
  label: string;
  title: string;
  steps: JoinStep[];
}

export default function Join() {
  const { join } = useSiteData();
  const phases: JoinPhase[] = [
    { label: 'PHASE 01', title: '准备', steps: join.steps.slice(0, 3) },
    { label: 'PHASE 02', title: '审核', steps: join.steps.slice(3, 6) },
    { label: 'PHASE 03', title: '进入', steps: join.steps.slice(6) },
  ];

  return (
    <section id="join" className="section join-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-tag pixel-text">JOIN US</span>
          <h2 className="section-title">{join.title}</h2>
          <div className="section-line" />
          <p className="section-desc">{join.subtitle}</p>
        </div>

        <div className="join-phases">
          {phases.map((phase) => (
            <section key={phase.label} className="join-phase animate-on-scroll">
              <header className="join-phase-header">
                <span className="join-phase-label pixel-text">{phase.label}</span>
                <h3>{phase.title}</h3>
              </header>

              <ol className="join-step-list">
                {phase.steps.map((step) => (
                  <li key={step.num} className="join-step">
                    <span className="join-step-num pixel-text" aria-hidden="true">{step.num}</span>
                    <div className="join-step-body">
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                      {step.link && (
                        <a href={step.link} target="_blank" rel="noopener noreferrer" className="join-step-link">
                          打开链接 <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className="join-notice animate-on-scroll" aria-label="安全提示">
          <span className="join-notice-icon" aria-hidden="true">🛡️</span>
          <div>
            <strong>服务器地址不会公开展示</strong>
            <p>{join.notice}</p>
          </div>
        </aside>

        <div className="join-cta animate-on-scroll">
          <a
            href={join.ctaPrimary.url}
            className="mc-btn mc-btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {join.ctaPrimary.label}
          </a>
          <a
            href={join.ctaSecondary.url}
            className="mc-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            {join.ctaSecondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
