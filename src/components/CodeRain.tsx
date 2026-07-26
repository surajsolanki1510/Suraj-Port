import { useEffect, useRef } from 'react'

const GLYPHS = '01<>/{}[];:=*#$@アカサタナハマヤラワ'

/** Subtle falling code — game HUD atmosphere, not full Matrix spam */
export function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const cols: { y: number; speed: number; chars: string[] }[] = []
    const FONT = 13

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor(w / 22)
      cols.length = 0
      for (let i = 0; i < count; i++) {
        cols.push({
          y: Math.random() * h,
          speed: 0.4 + Math.random() * 1.2,
          chars: Array.from({ length: 8 + ((i * 3) % 10) }, () => GLYPHS[(i * 7 + Math.random() * GLYPHS.length) | 0]),
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      if (!running) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.fillStyle = 'rgba(7, 6, 10, 0.12)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${FONT}px "JetBrains Mono", monospace`

      cols.forEach((col, i) => {
        const x = i * 22 + 4
        col.y += col.speed
        if (col.y > h + col.chars.length * FONT) {
          col.y = -col.chars.length * FONT
          col.speed = 0.4 + Math.random() * 1.2
        }
        col.chars.forEach((ch, j) => {
          const yy = col.y - j * FONT
          const alpha = Math.max(0, 0.35 - j * 0.04)
          ctx.fillStyle = j === 0 ? `rgba(255, 180, 80, ${alpha + 0.25})` : `rgba(255, 70, 30, ${alpha})`
          ctx.fillText(ch, x, yy)
        })
        if (Math.random() > 0.97) {
          col.chars[0] = GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="code-rain" aria-hidden />
}
