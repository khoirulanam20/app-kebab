import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, MonitorSmartphoneIcon, PlusIcon, ShieldCheckIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import DataTable from '@/components/common/DataTable'
import OrgTree from '@/components/common/OrgTree'
import { Section, SettingsPage } from '@/components/common/Section'
import { fmtDateTime } from '@/lib/format'
import { usePos } from '@/context/pos'
import { FEATURES } from '@/features'
import { PERM_KEYS as ALL_PERMS, ROLES } from '@/mock'

const PERM_KEYS = ALL_PERMS.filter(([k]) => FEATURES[k] !== false)

const field = 'h-11 rounded-xl border-0 bg-muted'

// scope: { outletId?, roles? } limits the rows and the roles that can be assigned/invited.
// The reporting line follows the hierarchy: Head Kitchen -> Owner, Kasir/Dapur -> the outlet's Head Kitchen.
export function StaffManager({ scope = {} }) {
  const { staff, setStaff, outlets, user, notify, logAction } = usePos()
  const roles = scope.roles ?? ROLES
  const [outletF, setOutletF] = useState('all')
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ name: '', email: '', role: roles.includes('Kasir') ? 'Kasir' : roles[0], outletId: scope.outletId ?? outlets[0]?.id })
  const [confirm, setConfirm] = useState(null)
  const owners = staff.filter((s) => s.role === 'Owner' && s.active).length
  const upd = (id, patch, text) => { setStaff((c) => c.map((s) => (s.id === id ? { ...s, ...patch } : s))); logAction(text) }
  const guard = (s) => s.role === 'Owner' && s.active && owners <= 1
  const managerFor = (role, outletId) => (role === 'Owner' ? null : role === 'Head Kitchen' ? staff.find((s) => s.role === 'Owner')?.id ?? null : staff.find((s) => s.role === 'Head Kitchen' && s.outletId === outletId && s.active)?.id ?? null)
  const rows = staff.filter((s) => (scope.outletId ? s.outletId === scope.outletId : outletF === 'all' || s.outletId === Number(outletF)) && (!scope.roles || scope.roles.includes(s.role)))
  const nameOf = (id) => staff.find((s) => s.id === id)?.name ?? <span className="text-muted-foreground">—</span>
  const add = (e) => {
    e.preventDefault()
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) return notify('Isi nama dan email yang valid')
    if (staff.some((s) => s.email === f.email)) return notify('Email sudah terdaftar')
    const outletId = f.role === 'Owner' ? null : Number(scope.outletId ?? f.outletId)
    if (['Kasir', 'Dapur'].includes(f.role) && !managerFor(f.role, outletId)) return notify('Cabang ini belum punya Head Kitchen. Tambahkan dulu.')
    setStaff((c) => [...c, { id: Date.now(), name: f.name.trim(), email: f.email, role: f.role, outletId, managerId: managerFor(f.role, outletId), active: true, lastLogin: null }])
    logAction(`Mengundang staf ${f.name.trim()} (${f.role})`); setAdding(false); setF({ ...f, name: '', email: '' }); notify(`Undangan dikirim ke ${f.email}`)
  }
  const changeRole = (s, role) => setConfirm({ title: 'Ubah peran?', text: `${s.name} akan menjadi ${role}, atasan dan hak aksesnya ikut berubah.`, run: () => upd(s.id, { role, managerId: managerFor(role, s.outletId) }, `Mengubah peran ${s.name} menjadi ${role}`) })
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {roles.map((r) => <Badge key={r} variant="secondary" className="h-8 px-3">{r}: {staff.filter((s) => s.role === r && s.active && (!scope.outletId || s.outletId === scope.outletId)).length}</Badge>)}
        {!scope.outletId && <NativeSelect aria-label="Filter cabang" value={outletF} onChange={(e) => setOutletF(e.target.value)} className="ml-auto h-10 w-auto rounded-full bg-white"><option value="all">Semua cabang</option>{outlets.map((o) => <option key={o.id} value={o.id}>{o.name.split('– ').pop()}</option>)}</NativeSelect>}
        <Button className={scope.outletId ? 'ml-auto' : ''} onClick={() => setAdding(true)}><PlusIcon /> Undang staf</Button>
      </div>
      <DataTable rows={rows} empty="Belum ada staf." columns={[
        { key: 'name', header: 'Nama', render: (s) => <span><b className="font-medium">{s.name}</b>{s.id === user?.id && <Badge className="ml-2">Anda</Badge>}<small className="block text-muted-foreground">{s.email}</small></span> },
        { key: 'role', header: 'Peran', render: (s) => <NativeSelect aria-label={`Peran ${s.name}`} value={s.role} disabled={guard(s) || !roles.includes(s.role)} onChange={(e) => changeRole(s, e.target.value)} className="h-9 w-40">{(roles.includes(s.role) ? roles : [s.role, ...roles]).map((r) => <option key={r}>{r}</option>)}</NativeSelect> },
        { key: 'mgr', header: 'Atasan', render: (s) => nameOf(s.managerId) },
        ...(scope.outletId ? [] : [{ key: 'outlet', header: 'Cabang', render: (s) => (s.role === 'Owner' ? <span className="text-muted-foreground">Semua cabang</span> : <NativeSelect aria-label={`Cabang ${s.name}`} value={s.outletId ?? ''} onChange={(e) => upd(s.id, { outletId: Number(e.target.value), managerId: managerFor(s.role, Number(e.target.value)) }, `Memindahkan ${s.name} ke cabang lain`)} className="h-9 w-44">{outlets.map((o) => <option key={o.id} value={o.id}>{o.name.split('– ').pop()}</option>)}</NativeSelect>) }]),
        { key: 'last', header: 'Terakhir login', render: (s) => (s.lastLogin ? fmtDateTime(s.lastLogin) : <span className="text-muted-foreground">Belum pernah</span>) },
        { key: 'active', header: 'Aktif', render: (s) => <Switch checked={s.active} disabled={guard(s) || s.id === user?.id} onCheckedChange={(v) => (v ? upd(s.id, { active: true }, `Mengaktifkan ${s.name}`) : setConfirm({ title: `Nonaktifkan ${s.name}?`, text: 'Staf ini tidak bisa masuk lagi sampai diaktifkan kembali.', run: () => upd(s.id, { active: false }, `Menonaktifkan ${s.name}`) }))} aria-label={`Aktifkan ${s.name}`} /> },
        { key: 'act', header: '', align: 'right', render: (s) => <Button variant="ghost" size="sm" onClick={() => { logAction(`Mengirim tautan atur ulang sandi ke ${s.name}`); notify(`Tautan atur ulang dikirim ke ${s.email}`) }}>Atur ulang sandi</Button> },
      ]} />
      <p className="mt-3 text-[13px] text-muted-foreground">Minimal satu Owner aktif harus ada. Kasir dan Dapur otomatis melapor ke Head Kitchen cabangnya.</p>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="gap-4 p-6">
          <div><DialogTitle className="text-lg font-semibold">Undang staf</DialogTitle><DialogDescription>Staf menerima email untuk membuat kata sandi.</DialogDescription></div>
          <form onSubmit={add} className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="sn">Nama</Label><Input id="sn" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} /></div>
            <div className="space-y-1.5"><Label htmlFor="se">Email</Label><Input id="se" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="sr">Peran</Label><NativeSelect id="sr" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{roles.map((r) => <option key={r}>{r}</option>)}</NativeSelect></div>
              {f.role !== 'Owner' && <div className="space-y-1.5"><Label htmlFor="so">Cabang</Label><NativeSelect id="so" disabled={!!scope.outletId} value={scope.outletId ?? f.outletId} onChange={(e) => setF({ ...f, outletId: e.target.value })}>{outlets.map((o) => <option key={o.id} value={o.id}>{o.name.split('– ').pop()}</option>)}</NativeSelect></div>}</div>
            <p className="rounded-xl bg-muted p-3 text-[13px] text-muted-foreground">Atasan: {nameOf(managerFor(f.role, Number(scope.outletId ?? f.outletId)))}</p>
            <Button type="submit" className="w-full">Kirim undangan</Button>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!confirm} title={confirm?.title} text={confirm?.text} onConfirm={() => confirm?.run()} onClose={() => setConfirm(null)} />
    </>
  )
}

