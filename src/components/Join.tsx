import { useSiteData } from '../context/SiteDataContext';
import './Join.css';

export default function Join() {
  const { join } = useSiteData();

  return (
    <section id="join" className="section join-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-tag pixel-text">JOIN US</span>
          <h2 className="section-title">{join.title}</h2>
          <div className="section-line" />
          <p className="section-desc">{join.subtitle}</p>
        </div>

        <div className="join-steps">
          {join.steps.map((s, i) => (
            <div key={i} className="join-step animate-on-scroll">
              <span className="join-step-num">{s.num}</span>
              <div className="join-step-body">
                <h3>{s.title}</h3>
                <div className="join-step-desc-row">
                  <p>{s.desc}</p>
                  {s.link && (
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="join-step-link">
                      前往 →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

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
