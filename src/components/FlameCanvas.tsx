import { useEffect, useRef } from 'react'
import { onFlameSurge } from '../lib/flameSurge'

type Tongue = {
  x: number
  baseY: number
  amp: number
  freq: number
  phase: number
  width: number
  height: number
  hue: number
}

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
}

/**
 * Aesthetic anime-style aura flame — soft layered tongues + sparks.
 * Designed to sit behind a character silhouette.
 */
export function FlameCanvas() {
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
    // Rage level 0..1 — eased so the flare-up and cooldown stay smooth
    let surge = 0
    let surgeUntil = 0

    const offSurge = onFlameSurge(() => {
      surgeUntil = performance.now() + 5200
    })

    const tongues: Tongue[] = []
    const sparks: Spark[] = []

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
      buildTongues()
    }

    const buildTongues = () => {
      tongues.length = 0
      const count = 14
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1)
        tongues.push({
          x: w * (0.28 + t * 0.44) + (Math.random() - 0.5) * w * 0.04,
          baseY: h * (0.72 + Math.random() * 0.06),
          amp: 8 + Math.random() * 18,
          freq: 1.2 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          width: w * (0.05 + Math.random() * 0.07),
          height: h * (0.42 + Math.random() * 0.28),
          hue: 18 + Math.random() * 28,
        })
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const spawnSpark = () => {
      sparks.push({
        x: w * (0.32 + Math.random() * 0.36),
        y: h * (0.4 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 0.7,
        vy: -(1.4 + Math.random() * 2.8),
        life: 0,
        max: 50 + Math.random() * 80,
        size: 1 + Math.random() * 2.4,
      })
    }

    const drawTongue = (tongue: Tongue, layer: number) => {
      const sway = Math.sin(time * tongue.freq + tongue.phase) * tongue.amp * (1 + surge * 1.35)
      const tipX = tongue.x + sway
      const reach = tongue.height * (1 + surge * 1.45)
      const tipY = tongue.baseY - reach * (0.85 + Math.sin(time * 1.4 + tongue.phase) * 0.08)
      const midY = (tongue.baseY + tipY) / 2
      const midX = tongue.x + sway * 0.45 + Math.sin(time * 2 + tongue.phase) * 6

      const left = tongue.width * (layer === 0 ? 1.15 : layer === 1 ? 0.75 : 0.4) * (1 + surge * 0.55)
      const baseAlpha = layer === 0 ? 0.28 : layer === 1 ? 0.45 : 0.7
      const alpha = Math.min(1, baseAlpha * (1 + surge * 0.95))

      const grad = ctx.createLinearGradient(tongue.x, tongue.baseY, tipX, tipY)
      if (layer === 0) {
        grad.addColorStop(0, `hsla(${tongue.hue + 5}, 100%, 45%, ${alpha})`)
        grad.addColorStop(0.45, `hsla(${tongue.hue + 15}, 100%, 55%, ${alpha * 0.85})`)
        grad.addColorStop(1, `hsla(${tongue.hue + 30}, 100%, 70%, 0)`)
      } else if (layer === 1) {
        grad.addColorStop(0, `hsla(22, 100%, 50%, ${alpha})`)
        grad.addColorStop(0.4, `hsla(32, 100%, 58%, ${alpha})`)
        grad.addColorStop(1, `hsla(45, 100%, 72%, 0)`)
      } else {
        grad.addColorStop(0, `hsla(28, 100%, 60%, ${alpha})`)
        grad.addColorStop(0.35, `hsla(42, 100%, 72%, ${alpha})`)
        grad.addColorStop(0.7, `hsla(48, 100%, 85%, ${alpha * 0.7})`)
        grad.addColorStop(1, `hsla(50, 100%, 95%, 0)`)
      }

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(tongue.x - left, tongue.baseY)
      ctx.quadraticCurveTo(midX - left * 0.7, midY, tipX, tipY)
      ctx.quadraticCurveTo(midX + left * 0.7, midY, tongue.x + left, tongue.baseY)
      ctx.closePath()
      ctx.fill()
    }

    const tick = () => {
      if (!running) return
      if (w < 2 || h < 2) {
        raf = requestAnimationFrame(tick)
        return
      }
      const surgeTarget = performance.now() < surgeUntil ? 1 : 0
      // Punch up almost instantly, cool down slow
      surge += (surgeTarget - surge) * (surgeTarget > surge ? 0.28 : 0.025)
      if (surge < 0.001) surge = 0

      time += 0.035 * (1 + surge * 1.1)
      ctx.clearRect(0, 0, w, h)

      // soft ground / body glow
      const bloom = ctx.createRadialGradient(w * 0.5, h * 0.58, 4, w * 0.5, h * 0.5, h * (0.48 + surge * 0.28))
      bloom.addColorStop(0, `rgba(255, ${110 - surge * 50}, 30, ${0.38 + surge * 0.5})`)
      bloom.addColorStop(0.45, `rgba(255, 50, 15, ${0.14 + surge * 0.28})`)
      bloom.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bloom
      ctx.fillRect(0, 0, w, h)

      // outer soft tongues
      ctx.save()
      ctx.filter = 'blur(10px)'
      for (const tongue of tongues) drawTongue(tongue, 0)
      ctx.restore()

      // mid tongues
      ctx.save()
      ctx.filter = 'blur(4px)'
      for (const tongue of tongues) drawTongue(tongue, 1)
      ctx.restore()

      // bright cores
      ctx.save()
      ctx.filter = 'blur(1.5px)'
      for (let i = 0; i < tongues.length; i += 2) drawTongue(tongues[i], 2)
      ctx.restore()

      // white-hot center ribbon
      const core = ctx.createRadialGradient(w * 0.5, h * 0.55, 2, w * 0.5, h * 0.42, w * (0.18 + surge * 0.16))
      core.addColorStop(0, `rgba(255, 245, 210, ${0.55 + surge * 0.42})`)
      core.addColorStop(0.35, `rgba(255, 180, 70, ${0.28 + surge * 0.35})`)
      core.addColorStop(1, 'rgba(255, 60, 10, 0)')
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.ellipse(
        w * 0.5 + Math.sin(time * 1.5) * 6,
        h * 0.48,
        w * (0.1 + surge * 0.06),
        h * (0.28 + surge * 0.18),
        Math.sin(time) * 0.05,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // sparks
      const sparkBudget = Math.round(36 + surge * 140)
      while (sparks.length < sparkBudget) spawnSpark()
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.life++
        s.x += s.vx + Math.sin(time * 2.5 + s.y * 0.04) * 0.4
        s.y += s.vy * (1 + surge * 1.6)
        const lt = s.life / s.max
        if (lt >= 1 || s.y < -20) {
          sparks.splice(i, 1)
          continue
        }
        const a = (1 - lt) * 0.9
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, ${220 - lt * 90}, ${120 - lt * 80}, ${a})`
        ctx.shadowColor = 'rgba(255, 140, 40, 0.8)'
        ctx.shadowBlur = 6
        ctx.arc(s.x, s.y, s.size * (1 - lt * 0.4), 0, Math.PI * 2)
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
      offSurge()
    }
  }, [])

  return <canvas ref={canvasRef} className="flame-canvas" aria-hidden />
}
