import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '../data/content'

export function Projects() {
  const [active, setActive] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)
  const project = projects[active]
  const isLive = project.href.startsWith('http')

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const chip = rail.querySelector<HTMLElement>(`[data-mission="${active}"]`)
    if (!chip) return
    const left = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [active])

  const prev = () => setActive((i) => (i - 1 + projects.length) % projects.length)
  const next = () => setActive((i) => (i + 1) % projects.length)

  return (
    <section className="section projects-section" id="projects">
      <motion.p
        className="section-eyebrow"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Live worlds
      </motion.p>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Projects you can open.
      </motion.h2>

      <div className="quest" style={{ ['--accent' as string]: project.accent }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={project.id}
            className="quest-stage"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="quest-viewport">
              <div className="quest-frame-ornament" aria-hidden />

              {project.preview === 'shot' && project.shot && (
                <div className="quest-shot">
                  <img src={project.shot} alt={`${project.title} interface`} />
                </div>
              )}

              <a
                className="quest-open"
                href={project.href}
                {...(isLive ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {isLive ? 'Open full site ↗' : 'Enter ↓'}
              </a>
            </div>

            <div className="quest-hud">
              <div className="quest-hud-main">
                <p className="quest-tag">{project.tagline}</p>
                <h3 className="quest-title">{project.title}</h3>
                <p className="quest-blurb">{project.blurb}</p>
              </div>
              <div className="quest-hud-side">
                <span className="quest-live-badge">{project.status}</span>
                <span className="quest-year">{project.year}</span>
                <ul className="quest-stack">
                  {project.tags.slice(0, 5).map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <a
                  className="quest-cta"
                  href={project.href}
                  {...(isLive ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {isLive ? 'Launch ↗' : 'Jump ↓'}
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="quest-controls">
          <div className="quest-pager">
            <button type="button" onClick={prev} aria-label="Previous project">
              ‹
            </button>
            <p>
              <strong>{project.id}</strong>
              <span>{project.title}</span>
            </p>
            <button type="button" onClick={next} aria-label="Next project">
              ›
            </button>
          </div>

          <div className="quest-rail" ref={railRef}>
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                data-mission={i}
                className={`quest-chip${i === active ? ' on' : ''}`}
                style={{ ['--accent' as string]: p.accent }}
                onClick={() => setActive(i)}
              >
                <span className="quest-chip-id">{p.id}</span>
                <span className="quest-chip-name">{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
