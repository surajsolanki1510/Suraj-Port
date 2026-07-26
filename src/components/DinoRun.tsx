import { useCallback, useEffect, useRef, useState } from 'react'
import { contact } from '../data/content'
import {
  fetchChampion,
  remoteEnabled,
  submitScore,
  type Champion,
} from '../lib/leaderboard'

/* Chrome-style offline T-Rex runner — ember skin + phone-friendly controls. */

const BEST_KEY = 'suraj-dino-best-v2'
const CHAMPION_KEY = 'suraj-dino-champion-v2'
const RESET_FLAG = 'suraj-dino-zeroed-once'

// One-time reset: wipe all local high scores back to 0
try {
  if (!localStorage.getItem(RESET_FLAG)) {
    localStorage.removeItem('suraj-dino-best')
    localStorage.removeItem('suraj-dino-champion')
    localStorage.removeItem(BEST_KEY)
    localStorage.removeItem(CHAMPION_KEY)
    localStorage.setItem(RESET_FLAG, '1')
  }
} catch {
  /* ignore */
}

type Obstacle = {
  x: number
  w: number
  h: number
  kind: 'cactus' | 'bird'
  y: number
  flap: number
  cluster: number
}

type Cloud = { x: number; y: number; s: number }

type Hud = {
  score: number
  best: number
  running: boolean
  over: boolean
  started: boolean
  night: boolean
  beatRecord: boolean
  tier: string
  speedLabel: string
}

type Actions = {
  jump: () => void
  setDuck: (v: boolean) => void
  reset: () => void
}

