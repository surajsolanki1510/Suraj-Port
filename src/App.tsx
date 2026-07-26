import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Skills } from './components/Skills'
import { Projects } from './components/Projects'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { RocketAscendLayer, useRocketAscend } from './components/RocketAscend'
import { site } from './data/content'

gsap.registerPlugin(ScrollTrigger)

const INTRO_AUDIO_KEY = 'suraj-port-intro-audio'

/** Events that count as the interaction browsers require before audible playback. */
const UNLOCK_EVENTS = [
  'pointerdown',
  'mousedown',
  'touchstart',
  'keydown',
  'wheel',
  'scroll',
  'mousemove',
] as const

export default function App() {
  const { flight, merge, launch, onArrived } = useRocketAscend()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.section').forEach((section) => {
        gsap.fromTo(
          section,
          { y: 28, opacity: 0.35 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              toggleActions: 'play none none none',
              once: true,
            },
          },
        )
      })
    })

    return () => ctx.revert()
  }, [])

  // Intro sting: plays by default, once per browser tab session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(INTRO_AUDIO_KEY)) return
    } catch {
      return
    }

    const audio = new Audio('/port-audio.mp3')
    audio.preload = 'auto'
    audio.muted = false
    audio.volume = 0.6

    let started = false
    let cleaned = false

    const markPlayed = () => {
      try {
        sessionStorage.setItem(INTRO_AUDIO_KEY, '1')
      } catch {
        /* private mode / blocked storage */
      }
    }

    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      UNLOCK_EVENTS.forEach((evt) => window.removeEventListener(evt, unlock, true))
      document.removeEventListener('visibilitychange', onVisible)
    }

    const attempt = () => {
      if (started) return
      void audio.play().then(
        () => {
          started = true
          markPlayed()
          cleanup()
        },
        () => {
          /* still blocked — listeners stay armed */
        },
      )
    }

    const unlock = () => attempt()

    const onVisible = () => {
      if (document.visibilityState === 'visible') attempt()
    }

    // Try immediately; browsers allow this when the visitor has prior engagement
    attempt()

    // Otherwise fire on the earliest signal of interaction
    UNLOCK_EVENTS.forEach((evt) =>
      window.addEventListener(evt, unlock, { capture: true, passive: true }),
    )
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cleanup()
      audio.pause()
      audio.src = ''
    }
  }, [])

  return (
    <>
      <div className="grain" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <About />
        <Contact />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-end">
            <p>
              © {new Date().getFullYear()} {site.name} — code that hits different.
            </p>
            <a
              href="#hero"
              className="footer-top"
              aria-label="Back to top"
              onClick={(e) => {
                e.preventDefault()
                launch(e.currentTarget)
              }}
            >
              <span className="footer-top-thruster" aria-hidden>
                <span className="footer-top-flame" />
                <svg viewBox="0 0 24 24" className="footer-top-arrow" aria-hidden>
                  <path d="M12 4 L19 13 H15 V20 H9 V13 H5 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="footer-top-labels" aria-hidden>
                <span className="footer-top-label">Back to top</span>
                <span className="footer-top-label alt">Launch</span>
              </span>
            </a>
          </div>
        </div>
      </footer>
      <RocketAscendLayer flight={flight} merge={merge} onArrived={onArrived} />
    </>
  )
}
