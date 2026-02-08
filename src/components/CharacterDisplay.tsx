import type { CharState } from '../lib/types'

interface CharacterDisplayProps {
  sourceText: string
  charStates: CharState[]
  className?: string
}

const stateClassMap: Record<CharState, string> = {
  correct: 'char-correct',
  incorrect: 'char-incorrect',
  cursor: 'char-cursor',
  untyped: 'char-untyped',
}

export default function CharacterDisplay({ sourceText, charStates, className }: CharacterDisplayProps) {
  return (
    <div className={`char-display ${className || ''}`}>
      {sourceText.split('').map((char, i) => (
        <span key={i} className={stateClassMap[charStates[i] || 'untyped']}>
          {char}
        </span>
      ))}
    </div>
  )
}
