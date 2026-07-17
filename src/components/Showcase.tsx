import { useSiteData } from '../context/SiteDataContext';
import './Showcase.css';

const FEATURED_TITLES = new Set(['自由的玩法', '友善的氛围', '敬业的管理', '城镇经营']);

export default function Showcase() {
  const { showcase } = useSiteData();
  const featuredCards = showcase.cards.filter((card) => FEATURED_TITLES.has(card.title));
  const supportingCards = showcase.cards.filter((card) => !FEATURED_TITLES.has(card.title));

  return (
    <section id="showcase" className="section showcase-section">
      <div className="container">
        <div className="showcase-header animate-on-scroll">
          <div className="showcase-heading">
            <span className="section-tag pixel-text">ABOUT</span>
            <h2 className="section-title">关于牛腩</h2>
            <div className="section-line showcase-line" />
          </div>
          <div className="showcase-summary">
            <p className="showcase-intro">{showcase.intro}</p>
            <div className="showcase-badges" aria-label="社区原则">
              {showcase.badges.map((badge) => (
                <span key={badge.label} className="showcase-badge">
                  <span aria-hidden="true">{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="showcase-featured-grid">
          {featuredCards.map((card, index) => (
            <article key={card.title} className="showcase-feature animate-on-scroll">
              <span className="showcase-feature-index pixel-text" aria-hidden="true">
                0{index + 1}
              </span>
              <span className="showcase-feature-icon" aria-hidden="true">{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </article>
          ))}
        </div>

        <div className="showcase-supporting-grid" aria-label="更多社区特色">
          {supportingCards.map((card) => (
            <article key={card.title} className="showcase-supporting-item animate-on-scroll">
              <span className="showcase-supporting-icon" aria-hidden="true">{card.icon}</span>
              <div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
