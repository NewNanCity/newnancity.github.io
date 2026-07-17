import { useCallback, useEffect, useRef, useState } from 'react'
import './EasterEggs.css'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export default function EasterEggs() {
  const [confetti, setConfetti] = useState(false)
  const konamiIndex = useRef(0)

  const handleKey = useCallback((event: KeyboardEvent) => {
    if (event.key === KONAMI[konamiIndex.current]) {
      konamiIndex.current += 1
      if (konamiIndex.current === KONAMI.length) {
        setConfetti(true)
        konamiIndex.current = 0
        window.setTimeout(() => setConfetti(false), 4000)
      }
      return
    }

    konamiIndex.current = 0
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!confetti) return null

  return (
    <div className="egg-confetti" aria-hidden="true">
      {Array.from({ length: 50 }, (_, index) => (
        <span
          key={index}
          className="egg-confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            background: ['#f6a623', '#5dba4f', '#5b9aff', '#ff7b54', '#e04040', '#fff'][
              Math.floor(Math.random() * 6)
            ],
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
          }}
        />
      ))}
      <div className="egg-confetti-text">
        <span className="pixel-text">成就达成</span>
        <strong>老玩家的暗号</strong>
      </div>
    </div>
  )
}
