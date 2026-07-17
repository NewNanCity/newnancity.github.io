import HomeLiveFeed from '../components/HomeLiveFeed'
import Hero from '../components/Hero'
import { useSiteData } from '../context/SiteDataContext'

export default function PortalHome() {
  const { portal, spirit } = useSiteData()

  return (
    <>
      <Hero />
      <HomeLiveFeed />

      <section className="portal-gateways" aria-labelledby="portal-gateways-title">
        <div className="container">
          <header className="portal-section-heading">
            <div>
              <span className="section-tag pixel-text">PORTAL</span>
              <h2 id="portal-gateways-title">今天想去哪里？</h2>
            </div>
            <p>城镇在生长，故事也在继续。挑一个方向，沿着方块铺成的路慢慢逛。</p>
          </header>

          <nav className="portal-gateway-grid" aria-label="门户一级入口">
            {portal.gateways.map((gateway) => (
              <a
                key={gateway.id}
                className={`portal-gateway portal-gateway--${gateway.id}`}
                href={gateway.href}
              >
                <img src={gateway.image} alt="" aria-hidden="true" />
                <span className="portal-gateway-shade" aria-hidden="true" />
                <span className="portal-gateway-content">
                  <span className="portal-gateway-meta">
                    <span className="portal-gateway-icon" aria-hidden="true">{gateway.icon}</span>
                    <span className="pixel-text">{gateway.eyebrow}</span>
                  </span>
                  <strong>{gateway.label}</strong>
                  <small>{gateway.description}</small>
                  <span className="portal-gateway-arrow" aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="portal-ecosystem" aria-labelledby="portal-ecosystem-title">
        <div className="container">
          <header className="portal-ecosystem-header">
            <div>
              <span className="section-tag pixel-text">NEWNAN NETWORK</span>
              <h2 id="portal-ecosystem-title">牛腩生态，接着逛</h2>
            </div>
            <p>完整名册、百科、皮肤和身份服务，都从这里继续相连。</p>
          </header>
          <nav className="portal-ecosystem-grid" aria-label="牛腩生态常用入口">
            {portal.ecosystem.map((item) => (
              <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">
                <span className="portal-ecosystem-icon" aria-hidden="true">{item.icon}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="portal-home-spirit" aria-labelledby="portal-home-spirit-title">
        <div className="container portal-home-spirit-grid">
          <div className="portal-home-spirit-copy">
            <span className="section-tag pixel-text">OUR HOME</span>
            <h2 id="portal-home-spirit-title">有你，才叫牛腩</h2>
            <blockquote>{spirit.quote}</blockquote>
            <a href="#/archive">去看看我们一起走过的路 <span aria-hidden="true">→</span></a>
          </div>
          <div className="portal-home-values">
            {spirit.values.map((value) => (
              <article key={value.title}>
                <span aria-hidden="true">{value.icon}</span>
                <div>
                  <h3>{value.title}</h3>
                  <p>{value.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
