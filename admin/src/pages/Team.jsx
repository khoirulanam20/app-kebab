import { StaffManager } from '@/pages/settings/SettingsAccess'
import PageHeader from '@/components/common/PageHeader'
import OrgTree from '@/components/common/OrgTree'
import { Card } from '@/components/ui/card'
import { usePos } from '@/context/pos'

// Head Kitchen manages the Kasir and Dapur of their own outlet.
export default function Team() {
  const { user, staff, outlets, outlet } = usePos()
  return (
    <>
      <PageHeader title="Tim cabang" description={`Kasir dan Dapur di ${outlet?.name ?? 'outlet Anda'}.`} />
      <div className="space-y-4">
        <Card className="p-5"><OrgTree staff={staff} outlets={outlets} outletId={user.outletId} /></Card>
        <StaffManager scope={{ outletId: user.outletId, roles: ['Kasir', 'Dapur'] }} />
      </div>
    </>
  )
}
