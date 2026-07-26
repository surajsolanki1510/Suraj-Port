import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { about } from '../data/content'

type Chapter = 0 | 1 | 2

const CHAPTER_KEYS = ['intro', 'education', 'experience'] as const
const CHAR_MS = 26
const LINE_PAUSE = 200

/** Natural size of the portrait photo — the fixed coordinate space */
const PHOTO_W = 1536

/** Below this rendered stage width, use short lines + big type so the screen stays readable */
const COMPACT_STAGE_W = 700

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Props = {
  chapter: Chapter
  /** false = photo shows its own logo screen; true = live terminal warped onto the LCD */
  engaged: boolean
}

export function LaptopScreen({ chapter, engaged }: Props) {
  const fitRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [inView, setInView] = useState(false)
  const [line, setLine] = useState(0)
  const [char, setChar] = useState(0)
  const [done, setDone] = useState(false)
  const compact = scale > 0 && scale * PHOTO_W < COMPACT_STAGE_W

  const script = useMemo(() => {
    const pack = about.terminal[CHAPTER_KEYS[chapter]]
    return compact ? pack.compact : pack.full
  }, [chapter, compact])

  // Scale the fixed 1536x1024 space to the rendered stage width
  useLayoutEffect(() => {
    const parent = fitRef.current?.parentElement
    if (!parent) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 0) setScale(w / PHOTO_W)
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  // Gate typing on the stage being visible
  useEffect(() => {
    const parent = fitRef.current?.parentElement
    if (!parent) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    )
    io.observe(parent)
    return () => io.disconnect()
  }, [])

  // Restart typing on chapter change / first engage
  useEffect(() => {
    if (!engaged) return
    setLine(0)
    setChar(0)
    setDone(false)
  }, [chapter, script, engaged])

  useEffect(() => {
    if (!engaged || !inView) return
    if (prefersReducedMotion()) {
      setLine(script.length)
      setChar(0)
      setDone(true)
    }
  }, [engaged, inView, script])

  useEffect(() => {
    if (!engaged || !inView || done || prefersReducedMotion()) return
    if (line >= script.length) {
      setDone(true)
      return
    }

    const current = script[line]
    if (char < current.length) {
      const t = window.setTimeout(() => setChar((c) => c + 1), CHAR_MS)
      return () => window.clearTimeout(t)
    }

    const t = window.setTimeout(() => {
      setLine((l) => l + 1)
      setChar(0)
    }, LINE_PAUSE)
    return () => window.clearTimeout(t)
  }, [engaged, inView, done, line, char, script])

  const visibleLines = engaged ? script.slice(0, Math.min(line, script.length)) : []
  const typingLine =
    engaged && !done && line < script.length ? script[line].slice(0, char) : null

  return (
    <div
      className="laptop-fit"
      ref={fitRef}
      style={{ transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
      aria-hidden
    >
      <AnimatePresence>
        {engaged && (
          <>
            <motion.div
              key="quad"
              className="laptop-quad"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={`laptop-app${compact ? ' compact' : ''}`}>
                <pre className="laptop-screen-term">
                  {visibleLines.map((l, i) => (
                    <span key={`${chapter}-${i}`} className="laptop-line">
                      {l}
                      {'\n'}
                    </span>
                  ))}
                  {typingLine !== null && (
                    <span className="laptop-line">
                      {typingLine}
                      <span className="laptop-cursor" />
                    </span>
                  )}
                  {done && <span className="laptop-cursor" />}
                </pre>
              </div>

              {/* LCD realism stack */}
              <div className="laptop-lcd-vignette" />
              <div className="laptop-lcd-pixels" />
              <div className="laptop-lcd-glare" />
              <div className="laptop-lcd-edge" />
            </motion.div>

            {/* Light spill from the (now darker, purple) screen */}
            <motion.div
              key="spill-deck"
              className="laptop-spill laptop-spill-deck"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              key="spill-side"
              className="laptop-spill laptop-spill-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
