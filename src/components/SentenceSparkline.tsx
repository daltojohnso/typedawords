import type { SentenceInfo } from '../lib/textAnalysis'

interface SentenceSparklineProps {
  sentences: SentenceInfo[]
}

export default function SentenceSparkline({ sentences }: SentenceSparklineProps) {
  const maxWords = Math.max(...sentences.map((s) => s.wordCount), 1)

  return (
    <div className="sparkline">
      {sentences.map((s, i) => (
        <div
          key={i}
          className="sparkline-bar"
          style={{ height: `${(s.wordCount / maxWords) * 100}%` }}
          title={`${s.wordCount} words`}
        />
      ))}
    </div>
  )
}
