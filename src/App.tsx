import { useState, useCallback } from 'react'
import type { ParsedBook } from './lib/types'
import { parseEpub } from './lib/epubParser'
import UploadScreen from './components/UploadScreen'
import TypingView from './components/TypingView'

function App() {
  const [book, setBook] = useState<ParsedBook | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileLoaded = useCallback(async (arrayBuffer: ArrayBuffer, _fileName: string) => {
    setLoading(true)
    setError(null)
    try {
      const parsed = await parseEpub(arrayBuffer)
      if (parsed.sections.length === 0) {
        setError('No readable text found in this EPUB.')
        setLoading(false)
        return
      }
      setBook(parsed)
    } catch (e) {
      setError(`Failed to parse EPUB: ${e instanceof Error ? e.message : 'unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBack = useCallback(() => {
    setBook(null)
    setError(null)
  }, [])

  if (loading) {
    return <div className="loading">parsing epub...</div>
  }

  if (book) {
    return <TypingView book={book} onBack={handleBack} />
  }

  return (
    <>
      <UploadScreen onFileLoaded={handleFileLoaded} />
      {error && (
        <p style={{ color: 'var(--error)', textAlign: 'center', marginTop: 16, fontSize: '0.85rem' }}>
          {error}
        </p>
      )}
    </>
  )
}

export default App
