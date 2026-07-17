import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  baseOpacity: number
  opacity: number
  hue: number
  phase: number
}

/** Warm torch-glow particles, like fireflies and floating embers. */
export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasElement = ref.current
    if (!canvasElement) return
    const context = canvasElement.getContext('2d')
    if (!context) return
    const canvas: HTMLCanvasElement = canvasElement
    const ctx: CanvasRenderingContext2D = context

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animId: number | null = null
    let particles: Particle[] = []
    let time = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      resize()
      const count = Math.floor((canvas.width * canvas.height) / 22000)
      particles = Array.from({ length: count }, () => {
        const random = Math.random()
        const hue = random > 0.88 ? 110 : random > 0.5 ? 30 + Math.random() * 15 : 36
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: -Math.random() * 0.3 - 0.05,
          baseOpacity: Math.random() * 0.25 + 0.04,
          opacity: 0,
          hue,
          phase: Math.random() * Math.PI * 2,
        }
      })
    }

    function draw() {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const particle of particles) {
        particle.x += particle.speedX + Math.sin(time + particle.phase) * 0.15
        particle.y += particle.speedY
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < -10) {
          particle.y = canvas.height + 10
          particle.x = Math.random() * canvas.width
        }

        particle.opacity = particle.baseOpacity * (
          0.7 + 0.3 * Math.sin(time * 3 + particle.phase)
        )
        const saturation = particle.hue > 100 ? 50 : 80
        const lightness = particle.hue > 100 ? 55 : 65
        ctx.fillStyle = `hsla(${particle.hue}, ${saturation}%, ${lightness}%, ${particle.opacity})`
        ctx.fillRect(
          Math.round(particle.x),
          Math.round(particle.y),
          particle.size,
          particle.size,
        )
      }
      animId = requestAnimationFrame(draw)
    }

    function start() {
      if (animId !== null) return
      init()
      draw()
    }

    function stop() {
      if (animId !== null) cancelAnimationFrame(animId)
      animId = null
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      if (event.matches) stop()
      else start()
    }

    function handleResize() {
      if (motionQuery.matches) resize()
      else init()
    }

    motionQuery.addEventListener('change', handleMotionChange)
    window.addEventListener('resize', handleResize)
    if (motionQuery.matches) resize()
    else start()

    return () => {
      stop()
      motionQuery.removeEventListener('change', handleMotionChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={ref} id="particle-canvas" aria-hidden="true" />
}
