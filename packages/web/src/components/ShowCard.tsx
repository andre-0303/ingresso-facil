import type { CSSProperties } from 'react'
import type { Show } from '../types'

interface Props {
  show: Show
  onBuy: () => void
  onEdit?: () => void
  isAdmin?: boolean
  style?: CSSProperties
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ShowCard({ show, onBuy, onEdit, isAdmin = false, style }: Props) {
  const available = show.ingressos_disponiveis ?? 0
  const sold = available === 0

  return (
    <article
      style={style}
      className={[
        'group relative flex flex-col rounded-lg overflow-hidden anim-fade-up',
        'bg-[var(--surface)] border border-[var(--border)]',
        'transition-all duration-300 ease-out',
        !sold && 'hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_32px_var(--card-glow),0_0_0_1px_var(--card-ring)]',
      ].filter(Boolean).join(' ')}
    >
      {/* Top accent bar */}
      <div className={`h-[3px] w-full flex-shrink-0 ${sold ? 'bg-danger/50' : 'bg-accent'}`} />

      {/* Sold-out stamp */}
      {sold && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg)]/50 pointer-events-none">
          <span className="font-display text-3xl tracking-widest text-danger/70 border-2 border-danger/40 px-4 py-1 rotate-[-12deg] select-none">
            ESGOTADO
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Show name */}
        <h2 className="font-display text-4xl leading-none tracking-wide text-[var(--text)] mb-3 line-clamp-2">
          {show.nome.toUpperCase()}
        </h2>

        {/* Date + location */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
            <span className="text-accent">◆</span>
            <span>{formatDate(show.data)}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
            <span className="text-accent">▲</span>
            <span className="truncate">{show.local}</span>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="border-t border-dashed border-[var(--border)] my-3" />

        {/* Footer row */}
        <div className="flex items-center justify-between mt-auto gap-3">
          <span className={`font-mono text-xs ${sold ? 'text-danger/70' : 'text-ok'}`}>
            {sold ? 'Esgotado' : `${available} disponíveis`}
          </span>
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={onEdit}
                className="px-3 py-2 text-xs font-semibold rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-accent/40 transition-all"
              >
                Editar
              </button>
            )}
            <button
              onClick={onBuy}
              disabled={sold}
              className={[
                'px-4 py-2 text-sm font-semibold rounded transition-all duration-200',
                !sold
                  ? 'bg-accent text-[#080808] hover:bg-accent-d active:scale-95'
                  : 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed',
              ].join(' ')}
            >
              {sold ? 'Esgotado' : 'Comprar'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
