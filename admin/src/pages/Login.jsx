import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { UsersRoundIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { homeFor } from '@/components/layout/nav-items'
import { usePos } from '@/context/pos'
import DemoAccounts from '@/components/common/DemoAccounts'
import { DEMO_PASSWORD } from '@/mock'

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
  }
  const pick = (a) => { setEmail(a.email); setPw(DEMO_PASSWORD); setErr(''); setForgot(false); setSent(false); setDemo(false) }
  const field = 'h-11 rounded-xl border-0 bg-muted'
  return (
    <div className="flex min-h-dvh items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-sm gap-5 p-7">
        <Link to="/" className="-mb-2 text-sm font-medium text-muted-foreground hover:text-foreground">← Kembali ke beranda</Link>
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