function loadBest() {
  try {
    const n = Number(localStorage.getItem(BEST_KEY))
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function saveBest(score: number) {
  try {
    if (score > loadBest()) localStorage.setItem(BEST_KEY, String(score))
  } catch {
    /* ignore */
  }
}

function loadChampion(): Champion {
  try {
    const raw = localStorage.getItem(CHAMPION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Champion
      if (parsed?.name && Number.isFinite(parsed.score) && parsed.score > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return { name: 'Nobody yet', score: 0 }
}

function saveChampion(champ: Champion) {
  try {
    localStorage.setItem(CHAMPION_KEY, JSON.stringify(champ))
    if (champ.score > loadBest()) localStorage.setItem(BEST_KEY, String(champ.score))
  } catch {
    /* ignore */
  }
}

function whatsappScoreUrl(score: number, champ: Champion, playerName?: string) {
  const lines = [
    `Yo Suraj 🔥 just ripped Dino Run on your portfolio.`,
    ``,
    `My run: ${score}m`,
    champ.score > 0
      ? `Current crown: ${champ.name} — ${champ.score}m`
      : `No champion yet — the board was empty.`,
    playerName ? `I just claimed the record as "${playerName}".` : ``,
    ``,
    `Think you can outrun me? Open your site and prove it.`,
  ]
    .filter(Boolean)
    .join('\n')
  const base = contact.whatsapp.split('?')[0]
  return `${base}?text=${encodeURIComponent(lines)}`
}

const emptyHud = (): Hud => ({
  score: 0,
  best: loadBest(),
  running: false,
  over: false,
  started: false,
  night: false,
  beatRecord: false,
  tier: 'WARMUP',
  speedLabel: 'x1.0',
})

function runTier(score: number) {
  if (score < 200) return 'WARMUP'
  if (score < 500) return 'CRUISE'
  if (score < 900) return 'PRESSURE'
  return 'CHAOS'
}

function px(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  x: number,
  y: number,
  w: number,
  h: number,
  s: number,
) {
  ctx.fillRect(ox + x * s, oy + y * s, w * s, h * s)
}

export function DinoRun() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const actionsRef = useRef<Actions>({
    jump: () => undefined,
    setDuck: () => undefined,
    reset: () => undefined,
  })
  const [hud, setHud] = useState<Hud>(emptyHud)
  const [duckingUi, setDuckingUi] = useState(false)
  const [champion, setChampion] = useState<Champion>(() => loadChampion())
  const [nameDraft, setNameDraft] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const runningRef = useRef(false)
  const championRef = useRef(champion)
  championRef.current = champion

  // Pull the global champion from Firebase (falls back to local storage)
  useEffect(() => {
    if (!remoteEnabled) return
    let cancelled = false
    fetchChampion().then((remote) => {
      if (cancelled || !remote) return
      setChampion((local) => (remote.score >= local.score ? remote : local))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const start = useCallback(() => {
    setNameDraft('')
    setNameSaved(false)
    actionsRef.current.reset()
  }, [])

  const share = useCallback(() => {
    const champ = championRef.current.score > 0 ? championRef.current : loadChampion()
    const name = nameSaved ? nameDraft.trim() : undefined
    window.open(whatsappScoreUrl(hud.score, champ, name), '_blank', 'noopener,noreferrer')
  }, [hud.score, nameDraft, nameSaved])

  const claimRecord = useCallback(async () => {
    const name = nameDraft.trim().slice(0, 18)
    if (!name || hud.score <= 0 || claiming) return
    setClaiming(true)
    const next = { name, score: hud.score }
    saveChampion(next)
    setChampion(next)
    if (remoteEnabled) await submitScore(name, hud.score)
    setClaiming(false)
    setNameSaved(true)
  }, [nameDraft, hud.score, claiming])

  const onJump = useCallback(() => actionsRef.current.jump(), [])
  const onDuckDown = useCallback(() => {
    setDuckingUi(true)
    actionsRef.current.setDuck(true)
  }, [])
  const onDuckUp = useCallback(() => {
    setDuckingUi(false)
    actionsRef.current.setDuck(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let alive = true
    let W = 800
    let H = 240
    const GROUND = () => H - 42

    let running = false
    let over = false
    let score = 0
    let speed = 4.4
    const baseSpeed = 4.4
    const maxBoost = 5.1
    let spawnTimer = 110
    let groundOff = 0
    let hudTick = 0
    let lastHudScore = -1
    let nightMix = 0
    let flashHit = 0
    let lastTs = 0
    let cachedBest = loadBest()

    const dino = {
      x: 52,
      y: 0,
      vy: 0,
      h: 46,
      duckH: 26,
      ducking: false,
      onGround: true,
      legPhase: 0,
      blink: 0,
    }
    const GRAVITY = 0.9
    const JUMP_V = 15.1
    const SCALE = 2

    const obstacles: Obstacle[] = []
    const clouds: Cloud[] = []
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random(),
        y: 0.15 + Math.random() * 0.35,
        s: 0.6 + Math.random() * 0.6,
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = Math.max(320, wrap.clientWidth)
      // Fill the stage on desktop frame layouts; fall back to classic ratio on phones
      const stageH = wrap.clientHeight
      H =
        stageH > 220
          ? Math.max(220, Math.min(420, stageH))
          : Math.max(210, Math.min(300, Math.round(W * 0.32)))
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const resetRun = () => {
      obstacles.length = 0
      score = 0
      speed = baseSpeed
      spawnTimer = 110
      lastHudScore = -1
      lastTs = 0
      cachedBest = loadBest()
      groundOff = 0
      nightMix = 0
      flashHit = 0
      over = false
      running = true
      runningRef.current = true
      dino.y = 0
      dino.vy = 0
      dino.onGround = true
      dino.ducking = false
      dino.legPhase = 0
      dino.blink = 0
      setDuckingUi(false)
      setHud({
        score: 0,
        best: loadBest(),
        running: true,
        over: false,
        started: true,
        night: false,
        beatRecord: false,
        tier: 'WARMUP',
        speedLabel: 'x1.0',
      })
    }

    const jump = () => {
      // Start / restart in place — never remount the canvas
      if (!running || over) {
        resetRun()
        dino.vy = -JUMP_V
        dino.onGround = false
        return
      }
      if (dino.onGround && !dino.ducking) {
        dino.vy = -JUMP_V
        dino.onGround = false
      }
    }
    const setDuck = (v: boolean) => {
      if (!running || over) return
      dino.ducking = v && dino.onGround
    }
    actionsRef.current = { jump, setDuck, reset: resetRun }

    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null
      if (!el) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping()) return
      const k = e.key
      const isJump = k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W'
      const isDuck = k === 'ArrowDown' || k === 's' || k === 'S'
      const isSide = k === 'ArrowLeft' || k === 'ArrowRight'

      if (running && !over) {
        if (isJump || isDuck || isSide) {
          e.preventDefault()
          e.stopPropagation()
        }
        if (isSide) return
        // Ignore key repeat for jump so holding ↑ doesn't spam
        if (isJump && !e.repeat) jump()
        else if (isDuck) {
          setDuck(true)
          setDuckingUi(true)
        }
        return
      }

      // Idle / game over — only first keydown starts (not autorepeat)
      if (isJump) {
        e.preventDefault()
        if (!e.repeat) jump()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (isTyping()) return
      if (!running || over) return
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault()
        e.stopPropagation()
        setDuck(false)
        setDuckingUi(false)
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest?.('.dino-pad')) return
      jump()
    }

    window.addEventListener('keydown', onKeyDown, { passive: false, capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    canvas.addEventListener('pointerdown', onPointerDown)

    const spawn = () => {
      // Soft start → birds creep in → late chaos
      const birdChance =
        score < 180 ? 0 : score < 380 ? 0.06 : score < 650 ? 0.14 : score < 1000 ? 0.24 : 0.38
      const isBird = Math.random() < birdChance

      if (isBird) {
        const tier = Math.random()
        // More low birds late (forces duck timing)
        const y =
          score > 900
            ? tier > 0.55
              ? 14
              : tier > 0.25
                ? 36
                : 62
            : tier > 0.66
              ? 62
              : tier > 0.33
                ? 36
                : 14
        obstacles.push({ x: W + 24, w: 46, h: 32, kind: 'bird', y, flap: 0, cluster: 1 })
      } else {
        let cluster = 1
        if (score > 340 && Math.random() < Math.min(0.42, 0.05 + score * 0.0003)) cluster = 2
        if (score > 980 && Math.random() < Math.min(0.3, 0.03 + score * 0.00016)) cluster = 3
        const unit = 18
        obstacles.push({
          x: W + 24,
          w: unit * cluster + (cluster - 1) * 4,
          h: 28 + Math.random() * (score > 500 ? 18 : score > 250 ? 14 : 9),
          kind: 'cactus',
          y: 0,
          flap: 0,
          cluster,
        })
      }
    }

    const endGame = () => {
      if (over) return
      over = true
      running = false
      runningRef.current = false
      const finalScore = Math.floor(score)
      saveBest(finalScore)
      cachedBest = loadBest()
      const champ =
        championRef.current.score > 0 ? championRef.current : loadChampion()
      const beatRecord = finalScore > champ.score
      flashHit = 1
      setDuckingUi(false)
      setHud({
        score: finalScore,
        best: cachedBest,
        running: false,
        over: true,
        started: true,
        night: nightMix > 0.5,
        beatRecord,
        tier: runTier(finalScore),
        speedLabel: `x${(speed / baseSpeed).toFixed(1)}`,
      })
    }

    const syncHud = (force = false) => {
      const floored = Math.floor(score)
      const tier = runTier(floored)
      const speedLabel = `x${(speed / baseSpeed).toFixed(1)}`
      hudTick++
      // Only push React state when the visible score changes — avoids lag at high speed
      if (!force && floored === lastHudScore && hudTick % 12 !== 0) return
      lastHudScore = floored
      setHud((h) => {
        if (
          !force &&
          h.score === floored &&
          h.running === running &&
          h.over === over &&
          h.night === nightMix > 0.5 &&
          h.tier === tier &&
          h.speedLabel === speedLabel
        ) {
          return h
        }
        return {
          ...h,
          score: floored,
          best: cachedBest,
          running,
          over,
          night: nightMix > 0.5,
          tier,
          speedLabel,
        }
      })
    }

    // Classic Chrome dino palette — flips to "night" mode on the day/night cycle.
    const night = () => nightMix > 0.5
    const FG = () => (night() ? '#e6e6e6' : '#535353')
    const BG = () => (night() ? '#1b1b1e' : '#f7f7f7')
    const CLOUD = () => (night() ? '#40404a' : '#d6d6d6')

    const drawBackground = () => {
      ctx.fillStyle = BG()
      ctx.fillRect(0, 0, W, H)

      if (night()) {
        // stars
        ctx.fillStyle = '#c9c9d2'
        for (let i = 0; i < 26; i++) {
          ctx.fillRect((i * 137.5) % W, (i * 53.7) % (H * 0.5), 2, 2)
        }
        // crescent moon
        const mx = W * 0.82
        const my = H * 0.24
        ctx.fillStyle = '#e8e8e8'
        ctx.beginPath()
        ctx.arc(mx, my, 14, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = BG()
        ctx.beginPath()
        ctx.arc(mx - 6, my - 3, 13, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = CLOUD()
      for (const c of clouds) {
        const x = c.x * W
        const y = c.y * H
        const s = c.s
        ctx.fillRect(x + 10 * s, y, 24 * s, 5 * s)
        ctx.fillRect(x + 4 * s, y + 5 * s, 38 * s, 5 * s)
        ctx.fillRect(x, y + 10 * s, 46 * s, 4 * s)
      }
    }

    const drawGround = () => {
      const gy = GROUND()
      ctx.fillStyle = FG()
      ctx.fillRect(0, gy, W, 2)
      const step = 42
      for (let x = -((groundOff) % step); x < W; x += step) {
        ctx.fillRect(x + 6, gy + 5, 7, 2)
        ctx.fillRect(x + 24, gy + 8, 3, 2)
      }
    }

    const drawDino = () => {
      const gy = GROUND()
      const s = SCALE
      const ox = dino.x
      const duck = dino.ducking
      const bodyH = duck ? dino.duckH : dino.h
      const oy = gy - bodyH - dino.y

      const fill = FG()
      const dark = FG()
      const eye = BG()
      ctx.fillStyle = fill

      if (duck) {
        px(ctx, ox, oy, 0, 6, 8, 4, s)
        px(ctx, ox, oy, 2, 4, 22, 8, s)
        px(ctx, ox, oy, 20, 2, 10, 8, s)
        px(ctx, ox, oy, 28, 0, 10, 7, s)
        px(ctx, ox, oy, 36, 2, 3, 3, s)
        ctx.fillStyle = eye
        px(ctx, ox, oy, 33, 1, 2, 2, s)
        ctx.fillStyle = dark
        const lp = Math.sin(dino.legPhase)
        px(ctx, ox, oy, 8, 11, 3, 3 + (lp > 0 ? 1 : 0), s)
        px(ctx, ox, oy, 16, 11, 3, 3 + (lp < 0 ? 1 : 0), s)
      } else {
        px(ctx, ox, oy, 0, 10, 2, 2, s)
        px(ctx, ox, oy, 1, 11, 3, 3, s)
        px(ctx, ox, oy, 2, 12, 4, 4, s)
        px(ctx, ox, oy, 4, 13, 4, 5, s)
        px(ctx, ox, oy, 6, 10, 10, 10, s)
        px(ctx, ox, oy, 8, 8, 8, 4, s)
        px(ctx, ox, oy, 14, 4, 4, 8, s)
        px(ctx, ox, oy, 16, 0, 10, 10, s)
        px(ctx, ox, oy, 24, 4, 3, 3, s)
        px(ctx, ox, oy, 25, 6, 2, 2, s)
        ctx.fillStyle = dark
        px(ctx, ox, oy, 18, -1, 2, 2, s)
        px(ctx, ox, oy, 21, -1, 2, 2, s)
        ctx.fillStyle = eye
        if (dino.blink <= 0) px(ctx, ox, oy, 22, 2, 2, 2, s)
        else px(ctx, ox, oy, 22, 3, 2, 1, s)
        ctx.fillStyle = fill
        px(ctx, ox, oy, 14, 12, 3, 2, s)
        px(ctx, ox, oy, 16, 13, 2, 2, s)
        ctx.fillStyle = fill
        const lp = Math.sin(dino.legPhase)
        if (!dino.onGround) {
          px(ctx, ox, oy, 8, 18, 3, 4, s)
          px(ctx, ox, oy, 12, 17, 3, 5, s)
          px(ctx, ox, oy, 7, 21, 4, 2, s)
          px(ctx, ox, oy, 12, 21, 4, 2, s)
        } else if (lp >= 0) {
          px(ctx, ox, oy, 8, 18, 3, 5, s)
          px(ctx, ox, oy, 7, 22, 4, 2, s)
          px(ctx, ox, oy, 13, 18, 3, 3, s)
          px(ctx, ox, oy, 13, 20, 5, 2, s)
        } else {
          px(ctx, ox, oy, 8, 18, 3, 3, s)
          px(ctx, ox, oy, 8, 20, 5, 2, s)
          px(ctx, ox, oy, 13, 18, 3, 5, s)
          px(ctx, ox, oy, 12, 22, 4, 2, s)
        }
      }
    }

    const drawObstacle = (o: Obstacle) => {
      const gy = GROUND()
      if (o.kind === 'cactus') {
        ctx.fillStyle = FG()
        for (let i = 0; i < o.cluster; i++) {
          const cx = o.x + i * 22
          const ch = o.h - (i % 2) * 6
          const cy = gy - ch
          ctx.fillRect(cx + 4, cy, 10, ch)
          ctx.fillRect(cx - 2, cy + ch * 0.3, 6, 4)
          ctx.fillRect(cx - 2, cy + ch * 0.3 - 10, 4, 14)
          ctx.fillRect(cx + 14, cy + ch * 0.45, 6, 4)
          ctx.fillRect(cx + 16, cy + ch * 0.45 - 8, 4, 12)
        }
      } else {
        const by = gy - o.y - o.h
        o.flap += 0.28
        const wing = Math.sin(o.flap) * 11
        ctx.fillStyle = FG()
        ctx.fillRect(o.x + 12, by + 12, 22, 10)
        ctx.fillRect(o.x + 32, by + 10, 12, 8)
        ctx.beginPath()
        ctx.moveTo(o.x + 44, by + 12)
        ctx.lineTo(o.x + 54, by + 14)
        ctx.lineTo(o.x + 44, by + 17)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(o.x + 18, by + 14)
        ctx.lineTo(o.x + 2, by + 14 - wing)
        ctx.lineTo(o.x + 28, by + 16)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = BG()
        ctx.fillRect(o.x + 38, by + 12, 2, 2)
      }
    }

    const hit = (o: Obstacle) => {
      const gy = GROUND()
      const dh = dino.ducking ? dino.duckH : dino.h
      const dTop = gy - dh - dino.y + 4
      const dLeft = dino.x + 6
      const dRight = dino.x + (dino.ducking ? 76 : 50)
      const dBottom = gy - dino.y - 2

      let oLeft: number
      let oRight: number
      let oTop: number
      let oBottom: number
      if (o.kind === 'cactus') {
        oLeft = o.x + 2
        oRight = o.x + o.w - 2
        oTop = gy - o.h + 2
        oBottom = gy
      } else {
        oLeft = o.x + 8
        oRight = o.x + 50
        oTop = gy - o.y - o.h + 8
        oBottom = gy - o.y - 2
      }
      return dRight > oLeft && dLeft < oRight && dBottom > oTop && dTop < oBottom
    }

    const tick = (ts: number) => {
      if (!alive) return

      // Delta-time keeps motion smooth even if a frame hiccups
      if (!lastTs) lastTs = ts
      const rawDt = (ts - lastTs) / (1000 / 60)
      lastTs = ts
      const dt = Math.min(2.2, Math.max(0.5, rawDt))

      drawBackground()
      drawGround()

      if (running && !over) {
        score += speed * 0.016 * dt
        // Easy open → slow burn → late chaos (eased curve, high cap)
        const t = Math.min(1, score / 2200)
        const eased = t * t * (1.15 - 0.15 * t)
        speed = baseSpeed + maxBoost * eased
        // Tiny late gravity bump so airtime shrinks under pressure
        const g = GRAVITY + Math.min(0.18, score * 0.00008)
        groundOff += speed * dt
        dino.legPhase += speed * 0.055 * dt

        const cyclePos = (score % 520) / 520
        nightMix = cyclePos < 0.55 ? 0 : Math.min(1, (cyclePos - 0.55) * 3.5)
        if (cyclePos > 0.92) nightMix = Math.max(0, (1 - cyclePos) * 12)

        dino.vy += g * dt
        dino.y -= dino.vy * dt
        if (dino.y <= 0) {
          dino.y = 0
          dino.vy = 0
          dino.onGround = true
        } else {
          dino.onGround = false
          dino.ducking = false
        }
        dino.blink = dino.blink > 0 ? dino.blink - 1 : Math.random() < 0.008 ? 10 : 0

        for (const c of clouds) {
          c.x -= speed * 0.00045 * c.s * dt
          if (c.x < -0.1) {
            c.x = 1.1
            c.y = 0.12 + Math.random() * 0.35
          }
        }

        spawnTimer -= dt
        const maxObs = score > 1100 ? 8 : score > 700 ? 7 : 5
        if (spawnTimer <= 0 && obstacles.length < maxObs) {
          spawn()
          // Wide gaps early, tight late — density mostly from score, not raw speed
          const gap =
            Math.max(52, 190 - score * 0.05 - speed * 1.8) +
            Math.random() * Math.max(22, 72 - score * 0.03)
          spawnTimer = gap
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i]
          o.x -= speed * dt
          if (o.x + o.w < -24) {
            obstacles.splice(i, 1)
            continue
          }
          if (hit(o)) endGame()
        }
      }

      for (const o of obstacles) drawObstacle(o)
      drawDino()

      if (flashHit > 0) {
        ctx.fillStyle = `rgba(83, 83, 83, ${flashHit * 0.18})`
        ctx.fillRect(0, 0, W, H)
        flashHit -= 0.05 * dt
      }

      ctx.fillStyle = FG()
      ctx.font = '700 16px ui-monospace, "Courier New", monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`${String(Math.floor(score)).padStart(5, '0')}`, W - 16, 26)
      ctx.textAlign = 'left'

      if (!running && !over) {
        ctx.fillStyle = FG()
        ctx.font = '600 13px ui-monospace, "Courier New", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('Press Space / Tap to start', W / 2, H * 0.38)
        ctx.textAlign = 'left'
      }

      syncHud()
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    syncHud(true)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <div
      className={`dino${hud.running && !hud.over ? ' is-playing' : ''}${hud.over ? ' is-over' : ''}`}
      data-tier={hud.tier}
    >
      <div className="dino-bezel" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="dino-head">
        <div>
          <div className="dino-title-row">
            <strong>DINO RUN</strong>
            {hud.running && !hud.over && <em className="dino-live">LIVE</em>}
          </div>
          <span className="dino-sub">Warmup → cruise → pressure → chaos. Survive the ramp.</span>
        </div>
        <div className="dino-stats">
          <span className="dino-stat-tier">
            ZONE <b>{hud.tier}</b>
          </span>
          <span>
            SPD <b>{hud.speedLabel}</b>
          </span>
          <span>
            SCORE <b>{hud.score}m</b>
          </span>
          <span>
            BEST <b>{hud.best}m</b>
          </span>
        </div>
      </div>

      <div className="dino-champ" aria-live="polite">
        <span className="dino-champ-label">
          {remoteEnabled ? 'WORLD RECORD' : 'RECORD HOLDER'}
        </span>
        {champion.score > 0 ? (
          <span className="dino-champ-line">
            <b>{champion.name}</b> · {champion.score}m
          </span>
        ) : (
          <span className="dino-champ-line">Open seat — be the first crown</span>
        )}
      </div>

      <div className="dino-stage" ref={wrapRef}>
        <div className="dino-stage-frame" aria-hidden />
        <canvas ref={canvasRef} aria-label="Dinosaur runner game" />

        {hud.over && (
          <div className="dino-over">
            {hud.beatRecord && !nameSaved ? (
              <>
                <p>NEW RECORD</p>
                <h3 className="dino-over-title">You stole the crown.</h3>
                <div className="dino-over-score">{hud.score}m</div>
                <p className="dino-over-copy">
                  You beat {champion.score > 0 ? `${champion.name}'s ${champion.score}m` : 'the empty board'}.
                  Drop your name — own the Dino Run throne.
                </p>
                <form
                  className="dino-claim"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void claimRecord()
                  }}
                >
                  <input
                    type="text"
                    maxLength={18}
                    placeholder="Your name"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    autoFocus
                    aria-label="Champion name"
                  />
                  <button
                    type="submit"
                    className="is-primary"
                    disabled={!nameDraft.trim() || claiming}
                  >
                    {claiming ? 'Claiming…' : 'Claim the crown'}
                  </button>
                </form>
                <button type="button" className="dino-skip" onClick={start}>
                  Skip · run again
                </button>
              </>
            ) : (
              <>
                <p>{nameSaved ? 'CROWN CLAIMED' : 'SYSTEM CRASH'}</p>
                <div className="dino-over-score">{hud.score}m</div>
                <p className="dino-over-copy">
                  {nameSaved
                    ? `${nameDraft.trim()} is the new record holder. Flex it on WhatsApp.`
                    : champion.score > 0
                      ? `Record still belongs to ${champion.name} · ${champion.score}m. Get closer.`
                      : 'Solid run — chase the crown next time.'}
                </p>
                <div className="dino-over-actions">
                  <button type="button" className="is-primary" onClick={share}>
                    WhatsApp my run
                  </button>
                  <button type="button" onClick={start}>
                    Run again
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="dino-keys">
        <b>↑</b> / Space jump · <b>↓</b> duck · zone ramps with distance
      </p>

      {hud.started && !hud.over && (
        <div className="dino-pad" aria-label="Touch controls">
          <button
            type="button"
            className={`dino-pad-btn dino-pad-duck${duckingUi ? ' is-active' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault()
              onDuckDown()
            }}
            onPointerUp={onDuckUp}
            onPointerLeave={onDuckUp}
            onPointerCancel={onDuckUp}
          >
            DUCK
          </button>
          <button
            type="button"
            className="dino-pad-btn dino-pad-jump"
            onPointerDown={(e) => {
              e.preventDefault()
              onJump()
            }}
          >
            JUMP
          </button>
        </div>
      )}

      <p className="dino-foot dino-foot-desktop">
        Laptop: <b>↑</b> jump · <b>↓</b> duck · Survive WARMUP → CHAOS and steal the crown.
      </p>
      <p className="dino-foot dino-foot-mobile">
        Phone: tap <b>Jump</b> / hold <b>Duck</b> · Beat the ramp, claim your name.
      </p>
    </div>
  )
}
