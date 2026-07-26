import { useEffect, useRef, useState, type ReactElement } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { skills } from '../data/content'
import { FlameCanvas } from './FlameCanvas'

type Skill = (typeof skills)[number]
type Stage = 0 | 1 | 2

const HTML_STAGE_MS = 1500

/* ——— Each demo teaches ONE real skill idea (unique animation) ——— */

/** TypeScript = catch type bugs at compile time, before runtime */
function DemoTypeScript() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 2800)
    return () => clearInterval(t)
  }, [])
  const phase = tick % 2 // 0 = JS boom, 1 = TS catch

  return (
    <div className="xdemo x-ts">
      <div className="x-ts-split">
        <div className={`x-ts-pane ${phase === 0 ? 'hot' : ''}`}>
          <header>JavaScript</header>
          <pre>{`let xp = "100"\nxp = xp + 50`}</pre>
          <AnimatePresence mode="wait">
            {phase === 0 ? (
              <motion.p
                key="boom"
                className="x-ts-err"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Runtime: &quot;10050&quot; 💥 silent bug
              </motion.p>
            ) : (
              <motion.p key="js-idle" className="x-ts-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                runs anyway…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className={`x-ts-pane good ${phase === 1 ? 'hot' : ''}`}>
          <header>TypeScript</header>
          <pre>{`let xp: number = 100\nxp = "50"`}</pre>
          <AnimatePresence mode="wait">
            {phase === 1 ? (
              <motion.p
                key="catch"
                className="x-ts-ok"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Compile error: string ≠ number ✓
              </motion.p>
            ) : (
              <motion.p key="ts-idle" className="x-ts-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                types watching…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className="x-caption">Types catch bugs before the app runs</p>
    </div>
  )
}

/** React = UI is a function of state — change state, UI updates */
function DemoReact() {
  const [count, setCount] = useState(0)
  const [navRenders] = useState(1)
  const [footerRenders] = useState(1)
  const [flash, setFlash] = useState(false)

  const bump = () => {
    setCount((c) => c + 1)
    setFlash(true)
    window.setTimeout(() => setFlash(false), 450)
  }

  return (
    <div className="xdemo x-react">
      <div className="x-react-ui">
        <div className="x-react-card static">
          <span>Navbar</span>
          <em>skipped</em>
          <b>renders: {navRenders}</b>
        </div>
        <motion.div
          key={count}
          className={`x-react-card live${flash ? ' flash' : ''}`}
          initial={{ scale: 1.06, borderColor: '#3dff8a' }}
          animate={{ scale: 1, borderColor: 'rgba(255,140,50,0.5)' }}
        >
          <span>Counter</span>
          <strong>{count}</strong>
          <em>re-rendered</em>
          <b>renders: {count + 1}</b>
        </motion.div>
        <div className="x-react-card static">
          <span>Footer</span>
          <em>skipped</em>
          <b>renders: {footerRenders}</b>
        </div>
      </div>
      <button type="button" className="x-react-btn" onClick={bump}>
        setCount({count} + 1)
      </button>
      <p className="x-caption">
        Click the button — only Counter re-renders. Navbar &amp; Footer stay at 1.
      </p>
    </div>
  )
}

/** Next.js = server sends ready HTML; plain React waits on the browser */
function DemoNext() {
  const [step, setStep] = useState(0)
  // 0 idle → 1 fetch → 2 work → 3 done (loops)
  useEffect(() => {
    const t = setInterval(() => setStep((n) => (n + 1) % 4), 1400)
    return () => clearInterval(t)
  }, [])

  const csrLabel =
    step === 0
      ? '1. Empty shell HTML'
      : step === 1
        ? '2. Download JS bundle…'
        : step === 2
          ? '3. Fetch /api/user…'
          : '4. Finally paints UI'
  const ssrLabel =
    step === 0
      ? '1. Request hits server'
      : step === 1
        ? '2. Server fetches data'
        : step === 2
          ? '3. HTML built with data'
          : '4. Browser paints instantly'

  return (
    <div className="xdemo xn">
      <div className="xn-split">
        <div className={`xn-pane ${step < 3 ? 'waiting' : 'late'}`}>
          <header>
            <span>React SPA</span>
            <em>Client-side</em>
          </header>
          <div className="xn-screen">
            {step < 3 ? (
              <motion.div
                key={`csr-${step}`}
                className="xn-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <i />
                <p>Loading…</p>
              </motion.div>
            ) : (
              <motion.div
                key="csr-done"
                className="xn-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong>Suraj</strong>
                <span>Full-Stack Dev</span>
              </motion.div>
            )}
          </div>
          <ol className="xn-steps">
            {['Empty HTML', 'Load JS', 'Fetch data', 'Show UI'].map((label, i) => (
              <li key={label} className={step >= i ? (step === i ? 'on' : 'done') : ''}>
                {label}
              </li>
            ))}
          </ol>
          <p className="xn-status">{csrLabel}</p>
        </div>

        <div className={`xn-pane good ${step >= 2 ? 'ready' : ''}`}>
          <header>
            <span>Next.js</span>
            <em>Server-side</em>
          </header>
          <div className="xn-screen">
            {step < 2 ? (
              <motion.div
                key={`ssr-${step}`}
                className="xn-server"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>server/</p>
                <code>{step === 0 ? 'await db.user()' : 'return <Profile />'}</code>
              </motion.div>
            ) : (
              <motion.div
                key="ssr-done"
                className="xn-card lit"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <strong>Suraj</strong>
                <span>Full-Stack Dev</span>
                <b>HTML ready ✓</b>
              </motion.div>
            )}
          </div>
          <ol className="xn-steps">
            {['Hit server', 'Fetch on server', 'Send full HTML', 'Show UI'].map((label, i) => (
              <li key={label} className={step >= i ? (step === i ? 'on' : 'done') : ''}>
                {label}
              </li>
            ))}
          </ol>
          <p className="xn-status">{ssrLabel}</p>
        </div>
      </div>
      <p className="x-caption">
        Next.js renders on the server — users see real content sooner, not a blank spinner
      </p>
    </div>
  )
}

/** HTML/CSS/JS — keep the portrait metaphor (structure → style → behavior) */
function DemoHtmlCss() {
  const [stage, setStage] = useState<Stage>(0)

  useEffect(() => {
    const t = setTimeout(() => setStage((s) => ((s + 1) % 3) as Stage), HTML_STAGE_MS)
    return () => clearTimeout(t)
  }, [stage])

  return (
    <div className="xdemo x-body">
      <div className="x-body-chips">
        <button type="button" className={stage === 0 ? 'lit' : ''} onClick={() => setStage(0)}>
          {'<html>'}
        </button>
        <button type="button" className={stage === 1 ? 'lit' : ''} onClick={() => setStage(1)}>
          {'.css'}
        </button>
        <button type="button" className={stage === 2 ? 'lit' : ''} onClick={() => setStage(2)}>
          {'js()'}
        </button>
      </div>

      <motion.div
        className={`x-body-stage stage-${stage}`}
        animate={
          stage === 2
            ? { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } }
            : { x: 0 }
        }
      >
        {stage === 2 && (
          <>
            <motion.div
              className="x-fire-layer"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <FlameCanvas />
            </motion.div>
            <motion.div
              className="x-ignite-ring"
              initial={{ opacity: 0.9, scale: 0.15 }}
              animate={{ opacity: 0, scale: 3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.div
              className="x-ignite-flash"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            <div className="x-embers" aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    left: `${20 + ((i * 137) % 60)}%`,
                    animationDelay: `${(i % 6) * 0.35}s`,
                    animationDuration: `${1.6 + (i % 4) * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {stage === 1 && (
          <motion.div
            className="x-flash"
            initial={{ opacity: 0.85, scale: 0.3 }}
            animate={{ opacity: 0, scale: 2.4 }}
            transition={{ duration: 0.35 }}
          />
        )}

        <motion.div
          className={`x-hero-wrap ${stage === 1 ? 'colored' : ''} ${stage === 2 ? 'on-fire' : ''}`}
          animate={
            stage === 2
              ? {
                  y: [0, -14, -6, -16, 0],
                  scale: [1, 1.06, 1.03, 1.07, 1],
                  rotate: [0, -1.2, 1.2, -0.8, 0],
                }
              : stage === 1
                ? { y: [0, -5, 0], scale: [0.97, 1.03, 1], rotate: 0 }
                : { y: [0, -3, 0], scale: 1, rotate: 0 }
          }
          transition={
            stage === 2
              ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
              : stage === 1
                ? { duration: 0.9 }
                : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <img
            src="/suraj-main-anime.png"
            alt=""
            className={`x-hero-img bw ${stage === 0 ? 'show' : stage === 1 ? 'fading' : 'hide'}`}
          />
          <img
            src="/suraj-main-anime.png"
            alt="anime character"
            className={`x-hero-img color ${stage >= 1 ? 'show' : ''} ${stage === 1 ? 'paint-in' : ''} ${
              stage === 2 ? 'fire-lit' : ''
            }`}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.p key="s0" className="x-pop-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              HTML · B&amp;W BASE
            </motion.p>
          )}
          {stage === 1 && (
            <motion.p key="s1" className="x-pop-label" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              CSS · COLOR UNLOCKED
            </motion.p>
          )}
          {stage === 2 && (
            <motion.p key="s2" className="x-pop-label dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              JS · FLAMES ON
            </motion.p>
          )}
        </AnimatePresence>

        <div className="x-body-floor" />
      </motion.div>

      <p className="x-caption">
        {stage === 0 && 'HTML — structure / skeleton of the page'}
        {stage === 1 && 'CSS — style paints look & layout'}
        {stage === 2 && 'JS — behavior brings it to life'}
      </p>
    </div>
  )
}

/** Node.js = non-blocking I/O — many requests move at once while waiting */
function DemoNode() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 900)
    return () => clearInterval(t)
  }, [])

  // Blocking: only one request progresses at a time (0→1→2)
  const blockActive = tick % 9
  const blockProgress = [
    Math.min(100, Math.max(0, blockActive) * 34),
    Math.min(100, Math.max(0, blockActive - 3) * 34),
    Math.min(100, Math.max(0, blockActive - 6) * 34),
  ]

  // Node: all three advance together (non-blocking I/O)
  const nodePct = Math.min(100, (tick % 5) * 25)
  const nodeBars = [nodePct, Math.min(100, nodePct + 5), Math.min(100, nodePct + 10)].map((n) =>
    Math.min(100, n),
  )

  const reqs = [
    { id: 'GET /users', wait: 'DB query' },
    { id: 'POST /login', wait: 'Auth check' },
    { id: 'GET /feed', wait: 'Cache read' },
  ]

  return (
    <div className="xdemo nd">
      <div className="nd-split">
        <div className="nd-pane">
          <header>
            <span>Blocking server</span>
            <em>one at a time</em>
          </header>
          <ul className="nd-list">
            {reqs.map((r, i) => {
              const pct = blockProgress[i]
              const state = pct <= 0 ? 'queued' : pct >= 100 ? 'done' : 'busy'
              return (
                <li key={r.id} className={state}>
                  <div className="nd-row">
                    <strong>{r.id}</strong>
                    <span>
                      {state === 'queued' ? 'waiting…' : state === 'busy' ? r.wait : 'done ✓'}
                    </span>
                  </div>
                  <div className="nd-bar">
                    <i style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="nd-note">Request 2 &amp; 3 sit idle while #1 blocks on I/O</p>
        </div>

        <div className="nd-pane good">
          <header>
            <span>Node.js</span>
            <em>event loop</em>
          </header>
          <ul className="nd-list">
            {reqs.map((r, i) => {
              const pct = nodeBars[i]
              const state = pct <= 0 ? 'queued' : pct >= 100 ? 'done' : 'busy'
              return (
                <li key={r.id} className={`${state} live`}>
                  <div className="nd-row">
                    <strong>{r.id}</strong>
                    <span>
                      {state === 'done' ? 'done ✓' : `${r.wait} (non-blocking)`}
                    </span>
                  </div>
                  <div className="nd-bar">
                    <i style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="nd-loop">
            <motion.i
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />
            <span>event loop keeps accepting work while I/O waits</span>
          </div>
        </div>
      </div>
      <p className="x-caption">
        Node never sits idle on a slow DB call — it keeps serving other requests
      </p>
    </div>
  )
}

/** Python = clean messy CSV the way FileSort does */
function DemoPython() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((n) => (n + 1) % 3), 2000)
    return () => clearInterval(t)
  }, [])

  const messy = [
    { row: '" Suraj ,25"', tag: 'spaces', bad: true },
    { row: '"DEV,"', tag: 'empty age', bad: true },
    { row: '" Suraj ,25"', tag: 'duplicate', bad: true },
    { row: '""', tag: 'blank', bad: true },
  ]
  const clean = [
    { row: 'Suraj, 25', tag: 'ok' },
    { row: 'Dev, 22', tag: 'ok' },
  ]
  const pipeline = ['dropna()', 'drop_duplicates()', 'str.strip()']

  return (
    <div className="xdemo x-py">
      <div className="x-py-board">
        <div className={`x-py-sheet ${step === 0 ? 'on' : ''}`}>
          <header>messy.csv · 4 rows</header>
          <ul>
            {messy.map((r) => (
              <li key={r.row + r.tag} className={step === 0 ? 'bad' : step >= 1 ? 'fading' : ''}>
                <code>{r.row}</code>
                <em>{r.tag}</em>
              </li>
            ))}
          </ul>
        </div>

        <div className={`x-py-pipe ${step === 1 ? 'on' : ''}`}>
          <header>pandas</header>
          {pipeline.map((line, i) => (
            <code key={line} className={step === 1 ? `hit hit-${i}` : ''}>
              df.{line}
            </code>
          ))}
        </div>

        <div className={`x-py-sheet clean ${step === 2 ? 'on' : ''}`}>
          <header>clean.csv · 2 rows</header>
          <ul>
            {clean.map((r) => (
              <li key={r.row} className={step === 2 ? 'good' : ''}>
                <code>{r.row}</code>
                <em>{r.tag}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="x-py-meter">
        <span className={step >= 0 ? 'on' : ''}>4 in</span>
        <i />
        <span className={step >= 2 ? 'on good' : ''}>2 clean out</span>
      </div>
      <p className="x-caption">
        {step === 0 && 'Real exports arrive messy — blanks, dupes, stray spaces'}
        {step === 1 && 'Pandas strips, drops empties, kills duplicates'}
        {step === 2 && 'Python cleans messy data — the exact job FileSort does'}
      </p>
    </div>
  )
}

/** PostgreSQL = relational JOIN: match rows across tables */
function DemoPostgres() {
  const [joined, setJoined] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setJoined((j) => !j), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="xdemo x-pg">
      <div className="x-pg-tables">
        <div className="x-pg-table">
          <header>users</header>
          <div>1 · Suraj</div>
          <div>2 · Dev</div>
        </div>
        <div className="x-pg-table">
          <header>orders</header>
          <div>o9 · user_id 1</div>
          <div>o2 · user_id 1</div>
        </div>
      </div>
      <motion.code
        animate={{ opacity: joined ? 1 : 0.45 }}
        className={joined ? 'lit' : ''}
      >
        SELECT * FROM users JOIN orders ON users.id = orders.user_id
      </motion.code>
      <AnimatePresence>
        {joined && (
          <motion.div
            className="x-pg-result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span>Suraj · o9</span>
            <span>Suraj · o2</span>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="x-caption">SQL joins related tables into one honest result set</p>
    </div>
  )
}

/** MongoDB = flexible docs vs rigid SQL migrations */
function DemoMongo() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((n) => (n + 1) % 3), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="xdemo x-mongo">
      <div className="x-mongo-split">
        <div className={`x-mongo-pane ${step === 1 ? 'blocked' : ''}`}>
          <header>
            <span>SQL table</span>
            <em>fixed columns</em>
          </header>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                <th>role</th>
                {step >= 2 && <th className="ghost">aura?</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Suraj</td>
                <td>dev</td>
                {step >= 2 && <td className="ghost">—</td>}
              </tr>
            </tbody>
          </table>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.code key="sql0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                columns locked
              </motion.code>
            )}
            {step === 1 && (
              <motion.code key="sql1" className="warn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                ALTER TABLE users ADD COLUMN aura…
              </motion.code>
            )}
            {step === 2 && (
              <motion.code key="sql2" className="warn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                migration required ✗
              </motion.code>
            )}
          </AnimatePresence>
        </div>

        <div className={`x-mongo-pane good ${step === 2 ? 'ready' : ''}`}>
          <header>
            <span>MongoDB</span>
            <em>flexible docs</em>
          </header>
          <pre>
            {step < 2
              ? `{\n  "_id": "a1",\n  "name": "Suraj",\n  "role": "dev"\n}`
              : `{\n  "_id": "a1",\n  "name": "Suraj",\n  "role": "dev",\n  "aura": "ember"\n}`}
          </pre>
          <AnimatePresence mode="wait">
            {step < 2 ? (
              <motion.code key="m0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {`insertOne({ … })`}
              </motion.code>
            ) : (
              <motion.code key="m1" className="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                aura added — no migration ✓
              </motion.code>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className="x-caption">
        {step === 0 && 'Same request: add a new field called aura'}
        {step === 1 && 'SQL needs ALTER TABLE + a migration'}
        {step === 2 && 'Same change: SQL blocks — Mongo just accepts it'}
      </p>
    </div>
  )
}

/** Auth = no token → 401; with JWT → protected resource */
function DemoAuth() {
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setAuthed((a) => !a), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="xdemo x-auth">
      <div className="x-auth-req">
        <code>GET /api/profile</code>
        <AnimatePresence mode="wait">
          {!authed ? (
            <motion.span key="no" className="badge bad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Authorization: —
            </motion.span>
          ) : (
            <motion.span key="yes" className="badge ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Authorization: Bearer eyJ…
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <motion.div
        key={String(authed)}
        className={`x-auth-res ${authed ? 'ok' : 'bad'}`}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {authed ? '200 · { name: "Suraj" }' : '401 Unauthorized'}
      </motion.div>
      <p className="x-caption">JWT proves identity — no token, no access</p>
    </div>
  )
}

/** Git = branch off main, commit, merge back */
function DemoGit() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="xdemo x-git">
      <svg viewBox="0 0 320 150" className="x-git-svg">
        <line x1="40" y1="110" x2="280" y2="110" stroke="rgba(255,122,24,0.45)" strokeWidth="3" />
        <circle cx="60" cy="110" r="8" fill="#ff7a18" />
        <text x="60" y="132" textAnchor="middle" fill="#ffb347" fontSize="11">
          main
        </text>
        {step >= 1 && (
          <>
            <path d="M120 110 C120 110 120 45 180 45" fill="none" stroke="#ffb347" strokeWidth="3" />
            <circle cx="180" cy="45" r="8" fill="#ffb347" />
            <text x="180" y="32" textAnchor="middle" fill="#ffb347" fontSize="11">
              feature
            </text>
            <circle cx="150" cy="70" r="5" fill="#ff7a18" />
            <text x="150" y="88" textAnchor="middle" fill="#c9bfb4" fontSize="9">
              commit
            </text>
          </>
        )}
        {step >= 2 && (
          <>
            <path d="M180 45 C230 45 230 110 250 110" fill="none" stroke="#3dff8a" strokeWidth="3" />
            <circle cx="250" cy="110" r="9" fill="#3dff8a" />
            <text x="250" y="132" textAnchor="middle" fill="#3dff8a" fontSize="11">
              merge
            </text>
          </>
        )}
      </svg>
      <p className="x-caption">
        {step === 0 && 'main holds the source of truth'}
        {step === 1 && 'branch + commit — work in parallel'}
        {step === 2 && 'merge brings history back safely'}
      </p>
    </div>
  )
}

/** Testing = fail → fix → pass */
function DemoTesting() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((n) => (n + 1) % 3), 2000)
    return () => clearInterval(t)
  }, [])

  const broken = 'function sum(a, b) {\n  return a - b  // bug\n}'
  const fixed = 'function sum(a, b) {\n  return a + b  // fixed\n}'
  const pass = step === 2

  return (
    <div className="xdemo x-test">
      <pre className="x-test-code">{`expect(sum(2, 2)).toBe(4)`}</pre>
      <motion.pre
        key={step === 0 ? 'bug' : 'fix'}
        className={`x-test-src ${step === 1 ? 'fixing' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {step === 0 ? broken : fixed}
      </motion.pre>
      <div className="x-test-compare">
        <div>
          <em>expected</em>
          <strong>4</strong>
        </div>
        <div>
          <em>actual</em>
          <strong className={pass ? 'ok' : 'bad'}>{pass ? '4' : '5'}</strong>
        </div>
      </div>
      <motion.div
        key={step}
        className={`x-test-verdict ${pass ? 'pass' : 'fail'}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {step === 0 && 'FAIL ✗ sum returned 5'}
        {step === 1 && 'FIX → change a - b to a + b'}
        {step === 2 && 'PASS ✓ ship it'}
      </motion.div>
      <p className="x-caption">
        {step === 0 && 'Test catches the bug before users do'}
        {step === 1 && 'Fix the implementation, keep the assertion'}
        {step === 2 && 'Fail → fix → pass — that is the whole loop'}
      </p>
    </div>
  )
}

/** Java = OOP — class is the blueprint, object is the real thing, methods make it act */
function DemoJava() {
  // 0 class blueprint → 1 create object → 2 call method (jump)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((n) => (n + 1) % 3), 1900)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="xdemo xj">
      <div className="xj-split">
        <div className={`xj-pane ${step === 0 ? 'on' : step > 0 ? 'done' : ''}`}>
          <header>1. Class</header>
          <pre>{`class Player {\n  jump() {…}\n}`}</pre>
          <p>Blueprint only — no player yet</p>
        </div>

        <div className={`xj-pane ${step === 1 ? 'on' : step > 1 ? 'done' : ''}`}>
          <header>2. Object</header>
          <pre>{`Player p =\n  new Player();`}</pre>
          <p>Real player created from the class</p>
        </div>

        <div className={`xj-pane ${step === 2 ? 'on' : ''}`}>
          <header>3. Method</header>
          <pre>{`p.jump();`}</pre>
          <p>Object does the action</p>
        </div>
      </div>

      <div className="xj-stage">
        <motion.div
          className={`xj-hero ${step >= 1 ? 'born' : ''} ${step === 2 ? 'jump' : ''}`}
          animate={
            step === 2
              ? { y: [0, -28, 0], transition: { duration: 0.7, ease: 'easeOut' } }
              : step >= 1
                ? { y: 0, opacity: 1, scale: 1 }
                : { y: 0, opacity: 0.25, scale: 0.9 }
          }
        >
          <span className="xj-hero-body" />
          <span className="xj-hero-label">{step >= 1 ? 'p' : '?'}</span>
        </motion.div>
        <div className="xj-ground" />
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            className="xj-bubble"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {step === 0 && 'Class = recipe'}
            {step === 1 && 'Object = real player'}
            {step === 2 && 'p.jump() → he jumps!'}
          </motion.span>
        </AnimatePresence>
      </div>

      <p className="x-caption">
        {step === 0 && 'A class is just the plan'}
        {step === 1 && 'new Player() makes a real object'}
        {step === 2 && 'Call a method — the object acts'}
      </p>
    </div>
  )
}

/** AI / LLM = hallucination vs RAG-grounded answer */
function DemoAi() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((n) => (n + 1) % 3), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="xdemo x-ai">
      <div className="x-ai-q">Q: What stack does Suraj use?</div>
      <div className="x-ai-split">
        <div className={`x-ai-pane ${step >= 1 ? 'hot' : ''}`}>
          <header>
            <span>No RAG</span>
            <em>guessing</em>
          </header>
          <p className="x-ai-answer bad">
            {step === 0 ? 'thinking…' : 'Probably PHP + jQuery'}
          </p>
          {step >= 1 && <span className="x-ai-tag bad">hallucinated</span>}
        </div>
        <div className={`x-ai-pane good ${step === 2 ? 'hot' : ''}`}>
          <header>
            <span>With RAG</span>
            <em>grounded</em>
          </header>
          {step < 2 ? (
            <ul className="x-ai-docs">
              <li className={step >= 1 ? 'hit' : ''}>portfolio.md · React ✓</li>
              <li className={step >= 1 ? 'hit' : ''}>stack.md · Node + TS ✓</li>
              <li>blog.md · unrelated…</li>
            </ul>
          ) : (
            <p className="x-ai-answer ok">React + Node + TypeScript</p>
          )}
          {step === 2 && <span className="x-ai-tag ok">grounded, cited</span>}
        </div>
      </div>
      <p className="x-caption">
        {step === 0 && 'Same question — two different ways to answer'}
        {step === 1 && 'Without docs the model invents; RAG pulls your real files'}
        {step === 2 && 'RAG answers from your docs — not vibes'}
      </p>
    </div>
  )
}

const DEMOS: Record<string, () => ReactElement> = {
  TypeScript: DemoTypeScript,
  Java: DemoJava,
  React: DemoReact,
  'Next.js': DemoNext,
  'HTML / CSS / JS': DemoHtmlCss,
  'Node.js': DemoNode,
  Python: DemoPython,
  PostgreSQL: DemoPostgres,
  MongoDB: DemoMongo,
  'Auth & Security': DemoAuth,
  'Git & GitHub': DemoGit,
  Testing: DemoTesting,
  'AI / LLM': DemoAi,
}

export function Skills() {
  const [active, setActive] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]))
  const railRef = useRef<HTMLElement>(null)

  const skill = skills[active] as Skill
  const Demo = DEMOS[skill.name] ?? DemoTypeScript

  useEffect(() => {
    const section = document.getElementById('skills')
    let skillsVisible = false

    const io =
      section &&
      new IntersectionObserver(
        ([entry]) => {
          skillsVisible = entry.isIntersecting && entry.intersectionRatio > 0.25
        },
        { threshold: [0, 0.25, 0.5] },
      )
    if (section && io) io.observe(section)

    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null
      if (!el) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
    }

    const onKey = (e: KeyboardEvent) => {
      if (!skillsVisible || isTyping()) return
      // Don't steal arrows while Dino Run (or any game) is mid-play
      if (document.querySelector('.dino.is-playing')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setActive((a) => {
          const n = (a + 1) % skills.length
          setVisited((v) => new Set(v).add(n))
          return n
        })
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setActive((a) => {
          const n = (a - 1 + skills.length) % skills.length
          setVisited((v) => new Set(v).add(n))
          return n
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      io?.disconnect()
    }
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const tab = rail.querySelector<HTMLElement>(`.chamber-tab[data-i="${active}"]`)
    if (!tab) return
    const left = tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [active])

  const select = (i: number) => {
    setActive(i)
    setVisited((v) => new Set(v).add(i))
  }

  const prev = () => select((active - 1 + skills.length) % skills.length)
  const next = () => select((active + 1) % skills.length)

  return (
    <section className="section skill-chamber" id="skills">
      <motion.p className="section-eyebrow" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        My skills · Full-stack arsenal
      </motion.p>
      <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        Skills that ship real products.
      </motion.h2>
      <motion.p className="section-lead" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        Every tech I work with, proven live — pick one and watch it do its job.
      </motion.p>

      <div className="chamber">
        <aside className="chamber-rail" ref={railRef}>
          {skills.map((s, i) => (
            <button
              key={s.name}
              type="button"
              data-i={i}
              className={`chamber-tab ${active === i ? 'active' : ''} ${visited.has(i) ? 'seen' : ''}`}
              onClick={() => select(i)}
            >
              <span className="chamber-tab-meta">
                <em>{s.tag}</em>
                <strong>{s.name}</strong>
              </span>
            </button>
          ))}
        </aside>

        <div className="chamber-pager" aria-label="Skill pager">
          <button type="button" className="chamber-pager-btn" onClick={prev} aria-label="Previous skill">
            ←
          </button>
          <span className="chamber-pager-count">
            {String(active + 1).padStart(2, '0')} / {String(skills.length).padStart(2, '0')}
            <em> · {visited.size} explored</em>
          </span>
          <button type="button" className="chamber-pager-btn" onClick={next} aria-label="Next skill">
            →
          </button>
        </div>

        <div className="chamber-stage">
          <div className="chamber-stage-top">
            <div>
              <p className="chamber-move">{skill.move}</p>
              <h3 className="chamber-skill-name">{skill.name}</h3>
              <p className="chamber-desc">{skill.desc}</p>
            </div>
          </div>

          <div className="chamber-viewport">
            <p className="chamber-live">Live demo · {skill.tag}</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.35 }}
                className="chamber-demo-wrap"
              >
                <Demo />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
