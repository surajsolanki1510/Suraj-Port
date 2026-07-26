/**
 * Global leaderboard for Dino Run, backed by Firebase Firestore's
 * REST API. No SDK — plain fetch with your project's web API key.
 *
 * If VITE_FIREBASE_PROJECT_ID / VITE_FIREBASE_API_KEY are missing, every
 * function quietly no-ops and the game falls back to per-device localStorage.
 */

export type Champion = { name: string; score: number }

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

export const remoteEnabled = Boolean(projectId && apiKey)

const COLLECTION = 'dino_scores'
const BASE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

/** Highest score ever submitted, with the runner's name. */
export async function fetchChampion(): Promise<Champion | null> {
  if (!remoteEnabled) return null
  try {
    const res = await fetch(`${BASE}:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: COLLECTION }],
          orderBy: [{ field: { fieldPath: 'score' }, direction: 'DESCENDING' }],
          limit: 1,
        },
      }),
    })
    if (!res.ok) return null
    const rows = (await res.json()) as Array<{
      document?: { fields?: { name?: { stringValue?: string }; score?: { integerValue?: string } } }
    }>
    const doc = rows.find((r) => r.document)?.document
    const name = doc?.fields?.name?.stringValue
    const score = Number(doc?.fields?.score?.integerValue)
    if (!name || !Number.isFinite(score)) return null
    return { name, score: Math.floor(score) }
  } catch {
    return null
  }
}

/** Submit a run. Returns true when the row was stored. */
export async function submitScore(name: string, score: number): Promise<boolean> {
  if (!remoteEnabled) return false
  const clean = name.trim().slice(0, 18)
  const val = Math.max(0, Math.min(999999, Math.floor(score)))
  if (!clean || val <= 0) return false
  try {
    const res = await fetch(`${BASE}/${COLLECTION}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          name: { stringValue: clean },
          score: { integerValue: String(val) },
          created_at: { timestampValue: new Date().toISOString() },
        },
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
