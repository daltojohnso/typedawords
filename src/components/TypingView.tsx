import { useRef, useEffect, useState, useCallback } from 'react'
import type { ParsedBook } from '../lib/types'
import { useTypingEngine } from '../hooks/useTypingEngine'
import { useProgress } from '../hooks/useProgress'
import CharacterDisplay from './CharacterDisplay'
import ProgressBar from './ProgressBar'

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

  const currentSection = book.sections[sectionIndex]
  const sourceText = currentSection?.paragraphs[paragraphIndex] || ''
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
          />
        </>
      )}
    </div>
  )
}
