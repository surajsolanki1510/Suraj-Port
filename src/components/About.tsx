import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { about, site } from '../data/content'
import { LaptopScreen } from './LaptopScreen'
import { CodeField } from './CodeField'

const chapters = ['Intro', 'Education', 'Experience'] as const

export function About() {
  const [active, setActive] = useState(0)
  const [engaged, setEngaged] = useState(false)

  const goTo = (i: number) => {
    setEngaged(true)
    setActive(i)
  }

  return (
    <section className="section about-section" id="about">
      <motion.p
        className="section-eyebrow"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {about.eyebrow}
      </motion.p>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {about.title}
      </motion.h2>

      <div className="origin-game">
        <motion.aside
          className="origin-character"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="origin-photo">
            <CodeField />
            <div className="origin-photo-aura" aria-hidden />
            <div className="origin-photo-floor" aria-hidden />
            <div className="origin-photo-frame" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="origin-photo-meta">
              <span>SUBJECT · LIVE</span>
              <span>{engaged ? 'LINKED' : 'STANDBY'}</span>
            </div>
            <div className="origin-dialogue">
              <p className="origin-dialogue-tag">suraj.exe // thought</p>
              <p className="origin-dialogue-line">
                “I don’t just ship features — I craft the moments users remember.”
              </p>
              <p className="origin-dialogue-aside">— late night build log</p>
            </div>
            <div className="origin-screen-stage">
              <img
                src="/about-me-photo-cutout.png"
                alt={`${site.name} — developer portrait`}
                draggable={false}
              />
              <LaptopScreen chapter={active as 0 | 1 | 2} engaged={engaged} />
            </div>
          </div>
        </motion.aside>

        <div className="origin-console">
          <div className="origin-console-head">
            <p>suraj.origin</p>
            <span>
              {engaged
                ? `CHAPTER ${String(active + 1).padStart(2, '0')} / 03`
                : 'DISPLAY · IDLE'}
            </span>
          </div>

          <div className="origin-chapters" role="tablist" aria-label="About chapters">
            {chapters.map((chapter, i) => (
              <button
                key={chapter}
                type="button"
                role="tab"
                aria-selected={engaged && active === i}
                className={engaged && active === i ? 'active' : ''}
                onClick={() => goTo(i)}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {chapter}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="origin-stage"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {active === 0 && (
                <div className="origin-intro">
                  <p className="origin-kicker">HELLO, WORLD.</p>
                  <h3>Hi, I&apos;m <em>{site.name}</em>.</h3>
                  <p>{about.intro}</p>
                  <div className="origin-build">
                    <span>DESIGN</span><i />
                    <span>ENGINEERING</span><i />
                    <span>EXPERIENCE</span>
                  </div>
                  <blockquote>“The best software doesn&apos;t just work — it inspires.”</blockquote>
                </div>
              )}

              {active === 1 && (
                <div className="origin-education">
                  <p className="origin-kicker">KNOWLEDGE TREE</p>
                  <div className="education-map">
                    {about.education.map((edu, i) => (
                      <article key={edu.school}>
                        <div className="education-node">
                          <img src={edu.logo} alt="" />
                          <span>{String(i + 1).padStart(2, '0')}</span>
                        </div>
                        <div>
                          <small>{edu.result}</small>
                          <h3>{edu.school}</h3>
                          <p>{edu.program}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {active === 2 && (
                <div className="origin-experience">
                  <p className="origin-kicker">MISSIONS COMPLETED</p>
                  <div className="experience-deck">
                    {about.experience.map((job) => (
                      <article key={job.company}>
                        <img src={job.logo} alt={`${job.company} logo`} />
                        <div>
                          <small>{job.period}</small>
                          <h3>{job.company}</h3>
                          <p>{job.role}</p>
                          <span>{job.place}</span>
                          <ul>
                            {job.stack.map((tag) => <li key={tag}>{tag}</li>)}
                          </ul>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="origin-nav">
            <button
              type="button"
              onClick={() => goTo((active - 1 + chapters.length) % chapters.length)}
              aria-label="Previous chapter"
            >
              ←
            </button>
            <p>{engaged ? chapters[active] : 'Boot'}</p>
            <button
              type="button"
              onClick={() => goTo((active + 1) % chapters.length)}
              aria-label="Next chapter"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
