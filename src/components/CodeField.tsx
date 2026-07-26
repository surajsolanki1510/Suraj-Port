import { useEffect, useRef } from 'react'

/**
 * Code constellation — layered token network filling the portrait column.
 * Exclusion ovals track the photo stage, keeping face + laptop screen clean.
 */

const TOKENS = [
  '</>', '{}', '[]', '=>', '&&', '||', '===', '??', '?.',
  'fn()', 'async', 'await', 'useState', '.map()', 'return',
  'const', 'type', '0x1F', 'null', 'true', '//', '#',
  '<div>', 'tsx', 'npm', 'git', 'API', 'JWT', 'SQL',
]

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  depth: number // 0 far → 1 near
  token: string
  warm: boolean
  phase: number
  pulse: number
}

type Packet = {
  a: number
  b: number
  t: number
  speed: number
  warm: boolean
}

export function CodeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let running = true
    let nodes: Node[] = []
    let packets: Packet[] = []
    let w = 0
    let h = 0
    // Photo stage rect within the canvas — exclusion ovals are relative to it
    let stage = { x: 0, y: 0, w: 1, h: 1 }

    /** Ovals in stage-normalized coords: person (left-center), laptop (lower-right) */
    const ovalDist = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => {
      const px = stage.x + cx * stage.w
      const py = stage.y + cy * stage.h
      return ((x - px) / (rx * stage.w)) ** 2 + ((y - py) / (ry * stage.h)) ** 2
    }

    const inExclusion = (x: number, y: number) =>
      ovalDist(x, y, 0.36, 0.4, 0.3, 0.5) < 1 || ovalDist(x, y, 0.7, 0.7, 0.3, 0.3) < 1

    const exclusionFade = (x: number, y: number) => {
      const d = Math.min(
        ovalDist(x, y, 0.36, 0.4, 0.34, 0.54),
        ovalDist(x, y, 0.7, 0.7, 0.34, 0.34),
      )
      if (d < 0.9) return 0
      if (d > 1.4) return 1
      return (d - 0.9) / 0.5
    }

    const spawn = () => {
      nodes = []
      packets = []
      const count = Math.round(Math.min(58, Math.max(28, (w * h) / 18000)))

      let tries = 0
      while (nodes.length < count && tries < count * 20) {
        tries++
        const x = Math.random() * w
        const y = Math.random() * h
        if (inExclusion(x, y) && Math.random() > 0.12) continue

        const depth = Math.random()
        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (0.08 + depth * 0.14),
          vy: (Math.random() - 0.5) * (0.08 + depth * 0.14),
          size: 8 + depth * 9,
          depth,
          token: TOKENS[(Math.random() * TOKENS.length) | 0],
          warm: Math.random() > 0.82,
          phase: Math.random() * Math.PI * 2,
          pulse: Math.random(),
        })
      }

      for (let i = 0; i < Math.min(5, nodes.length); i++) {
        packets.push({
          a: (Math.random() * nodes.length) | 0,
          b: (Math.random() * nodes.length) | 0,
          t: Math.random(),
          speed: 0.0025 + Math.random() * 0.004,
          warm: Math.random() > 0.75,
        })
      }
    }

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

      const stageEl = parent.querySelector<HTMLElement>('.origin-screen-stage')
      if (stageEl) {
        const pr = parent.getBoundingClientRect()
        const sr = stageEl.getBoundingClientRect()
        stage = { x: sr.left - pr.left, y: sr.top - pr.top, w: sr.width, h: sr.height }
      } else {
        stage = { x: 0, y: 0, w, h }
      }

      spawn()
    }

    resize()
    window.addEventListener('resize', resize)
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const neighbors = (i: number, maxDist: number) => {
      const a = nodes[i]
      const list: number[] = []
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        if (dx * dx + dy * dy < maxDist * maxDist) list.push(j)
      }
      return list
    }

    const tick = (now: number) => {
      if (!running) return
      ctx.clearRect(0, 0, w, h)

      const t = now * 0.001

      // Soft ambient haze — corners of the full column
      const haze = ctx.createRadialGradient(w * 0.08, h * 0.06, 0, w * 0.08, h * 0.06, w * 0.5)
      haze.addColorStop(0, 'rgba(142, 108, 255, 0.05)')
      haze.addColorStop(1, 'transparent')
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, w, h)

      const haze2 = ctx.createRadialGradient(w * 0.92, h * 0.94, 0, w * 0.92, h * 0.94, w * 0.45)
      haze2.addColorStop(0, 'rgba(255, 122, 24, 0.035)')
      haze2.addColorStop(1, 'transparent')
      ctx.fillStyle = haze2
      ctx.fillRect(0, 0, w, h)

      if (!reduced) {
        for (const n of nodes) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < -20) n.x = w + 20
          if (n.x > w + 20) n.x = -20
          if (n.y < -20) n.y = h + 20
          if (n.y > h + 20) n.y = -20
          n.pulse = 0.55 + Math.sin(t * 1.4 + n.phase) * 0.45
        }
      }

      // Constellation web
      const linkDist = Math.min(w, h) * 0.18
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        const fadeA = exclusionFade(a.x, a.y)
        if (fadeA < 0.05) continue
        const near = neighbors(i, linkDist)
        for (const j of near) {
          if (j <= i) continue
          const b = nodes[j]
          const fadeB = exclusionFade(b.x, b.y)
          const alpha = Math.min(fadeA, fadeB) * 0.2 * ((a.depth + b.depth) * 0.5)
          if (alpha < 0.02) continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const falloff = 1 - dist / linkDist
          ctx.strokeStyle = a.warm || b.warm
            ? `rgba(255, 160, 70, ${alpha * falloff})`
            : `rgba(160, 130, 255, ${alpha * falloff})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // Traveling packets
      if (!reduced) {
        for (const p of packets) {
          p.t += p.speed
          if (p.t > 1) {
            p.t = 0
            p.a = (Math.random() * nodes.length) | 0
            const near = neighbors(p.a, linkDist * 1.2)
            p.b = near.length ? near[(Math.random() * near.length) | 0] : ((Math.random() * nodes.length) | 0)
          }
          const a = nodes[p.a]
          const b = nodes[p.b]
          if (!a || !b) continue
          const x = a.x + (b.x - a.x) * p.t
          const y = a.y + (b.y - a.y) * p.t
          const fade = exclusionFade(x, y)
          if (fade < 0.1) continue
          const r = 1.6 + fade
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
          if (p.warm) {
            grad.addColorStop(0, `rgba(255, 190, 90, ${0.55 * fade})`)
            grad.addColorStop(1, 'transparent')
          } else {
            grad.addColorStop(0, `rgba(190, 160, 255, ${0.55 * fade})`)
            grad.addColorStop(1, 'transparent')
          }
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(x, y, r * 5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Nodes + tokens
      for (const n of nodes) {
        const fade = exclusionFade(n.x, n.y)
        if (fade < 0.04) continue

        const breathe = reduced ? 0.85 : n.pulse
        const alpha = fade * (0.22 + n.depth * 0.38) * breathe
        const r = 1.1 + n.depth * 1.8

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5)
        if (n.warm) {
          g.addColorStop(0, `rgba(255, 170, 70, ${alpha * 0.7})`)
          g.addColorStop(1, 'transparent')
        } else {
          g.addColorStop(0, `rgba(150, 120, 255, ${alpha * 0.7})`)
          g.addColorStop(1, 'transparent')
        }
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = n.warm
          ? `rgba(255, 200, 120, ${Math.min(0.85, alpha + 0.15)})`
          : `rgba(210, 190, 255, ${Math.min(0.85, alpha + 0.15)})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()

        if (n.depth > 0.55) {
          ctx.font = `${Math.round(n.size)}px ui-monospace, "Cascadia Code", Menlo, Consolas, monospace`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = n.warm
            ? `rgba(255, 185, 100, ${alpha * 0.75})`
            : `rgba(190, 170, 255, ${alpha * 0.75})`
          ctx.shadowColor = n.warm
            ? 'rgba(255, 120, 30, 0.3)'
            : 'rgba(120, 80, 255, 0.3)'
          ctx.shadowBlur = 5 + n.depth * 6
          ctx.fillText(n.token, n.x + 6 + n.depth * 4, n.y)
          ctx.shadowBlur = 0
        }
      }

      // Edge code rain streaks (left + right rails of the column)
      if (!reduced) {
        ctx.font = '11px ui-monospace, Menlo, Consolas, monospace'
        for (let i = 0; i < 6; i++) {
          const left = i < 3
          const x = left ? 10 + i * 16 : w - 14 - (i - 3) * 16
          const speed = 14 + (i % 3) * 8
          const yBase = ((t * speed * 8 + i * 90) % (h + 120)) - 60
          for (let k = 0; k < 5; k++) {
            const y = yBase - k * 14
            const ch = TOKENS[(i * 5 + k) % TOKENS.length]
            const a = 0.14 - k * 0.025
            if (a <= 0) continue
            if (exclusionFade(x, y) < 0.4) continue
            ctx.fillStyle = i % 3 === 0
              ? `rgba(255, 170, 80, ${a})`
              : `rgba(170, 140, 255, ${a})`
            ctx.fillText(ch.length > 4 ? ch.slice(0, 3) : ch, x, y)
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ro.disconnect()
    }
  }, [])

  return <canvas className="code-field" ref={canvasRef} aria-hidden />
}
