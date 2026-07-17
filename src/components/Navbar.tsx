import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSiteData } from '../context/SiteDataContext'
import type { PortalRoute } from '../routing/portal-route.js'
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
  const { nav, portal } = useSiteData()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const menuHidden = isMobile && !open
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
      if (!event.matches) setOpen(false)
    }

    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [route.key])

  useEffect(() => {
    if (!open || !isMobile) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>('a[href]')
    firstLink?.focus()

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobile, open])

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isMobile || !open || event.key !== 'Tab' || !panelRef.current) return

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
        <a href="#/" className="nav-logo" onClick={() => setOpen(false)}>
          <img src="/favicon.ico" alt="" className="nav-logo-img" />
          <span className="nav-logo-text">NewNanCity</span>
        </a>

        <button
          ref={toggleRef}
          type="button"
          className={`nav-toggle${open ? ' active' : ''}`}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          aria-controls="site-navigation-panel"
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>

        {isMobile && open && (
          <div className="nav-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
        )}

        <div
          ref={panelRef}
          id="site-navigation-panel"
          className={`nav-links${open ? ' open' : ''}`}
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
                onClick={() => setOpen(false)}
              >
                <span aria-hidden="true">{gateway.icon}</span>
                <span>{gateway.label}</span>
              </a>
            ))}
          </div>

          {isMobile && (
            <div className="nav-mobile-utilities">
              <p className="pixel-text">QUICK TRAVEL</p>
              <div>
                {nav.links.map((link) => {
                  const internal = link.url.startsWith('#')
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target={internal ? undefined : '_blank'}
                      rel={internal ? undefined : 'noopener noreferrer'}
                      onClick={() => setOpen(false)}
                    >
                      <span aria-hidden="true">{link.icon}</span>
                      <span>{link.label}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {!isMobile && (
          <details className="nav-tools">
            <summary aria-label="更多入口" title="更多入口">•••</summary>
            <div className="nav-tools-menu">
              <p className="pixel-text">QUICK TRAVEL</p>
              {nav.links.map((link) => {
                const internal = link.url.startsWith('#')
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target={internal ? undefined : '_blank'}
                    rel={internal ? undefined : 'noopener noreferrer'}
                  >
                    <span aria-hidden="true">{link.icon}</span>
                    <span>{link.label}</span>
                    <span aria-hidden="true">{internal ? '→' : '↗'}</span>
                  </a>
                )
              })}
            </div>
          </details>
        )}
      </div>
    </nav>
  )
}
