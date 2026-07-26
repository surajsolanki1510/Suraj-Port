import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { emitFlameSurge } from '../lib/flameSurge'

type Flight = {
  startX: number
  startY: number
  duration: number
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Anime character aim point in viewport coords (rocket is position: fixed). */
function characterTarget() {
  const fig =
    document.querySelector<HTMLElement>('.hero-portrait-fig') ||
    document.querySelector<HTMLElement>('.hero-portrait-wrap')
  if (fig) {
    const rect = fig.getBoundingClientRect()
    if (rect.width > 40 && rect.bottom > 40 && rect.top < window.innerHeight) {
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.4,
      }
    }
  }

  if (window.innerWidth <= 960) {
    return { x: window.innerWidth / 2, y: Math.min(window.innerHeight * 0.3, 220) }
  }
  return { x: window.innerWidth * 0.2, y: window.innerHeight * 0.45 }
}

export function useRocketAscend() {
  const [flight, setFlight] = useState<Flight | null>(null)
  const [merge, setMerge] = useState<{ x: number; y: number } | null>(null)
  const busy = useRef(false)
  const scrollTween = useRef<gsap.core.Tween | null>(null)

  const launch = useCallback((originEl: HTMLElement) => {
    if (busy.current) return
    busy.current = true

    if (prefersReducedMotion()) {
      const hero = document.getElementById('hero')
      if (hero) hero.scrollIntoView({ behavior: 'auto', block: 'start' })
      else window.scrollTo(0, 0)
      busy.current = false
      return
    }

    // Freeze section reveals so rocket scroll doesn't thrash the whole UI
    ScrollTrigger.getAll().forEach((st) => st.disable(false))

    const rect = originEl.getBoundingClientRect()
    const duration = Math.min(2, Math.max(1.15, window.scrollY / 1300))

    setMerge(null)
    setFlight({
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
      duration,
    })

    scrollTween.current?.kill()
    const html = document.documentElement
    const prevBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'

    const proxy = { y: window.scrollY }
    scrollTween.current = gsap.to(proxy, {
      y: 0,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: () => {
        html.style.scrollBehavior = prevBehavior
      },
    })
  }, [])

  const onArrived = useCallback((x: number, y: number) => {
    setFlight(null)
    setMerge({ x, y })
    emitFlameSurge()

    window.setTimeout(() => {
      setMerge(null)
      ScrollTrigger.getAll().forEach((st) => st.enable(false))
      ScrollTrigger.refresh()
      busy.current = false
    }, 1600)
  }, [])

  useEffect(() => {
    return () => {
      scrollTween.current?.kill()
      ScrollTrigger.getAll().forEach((st) => st.enable(false))
    }
  }, [])

  return { flight, merge, launch, onArrived }
}

export function RocketAscendLayer({
  flight,
  merge,
  onArrived,
}: {
  flight: Flight | null
  merge: { x: number; y: number } | null
  onArrived: (x: number, y: number) => void
}) {
  const rocketRef = useRef<HTMLDivElement>(null)
  const arrived = useRef(false)

  useEffect(() => {
    if (!flight || !rocketRef.current) return
    arrived.current = false
    const el = rocketRef.current
    const startX = flight.startX
    const startY = flight.startY

    gsap.set(el, {
      x: startX,
      y: startY,
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      scale: 0.7,
      rotate: -6,
    })

    const state = { p: 0 }

    const tl = gsap.timeline({
      onComplete: () => {
        if (arrived.current) return
        arrived.current = true
        const live = characterTarget()
        onArrived(live.x, live.y)
      },
    })

    tl.to(el, { opacity: 1, duration: 0.18, ease: 'power1.out' })
      .to(
        state,
        {
          p: 1,
          duration: flight.duration,
          ease: 'power2.inOut',
          onUpdate: () => {
            const live = characterTarget()
            const p = state.p
            gsap.set(el, {
              x: startX + (live.x - startX) * p,
              y: startY + (live.y - startY) * p,
              scale: 0.7 + 0.3 * p,
              rotate: -6 + 6 * p,
            })
          },
        },
        0,
      )
      .to(
        el,
        {
          opacity: 0,
          scale: 0.55,
          duration: 0.42,
          ease: 'power2.out',
        },
        flight.duration - 0.28,
      )

    return () => {
      tl.kill()
    }
  }, [flight, onArrived])

  return (
    <div className="rocket-layer" aria-hidden>
      {flight && (
        <div ref={rocketRef} className="rocket-flyer">
          <span className="rocket-flyer-trail" />
          <span className="rocket-flyer-flame" />
          <svg className="rocket-flyer-body" viewBox="0 0 24 32" fill="none">
            <path
              d="M12 2 C14.5 7 16 12 16 18 L14 28 L12 26 L10 28 L8 18 C8 12 9.5 7 12 2Z"
              fill="url(#rocketFill)"
            />
            <path d="M8 18 L4 24 L8 22Z" fill="#ff7a18" />
            <path d="M16 18 L20 24 L16 22Z" fill="#ff7a18" />
            <circle cx="12" cy="14" r="2.2" fill="#fff6ee" opacity="0.9" />
            <defs>
              <linearGradient id="rocketFill" x1="12" y1="2" x2="12" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff6ee" />
                <stop offset="0.45" stopColor="#ffb347" />
                <stop offset="1" stopColor="#ff2a1f" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {merge && <div className="rocket-merge" style={{ left: merge.x, top: merge.y }} />}
    </div>
  )
}
