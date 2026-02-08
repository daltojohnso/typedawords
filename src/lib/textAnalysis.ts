import { type StressDict, lookupStress } from './cmuDict'

export type OverlayMode = 'off' | 'conj' | 'syllables'

export interface WordSpan {
  word: string
  start: number
  end: number
}

export interface SentenceInfo {
  wordCount: number
  startIndex: number
  endIndex: number
}

export interface WordStress {
  word: string
  stress: number[] | null
}

export interface CharAnnotation {
  bg?: string
}

const CONJUNCTIONS = new Set(['and', 'but', 'or', 'nor', 'for', 'yet', 'so'])

export function extractWords(text: string): WordSpan[] {
  const words: WordSpan[] = []
  const re = /[a-zA-Z'-]+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    words.push({ word: m[0], start: m.index, end: m.index + m[0].length })
  }
  return words
}

export function extractSentences(text: string): SentenceInfo[] {
  const sentences: SentenceInfo[] = []
  const re = /[^.!?]+[.!?]*/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const chunk = m[0].trim()
    if (!chunk) continue
    const wordCount = (chunk.match(/[a-zA-Z'-]+/g) || []).length
    if (wordCount > 0) {
      sentences.push({
        wordCount,
        startIndex: m.index,
        endIndex: m.index + m[0].length,
      })
    }
  }
  return sentences
}

export function buildStressData(words: WordSpan[], dict: StressDict): WordStress[] {
  return words.map((w) => ({
    word: w.word,
    stress: lookupStress(dict, w.word),
  }))
}

export function conjunctionStats(words: WordSpan[]): { count: number; total: number } {
  let count = 0
  for (const w of words) {
    if (CONJUNCTIONS.has(w.word.toLowerCase())) count++
  }
  return { count, total: words.length }
}

function syllableBg(syllableCount: number): string | undefined {
  if (syllableCount <= 1) return undefined
  if (syllableCount === 2) return 'rgba(100,102,105,0.10)'
  if (syllableCount === 3) return 'rgba(226,183,20,0.08)'
  return 'rgba(226,183,20,0.16)'
}

export function buildCharAnnotations(
  text: string,
  words: WordSpan[],
  dict: StressDict,
  mode: OverlayMode,
): CharAnnotation[] {
  const annotations: CharAnnotation[] = new Array(text.length).fill({})
  if (mode === 'off') return annotations

  for (const w of words) {
    let bg: string | undefined
    if (mode === 'conj') {
      if (CONJUNCTIONS.has(w.word.toLowerCase())) {
        bg = 'rgba(226,183,20,0.12)'
      }
    } else if (mode === 'syllables') {
      const stress = lookupStress(dict, w.word)
      if (stress) {
        bg = syllableBg(stress.length)
      }
    }
    if (bg) {
      for (let i = w.start; i < w.end; i++) {
        annotations[i] = { bg }
      }
    }
  }
  return annotations
}
