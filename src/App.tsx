import { useEffect, useState } from 'react'
import EasterEggs from './components/EasterEggs'
import Footer from './components/Footer'
import Map from './components/Map'
import Navbar from './components/Navbar'
import ParticleCanvas from './components/ParticleCanvas'
import SEO from './components/SEO'
import { SiteDataProvider, useSiteData } from './context/SiteDataContext'
import { useScrollAnimations } from './hooks/useScrollAnimations'
import ArchivePage from './pages/ArchivePage'
import CommunityPage from './pages/CommunityPage'
import JoinPage from './pages/JoinPage'
import NotFoundPage from './pages/NotFoundPage'
import PortalHome from './pages/PortalHome'
import TownPage from './pages/TownPage'
import WorldPage from './pages/WorldPage'
import { parsePortalRoute, type PortalRoute } from './routing/portal-route.js'
import './styles/portal.css'

function renderPortalPage(route: PortalRoute) {
  switch (route.page) {
    case 'home':
      return <PortalHome />
    case 'world':
      return <WorldPage />
    case 'community':
      return <CommunityPage />
    case 'archive':
      return <ArchivePage />
    case 'join':
      return <JoinPage />
    case 'town':
      return <TownPage townSlug={route.townSlug} />
    case 'not-found':
      return <NotFoundPage />
    case 'map':
      return null
  }
}

function AppContent() {
  const { portal } = useSiteData()
  const [route, setRoute] = useState<PortalRoute>(() => parsePortalRoute(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => setRoute(parsePortalRoute(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [route.key])

  useScrollAnimations(route.key)

  const town = route.page === 'town'
    ? portal.towns.find((item) => item.slug === route.townSlug)
    : undefined
  const routeNotFound = route.page === 'not-found' || (route.page === 'town' && !town)
  const title = town
    ? `${town.name} | 牛腩世界`
    : route.page === 'town'
      ? '城镇档案未找到 | 牛腩世界'
    : route.page === 'world'
      ? '牛腩世界 | 城镇、轨道与地图'
      : route.page === 'community'
        ? '牛腩社区 | 新闻、创作与伙伴们'
        : route.page === 'archive'
          ? '牛腩档案 | 六年历程与影像'
          : route.page === 'join'
            ? '加入牛腩小镇'
            : route.page === 'map'
              ? '牛腩世界实时地图'
              : route.page === 'not-found'
                ? '页面未找到 | 牛腩小镇'
              : undefined

  if (route.page === 'map') {
    return (
      <>
        <SEO title={title} />
        <Navbar route={route} />
        <Map />
      </>
    )
  }

  return (
    <>
      <SEO title={title} noIndex={routeNotFound} />
      <ParticleCanvas />
      <Navbar route={route} />
      <main id="main-content">
        <div className="portal-route-frame" key={route.key}>{renderPortalPage(route)}</div>
      </main>
      <Footer />
      <EasterEggs />
    </>
  )
}

export default function App() {
  return (
    <SiteDataProvider>
      <AppContent />
    </SiteDataProvider>
  )
}
