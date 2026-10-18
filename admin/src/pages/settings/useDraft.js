import { useEffect, useMemo, useState } from 'react'
import { usePos } from '@/context/pos'

// Edit a settings section locally; nothing is applied until save(). Warns before closing the tab while dirty.
export function useDraft(key, label, validate) {
  const { settings, setSettings, notify, logAction } = usePos()
  const [d, setD] = useState(settings[key])
  const dirty = useMemo(() => JSON.stringify(d) !== JSON.stringify(settings[key]), [d, settings, key])
  useEffect(() => {
    if (!dirty) return
    const h = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])
  const save = (e, override) => {
    e?.preventDefault()
    const val = override ?? d
    const err = validate?.(val)
    if (err) return notify(err)
    setD(val)
    setSettings((s) => ({ ...s, [key]: val }))
    logAction(`Mengubah ${label}`); notify('Pengaturan disimpan')
  }
  return { d, setD, dirty, save, reset: () => setD(settings[key]) }
}
