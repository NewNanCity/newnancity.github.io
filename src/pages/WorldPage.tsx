import PortalPageHeader from '../components/PortalPageHeader'
import { useSiteData } from '../context/SiteDataContext'
import { portalHref } from '../routing/portal-route.js'

export default function WorldPage() {
  const { portal } = useSiteData()
  const gateway = portal.gateways.find((item) => item.id === 'world')!
  const townDirectory = portal.ecosystem.find((item) => item.id === 'towns')!

  return (
    <div className="portal-page portal-world-page">
      <PortalPageHeader
        eyebrow="WORLD DIRECTORY"
        title="牛腩世界"
        description="一座座城镇和一条条铁路，把大家的生活连成了同一个不断生长的世界。"
        image={gateway.image}
      >
        <a className="mc-btn mc-btn-primary" href="#/map">打开实时地图</a>
        <a className="mc-btn" href="/towns/town-rate.html">查看城镇评级</a>
        <a className="mc-btn" href={townDirectory.href} target="_blank" rel="noopener noreferrer">
          完整小镇名册 <span aria-hidden="true">↗</span>
        </a>
      </PortalPageHeader>

      <section className="portal-content-section" aria-labelledby="town-directory-title">
        <div className="container">
          <header className="portal-section-heading portal-section-heading--compact">
            <div>
              <span className="section-tag pixel-text">TOWNS</span>
              <h2 id="town-directory-title">先认识几座城</h2>
            </div>
            <p>每座城都有自己的脾气。先看看城镇名片，喜欢的话就去它自己的主页继续逛。</p>
          </header>

          <div className="portal-town-grid">
            {portal.towns.map((town, index) => (
              <article className="portal-town-card" key={town.slug}>
                <a className="portal-town-card-media" href={portalHref('town', town.slug)}>
                  <img src={town.cover} alt="" aria-hidden="true" />
                  <span className="portal-town-index pixel-text" aria-hidden="true">
                    0{index + 1}
                  </span>
                </a>
                <div className="portal-town-card-copy">
                  <span>{town.subtitle}</span>
                  <h3><a href={portalHref('town', town.slug)}>{town.name}</a></h3>
                  <p>{town.summary}</p>
                  <div className="portal-tag-list" aria-label={`${town.name}标签`}>
                    {town.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <a className="portal-text-link" href={portalHref('town', town.slug)}>
                    认识这座城 <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-rail-band" aria-labelledby="rail-title">
        <div className="container portal-rail-grid">
          <div className="portal-rail-visual" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <div className="portal-rail-copy">
            <span className="section-tag pixel-text">RAIL & MAP</span>
            <h2 id="rail-title">沿着交通网络探索世界</h2>
            <p>铁路把主城、城镇和远方聚落串在一起。打开地图挑一座站，下一趟旅程就从那里开始。</p>
            <div className="portal-inline-actions">
              <a href="#/map">实时地图 <span aria-hidden="true">↗</span></a>
              <a href="/towns/town-rate.html">城镇评级 <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
