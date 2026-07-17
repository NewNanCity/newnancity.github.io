import { useEffect, useState, type FocusEvent } from 'react'
import { useSiteData } from '../context/SiteDataContext'
import { nextHomeFeedIndex } from '../state/home-feed-state.js'
import type { PortalFeedCategory } from '../types/SiteData'

const ROTATION_INTERVAL_MS = 6500

const CATEGORY_LABELS: Record<PortalFeedCategory, string> = {
  news: '新闻',
  town: '城镇',
  activity: '活动',
  memory: '回忆',
  scenery: '风景',
}

export default function HomeLiveFeed() {
  const { portal } = useSiteData()
  const [activeIndex, setActiveIndex] = useState(0)
  const [manualPaused, setManualPaused] = useState(false)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(document.hidden)
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const currentItem = portal.feed[activeIndex]
  const autoPaused = manualPaused || interactionPaused || pageHidden || reduceMotion
  const playbackLabel = reduceMotion
    ? '已按减少动态效果设置暂停'
    : manualPaused
      ? '继续自动播放'
      : '暂停自动播放'

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (autoPaused || portal.feed.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => nextHomeFeedIndex(current, portal.feed.length))
    }, ROTATION_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [autoPaused, portal.feed.length])

  useEffect(() => {
    const nextIndex = nextHomeFeedIndex(activeIndex, portal.feed.length)
    const preload = new Image()
    preload.src = portal.feed[nextIndex].image
  }, [activeIndex, portal.feed])

  const handleFeedFocusOut = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setInteractionPaused(false)
    }
  }

  const selectItem = (index: number) => {
    setActiveIndex(index)
    setManualPaused(true)
  }

  const external = currentItem.href.startsWith('http')

  return (
    <section
      className="portal-live-feed"
      aria-labelledby="portal-live-title"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={handleFeedFocusOut}
    >
      <div className="container">
        <header className="portal-live-header">
          <div>
            <span className="section-tag pixel-text">LIVE FROM NEWNAN</span>
            <h2 id="portal-live-title">今天的小镇，有这些事</h2>
            <p>一条新闻、一座城、一场热闹，或者某个值得再看一眼的瞬间。</p>
          </div>
          <button
            type="button"
            className="portal-live-pause"
            aria-label={playbackLabel}
            title={playbackLabel}
            disabled={reduceMotion}
            onClick={() => setManualPaused((paused) => !paused)}
          >
            <span aria-hidden="true">{manualPaused ? '▶' : 'Ⅱ'}</span>
          </button>
        </header>

        <div className="portal-live-grid">
          <article
            className="portal-live-feature"
            data-category={currentItem.category}
            key={currentItem.id}
          >
            <a
              href={currentItem.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
            >
              <img src={currentItem.image} alt="" aria-hidden="true" />
              <span className="portal-live-shade" aria-hidden="true" />
              <span className="portal-live-copy">
                <span className="portal-live-eyebrow pixel-text">{currentItem.eyebrow}</span>
                <strong>{currentItem.title}</strong>
                <small>{currentItem.meta}</small>
                <p>{currentItem.summary}</p>
                <span className="portal-live-action">
                  {currentItem.actionLabel} <span aria-hidden="true">{external ? '↗' : '→'}</span>
                </span>
              </span>
            </a>
          </article>

          <ol className="portal-live-queue" aria-label="更多小镇动态">
            {portal.feed.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={index === activeIndex ? 'is-current' : undefined}
                  aria-pressed={index === activeIndex}
                  onClick={() => selectItem(index)}
                >
                  <span className="portal-live-index pixel-text" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <small>{CATEGORY_LABELS[item.category]}</small>
                    <strong>{item.title}</strong>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