export function SettingsStaff() {
  const { staff, outlets } = usePos()
  return (
    <SettingsPage title="Staf & peran" description="Hierarki: Owner → Head Kitchen → Kasir dan Dapur. Semua akun tiap cabang dikelola di sini.">
      <div className="space-y-4">
        <Section title="Struktur tim"><OrgTree staff={staff} outlets={outlets} /></Section>
        <StaffManager />
      </div>
    </SettingsPage>
  )
}

export function SettingsAccess() {
  const { perms, setPerms, logAction, notify } = usePos()
  const [src, setSrc] = useState({ from: 'Kasir', to: 'Head Kitchen' })
  const toggle = (role, key, v) => { setPerms((p) => ({ ...p, [role]: { ...p[role], [key]: v } })); logAction(`${v ? 'Memberi' : 'Mencabut'} akses ${PERM_KEYS.find((k) => k[0] === key)[1]} untuk ${role}`) }
  const count = (r) => PERM_KEYS.filter(([k]) => perms[r]?.[k]).length
  const copy = () => { if (src.from === src.to) return notify('Pilih dua peran yang berbeda'); setPerms((p) => ({ ...p, [src.to]: { ...p[src.from] } })); logAction(`Menyalin hak akses ${src.from} ke ${src.to}`); notify(`Hak akses ${src.to} disamakan dengan ${src.from}`) }
  const editable = ROLES.filter((r) => r !== 'Owner')
  return (
    <SettingsPage title="Hak akses" description="Menu apa saja yang boleh dibuka tiap peran. Owner hanya melihat menu pengelolaan, detail operasional dilihat lewat Cabang. Perubahan langsung berlaku.">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Section className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm"><thead><tr className="text-left text-[13px] text-muted-foreground"><th className="py-2 font-medium">Menu</th>{ROLES.map((r) => <th key={r} className="px-3 py-2 text-center font-medium">{r}</th>)}</tr></thead>
            <tbody>{PERM_KEYS.map(([k, l]) => <tr key={k} className="border-t border-border hover:bg-muted/50"><th scope="row" className="py-3 text-left font-medium">{l}</th>{ROLES.map((r) => <td key={r} className="px-3 py-3 text-center"><Checkbox className="mx-auto" disabled={r === 'Owner'} checked={!!perms[r]?.[k]} onCheckedChange={(v) => toggle(r, k, v)} aria-label={`${r} boleh akses ${l}`} /></td>)}</tr>)}</tbody>
            <tfoot><tr className="border-t-2 border-border text-[13px] text-muted-foreground"><th scope="row" className="py-3 text-left font-medium">Jumlah menu</th>{ROLES.map((r) => <td key={r} className="px-3 py-3 text-center font-semibold text-foreground">{count(r)}/{PERM_KEYS.length}</td>)}</tr></tfoot></table>
        </Section>
        <Section title="Salin hak akses" description="Samakan satu peran dengan peran lain.">
          <div className="space-y-1.5"><Label htmlFor="cf">Dari</Label><NativeSelect id="cf" value={src.from} onChange={(e) => setSrc({ ...src, from: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="ct">Ke</Label><NativeSelect id="ct" value={src.to} onChange={(e) => setSrc({ ...src, to: e.target.value })}>{editable.map((r) => <option key={r}>{r}</option>)}</NativeSelect></div>
          <Button variant="outline" onClick={copy}>Salin</Button>
        </Section>
      </div>
    </SettingsPage>
  )
}

const SESSIONS = [{ id: 1, device: 'Chrome · macOS', where: 'Yogyakarta', at: '2026-10-18T09:12:00', current: true }, { id: 2, device: 'Tablet kasir · Android', where: 'Cabang Pusat', at: '2026-10-18T08:30:00' }, { id: 3, device: 'Safari · iPhone', where: 'Sleman', at: '2026-10-17T21:05:00' }]
const LOGINS = [{ id: 1, at: '2026-10-18T09:12:00', device: 'Chrome · macOS', result: 'Berhasil' }, { id: 2, at: '2026-10-17T21:03:00', device: 'Safari · iPhone', result: 'Berhasil' }, { id: 3, at: '2026-10-16T02:41:00', device: 'Tidak dikenal', result: 'Gagal' }]

export function SettingsSecurity() {
  const { settings, setSettings, user, notify, logAction } = usePos()
  const [pw, setPw] = useState({ cur: '', next: '', again: '' })
  const [pin, setPin] = useState({ cur: '', next: '', again: '' })
  const [sessions, setSessions] = useState(SESSIONS)
  const [step, setStep] = useState(0)
  const [code, setCode] = useState('')
  const secret = 'KNMOWNER2FA26XYZ'
  const isOwner = user?.role === 'Owner'
  const changePw = (e) => {
    e.preventDefault()
    if (pw.next.length < 8) return notify('Kata sandi baru minimal 8 karakter')
    if (pw.next !== pw.again) return notify('Konfirmasi kata sandi tidak sama')
    logAction('Mengganti kata sandi'); setPw({ cur: '', next: '', again: '' }); notify('Kata sandi diganti')
  }
  const changePin = (e) => {
    e.preventDefault()
    if (pin.cur !== settings.ownerPin) return notify('PIN lama salah')
    if (!/^\d{4,6}$/.test(pin.next)) return notify('PIN baru 4–6 digit angka')
    if (pin.next !== pin.again) return notify('Konfirmasi PIN tidak sama')
    setSettings((s) => ({ ...s, ownerPin: pin.next })); logAction('Mengganti PIN Owner'); setPin({ cur: '', next: '', again: '' }); notify('PIN Owner diganti')
  }
  const verify = (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) return notify('Masukkan 6 digit kode')
    setSettings((s) => ({ ...s, twoFactor: true })); logAction('Mengaktifkan verifikasi dua langkah'); setStep(0); setCode(''); notify('Verifikasi dua langkah aktif')
  }
  const secret3 = (id, label, key, state, setState, type = 'password') => <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} autoComplete="off" value={state[key]} onChange={(e) => setState({ ...state, [key]: e.target.value })} className={field} /></div>
  return (
    <SettingsPage title="Keamanan" description="Akun Anda, PIN persetujuan, dan sesi yang sedang masuk.">
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <Section title="Ganti kata sandi"><form onSubmit={changePw} className="space-y-3">{secret3('pw1', 'Kata sandi saat ini', 'cur', pw, setPw)}{secret3('pw2', 'Kata sandi baru', 'next', pw, setPw)}{secret3('pw3', 'Ulangi kata sandi baru', 'again', pw, setPw)}<Button type="submit">Ganti kata sandi</Button></form></Section>
        {isOwner && <Section title="PIN Owner" description="Dipakai menyetujui void dan retur. Bawaan prototype: 1234."><form onSubmit={changePin} className="space-y-3">{secret3('pn1', 'PIN saat ini', 'cur', pin, setPin)}{secret3('pn2', 'PIN baru (4–6 digit)', 'next', pin, setPin)}{secret3('pn3', 'Ulangi PIN baru', 'again', pin, setPin)}<Button type="submit">Ganti PIN</Button></form></Section>}
        {isOwner && (
          <Section title="Verifikasi dua langkah" description="Kode dari aplikasi authenticator saat login.">
            {settings.twoFactor ? (
              <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm"><span className="flex items-center gap-2"><ShieldCheckIcon className="size-5 text-primary" aria-hidden /><Badge>Aktif</Badge></span><Button variant="outline" size="sm" onClick={() => { setSettings((s) => ({ ...s, twoFactor: false })); logAction('Menonaktifkan verifikasi dua langkah'); notify('Verifikasi dua langkah dimatikan') }}>Matikan</Button></div>
            ) : step === 0 ? <Button className="self-start" onClick={() => setStep(1)}>Aktifkan</Button> : (
              <form onSubmit={verify} className="space-y-3">
                <div className="flex items-center gap-4"><div className="rounded-xl border-4 border-foreground bg-white p-2"><QRCodeSVG value={`otpauth://totp/Kebab:owner?secret=${secret}`} size={112} role="img" title="QR verifikasi dua langkah" className="block" /></div><p className="text-sm">Pindai dengan Google Authenticator, atau masukkan kunci:<br /><code className="font-mono font-semibold">{secret}</code></p></div>
                <div className="space-y-1.5"><Label htmlFor="otp">Kode 6 digit</Label><Input id="otp" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className={`${field} w-40 text-center font-mono tracking-widest`} /></div>
                <div className="flex gap-2"><Button type="submit">Verifikasi</Button><Button type="button" variant="outline" onClick={() => setStep(0)}>Batal</Button></div>
                <p className="text-[13px] text-muted-foreground">Prototype: kode 6 digit apa saja diterima.</p>
              </form>
            )}
          </Section>
        )}
        <Section title="Sesi aktif" className="lg:col-span-2 2xl:col-span-1">
          <ul className="divide-y divide-border">{sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3 text-sm"><MonitorSmartphoneIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden /><span className="flex-1"><b className="block font-medium">{s.device}{s.current && <Badge className="ml-2">Ini</Badge>}</b><span className="text-muted-foreground">{s.where} · {fmtDateTime(s.at)}</span></span>
              {!s.current && <Button size="sm" variant="outline" onClick={() => { setSessions((c) => c.filter((x) => x.id !== s.id)); logAction(`Mengeluarkan sesi ${s.device}`); notify('Sesi dikeluarkan') }}>Keluarkan</Button>}</li>))}</ul>
        </Section>
        <Section title="Riwayat login" className="lg:col-span-2">
          <DataTable rows={LOGINS} columns={[{ key: 'at', header: 'Waktu', render: (l) => fmtDateTime(l.at) }, { key: 'device', header: 'Perangkat' }, { key: 'result', header: 'Hasil', render: (l) => <Badge variant={l.result === 'Gagal' ? 'secondary' : 'default'}>{l.result}</Badge> }]} />
        </Section>
      </div>
    </SettingsPage>
  )
}

