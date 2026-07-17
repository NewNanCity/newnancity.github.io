import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSiteData } from '../context/SiteDataContext'
import type { PortalRoute } from '../routing/portal-route.js'
import TravelPanel from './TravelPanel'
import './Navbar.css'

const MOBILE_QUERY = '(max-width: 768px)'

function activeGateway(route: PortalRoute) {
  if (route.page === 'town' || route.page === 'map') return 'world'
  if (['world', 'community', 'archive', 'join'].includes(route.page)) return route.page
  return null
}

interface NavbarProps {
  route: PortalRoute
}

export default function Navbar({ route }: NavbarProps) {
  const { portal } = useSiteData()
  const [scrolled, setScrolled] = useState(false)
  const [activeOverlay, setActiveOverlay] = useState<'menu' | 'travel' | null>(null)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const menuOpen = activeOverlay === 'menu'
  const travelOpen = activeOverlay === 'travel'
  const menuHidden = isMobile && !menuOpen
  const currentGateway = activeGateway(route)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
      if (!event.matches) {
        setActiveOverlay((current) => current === 'menu' ? null : current)
      }
    }

    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    setActiveOverlay(null)
  }, [route.key])

  useEffect(() => {
    if (!menuOpen || !isMobile) return
    const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>('a[href]')
    firstLink?.focus()

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setActiveOverlay(null)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobile, menuOpen])

  useEffect(() => {
    if (activeOverlay === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [activeOverlay])

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isMobile || !menuOpen || event.key !== 'Tab' || !panelRef.current) return

    const links = Array.from(panelRef.current.querySelectorAll<HTMLAnchorElement>('a[href]'))
    if (links.length === 0) return

    const first = links[0]
    const last = links[links.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <nav className={`navbar navbar--${route.page}${scrolled ? ' scrolled' : ''}`} aria-label="主导航">
      <div className="nav-inner">
        <a href="#/" className="nav-logo" onClick={() => setActiveOverlay(null)}>
          <img src="/favicon.ico" alt="" className="nav-logo-img" />
          <span className="nav-logo-text">NewNanCity</span>
        </a>

        <div
          ref={panelRef}
          id="site-navigation-panel"
          className={`nav-links${menuOpen ? ' open' : ''}`}
          aria-hidden={menuHidden || undefined}
          inert={menuHidden || undefined}
          onKeyDown={handlePanelKeyDown}
        >
          <p className="nav-menu-title pixel-text">NEWNAN CITY</p>
          <div className="nav-primary-grid">
            {portal.gateways.map((gateway) => (
              <a
                key={gateway.id}
                className="nav-primary-item"
                href={gateway.href}
                aria-current={currentGateway === gateway.id ? 'page' : undefined}
                onClick={() => setActiveOverlay(null)}
              >
                <span aria-hidden="true">{gateway.icon}</span>
                <span>{gateway.label}</span>
              </a>
            ))}
          </div>

        </div>

        <TravelPanel
          open={travelOpen}
          onOpen={() => setActiveOverlay('travel')}
          onClose={() => setActiveOverlay(null)}
        />

        <button
          ref={toggleRef}
          type="button"
          className={`nav-toggle${menuOpen ? ' active' : ''}`}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          aria-controls="site-navigation-panel"
          onClick={() => setActiveOverlay((current) => current === 'menu' ? null : 'menu')}
        >
          <span /><span /><span />
        </button>

        {isMobile && menuOpen && (
          <div className="nav-backdrop" aria-hidden="true" onClick={() => setActiveOverlay(null)} />
        )}
      </div>
    </nav>
  )
}
