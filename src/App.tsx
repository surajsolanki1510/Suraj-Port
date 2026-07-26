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

function prefersQuiet() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(prefers-reduced-data: reduce)').matches)
  )
}

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

  // Intro sting: once per browser tab session
  useEffect(() => {
    if (prefersQuiet()) return
    try {
      if (sessionStorage.getItem(INTRO_AUDIO_KEY)) return
    } catch {
      return
    }

    const audio = new Audio('/port-audio.mp3')
    audio.preload = 'auto'
    audio.volume = 0.55

    let started = false
    let cleaned = false

    const markPlayed = () => {
      try {
        sessionStorage.setItem(INTRO_AUDIO_KEY, '1')
      } catch {
        /* private mode / blocked storage */
      }
    }

    const cleanupUnlock = () => {
      if (cleaned) return
      cleaned = true
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('keydown', unlock, true)
    }

    const start = () => {
      if (started) return
      started = true
      void audio.play().then(
        () => {
          markPlayed()
        },
        () => {
          started = false
        },
      )
    }

    const unlock = () => {
      if (started) {
        cleanupUnlock()
        return
      }
      start()
      cleanupUnlock()
    }

    void audio.play().then(
      () => {
        started = true
        markPlayed()
        cleanupUnlock()
      },
      () => {
        // Autoplay blocked — wait for first user gesture in this tab
        window.addEventListener('pointerdown', unlock, true)
        window.addEventListener('keydown', unlock, true)
      },
    )

    return () => {
      cleanupUnlock()
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
