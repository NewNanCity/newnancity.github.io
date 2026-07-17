import PortalPageHeader from '../components/PortalPageHeader'
import { useSiteData } from '../context/SiteDataContext'
import { portalHref } from '../routing/portal-route.js'

export default function WorldPage() {
  const { portal } = useSiteData()
  const gateway = portal.gateways.find((item) => item.id === 'world')!
  const fullTownRoster = portal.ecosystem.find((item) => item.id === 'towns')!
  const localTownDirectory = portal.townDirectory ?? []
  const hasLocalTownDirectory = localTownDirectory.length > 0

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
        <a className="mc-btn" href={fullTownRoster.href} target="_blank" rel="noopener noreferrer">
          完整小镇名册 <span aria-hidden="true">↗</span>
        </a>
      </PortalPageHeader>

      <div className="portal-content-section">
        <div className="container">
          {hasLocalTownDirectory && (
            <section aria-labelledby="local-town-directory-title">
              <header className="portal-section-heading portal-section-heading--compact">
                <div>
                  <span className="section-tag pixel-text">LOCAL TOWN SITES</span>
                  <h2 id="local-town-directory-title">城镇主页，从这里出发</h2>
                </div>
                <div className="portal-directory-heading-aside">
                  <p>这里收好本站能直接到达的城镇主页；更广的城镇与聚落记录仍在完整名册里持续更新。</p>
                  <a href={fullTownRoster.href} target="_blank" rel="noopener noreferrer">
                    查看完整名册 <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </header>

              <nav className="portal-town-directory" aria-label="本站城镇主页">
                {localTownDirectory.map((town, index) => (
                  <a
                    className="portal-town-directory-item"
                    data-status={town.status}
                    href={town.href}
                    key={town.id}
                  >
                    <span className="portal-town-directory-index pixel-text" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="portal-town-directory-copy">
                      <span className="portal-town-directory-meta">
                        <span>{town.status === 'open' ? '主页开放' : '资料整理中'}</span>
                        <small>{town.meta}</small>
                      </span>
                      <strong>{town.name}</strong>
                      <small>{town.summary}</small>
                    </span>
                    <span className="portal-town-directory-arrow" aria-hidden="true">→</span>
                  </a>
                ))}
              </nav>
            </section>
          )}

          <section
            className={hasLocalTownDirectory ? 'portal-featured-towns' : undefined}
            aria-labelledby="town-stories-title"
          >
            <header className="portal-section-heading portal-section-heading--compact">
              <div>
                <span className="section-tag pixel-text">TOWN STORIES</span>
                <h2 id="town-stories-title">先读三座城的故事</h2>
              </div>
              <p>这三座城已经整理了更完整的名片。读完故事，也可以直接走进它自己的主页。</p>
            </header>

            <div className="portal-town-grid" role="list">
              {portal.towns.map((town, index) => (
                <article className="portal-town-card" key={town.slug} role="listitem">
                  <a className="portal-town-card-media" href={portalHref('town', town.slug)}>
                    <img src={town.cover} alt="" aria-hidden="true" loading="lazy" decoding="async" />
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
                    <div className="portal-town-card-actions">
                      <a className="portal-text-link" href={portalHref('town', town.slug)}>
                        认识这座城 <span aria-hidden="true">→</span>
                      </a>
                      <a className="portal-text-link portal-text-link--quiet" href={town.siteUrl}>
                        直接进主页 <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="portal-rail-band" aria-labelledby="rail-title">
        <div className="container portal-rail-grid">
          <div className="portal-rail-visual animate-on-scroll" aria-hidden="true">
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
