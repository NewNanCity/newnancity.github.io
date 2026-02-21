import { useState, useEffect, useCallback, useRef } from 'react'
import { useSiteData } from '../context/SiteDataContext'
import './Gallery.css'

const INTERVAL = 5000
const TRANSITION = 800

// Fisher-Yates shuffle
function shuffleArray(arr: number[]): number[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function Gallery() {
  const { gallery } = useSiteData()
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set())
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [positionInShuffle, setPositionInShuffle] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const [showControls] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const total = gallery.length

  // 监听 Gallery 是否在视口内
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0 } // 元素任何部分进入视口时触发
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // 计算需要渲染的图片指标（当前、前一张、后一张）
  const getIndexesToRender = (idx: number): Set<number> => {
    const toRender = new Set<number>()
    toRender.add(idx) // 当前
    toRender.add((idx - 1 + total) % total) // 前一张
    toRender.add((idx + 1) % total) // 后一张
    return toRender
  }

  const indicesToRender = getIndexesToRender(current)

  // 只有当 Gallery 进入视口时，才初始化图片加载
  useEffect(() => {
    if (isVisible && !isInitialized && total > 0) {
      const indices = Array.from({ length: total }, (_, i) => i)
      const shuffled = shuffleArray(indices)
      setShuffledIndices(shuffled)
      setCurrent(shuffled[0])
      setIsInitialized(true)
    }
  }, [isVisible, isInitialized, total])

  const goToNext = useCallback(() => {
    if (isTransitioning || total < 2 || shuffledIndices.length === 0) return

    setIsTransitioning(true)

    let nextPos = positionInShuffle + 1
    let shuffled = shuffledIndices

    // If completed a full cycle, reshuffle
    if (nextPos >= total) {
      shuffled = shuffleArray(Array.from({ length: total }, (_, i) => i))
      setShuffledIndices(shuffled)
      nextPos = 0
    }

    const nextIndex = shuffled[nextPos]
    setCurrent(nextIndex)
    setPositionInShuffle(nextPos)
    setProgressKey(prev => prev + 1)

    setTimeout(() => setIsTransitioning(false), TRANSITION)
  }, [positionInShuffle, shuffledIndices, isTransitioning, total])

  const goPrev = useCallback(() => {
    if (isTransitioning || total < 2 || shuffledIndices.length === 0) return

    setIsTransitioning(true)

    let prevPos = positionInShuffle - 1
    let shuffled = shuffledIndices

    // If at beginning, go to end of previous cycle
    if (prevPos < 0) {
      shuffled = shuffleArray(Array.from({ length: total }, (_, i) => i))
      setShuffledIndices(shuffled)
      prevPos = total - 1
    }

    const prevIndex = shuffled[prevPos]
    setCurrent(prevIndex)
    setPositionInShuffle(prevPos)
    setProgressKey(prev => prev + 1)

    setTimeout(() => setIsTransitioning(false), TRANSITION)
  }, [positionInShuffle, shuffledIndices, isTransitioning, total])

  /* auto-rotate with shuffled order - 仅当 Gallery 可见时运行 */
  useEffect(() => {
    if (shuffledIndices.length === 0 || !isVisible) {
      // 如果不可见，清除定时器
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    // Gallery 可见时启动定时器
    timerRef.current = setInterval(goToNext, INTERVAL)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [goToNext, shuffledIndices, isVisible])

  const handleLoad = (i: number) => setLoadedSet(prev => { const s = new Set(prev); s.add(i); return s })

  return (
    <section className="gallery-section" id="gallery" ref={sectionRef}>
      {/* Full-bleed background slides */}
      <div className="gallery-bg">
        {gallery.map((img, i) => {
          // 只有初始化后才渲染图片；只渲染当前、前一张、后一张的图片，其他用占位符
          const shouldRender = isInitialized && indicesToRender.has(i)
          return (
            <div
              key={img.src}
              className={`gallery-bg-slide${i === current ? ' gallery-bg-slide--active' : ''}`}
            >
              {shouldRender ? (
                <img
                  src={img.src}
                  alt={img.caption}
                  loading={i === current ? 'eager' : 'lazy'}
                  onLoad={() => handleLoad(i)}
                />
              ) : (
                // 未渲染的图片不加载 src，只用占位符
                <div className="gallery-bg-placeholder" />
              )}
              {!loadedSet.has(i) && shouldRender && (
                <div className="gallery-bg-placeholder" />
              )}
            </div>
          )
        })}
        <div className="gallery-overlay" />
      </div>

      {/* Header section with title */}
      <div className="gallery-header-box animate-on-scroll">
        <div className="section-header">
          <span className="section-tag pixel-text">GALLERY</span>
          <h2 className="section-title">小镇风光</h2>
          <div className="section-line" />
          <p className="section-desc">六年岁月，每一帧都值得珍藏</p>
        </div>
      </div>

      {/* Info section at bottom - full width */}
      <div
        className="gallery-info-box animate-on-scroll"
        // onMouseEnter={() => setShowControls(true)}
        // onMouseLeave={() => setShowControls(false)}
      >
        {/* Progress bar */}
        <div className="gallery-progress-container">
          <div key={progressKey} className="gallery-progress-bar" />
        </div>

        <div className="gallery-info">
          <button
            className={`gallery-btn gallery-btn-prev${showControls ? ' gallery-btn--visible' : ''}`}
            onClick={goPrev}
            aria-label="上一张"
            title="上一张"
          >
            ◀
          </button>

          <span className="gallery-caption">{gallery[current]?.caption}</span>
          <span className="gallery-year pixel-text">{gallery[current]?.year}</span>

          <button
            className={`gallery-btn gallery-btn-next${showControls ? ' gallery-btn--visible' : ''}`}
            onClick={goToNext}
            aria-label="下一张"
            title="下一张"
          >
            ▶
          </button>
        </div>

        {/* Dot indicators */}
        {/* <div className="gallery-dots">
          {gallery.map((_, i) => (
            <span
              key={i}
              className={`gallery-dot${i === current ? ' gallery-dot--active' : ''}`}
            />
          ))}
        </div> */}

        <p className="gallery-note">
          📷 欢迎玩家投稿你在牛腩的最美瞬间
        </p>
      </div>
    </section>
  )
}
