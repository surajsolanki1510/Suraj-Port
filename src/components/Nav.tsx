import { useEffect, useState } from 'react'
import { navLinks, site } from '../data/content'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.4, 0.7] },
    )

    sections.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="nav">
      <a href="#hero" className="nav-brand" onClick={() => setOpen(false)}>
        {site.name}<span>.</span>
      </a>

      <button
        className="nav-toggle"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>

      <ul className={`nav-links${open ? ' open' : ''}`}>
        {navLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={active === link.id ? 'active' : ''}
              onClick={(e) => {
                setOpen(false)
                const el = document.getElementById(link.id)
                if (!el) return
                e.preventDefault()
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                history.replaceState(null, '', `#${link.id}`)
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  )
}
