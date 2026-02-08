import type { WordStress } from '../lib/textAnalysis'

interface StressPatternVizProps {
  stressData: WordStress[]
}

const DOT_STYLES: Record<number, { size: number; opacity: number }> = {
  0: { size: 4, opacity: 0.25 },
  1: { size: 8, opacity: 1.0 },
  2: { size: 6, opacity: 0.55 },
}

const UNKNOWN_STYLE = { size: 5, opacity: 0.12 }

export default function StressPatternViz({ stressData }: StressPatternVizProps) {
  return (
    <div className="stress-viz">
      {stressData.map((ws, wi) => (
        <span key={wi} className="stress-word">
          {ws.stress
            ? ws.stress.map((level, si) => {
                const s = DOT_STYLES[level] || UNKNOWN_STYLE
                return (
                  <span
                    key={si}
                    className="stress-dot"
                    style={{
                      width: s.size,
                      height: s.size,
                      opacity: s.opacity,
                    }}
                  />
                )
              })
            : <span
                className="stress-dot stress-dot-unknown"
                style={{
                  width: UNKNOWN_STYLE.size,
                  height: UNKNOWN_STYLE.size,
                  opacity: UNKNOWN_STYLE.opacity,
                }}
              />
          }
        </span>
      ))}
    </div>
  )
}
