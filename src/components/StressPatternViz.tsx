import { type WordStress, STRESS_DOT_STYLES, STRESS_DOT_UNKNOWN } from '../lib/textAnalysis'

interface StressPatternVizProps {
  stressData: WordStress[]
}

function renderDot(level: number, key: number) {
  const s = STRESS_DOT_STYLES[level] || STRESS_DOT_UNKNOWN
  return (
    <span
      key={key}
      className="stress-dot"
      style={{ width: s.size, height: s.size, opacity: s.opacity }}
    />
  )
}

export default function StressPatternViz({ stressData }: StressPatternVizProps) {
  return (
    <div className="stress-viz">
      {stressData.map((ws, wi) => (
        <span key={wi} className="stress-word">
          {ws.stress
            ? ws.stress.map((level, si) => renderDot(level, si))
            : renderDot(-1, 0)
          }
        </span>
      ))}
    </div>
  )
}
