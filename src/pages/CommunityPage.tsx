import PortalPageHeader from '../components/PortalPageHeader'
import { useSiteData } from '../context/SiteDataContext'

export default function CommunityPage() {
  const { portal } = useSiteData()
  const gateway = portal.gateways.find((item) => item.id === 'community')!
  const communityUpdates = portal.updates.filter((item) => item.category === 'community')

  return (
    <div className="portal-page portal-community-page">
      <PortalPageHeader
        eyebrow="COMMUNITY BOARD"
        title="社区"
        description={portal.community.intro}
        image={gateway.image}
      />

      <section className="portal-content-section" aria-labelledby="community-links-title">
        <div className="container portal-community-grid">
          <div>
            <header className="portal-section-heading portal-section-heading--stacked">
              <div>
                <span className="section-tag pixel-text">CHANNELS</span>
                <h2 id="community-links-title">社区入口</h2>
              </div>
              <p>想看新闻、找视频，或者去频道里和大家打个招呼，都可以从这里出发。</p>
            </header>

            <div className="portal-community-links">
              {portal.community.links.map((link) => {
                const external = link.kind === 'external'
                return (
                  <a
                    key={link.title}
                    href={link.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    <span className="portal-community-icon" aria-hidden="true">{link.icon}</span>
                    <span>
                      <strong>{link.title}</strong>
                      <small>{link.description}</small>
                    </span>
                    <span aria-hidden="true">{external ? '↗' : '→'}</span>
                  </a>
                )
              })}
            </div>
          </div>

          <aside className="portal-community-update" aria-label="最近社区动态">
            <span className="pixel-text">LATEST</span>
            {communityUpdates.length > 0 ? communityUpdates.map((update) => (
              <a href={update.href} key={update.title}>
                <time dateTime={update.date}>{update.date}</time>
                <strong>{update.title}</strong>
                <small>{update.summary}</small>
              </a>
            )) : <p>这两天很安静，过会儿再来坐坐。</p>}
          </aside>
        </div>
      </section>

      <section className="portal-creator-band" aria-labelledby="creator-title">
        <div className="container">
          <span className="portal-plan-state pixel-text">PLAYER MADE</span>
          <div>
            <h2 id="creator-title">{portal.community.creator.title}</h2>
            <p>{portal.community.creator.description}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
