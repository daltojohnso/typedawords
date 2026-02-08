import { useState, useEffect } from 'react'
import { loadCmuDict, type StressDict } from '../lib/cmuDict'

export function useCmuDict(): StressDict | null {
  const [dict, setDict] = useState<StressDict | null>(null)

  useEffect(() => {
    loadCmuDict().then(setDict).catch((e) => {
      console.error('Failed to load CMU pronunciation dictionary:', e)
    })
  }, [])

  return dict
}
