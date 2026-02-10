import { useEffect, useRef } from 'react'

/** Warm torch-glow particles — like fireflies and floating embers. */
export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let animId: number
    let particles: Particle[] = []
    let time = 0

    interface Particle {
      x: number; y: number; size: number
      speedX: number; speedY: number
      baseOpacity: number; opacity: number
      hue: number; phase: number
    }

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      resize()
      const count = Math.floor((canvas.width * canvas.height) / 22000)
      particles = Array.from({ length: count }, () => {
        const r = Math.random()
        // Mostly warm: gold, orange, amber; occasional green spark
        const hue = r > 0.88 ? 110 : r > 0.5 ? 30 + Math.random() * 15 : 36
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: -Math.random() * 0.3 - 0.05, // drift upward like embers
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
      for (const p of particles) {
        p.x += p.speedX + Math.sin(time + p.phase) * 0.15
        p.y += p.speedY
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }

        // Torch flicker effect
        p.opacity = p.baseOpacity * (0.7 + 0.3 * Math.sin(time * 3 + p.phase))

        const sat = p.hue > 100 ? 50 : 80
        const lit = p.hue > 100 ? 55 : 65
        ctx.fillStyle = `hsla(${p.hue}, ${sat}%, ${lit}%, ${p.opacity})`
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }
      animId = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', init)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', init)
    }
  }, [])

  return <canvas ref={ref} id="particle-canvas" />
}
