import { useEffect, useState } from 'react'
import './LoadingScreen.css'

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 最少显示 800ms，最多显示 3s
    const minTimer = setTimeout(() => {
      // 检查页面是否已准备好
      const checkIfReady = setInterval(() => {
        if (document.readyState === 'complete') {
          setIsVisible(false)
          clearInterval(checkIfReady)
        }
      }, 100)
    }, 800)

    const maxTimer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => {
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="loading-screen">
      <div className="loading-container">
        {/* Minecraft 风格的加载动画 */}
        <div className="loading-logo">
          <div className="pixel-brick"></div>
        </div>

        <div className="loading-text">
          <span className="loading-title">牛腩小镇</span>
          <span className="loading-subtitle">NewNanCity</span>
        </div>

        {/* 加载进度条 */}
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="progress-text">加载中...</div>
        </div>

        {/* 装饰性粒子 */}
        <div className="loading-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  )
}
