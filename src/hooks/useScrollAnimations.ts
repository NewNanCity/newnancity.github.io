import { useEffect } from 'react'

export function useScrollAnimations(page: string) {
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-scroll')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    elements.forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [page])
}
