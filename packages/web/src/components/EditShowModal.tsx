import { useState, type FormEvent, type ChangeEvent } from 'react'
import type { Show } from '../types'
import { api } from '../api'

interface Props {
  show: Show
  onClose: (updated?: Show) => void
}

export function EditShowModal({ show, onClose }: Props) {
  const [quantidade, setQuantidade] = useState('')
  const [preco, setPreco] = useState(String(show.ingressos_disponiveis ?? ''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const updated = await api.shows.adicionarIngressos(show.id, {
        quantidade: parseInt(quantidade),
        preco_ingresso: parseFloat(preco),
      })
      setSuccess(true)
      setTimeout(() => onClose(updated as Show), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar show')
    } finally {
      setLoading(false)
    }
  }

  function field(
    label: string,
    type: string,
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    props?: Record<string, string | number>
  ) {
    return (
      <div>
        <label className="block font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1.5">
          {label}
        </label>
        <input
          type={type} value={value} onChange={onChange} {...props}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:border-accent/60 transition-colors font-mono"
        />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm anim-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden anim-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-0.5">
              Adicionar ingressos
            </p>
            <h2 className="font-display text-xl leading-none text-accent tracking-wider truncate">
              {show.nome.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={() => onClose()}
            className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="py-6 text-center anim-scale-in">
              <div className="font-display text-4xl text-ok tracking-widest anim-check">ATUALIZADO!</div>
              <p className="font-mono text-xs text-ok/60 mt-2">Ingressos adicionados com sucesso.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-mono">
                  {error}
                </div>
              )}

              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3 font-mono text-xs">
                <span className="text-[var(--muted)]">Disponíveis atualmente: </span>
                <span className={show.ingressos_disponiveis === 0 ? 'text-danger' : 'text-ok'}>
                  {show.ingressos_disponiveis ?? 0}
                </span>
              </div>

              {field('Ingressos a adicionar', 'number', quantidade,
                e => setQuantidade(e.target.value), { min: 1, required: 'required', placeholder: '50' })}

              {field('Preço por ingresso (R$)', 'number', preco,
                e => setPreco(e.target.value), { min: '0.01', step: '0.01', required: 'required', placeholder: '150.00' })}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-accent text-[#080808] font-display text-xl tracking-widest rounded-xl hover:bg-accent-d active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? 'SALVANDO…' : 'ADICIONAR'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
