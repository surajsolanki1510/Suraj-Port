import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { site } from '../data/content'
import { FlameCanvas } from './FlameCanvas'
import { EyeFireCanvas } from './EyeFireCanvas'
import { CodeForge } from './CodeForge'
import { CodeRain } from './CodeRain'
import { onFlameSurge } from '../lib/flameSurge'

const RAGE_MS = 5200

const embers = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: 8 + ((i * 29) % 84),
  delay: (i % 10) * 0.12,
  duration: 1.5 + (i % 6) * 0.35,
  size: 2 + (i % 5),
  drift: ((i % 7) - 3) * 18,
}))

export function Hero() {
  const [raging, setRaging] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const portraitRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const off = onFlameSurge(() => {
      window.clearTimeout(timer.current)
      setRaging(false)
      requestAnimationFrame(() => setRaging(true))
      timer.current = window.setTimeout(() => setRaging(false), RAGE_MS)
    })
    return () => {
      off()
      window.clearTimeout(timer.current)
    }
  }, [])

  return (
    <section className="hero" id="hero">
      <div className="hero-bg" aria-hidden />
      <div className="hero-code-layer" aria-hidden>
        <CodeRain />
      </div>
      <div className="hero-scanlines" aria-hidden />

      <div className="hero-layout">
        <motion.aside
          className="hero-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={`hero-portrait-wrap${raging ? ' is-raging' : ''}`}>
            <div className="flame-back" aria-hidden>
              <FlameCanvas />
              <div className="flame-aura" />
            </div>

            <div className="hero-portrait-fig">
              <img
                ref={portraitRef}
                className="hero-portrait"
                src="/suraj-main-anime.png"
                alt={`${site.name} portrait`}
                width={1122}
                height={1402}
                decoding="async"
              />

              <div className="hero-rage" aria-hidden>
                <EyeFireCanvas active={raging} imageRef={portraitRef} />
                <span className="hero-rage-shimmer" />
                <span className="hero-rage-embers">
                  {embers.map((e) => (
                    <b
                      key={e.id}
                      style={
                        {
                          left: `${e.left}%`,
                          width: e.size,
                          height: e.size,
                          '--delay': `${e.delay}s`,
                          '--dur': `${e.duration}s`,
                          '--drift': `${e.drift}px`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
              </div>
            </div>

            <div className="hero-rage-vignette" aria-hidden />

            <div className="hero-frame-marks" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </motion.aside>

        <div className="hero-right">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="pulse-dot" />
            PLAYER ONLINE · LVL 99
          </motion.div>

          <motion.p
            className="hero-role"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            {site.role}
          </motion.p>

          <motion.h1
            className="hero-name"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {site.name}
          </motion.h1>

          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            Where Ideas Catch <em>Fire</em>
          </motion.p>

          <motion.div
            className="hero-forge-wrap"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <CodeForge />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
