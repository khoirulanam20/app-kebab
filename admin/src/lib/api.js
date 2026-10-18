// Client for the shared mock backend (/mock-api). Start it with `npm run api`.
export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function api(path, opts = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 3000)
  try {
    const r = await fetch(API + path, { headers: { 'content-type': 'application/json' }, signal: ctrl.signal, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined })
    const data = r.status === 204 ? null : await r.json()
    if (!r.ok) throw Object.assign(new Error(data?.error ?? `HTTP ${r.status}`), { status: r.status })
    return data
  } finally { clearTimeout(t) }
}