const PAGE = 10
export function SettingsLog() {
  const { log, notify } = usePos()
  const [q, setQ] = useState(''); const [who, setWho] = useState('all'); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [page, setPage] = useState(1)
  const users = useMemo(() => [...new Set(log.map((l) => l.who))], [log])
  const rows = log.filter((l) => (who === 'all' || l.who === who) && (!from || l.at.slice(0, 10) >= from) && (!to || l.at.slice(0, 10) <= to) && (l.who + l.text).toLowerCase().includes(q.toLowerCase()))
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const cur = Math.min(page, pages)
  const exportCsv = () => {
    const csv = [['Waktu', 'Siapa', 'Aktivitas'], ...rows.map((l) => [l.at, l.who, l.text])].map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: 'log-aktivitas.csv' }).click(); URL.revokeObjectURL(url); notify('Log diunduh')
  }
  const f = 'h-10 rounded-full border-0 bg-white'
  return (
    <SettingsPage title="Log aktivitas" description="Siapa mengubah apa, kapan. Tidak bisa diubah atau dihapus.">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input aria-label="Cari log" placeholder="Cari aktivitas" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} className={`${f} w-60`} />
        <NativeSelect aria-label="Filter pengguna" value={who} onChange={(e) => { setWho(e.target.value); setPage(1) }} className="h-10 w-auto rounded-full bg-white"><option value="all">Semua pengguna</option>{users.map((u) => <option key={u}>{u}</option>)}</NativeSelect>
        <Input type="date" aria-label="Dari tanggal" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} className={`${f} w-40`} /><Input type="date" aria-label="Sampai tanggal" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} className={`${f} w-40`} />
        <Button variant="outline" size="sm" className="ml-auto" disabled={!rows.length} onClick={exportCsv}><DownloadIcon /> Ekspor CSV</Button>
      </div>
      <DataTable rows={rows.slice((cur - 1) * PAGE, cur * PAGE)} empty="Tidak ada aktivitas." columns={[{ key: 'at', header: 'Waktu', render: (l) => fmtDateTime(l.at) }, { key: 'who', header: 'Siapa', render: (l) => <b className="font-medium">{l.who}</b> }, { key: 'text', header: 'Aktivitas' }]} />
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground"><span>{rows.length} aktivitas</span>
        <span className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Halaman sebelumnya" disabled={cur === 1} onClick={() => setPage(cur - 1)}><ChevronLeftIcon /></Button>Halaman {cur} dari {pages}<Button variant="outline" size="icon" aria-label="Halaman berikutnya" disabled={cur === pages} onClick={() => setPage(cur + 1)}><ChevronRightIcon /></Button></span></div>
    </SettingsPage>
  )
}
