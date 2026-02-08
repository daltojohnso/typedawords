import { useCallback } from 'react'
import type { BookPosition } from '../lib/types'

function storageKey(bookTitle: string): string {
  return `typedawords:progress:${bookTitle}`
}

export function useProgress(bookTitle: string) {
  const load = useCallback((): BookPosition | null => {
    try {
      const raw = localStorage.getItem(storageKey(bookTitle))
      if (!raw) return null
      return JSON.parse(raw) as BookPosition
    } catch {
      return null
    }
  }, [bookTitle])

  const save = useCallback((position: Omit<BookPosition, 'lastAccessed'>) => {
    const data: BookPosition = {
      ...position,
      lastAccessed: Date.now(),
    }
    try {
      localStorage.setItem(storageKey(bookTitle), JSON.stringify(data))
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [bookTitle])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(bookTitle))
    } catch {
      // ignore
    }
  }, [bookTitle])

  return { load, save, clear }
}
