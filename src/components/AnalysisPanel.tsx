import { useState } from 'react'
import type { AnalysisResult } from '../hooks/useTextAnalysis'
import type { OverlayMode } from '../lib/textAnalysis'
import type { StressDisplay } from './TypingView'
import SentenceSparkline from './SentenceSparkline'
import StressPatternViz from './StressPatternViz'

interface AnalysisPanelProps {
  analysis: AnalysisResult
  overlayMode: OverlayMode
  onOverlayChange: (mode: OverlayMode) => void
  stressDisplay: StressDisplay
  onStressDisplayChange: (mode: StressDisplay) => void
}

const OVERLAY_OPTIONS: { value: OverlayMode; label: string }[] = [
  { value: 'off', label: 'off' },
  { value: 'conj', label: 'conj' },
  { value: 'syllables', label: 'syllables' },
]

const STRESS_OPTIONS: { value: StressDisplay; label: string }[] = [
  { value: 'off', label: 'off' },
  { value: 'inline', label: 'inline' },
  { value: 'panel', label: 'panel' },
]

export default function AnalysisPanel({ analysis, overlayMode, onOverlayChange, stressDisplay, onStressDisplayChange }: AnalysisPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  const conjPct = analysis.conjunctions.total > 0
    ? ((analysis.conjunctions.count / analysis.conjunctions.total) * 100).toFixed(1)
    : '0.0'

  return (
    <div className={`analysis-panel ${collapsed ? 'analysis-collapsed' : ''}`}>
      <div className="analysis-header">
        <div className="toggle-groups">
          <div className="toggle-group">
            <span className="toggle-label">highlight</span>
            <div className="overlay-toggles">
              {OVERLAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`overlay-btn ${overlayMode === opt.value ? 'overlay-active' : ''}`}
                  onClick={() => onOverlayChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="toggle-group">
            <span className="toggle-label">stress</span>
            <div className="overlay-toggles">
              {STRESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`overlay-btn ${stressDisplay === opt.value ? 'overlay-active' : ''}`}
                  onClick={() => onStressDisplayChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <div className="analysis-body">
          <div className="analysis-top-row">
            <div className="sparkline-section">
              <div className="analysis-label">sentences</div>
              <SentenceSparkline sentences={analysis.sentences} />
            </div>
            <div className="conj-section">
              <div className="analysis-label">conjunctions</div>
              <div className="conj-stat">
                <span className="conj-count">{analysis.conjunctions.count}</span>
                <span className="conj-pct">{conjPct}%</span>
              </div>
            </div>
          </div>
          {stressDisplay === 'panel' && (
            <div className="analysis-bottom">
              <div className="analysis-label">stress pattern</div>
              <StressPatternViz stressData={analysis.stressData} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
