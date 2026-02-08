import { useMemo } from 'react'
import type { StressDict } from '../lib/cmuDict'
import {
  extractWords,
  extractSentences,
  buildStressData,
  conjunctionStats,
  buildCharAnnotations,
  type OverlayMode,
  type WordSpan,
  type SentenceInfo,
  type WordStress,
  type CharAnnotation,
} from '../lib/textAnalysis'

export interface AnalysisResult {
  words: WordSpan[]
  sentences: SentenceInfo[]
  stressData: WordStress[]
  conjunctions: { count: number; total: number }
  charAnnotations: CharAnnotation[]
}

export function useTextAnalysis(
  sourceText: string,
  dict: StressDict | null,
  overlayMode: OverlayMode,
): AnalysisResult | null {
  return useMemo(() => {
    if (!dict || !sourceText) return null

    const words = extractWords(sourceText)
    const sentences = extractSentences(sourceText)
    const stressData = buildStressData(words, dict)
    const conj = conjunctionStats(words)
    const charAnnotations = buildCharAnnotations(sourceText, words, dict, overlayMode)

    return {
      words,
      sentences,
      stressData,
      conjunctions: conj,
      charAnnotations,
    }
  }, [sourceText, dict, overlayMode])
}
