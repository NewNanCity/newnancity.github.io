import { useSiteData } from '../context/SiteDataContext';
import './Showcase.css';

export default function Showcase() {
  const { showcase } = useSiteData();

  return (
    <section id="showcase" className="section showcase-section">
      <div className="container">
        <div className="showcase-header animate-on-scroll">
          <span className="section-tag pixel-text">ABOUT</span>
          <h2 className="section-title">关于牛腩</h2>
          <div className="section-line" />
          <p className="showcase-intro">{showcase.intro}</p>
          <div className="showcase-badges">
            {showcase.badges.map((b) => (
              <span key={b.label} className="showcase-badge">
                <span className="showcase-badge-icon">{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className="showcase-grid">
          {showcase.cards.map((card, i) => (
            <div
              key={card.title}
              className="showcase-card mc-slot animate-on-scroll"
              style={{ transitionDelay: `${(i % 5) * 0.06}s` } as React.CSSProperties}
            >
              <span className="showcase-card-icon">{card.icon}</span>
              <div className="showcase-card-body">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
