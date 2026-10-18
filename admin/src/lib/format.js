export const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID')
export const rp = (n) => Math.round(n).toLocaleString('id-ID')
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
export const fmtTime = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
export const fmtDateTime = (iso) => `${fmtDate(iso)}, ${fmtTime(iso)}`
