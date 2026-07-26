import { useEffect, useMemo, useRef, useState } from 'react'
import { skills } from '../data/content'

const STAGES = [
  {
    id: 'html',
    status: 'COMPILING SKELETON…',
    file: 'suraj.html',
    code: [
      '<div class="player-card">',
      '  <img class="avatar" src="suraj.png" />',
      '  <h1>SURAJ</h1>',
      '  <div class="skill" data-lvl="92">React</div>',
      '  <div class="skill" data-lvl="88">TypeScript</div>',
      '  <div class="skill" data-lvl="85">Node.js</div>',
      '  <div class="skill" data-lvl="80">Python</div>',
      '</div>',
    ],
  },
  {
    id: 'css',
    status: 'APPLYING SKIN…',
    file: 'suraj.css',
    code: [
      '.player-card { border: 1px solid #ff7a18; }',
      '.avatar { border-radius: 50%; border: 2px solid #ffb347; }',
      '.name { color: #ffb347; font-family: Orbitron; }',
      '.skill { color: #f4eee6; letter-spacing: 0.04em; }',
    ],
  },
  {
    id: 'js',
    status: 'INJECTING POWERS…',
    file: 'suraj.js',
    code: [
      'const bars = document.querySelectorAll(".skill")',
      'bars.forEach((bar, i) => {',
      '  bar.animate({ width: bar.dataset.lvl + "%" })',
      '})',
      'aura.set("ember") // live',
    ],
  },
  {
    id: 'py',
    status: 'SYNCING BRAIN…',
    file: 'brain.py',
    code: [
      'from suraj import brain',
      'for skill in brain.load_stats():',
      '    skill.sync()  # -> 100%',
      'print("PLAYER ONLINE")',
    ],
  },
]

const CHAR_MS = 16
const LINE_PAUSE = 150
const STAGE_PAUSE = 700
const DONE_HOLD = 3200

const forgeSkills = skills.slice(0, 4)

