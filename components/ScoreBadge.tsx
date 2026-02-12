'use client'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500'
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    if (score >= 40) return 'bg-gradient-to-r from-orange-500 to-red-500'
    return 'bg-gradient-to-r from-red-500 to-pink-500'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }

  return (
    <div
      className={`${getScoreColor(score)} ${sizeClasses[size]} rounded-full font-bold text-white shadow-lg`}
    >
      <span className="drop-shadow-md">{score}</span>
      <span className="opacity-80 font-normal text-xs ml-1">/ 100</span>
    </div>
  )
}