import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import type {
  PortalTown,
  PortalTownDirectoryEntry,
  PortalWorldAtlas,
} from '../types/SiteData'
import './WorldAtlas.css'

const PARALLAX_QUERY = '(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

interface WorldAtlasProps {
  atlas: PortalWorldAtlas
  townDirectory: PortalTownDirectoryEntry[]
  featuredTowns: PortalTown[]
  fullTownRosterHref: string
}

interface AtlasNodeView {
  town: PortalTownDirectoryEntry
  x: number
  y: number
  depth: number
  cover?: string
}

interface AtlasNodeStyle extends CSSProperties {
  '--atlas-node-x': string
  '--atlas-node-y': string
  '--atlas-node-depth': string
  '--atlas-node-order': number
}

function townIdFromRef(targetRef: `town:${string}`): string {
  return targetRef.slice('town:'.length)
}

export default function WorldAtlas({
  atlas,
  townDirectory,
  featuredTowns,
  fullTownRosterHref,
}: WorldAtlasProps) {
  const atlasRef = useRef<HTMLElement>(null)
  const boundsRef = useRef<DOMRect | null>(null)
  const frameRef = useRef<number | null>(null)
  const parallaxEnabledRef = useRef(false)
  const nodes = useMemo<AtlasNodeView[]>(() => atlas.nodes.flatMap((node) => {
    const townId = townIdFromRef(node.targetRef)
    const town = townDirectory.find((entry) => entry.id === townId)
    if (!town) return []

    return [{
      town,
      x: node.x,
      y: node.y,
      depth: node.depth,
      cover: featuredTowns.find((entry) => entry.slug === townId)?.cover,
    }]
  }), [atlas.nodes, featuredTowns, townDirectory])
  const [activeTownId, setActiveTownId] = useState(nodes[0]?.town.id ?? '')
  const [previewTownId, setPreviewTownId] = useState<string | null>(null)
  const activeNode = nodes.find((node) => node.town.id === activeTownId) ?? nodes[0]
  const previewCover = previewTownId
    ? nodes.find((node) => node.town.id === previewTownId)?.cover
    : undefined

  const resetParallax = () => {
    boundsRef.current = null
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    const element = atlasRef.current
    if (!element) return
    element.style.setProperty('--atlas-scene-x', '0px')
    element.style.setProperty('--atlas-scene-y', '0px')
    element.style.setProperty('--atlas-plane-x', '0px')
    element.style.setProperty('--atlas-plane-y', '0px')
    element.style.setProperty('--atlas-nav-x', '0px')
    element.style.setProperty('--atlas-nav-y', '0px')
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(PARALLAX_QUERY)
    const updatePreference = () => {
      parallaxEnabledRef.current = mediaQuery.matches
      if (!mediaQuery.matches) resetParallax()
    }
    const handleVisibilityChange = () => {
      if (document.hidden) resetParallax()
    }

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    window.addEventListener('resize', resetParallax, { passive: true })
    window.addEventListener('scroll', resetParallax, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mediaQuery.removeEventListener('change', updatePreference)
      window.removeEventListener('resize', resetParallax)
      window.removeEventListener('scroll', resetParallax)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      resetParallax()
    }
  }, [])

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!parallaxEnabledRef.current || event.pointerType !== 'mouse') return
    boundsRef.current = event.currentTarget.getBoundingClientRect()
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!parallaxEnabledRef.current || event.pointerType !== 'mouse') return
    const bounds = boundsRef.current ?? event.currentTarget.getBoundingClientRect()
    boundsRef.current = bounds

    const normalizedX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2))
    const normalizedY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2))
    const element = event.currentTarget
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      element.style.setProperty('--atlas-scene-x', `${(-normalizedX * 5).toFixed(2)}px`)
      element.style.setProperty('--atlas-scene-y', `${(-normalizedY * 3).toFixed(2)}px`)
      element.style.setProperty('--atlas-plane-x', `${(normalizedX * 4).toFixed(2)}px`)
      element.style.setProperty('--atlas-plane-y', `${(normalizedY * 2).toFixed(2)}px`)
      element.style.setProperty('--atlas-nav-x', `${(normalizedX * 7).toFixed(2)}px`)
      element.style.setProperty('--atlas-nav-y', `${(normalizedY * 4).toFixed(2)}px`)
      frameRef.current = null
    })
  }

  const activateTown = (townId: string) => {
    setActiveTownId(townId)
    setPreviewTownId(townId)
  }

  return (
    <section
      ref={atlasRef}
      className="world-atlas"
      aria-labelledby="world-atlas-title"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={resetParallax}
      onPointerMove={handlePointerMove}
    >
      <div className="world-atlas__scene" aria-hidden="true">
        <img
          className="world-atlas__background"
          src={atlas.backgroundImage}
          alt=""
          fetchPriority="high"
        />
        {previewCover && (
          <img
            key={previewCover}
            className="world-atlas__preview-image"
            src={previewCover}
            alt=""
          />
        )}
        <span className="world-atlas__shade" />
        <span className="world-atlas__plane" />
      </div>

      <div className="container world-atlas__content">
        <header className="world-atlas__intro">
          <a className="portal-back-link" href="#/">
            <span aria-hidden="true">←</span> 回到牛腩小镇
          </a>
          <span className="world-atlas__eyebrow pixel-text">
            TOWN ATLAS / {String(nodes.length).padStart(2, '0')}
          </span>
          <h1 id="world-atlas-title">牛腩世界</h1>
          <p>城镇、街巷和铁路一起生长。先从一座城的主页出发，想看准确位置时再打开实时地图。</p>

          <div className="world-atlas__actions">
            <a className="mc-btn mc-btn-primary" href="#/map">
              实时地图 <span aria-hidden="true">↗</span>
            </a>
            <a className="mc-btn" href="/towns/town-rate.html">城镇评级</a>
            <a className="world-atlas__roster-link" href={fullTownRosterHref} target="_blank" rel="noopener noreferrer">
              完整名册 <span aria-hidden="true">↗</span>
            </a>
          </div>

          {activeNode && (
            <aside className="world-atlas__active" aria-label="当前城镇">
              <span>{activeNode.town.status === 'open' ? '主页开放' : '资料整理中'}</span>
              <strong>{activeNode.town.name}</strong>
              <small>{activeNode.town.summary}</small>
            </aside>
          )}
        </header>

        <nav className="world-atlas__nodes" aria-label="城镇图鉴">
          {nodes.map((node, index) => {
            const style: AtlasNodeStyle = {
              '--atlas-node-x': `${node.x}%`,
              '--atlas-node-y': `${node.y}%`,
              '--atlas-node-depth': `${Math.round(node.depth * 96)}px`,
              '--atlas-node-order': index,
              zIndex: Math.round(node.depth * 10) + 1,
            }
            return (
              <a
                className={`world-atlas__node${activeNode?.town.id === node.town.id ? ' is-active' : ''}`}
                data-status={node.town.status}
                href={node.town.href}
                key={node.town.id}
                style={style}
                onFocus={() => activateTown(node.town.id)}
                onPointerEnter={() => activateTown(node.town.id)}
              >
                <span className="world-atlas__marker" aria-hidden="true" />
                <span className="world-atlas__node-index pixel-text" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="world-atlas__node-copy">
                  <strong>{node.town.name}</strong>
                  <small>{node.town.meta}</small>
                </span>
                <span className="world-atlas__node-arrow" aria-hidden="true">→</span>
              </a>
            )
          })}
        </nav>
      </div>
    </section>
  )
}
