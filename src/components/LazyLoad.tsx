import { useState, useEffect } from 'react'

interface LazyLoadProps {
  children: React.ReactNode
  delay?: number
  fallback?: React.ReactNode
}

/**
 * 延迟加载组件 - 用于非首屏关键元素
 * 首屏加载完成后再初始化这些组件
 */
export default function LazyLoad({ children, delay = 1000, fallback = null }: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return isVisible ? children : fallback
}
