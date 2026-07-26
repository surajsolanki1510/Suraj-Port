const EVENT = 'flame-surge'

/** Fired when the rocket merges into the hero flame. */
export function emitFlameSurge() {
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function onFlameSurge(cb: () => void) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
