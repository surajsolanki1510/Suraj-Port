import { useEffect, useRef, type RefObject } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  heat: number
}

/** Iris centers as fractions of the PNG (1122×1402). */
const EYES = [
  { x: 0.518, y: 0.252 },
  { x: 0.622, y: 0.26 },
]

function containRect(
  naturalW: number,
  naturalH: number,
  boxW: number,
  boxH: number,
) {
  const scale = Math.min(boxW / naturalW, boxH / naturalH)
  const rw = naturalW * scale
  const rh = naturalH * scale
  return {
    ox: (boxW - rw) / 2,
    oy: (boxH - rh) / 2,
    rw,
    rh,
  }
}

/**
 * Subtle realistic eye-fire, locked to the visible portrait pixels
 * (handles object-fit letterboxing).
 */
export function EyeFireCanvas({
  active,
  imageRef,
}: {
  active: boolean
  imageRef: RefObject<HTMLImageElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let time = 0
    let intensity = 0
    const particles: Particle[] = []

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = parent.clientWidth
      h = parent.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const eyePoints = () => {
      const img = imageRef.current
      const nw = img?.naturalWidth || 1122
      const nh = img?.naturalHeight || 1402
      const { ox, oy, rw, rh } = containRect(nw, nh, w, h)
      return EYES.map((e) => ({
        x: ox + e.x * rw,
        y: oy + e.y * rh,
        scale: rw / nw,
      }))
    }

    const spawn = (ex: number, ey: number, scale: number) => {
      const r = Math.max(2, 7 * scale)
      particles.push({
        x: ex + (Math.random() - 0.5) * r * 1.2,
        y: ey + (Math.random() - 0.4) * r * 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.45 + Math.random() * 1.05),
        life: 0,
        max: 30 + Math.random() * 34,
        size: Math.max(0.7, (0.8 + Math.random() * 1.6) * scale),
        heat: 0.35 + Math.random() * 0.35,
      })
    }

    const drawWisp = (
      ex: number,
      ey: number,
      scale: number,
      phase: number,
      lean: number,
      tall: number,
      alphaMul: number,
    ) => {
      const turb = Math.sin(time * 4.6 + phase) * 0.55 + Math.sin(time * 7.2 + phase * 1.6) * 0.28
      const sway = (turb * 4.5 + lean * 2.2) * scale
      const tipX = ex + sway
      const tipY = ey - (10 + tall * 16) * scale * intensity - Math.sin(time * 5.6 + phase) * 1.6 * scale
      const midX = ex + sway * 0.45
      const midY = ey * 0.45 + tipY * 0.55
      const base = (3.2 + tall * 1.6) * scale * (0.75 + intensity * 0.25)

      const g = ctx.createLinearGradient(ex, ey + 2, tipX, tipY)
      g.addColorStop(0, `rgba(255, 70, 10, ${0.5 * intensity * alphaMul})`)
      g.addColorStop(0.28, `rgba(255, 125, 25, ${0.46 * intensity * alphaMul})`)
      g.addColorStop(0.55, `rgba(255, 175, 55, ${0.3 * intensity * alphaMul})`)
      g.addColorStop(0.8, `rgba(255, 225, 130, ${0.14 * intensity * alphaMul})`)
      g.addColorStop(1, 'rgba(255, 245, 210, 0)')

      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(ex - base, ey + 1)
      ctx.quadraticCurveTo(midX - base * 0.45, midY, tipX, tipY)
      ctx.quadraticCurveTo(midX + base * 0.45, midY, ex + base, ey + 1)
      ctx.closePath()
      ctx.fill()

      const c = ctx.createLinearGradient(ex, ey, tipX, tipY)
      c.addColorStop(0, `rgba(255, 235, 195, ${0.5 * intensity * alphaMul})`)
      c.addColorStop(0.4, `rgba(255, 185, 80, ${0.28 * intensity * alphaMul})`)
      c.addColorStop(1, 'rgba(255, 120, 30, 0)')
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.moveTo(ex - base * 0.3, ey)
      ctx.quadraticCurveTo(midX, midY + 1, tipX, tipY + 3 * scale)
      ctx.quadraticCurveTo(midX, midY + 1, ex + base * 0.3, ey)
      ctx.closePath()
      ctx.fill()
    }

    const tick = () => {
      if (!running) return
      if (w < 2 || h < 2) {
        raf = requestAnimationFrame(tick)
        return
      }

      const target = active ? 0.7 : 0
      intensity += (target - intensity) * (target > intensity ? 0.14 : 0.05)
      if (intensity < 0.008 && !active) {
        particles.length = 0
        ctx.clearRect(0, 0, w, h)
        raf = requestAnimationFrame(tick)
        return
      }

      time += 0.035
      ctx.clearRect(0, 0, w, h)
      const eyes = eyePoints()

      for (let e = 0; e < eyes.length; e++) {
        const { x: ex, y: ey, scale } = eyes[e]

        const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 18 * scale)
        glow.addColorStop(0, `rgba(255, 220, 150, ${0.55 * intensity})`)
        glow.addColorStop(0.4, `rgba(255, 120, 30, ${0.28 * intensity})`)
        glow.addColorStop(1, 'rgba(255, 40, 0, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.ellipse(ex, ey, 7 * scale, 3.6 * scale, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.filter = 'blur(2.4px)'
        drawWisp(ex, ey, scale, e * 1.7, -0.8, 0.95, 0.9)
        drawWisp(ex, ey, scale, e * 2.3 + 1, 0.85, 0.75, 0.8)
        ctx.restore()

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.filter = 'blur(1px)'
        drawWisp(ex, ey, scale, e * 3.8, 0.1, 0.5, 0.75)
        ctx.restore()

        const budget = Math.round(6 + intensity * 10)
        let count = 0
        for (const p of particles) {
          if (Math.abs(p.x - ex) < 28 * scale) count++
        }
        while (count < budget) {
          spawn(ex, ey, scale)
          count++
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx + Math.sin(time * 2.6 + p.y * 0.06) * 0.16
        p.y += p.vy
        p.vx *= 0.985
        const t = p.life / p.max
        if (t >= 1) {
          particles.splice(i, 1)
          continue
        }
        const a = (1 - t) * p.heat * intensity * 0.8
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, ${Math.floor(195 - t * 95)}, ${Math.floor(90 - t * 70)}, ${a})`
        ctx.shadowColor = `rgba(255, 130, 40, ${a * 0.55})`
        ctx.shadowBlur = 3.5
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.55), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active, imageRef])

  return <canvas ref={canvasRef} className="eye-fire-canvas" aria-hidden />
}
