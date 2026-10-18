import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DEMO_PASSWORD, ROLES } from '@/mock'
import { getAccounts, tenants } from '@/seeds'

export default function DemoAccounts({ open, onClose, onPick }) {
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
