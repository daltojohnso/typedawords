export type StressDict = Record<string, number[]>

let cached: Promise<StressDict> | null = null

export function loadCmuDict(): Promise<StressDict> {
  if (!cached) {
    cached = fetch('/cmudict.json').then((r) => r.json())
  }
  return cached
}

export function lookupStress(dict: StressDict, word: string): number[] | null {
  const clean = word.toLowerCase().replace(/[^a-z'-]/g, '')
  return dict[clean] ?? null
}
