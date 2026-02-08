import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import type { ParsedBook } from '../lib/types'
import type { OverlayMode } from '../lib/textAnalysis'
import { useTypingEngine } from '../hooks/useTypingEngine'
import { useProgress } from '../hooks/useProgress'
import { useCmuDict } from '../hooks/useCmuDict'
import { useTextAnalysis } from '../hooks/useTextAnalysis'
import CharacterDisplay from './CharacterDisplay'
import ProgressBar from './ProgressBar'
import AnalysisPanel from './AnalysisPanel'

export type StressDisplay = 'off' | 'inline' | 'panel'

function useStickyState<T extends string>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (stored as T) : defaultValue
    } catch {
      return defaultValue
    }
  })
  const set = useCallback((v: T) => {
    setValue(v)
    try { localStorage.setItem(key, v) } catch { /* ignore */ }
  }, [key])
  return [value, set]
}

interface TypingViewProps {
  book: ParsedBook
  onBack: () => void
}

export default function TypingView({ book, onBack }: TypingViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const { load, save } = useProgress(book.title)
  const [browsing, setBrowsing] = useState(false)

  const totalParagraphs = book.sections.reduce((sum, s) => sum + s.paragraphs.length, 0)

  const [sectionIndex, setSectionIndex] = useState(() => {
    const saved = load()
    if (saved && saved.sectionIndex < book.sections.length) return saved.sectionIndex
    return 0
  })

  const [paragraphIndex, setParagraphIndex] = useState(() => {
    const saved = load()
    if (
      saved &&
      saved.sectionIndex < book.sections.length &&
      saved.paragraphIndex < book.sections[saved.sectionIndex].paragraphs.length
    ) return saved.paragraphIndex
    return 0
  })

  const [flashClass, setFlashClass] = useState('')
  const [overlayMode, setOverlayMode] = useStickyState<OverlayMode>('typedawords:overlay', 'off')
  const [stressDisplay, setStressDisplay] = useStickyState<StressDisplay>('typedawords:stress', 'off')

  const dict = useCmuDict()

  const currentSection = book.sections[sectionIndex]
  const sourceText = currentSection?.paragraphs[paragraphIndex] || ''

  const analysis = useTextAnalysis(sourceText, dict, overlayMode)

  const wordStresses = useMemo(() => {
    if (!analysis || stressDisplay !== 'inline') return undefined
    return analysis.words.map((w, i) => ({
      start: w.start,
      end: w.end,
      stress: analysis.stressData[i].stress,
    }))
  }, [analysis, stressDisplay])

  const isEndOfBook = sectionIndex >= book.sections.length

  const { state, handleInput, handleBackspace, reset } = useTypingEngine(sourceText)

  let completedParagraphs = 0
  for (let i = 0; i < sectionIndex; i++) {
    completedParagraphs += book.sections[i].paragraphs.length
  }
  completedParagraphs += paragraphIndex

  const goTo = useCallback((section: number, paragraph: number) => {
    const s = Math.max(0, Math.min(section, book.sections.length - 1))
    const p = Math.max(0, Math.min(paragraph, book.sections[s].paragraphs.length - 1))
    setSectionIndex(s)
    setParagraphIndex(p)
    save({ sectionIndex: s, paragraphIndex: p })
    reset()
    setBrowsing(false)
  }, [book.sections, save, reset])

  const goPrev = useCallback(() => {
    if (paragraphIndex > 0) {
      goTo(sectionIndex, paragraphIndex - 1)
    } else if (sectionIndex > 0) {
      goTo(sectionIndex - 1, book.sections[sectionIndex - 1].paragraphs.length - 1)
    }
  }, [sectionIndex, paragraphIndex, book.sections, goTo])

  const goNext = useCallback(() => {
    if (currentSection && paragraphIndex < currentSection.paragraphs.length - 1) {
      goTo(sectionIndex, paragraphIndex + 1)
    } else if (sectionIndex < book.sections.length - 1) {
      goTo(sectionIndex + 1, 0)
    }
  }, [sectionIndex, paragraphIndex, currentSection, book.sections, goTo])

  // Auto-advance on paragraph completion
  useEffect(() => {
    if (!state.isComplete || sourceText.length === 0) return

    setFlashClass('paragraph-complete')
    const timeout = setTimeout(() => {
      setFlashClass('')

      if (currentSection && paragraphIndex < currentSection.paragraphs.length - 1) {
        const nextPara = paragraphIndex + 1
        setParagraphIndex(nextPara)
        save({ sectionIndex, paragraphIndex: nextPara })
      } else {
        const nextSection = sectionIndex + 1
        setSectionIndex(nextSection)
        setParagraphIndex(0)
        if (nextSection < book.sections.length) {
          save({ sectionIndex: nextSection, paragraphIndex: 0 })
        }
      }
      reset()
    }, 300)

    return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isComplete])

  // Focus textarea when not browsing
  useEffect(() => {
    if (!browsing) {
      textareaRef.current?.focus()
    }
  }, [sectionIndex, paragraphIndex, browsing])

  // Scroll active paragraph into view when entering browse mode
  useEffect(() => {
    if (browsing && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center', behavior: 'auto' })
    }
  }, [browsing])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    if (e.key === 'Backspace') {
      handleBackspace()
      return
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      handleInput(e.key)
    }
  }, [handleInput, handleBackspace])

  const handleContainerClick = useCallback(() => {
    if (!browsing) textareaRef.current?.focus()
  }, [browsing])

  if (isEndOfBook) {
    return (
      <div className="typing-view">
        <div className="typing-header">
          <h2>{book.title}</h2>
        </div>
        <div className="end-of-book">
          <h2>finished</h2>
          <p>you typed the entire book</p>
          <button onClick={onBack}>new book</button>
        </div>
      </div>
    )
  }

  return (
    <div className="typing-view" onClick={handleContainerClick}>
      <div className="typing-header">
        <h2>{book.title}</h2>
        <div className="header-buttons">
          <button className="nav-btn" onClick={goPrev} aria-label="Previous paragraph">&lt;</button>
          <button className="nav-btn" onClick={goNext} aria-label="Next paragraph">&gt;</button>
          <button onClick={() => setBrowsing(!browsing)}>
            {browsing ? 'type' : 'browse'}
          </button>
          <button onClick={onBack}>new book</button>
        </div>
      </div>
      <ProgressBar current={completedParagraphs} total={totalParagraphs} />

      {browsing ? (
        <div className="browse-view">
          {book.sections.map((section, si) => (
            <div key={si} className="browse-section">
              {section.paragraphs.map((text, pi) => {
                const isActive = si === sectionIndex && pi === paragraphIndex
                return (
                  <button
                    key={pi}
                    ref={isActive ? activeRef : undefined}
                    className={`browse-paragraph ${isActive ? 'browse-active' : ''}`}
                    onClick={() => goTo(si, pi)}
                  >
                    {text}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <>
          <textarea
            ref={textareaRef}
            className="hidden-input"
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <CharacterDisplay
            sourceText={sourceText}
            charStates={state.charStates}
            className={flashClass}
            charAnnotations={analysis?.charAnnotations}
            wordStresses={wordStresses}
          />
          {analysis && (
            <AnalysisPanel
              analysis={analysis}
              overlayMode={overlayMode}
              onOverlayChange={setOverlayMode}
              stressDisplay={stressDisplay}
              onStressDisplayChange={setStressDisplay}
            />
          )}
        </>
      )}
    </div>
  )
}
