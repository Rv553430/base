'use client'

import { useEffect, useState } from 'react'

interface ClientTimeProps {
  date: Date
}

export function ClientTime({ date }: ClientTimeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="text-xs text-gray-500">Last updated: --:--:--</span>
  }

  return (
    <span className="text-xs text-gray-500">
      Last updated: {date.toLocaleTimeString()}
    </span>
  )
}