export function CodeForge() {
  const [stage, setStage] = useState(0)
  const [line, setLine] = useState(0)
  const [char, setChar] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'stagePause' | 'done'>('typing')
  const bodyRef = useRef<HTMLPreElement>(null)

  const totals = useMemo(
    () => STAGES.map((s) => s.code.reduce((n, l) => n + l.length + 1, 0)),
    [],
  )

  // typing engine
  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => {
        setStage(0)
        setLine(0)
        setChar(0)
        setPhase('typing')
      }, DONE_HOLD)
      return () => clearTimeout(t)
    }

    if (phase === 'stagePause') {
      const t = setTimeout(() => {
        setStage((s) => s + 1)
        setLine(0)
        setChar(0)
        setPhase('typing')
      }, STAGE_PAUSE)
      return () => clearTimeout(t)
    }

    const codeLines = STAGES[stage].code
    if (line >= codeLines.length) {
      if (stage === STAGES.length - 1) {
        setPhase('done')
      } else {
        setPhase('stagePause')
      }
      return
    }

    const current = codeLines[line]
    if (char < current.length) {
      const t = setTimeout(() => setChar((c) => c + 1), CHAR_MS)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setLine((l) => l + 1)
      setChar(0)
    }, LINE_PAUSE)
    return () => clearTimeout(t)
  }, [stage, line, char, phase])

  // progress of a given stage index: 1 if passed, 0..1 if current, 0 if future
  const progressOf = (target: number) => {
    if (phase === 'done') return 1
    if (stage > target) return 1
    if (stage < target) return 0
    const codeLines = STAGES[target].code
    let typed = 0
    for (let i = 0; i < line && i < codeLines.length; i++) typed += codeLines[i].length + 1
    typed += char
    return Math.min(1, typed / totals[target])
  }

  const html = progressOf(0)
  const css = progressOf(1)
  const js = progressOf(2)
  const py = progressOf(3)
  const isDone = phase === 'done'

  const status = isDone ? 'PLAYER READY — WORLD LIVE' : STAGES[stage].status

  const visibleLines = STAGES[stage].code
    .slice(0, Math.min(line + 1, STAGES[stage].code.length))
    .map((l, i) => (i === line ? l.slice(0, char) : l))

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [visibleLines, isDone])

  return (
    <div className="code-forge">
      {/* GENERATED PLAYER CARD */}
      <div className="forge-panel">
        <div className="forge-head">
          <span>ABILITY LOADOUT</span>
          <span className={`forge-status${isDone ? ' ready' : ''}`}>{status}</span>
        </div>

        <div
          className={[
            'forge-card',
            css > 0.05 ? 'has-style' : '',
            js > 0.05 ? 'has-js' : '',
            isDone || py >= 0.98 ? 'online' : '',
          ].join(' ')}
        >
          <div className="forge-top">
            <div className={`f-avatar ${html > 0.12 ? 'on' : ''} ${css > 0.55 ? 'styled' : ''} ${js > 0.9 ? 'live' : ''}`}>
              <img src="/suraj-main-anime.png" alt="avatar" />
            </div>
            <div className="forge-id">
              <div className={`f-name ${html > 0.25 ? 'on' : ''} ${css > 0.7 ? 'styled' : ''}`}>SURAJ</div>
              <div className={`f-role ${html > 0.3 ? 'on' : ''} ${css > 0.75 ? 'styled' : ''}`}>
                FULL-STACK DEV
              </div>
            </div>
          </div>

          <div className="forge-skills">
            {forgeSkills.map((sk, i) => {
              const revealAt = 0.35 + i * 0.12
              const fillAt = 0.12 + i * 0.18
              const filled = js >= fillAt
              const value = isDone || py >= 1 ? 100 : Math.round(sk.level + (100 - sk.level) * py)
              return (
                <div
                  key={sk.name}
                  className={`f-skill ${html > revealAt ? 'on' : ''} ${css > 0.75 ? 'styled' : ''}`}
                >
                  <div className="f-skill-meta">
                    <span>{sk.name}</span>
                    <span className={py > 0.2 ? 'counting' : ''}>
                      {filled ? value : 0}
                      {py > i * 0.22 + 0.15 && <em className="f-sync"> ✓</em>}
                    </span>
                  </div>
                  <div className="f-bar">
                    <i style={{ width: filled ? `${value}%` : '0%' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CODE TERMINAL */}
      <div className="terminal">
        <div className="terminal-bar">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="terminal-title">{STAGES[stage].file}</span>
          <span className="terminal-stage">
            {STAGES.map((s, i) => (
              <i key={s.id} className={i < stage || isDone ? 'past' : i === stage ? 'now' : ''} />
            ))}
          </span>
        </div>
        <pre className="terminal-body" ref={bodyRef}>
          {visibleLines.map((l, i) => (
            <div key={i} className="terminal-line">
              <span className="tok-num">{String(i + 1).padStart(2, ' ')}</span> {highlight(l, STAGES[stage].id)}
              {i === visibleLines.length - 1 && !isDone && <span className="caret" />}
            </div>
          ))}
          {isDone && (
            <div className="terminal-line tok-ok">▸ PLAYER ONLINE — rebooting demo…</div>
          )}
        </pre>
      </div>
    </div>
  )
}

function highlight(lineText: string, lang: string) {
  if (lang === 'py' && lineText.trim().startsWith('#')) {
    return <span className="tok-comment">{lineText}</span>
  }
  if (lineText.includes('//')) {
    const [code, comment] = [lineText.slice(0, lineText.indexOf('//')), lineText.slice(lineText.indexOf('//'))]
    return (
      <>
        <span>{code}</span>
        <span className="tok-comment">{comment}</span>
      </>
    )
  }
  const parts = lineText.split(/("[^"]*"|'[^']*'|<\/?[\w-]+|\{|\}|#\w+|\.[\w-]+(?=\s*\{))/g)
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null
        if (part.startsWith('"') || part.startsWith("'")) {
          return (
            <span key={i} className="tok-str">
              {part}
            </span>
          )
        }
        if (part.startsWith('<')) {
          return (
            <span key={i} className="tok-cmd">
              {part}
            </span>
          )
        }
        if (part.startsWith('#') || (part.startsWith('.') && lang === 'css')) {
          return (
            <span key={i} className="tok-sel">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
