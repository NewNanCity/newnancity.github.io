import { useEffect, useState, useCallback, useRef } from 'react'
import { useSiteData } from '../context/SiteDataContext'
import './EasterEggs.css'

/**
 * Hidden easter eggs scattered across the page:
 * 1. Konami Code → pixel confetti explosion
 * 2. Click logo 5 times → secret message
 * 3. Hover on certain area → hidden creeper face
 * 4. Idle for 30s → floating chat bubble with tips
 */

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

const defaultIdleMessages = [
  '嘘…… 你发现了一个彩蛋！🥚',
  '牛腩小镇欢迎每一个善良的冒险家 💛',
  '据说连续点击logo五次会有惊喜……',
  '试试输入 ↑↑↓↓←→←→BA 看看？',
  'SSSsssss…… 🟩 (别怕，这不是苦力怕)',
]

export default function EasterEggs() {
  const { tips } = useSiteData()
  const [confetti, setConfetti] = useState(false)
  const [chatBubble, setChatBubble] = useState<string | null>(null)
  const konamiIndex = useRef(0)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Combine tips with default messages
  const allMessages = [...(tips || []), ...defaultIdleMessages]

  // Konami code listener
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === KONAMI[konamiIndex.current]) {
      konamiIndex.current++
      if (konamiIndex.current === KONAMI.length) {
        setConfetti(true)
        konamiIndex.current = 0
        setTimeout(() => setConfetti(false), 4000)
      }
    } else {
      konamiIndex.current = 0
    }
  }, [])

  // Idle message
  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    setChatBubble(null)
    idleTimer.current = setTimeout(() => {
      const msg = allMessages[Math.floor(Math.random() * allMessages.length)]
      setChatBubble(msg)
      // Auto hide after 6s
      setTimeout(() => setChatBubble(null), 6000)
    }, 45000) // 45s idle
  }, [allMessages])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('scroll', resetIdle)
    resetIdle()
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('scroll', resetIdle)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [handleKey, resetIdle])

  return (
    <>
      {/* Confetti explosion on Konami code */}
      {confetti && (
        <div className="egg-confetti" aria-hidden="true">
          {Array.from({ length: 50 }, (_, i) => (
            <span
              key={i}
              className="egg-confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                background: ['#f6a623','#5dba4f','#5b9aff','#ff7b54','#e04040','#fff'][Math.floor(Math.random()*6)],
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
              }}
            />
          ))}
          <div className="egg-confetti-text pixel-text">🎉 Achievement Unlocked! 🎉</div>
        </div>
      )}

      {/* Idle chat bubble */}
      {chatBubble && (
        <div className="egg-bubble" onClick={() => setChatBubble(null)}>
          <div className="egg-bubble-inner">
            {chatBubble}
          </div>
        </div>
      )}
    </>
  )
}
