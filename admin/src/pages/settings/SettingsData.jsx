import { useState } from 'react'
import { DownloadIcon, DatabaseBackupIcon, RotateCcwIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import DataTable from '@/components/common/DataTable'
import SaveBar from '@/components/common/SaveBar'
import { Section, SettingsPage } from '@/components/common/Section'
import { fmtDateTime } from '@/lib/format'
import { usePos } from '@/context/pos'
import { tenants } from '@/seeds'
import { useDraft } from './useDraft'

const field = 'h-11 rounded-xl border-0 bg-muted'
const QUOTA_MB = 100

function Meter({ label, used, max }) {
  const pct = Math.min(100, Math.round((used / max) * 100))
  return (
    <div className="space-y-1.5 text-sm"><div className="flex justify-between"><span>{label}</span><span className="tabular-nums text-muted-foreground">{used} / {max}</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={label} aria-valuenow={used} aria-valuemax={max}><div className={`h-full rounded-full ${pct >= 90 ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${pct}%` }} /></div></div>
  )
}

export function SettingsBackup() {
  const d = usePos()
  const { backups, setBackups, notify, logAction } = d
  const { d: cfg, setD: setCfg, dirty, save, reset } = useDraft('backupCfg', 'jadwal backup', (x) => (x.retain < 1 ? 'Masa simpan minimal 1 hari' : null))
  const [restore, setRestore] = useState(null)
  const sizeMb = (b) => Number(String(b.size).replace(',', '.').replace(/[^\d.]/g, '')) || 0
  const used = +backups.reduce((s, b) => s + sizeMb(b), 0).toFixed(1)
  const snapshot = () => JSON.stringify({ tenant: d.tenant?.id, exportedAt: new Date().toISOString(), products: d.products, categories: d.categories, customers: d.customers, orders: d.orders, vouchers: d.vouchers, outlets: d.outlets, ingredients: d.ingredients, settings: { ...d.settings, gateway: undefined, ownerPin: undefined } }, null, 2)
  const download = () => {
    const url = URL.createObjectURL(new Blob([snapshot()], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: `backup-${d.tenant?.slug}-${new Date().toISOString().slice(0, 10)}.json` }).click(); URL.revokeObjectURL(url)
    logAction('Mengunduh data'); notify('Data diunduh')
  }
  const backupNow = () => { setBackups((b) => [{ id: Date.now(), at: new Date().toISOString(), size: `${(snapshot().length / 1024 / 1024 + 1).toFixed(1).replace('.', ',')} MB`, kind: 'Manual' }, ...b]); logAction('Membuat backup manual'); notify('Backup dibuat') }
  return (
    <SettingsPage title="Backup" description="Salinan data otomatis dan manual. Kunci gateway dan PIN tidak ikut diekspor.">
      <form onSubmit={save}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={backupNow}><DatabaseBackupIcon /> Backup sekarang</Button><Button type="button" onClick={download}><DownloadIcon /> Unduh data (JSON)</Button></div>
            <DataTable rows={backups} columns={[{ key: 'at', header: 'Waktu', render: (b) => fmtDateTime(b.at) }, { key: 'kind', header: 'Jenis', render: (b) => <Badge variant={b.kind === 'Manual' ? 'default' : 'secondary'}>{b.kind}</Badge> }, { key: 'size', header: 'Ukuran', align: 'right' }, { key: 'r', header: '', align: 'right', render: (b) => <Button type="button" variant="outline" size="sm" onClick={() => setRestore(b)}><RotateCcwIcon /> Pulihkan</Button> }]} />
          </div>
          <div className="space-y-4">
            <Section title="Jadwal otomatis">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label htmlFor="bf">Frekuensi</Label><NativeSelect id="bf" value={cfg.freq} onChange={(e) => setCfg({ ...cfg, freq: e.target.value })}><option value="daily">Harian</option><option value="weekly">Mingguan</option></NativeSelect></div>
                <div className="space-y-1.5"><Label htmlFor="bh">Jam</Label><Input id="bh" type="time" value={cfg.hour} onChange={(e) => setCfg({ ...cfg, hour: e.target.value })} className={field} /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="br">Simpan selama (hari)</Label><Input id="br" inputMode="numeric" value={cfg.retain} onChange={(e) => setCfg({ ...cfg, retain: Number(e.target.value.replace(/\D/g, '')) || 0 })} className={field} /><p className="text-[13px] text-muted-foreground">Backup lebih lama dari ini dihapus otomatis.</p></div>
            </Section>
            <Section title="Penyimpanan"><Meter label="Terpakai (MB)" used={used} max={QUOTA_MB} /></Section>
          </div>
        </div>
        <SaveBar dirty={dirty} onReset={reset} />
      </form>
      <ConfirmDialog open={!!restore} title="Pulihkan backup ini?" text={restore ? `Data akan dikembalikan ke kondisi ${fmtDateTime(restore.at)}. Perubahan setelah itu hilang.` : ''} confirmLabel="Pulihkan" onConfirm={() => { logAction(`Memulihkan backup ${fmtDateTime(restore.at)}`); notify('Backup dipulihkan (simulasi)') }} onClose={() => setRestore(null)} />
    </SettingsPage>
  )
}

export function SettingsTenant() {
  const { tenant, user, staff, outlets, products } = usePos()
  const lim = tenant?.limits ?? { outlets: 1, staff: 5, products: 50 }
  return (
    <SettingsPage title="Tenant" description="Bisnis yang sedang Anda kelola dan pemakaian paketnya.">
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <Section title="Tenant aktif">
          <dl className="grid grid-cols-2 gap-3 text-sm">{[['Bisnis', tenant?.name], ['Domain', tenant?.domain], ['Paket', tenant?.plan], ['ID tenant', tenant?.id], ['Masuk sebagai', `${user?.name} (${user?.role})`]].map(([k, v]) => <div key={k}><dt className="text-[13px] text-muted-foreground">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}</dl>
        </Section>
        <Section title="Pemakaian paket" description={`Batas paket ${tenant?.plan}`}>
          <Meter label="Cabang" used={outlets.length} max={lim.outlets} /><Meter label="Staf" used={staff.length} max={lim.staff} /><Meter label="Produk" used={products.length} max={lim.products} />
        </Section>
        <Section title="Isolasi data" description="Setiap akun terikat ke satu tenant (bisnis), dan data tenant lain tidak pernah terlihat. Saat ini hanya ada tenant Kebab N Me dengan semua cabangnya. Tenant baru bisa ditambahkan tanpa mengubah tampilan ini.">
          <ul className="space-y-2">{tenants.map((t) => <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3 text-sm"><span><b className="block font-medium">{t.name}</b><span className="text-muted-foreground">{t.domain}</span></span>{t.id === tenant?.id && <Badge>Aktif</Badge>}</li>)}</ul>
        </Section>
      </div>
    </SettingsPage>
  )
}
