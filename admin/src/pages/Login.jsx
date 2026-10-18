import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { UsersRoundIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { homeFor } from '@/components/layout/nav-items'
import { usePos } from '@/context/pos'
import { DEMO_PASSWORD, ROLES } from '@/mock'
import { getAccounts, tenants } from '@/seeds'

function DemoAccounts({ open, onClose, onPick }) {
  const accounts = getAccounts()
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] gap-4 overflow-y-auto p-6 sm:max-w-2xl">
        <div>
          <DialogTitle className="text-lg font-semibold">Akun demo</DialogTitle>
          <DialogDescription>Pilih akun untuk mengisi form masuk. Kata sandi semua akun: <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">{DEMO_PASSWORD}</code></DialogDescription>
        </div>
        <div className="space-y-5">
          {tenants.map((t) => {
            const list = accounts.filter((a) => a.tenantId === t.id)
            const groups = [...new Set(list.map((a) => a.branch ?? ''))]
            return (
              <section key={t.id} aria-label={t.name}>
                <h3 className="mb-2 font-semibold">{t.name}</h3>
                <div className="space-y-3">
                  {groups.map((g) => (
                    <div key={g}>
                      <p className="mb-1.5 text-[13px] font-medium text-muted-foreground">{g ? `Cabang ${g}` : 'Pemilik'}</p>
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {list.filter((a) => (a.branch ?? '') === g).sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role)).map((a) => (
                          <li key={a.email}>
                            <button type="button" onClick={() => onPick(a)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2.5 text-left text-sm hover:bg-accent/40">
                              <span className="min-w-0"><b className="block truncate font-medium">{a.name}</b><span className="block truncate text-[13px] text-muted-foreground">{a.email}</span></span>
                              <Badge variant={a.role === 'Owner' ? 'default' : 'secondary'} className="shrink-0">{a.role}</Badge>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
        <p className="rounded-xl bg-muted p-3 text-[13px] text-muted-foreground">Owner memegang semua cabang. Tiap cabang punya Head Kitchen, yang membawahi Kasir dan Dapur. Tiap bisnis (tenant) punya data sendiri.</p>
      </DialogContent>
    </Dialog>
  )
}

export default function Login() {
  const { user, login, can } = usePos()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [forgot, setForgot] = useState(false)
  const [sent, setSent] = useState(false)
  const [demo, setDemo] = useState(false)
  if (user) return <Navigate to={homeFor(user.role, can)} replace />
  const submit = (e) => {
    e.preventDefault()
    if (forgot) { if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Masukkan email yang valid.'); setErr(''); return setSent(true) }
    const msg = login({ email, password: pw })
    if (msg) return setErr(msg)
    nav('/')
  }
  const pick = (a) => { setEmail(a.email); setPw(DEMO_PASSWORD); setErr(''); setForgot(false); setSent(false); setDemo(false) }
  const field = 'h-11 rounded-xl border-0 bg-muted'
  return (
    <div className="flex min-h-dvh items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-sm gap-5 p-7">
        <div className="text-center">
          <img src="/logo-mark.png" alt="Kebab N Me – Always Kebab" className="logo-round mx-auto h-16" />
          <h1 className="mt-4 font-display text-2xl">{forgot ? 'Lupa kata sandi' : 'Masuk'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{forgot ? 'Kami kirim tautan atur ulang ke email Anda.' : 'Kasir, dapur, dan pengelolaan cabang.'}</p>
        </div>
        {sent ? (
          <div className="space-y-4 text-center"><p className="text-sm">Tautan atur ulang dikirim ke <b>{email}</b>. Cek kotak masuk Anda.</p><Button className="w-full" onClick={() => { setSent(false); setForgot(false) }}>Kembali ke login</Button></div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></div>
            {!forgot && <div className="space-y-1.5"><Label htmlFor="pw">Kata sandi</Label><Input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={field} /></div>}
            {err && <p role="alert" className="text-sm text-primary">{err}</p>}
            <Button type="submit" className="w-full">{forgot ? 'Kirim tautan' : 'Masuk'}</Button>
            <button type="button" onClick={() => { setForgot(!forgot); setErr('') }} className="block w-full text-center text-sm font-medium text-primary">{forgot ? 'Kembali ke login' : 'Lupa kata sandi?'}</button>
          </form>
        )}
        <Button type="button" variant="outline" onClick={() => setDemo(true)} className="w-full"><UsersRoundIcon /> Lihat akun demo</Button>
      </Card>
      <DemoAccounts open={demo} onClose={() => setDemo(false)} onPick={pick} />
    </div>
  )
}
