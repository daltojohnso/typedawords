export type StressDict = Record<string, number[]>

let cached: Promise<StressDict> | null = null

export function loadCmuDict(): Promise<StressDict> {
  if (!cached) {
    cached = fetch('/cmudict.json')
      .then((r) => {
        if (!r.ok) throw new Error(`CMU dict fetch failed: ${r.status}`)
        return r.json()
      })
      .catch((e) => {
        cached = null
        throw e
      })
  }
  return cached
}

export function lookupStress(dict: StressDict, word: string): number[] | null {
  const clean = word.toLowerCase().replace(/[^a-z'-]/g, '')
  return dict[clean] ?? null
}
