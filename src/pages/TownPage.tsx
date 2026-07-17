import PortalPageHeader from '../components/PortalPageHeader'
import { useSiteData } from '../context/SiteDataContext'
import { portalHref } from '../routing/portal-route.js'
import NotFoundPage from './NotFoundPage'

interface TownPageProps {
  townSlug: string
}

export default function TownPage({ townSlug }: TownPageProps) {
  const { portal } = useSiteData()
  const town = portal.towns.find((item) => item.slug === townSlug)

  if (!town) {
    return <NotFoundPage title="没有找到这座城镇" description="这个城镇尚未登记到牛腩世界目录。" />
  }

  const relatedTowns = portal.towns.filter((item) => item.slug !== town.slug)

  return (
    <div className="portal-page portal-town-page">
      <PortalPageHeader
        eyebrow="MEET THE TOWN"
        title={town.name}
        description={town.subtitle}
        image={town.cover}
        backHref="#/world"
        backLabel="回到牛腩世界"
      >
        <a className="mc-btn mc-btn-primary" href={town.siteUrl}>去城镇主页逛逛</a>
      </PortalPageHeader>

      <section className="portal-town-profile" aria-labelledby="town-profile-title">
        <div className="container portal-town-profile-grid">
          <div className="portal-town-narrative">
            <span className="section-tag pixel-text">PROFILE</span>
            <h2 id="town-profile-title">认识这座城</h2>
            <p>{town.summary}</p>
            <div className="portal-tag-list" aria-label={`${town.name}标签`}>
              {town.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <a className="portal-text-link" href={town.siteUrl}>
              继续走进城镇自己的页面 <span aria-hidden="true">↗</span>
            </a>
          </div>

          <dl className="portal-town-facts">
            {town.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <nav className="portal-related-towns" aria-label="继续探索其他城镇">
        <div className="container">
          <span className="pixel-text">NEXT DESTINATIONS</span>
          <div>
            {relatedTowns.map((item) => (
              <a key={item.slug} href={portalHref('town', item.slug)}>
                <strong>{item.name}</strong>
                <small>{item.subtitle}</small>
                <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
