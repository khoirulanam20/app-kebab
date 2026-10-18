import { ClockIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Countdown({ seconds = 6 * 3600 + 48 * 60 }) {
  const [s, setS] = useState(seconds)
  useEffect(() => {
    const t = setInterval(() => setS((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const p = (n) => String(n).padStart(2, '0')
  return <span className="rounded-full bg-peach px-3 py-1 text-sm font-semibold tabular-nums text-brand"><ClockIcon className="mr-1.5 inline size-4 -translate-y-px" />{p(Math.floor(s / 3600))} : {p(Math.floor((s % 3600) / 60))} : {p(s % 60)}</span>
}
