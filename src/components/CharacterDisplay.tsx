import React from 'react'
import type { CharState } from '../lib/types'
import type { CharAnnotation } from '../lib/textAnalysis'

export interface WordStressInfo {
  start: number
  end: number
  stress: number[] | null
}

interface CharacterDisplayProps {
  sourceText: string
  charStates: CharState[]
  className?: string
  charAnnotations?: CharAnnotation[]
  wordStresses?: WordStressInfo[]
}

const stateClassMap: Record<CharState, string> = {
  correct: 'char-correct',
  incorrect: 'char-incorrect',
  cursor: 'char-cursor',
  untyped: 'char-untyped',
}

const DOT_STYLES: Record<number, { size: number; opacity: number }> = {
  0: { size: 4, opacity: 0.25 },
  1: { size: 8, opacity: 1.0 },
  2: { size: 6, opacity: 0.55 },
}
const UNKNOWN_STYLE = { size: 5, opacity: 0.12 }

export default function CharacterDisplay({ sourceText, charStates, className, charAnnotations, wordStresses }: CharacterDisplayProps) {

  function renderChar(i: number) {
    const char = sourceText[i]
    const state = charStates[i] || 'untyped'
    const annotation = charAnnotations?.[i]
    const showBg = annotation?.bg && (state === 'untyped' || state === 'cursor')
    return (
      <span
        key={i}
        className={stateClassMap[state]}
        style={showBg ? { backgroundColor: annotation!.bg } : undefined}
      >
        {char}
      </span>
    )
  }

  function renderDots(stress: number[]) {
    return (
      <span className="word-stress-dots">
        {stress.map((level, i) => {
          const s = DOT_STYLES[level] || UNKNOWN_STYLE
          return (
            <span
              key={i}
              className="stress-dot"
              style={{ width: s.size, height: s.size, opacity: s.opacity }}
            />
          )
        })}
      </span>
    )
  }

  function renderChars(from: number, to: number) {
    const spans = []
    for (let i = from; i < to; i++) spans.push(renderChar(i))
    return spans
  }

  if (!wordStresses) {
    return (
      <div className={`char-display ${className || ''}`}>
        {renderChars(0, sourceText.length)}
      </div>
    )
  }

  // Segment text into word groups (with dots above) and gap spans
  const segments: React.ReactElement[] = []
  let lastEnd = 0

  for (let wi = 0; wi < wordStresses.length; wi++) {
    const ws = wordStresses[wi]
    // Gap before this word (spaces, punctuation)
    if (ws.start > lastEnd) {
      segments.push(<span key={`g${wi}`}>{renderChars(lastEnd, ws.start)}</span>)
    }
    // Word group with stress dots above
    segments.push(
      <span key={`w${wi}`} className="word-with-stress">
        {ws.stress && renderDots(ws.stress)}
        {renderChars(ws.start, ws.end)}
      </span>
    )
    lastEnd = ws.end
  }
  // Trailing gap
  if (lastEnd < sourceText.length) {
    segments.push(<span key="trail">{renderChars(lastEnd, sourceText.length)}</span>)
  }

  return (
    <div className={`char-display ${className || ''}`}>
      {segments}
    </div>
  )
}
