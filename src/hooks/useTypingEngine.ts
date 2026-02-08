import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { CharState } from '../lib/types'

export function useTypingEngine(sourceText: string) {
  const [typed, setTyped] = useState<string[]>([])
  const prevSourceRef = useRef(sourceText)

  // Reset typed state when sourceText changes (paragraph advance)
  useEffect(() => {
    if (prevSourceRef.current !== sourceText) {
      setTyped([])
      prevSourceRef.current = sourceText
    }
  }, [sourceText])

  const charStates: CharState[] = useMemo(() => {
    const states: CharState[] = []
    for (let i = 0; i < sourceText.length; i++) {
      if (i < typed.length) {
        states.push(typed[i] === sourceText[i] ? 'correct' : 'incorrect')
      } else if (i === typed.length) {
        states.push('cursor')
      } else {
        states.push('untyped')
      }
    }
    return states
  }, [sourceText, typed])

  const isComplete = typed.length === sourceText.length && sourceText.length > 0

  const handleInput = useCallback((value: string) => {
    setTyped((prev) => {
      if (prev.length >= sourceText.length) return prev
      return [...prev, value]
    })
  }, [sourceText.length])

  const handleBackspace = useCallback(() => {
    setTyped((prev) => {
      if (prev.length === 0) return prev
      return prev.slice(0, -1)
    })
  }, [])

  const reset = useCallback(() => {
    setTyped([])
  }, [])

  return { state: { typed, charStates, isComplete }, handleInput, handleBackspace, reset }
}
