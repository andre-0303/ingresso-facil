import type { StatusPagamento, StatusIngresso } from '../types'

type Status = StatusPagamento | StatusIngresso

const CONFIG: Record<Status, { label: string; cls: string }> = {
  DISPONIVEL: { label: 'Disponível', cls: 'bg-ok/15 text-ok border-ok/30' },
  RESERVADO:  { label: 'Reservado',  cls: 'bg-warn/15 text-warn border-warn/30' },
  VENDIDO:    { label: 'Vendido',    cls: 'bg-danger/15 text-danger border-danger/30' },
  PAGO:       { label: 'Pago',       cls: 'bg-ok/15 text-ok border-ok/30' },
  PENDENTE:   { label: 'Pendente',   cls: 'bg-warn/15 text-warn border-warn/30' },
  RECUSADO:   { label: 'Recusado',   cls: 'bg-danger/15 text-danger border-danger/30' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, cls } = CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${cls}`}>
      {label}
    </span>
  )
}
