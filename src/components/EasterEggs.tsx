import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useSiteData } from '../context/SiteDataContext'
import './EasterEggs.css'

/**
 * Hidden easter eggs scattered across the page:
 * 1. Konami Code → pixel confetti explosion
 * 2. Click logo 5 times → secret message
 * 3. Hover on certain area → hidden creeper face
 * 4. Idle for 20s → floating chat bubble with tips
 */

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

const defaultIdleMessages = [
  '嘘…… 你发现了一个彩蛋！🥚',
  '牛腩小镇欢迎每一个善良的冒险家 💛',
  '据说连续点击logo五次会有惊喜……',
  '试试输入 ↑↑↓↓←→←→BA 看看？',
  'SSSsssss…… 🟩 (别怕，这不是苦力怕)',
]

// Idle timeout before showing a tip when mouse doesn't move (ms)
const IDLE_TIMEOUT = 5_000

export default function EasterEggs() {
  const { tips } = useSiteData()
  const [confetti, setConfetti] = useState(false)
  const [chatBubble, setChatBubble] = useState<string | null>(null)
  const konamiIndex = useRef(0)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tipHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stable reference — only recompute when tips data actually changes
  const allMessages = useMemo(
    () => [...(tips || []), ...defaultIdleMessages],
    [tips],
  )
  const messagesRef = useRef(allMessages)
  messagesRef.current = allMessages

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

  // Show a random idle tip
  const showTip = useCallback(() => {
    const msgs = messagesRef.current
    const msg = msgs[Math.floor(Math.random() * msgs.length)]
    setChatBubble(msg)

    // Clear any previous tip hide timer
    if (tipHideTimer.current) clearTimeout(tipHideTimer.current)

    // Auto-hide tip after 6s
    tipHideTimer.current = setTimeout(() => {
      setChatBubble(null)
      tipHideTimer.current = null
    }, 6000)

    // Immediately restart idle timer for next tip (only one timer at a time)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      showTip()
    }, IDLE_TIMEOUT)
  }, [])

  // Reset idle timer (called from debounced mousemove/click)
  const resetIdleTimer = useCallback(() => {
    // Clear any pending idle timer, tip, and tip hide timer
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (tipHideTimer.current) clearTimeout(tipHideTimer.current)
    setChatBubble(null)

    // Start new idle timer
    idleTimer.current = setTimeout(() => {
      showTip()
    }, IDLE_TIMEOUT)
  }, [showTip])

  // Debounced handler for mousemove and click
  const handleActivity = useCallback(() => {
    if (resetDebounce.current) clearTimeout(resetDebounce.current)
    resetDebounce.current = setTimeout(resetIdleTimer, 3000)
  }, [resetIdleTimer])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('click', handleActivity)

    // Initialize first idle timer
    resetIdleTimer()

    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('click', handleActivity)
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (tipHideTimer.current) clearTimeout(tipHideTimer.current)
      if (resetDebounce.current) clearTimeout(resetDebounce.current)
    }
  }, [handleKey, handleActivity, resetIdleTimer])

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
