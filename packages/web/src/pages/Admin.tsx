import { useState, type FormEvent, type ChangeEvent } from 'react'
import { api } from '../api'

interface Props {
  onBack: () => void
}

interface FormData {
  nome: string
  data: string
  local: string
  quantidade_ingressos: string
  preco_ingresso: string
}

const INITIAL: FormData = { nome: '', data: '', local: '', quantidade_ingressos: '', preco_ingresso: '' }

export function Admin({ onBack }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function update(field: keyof FormData) {
    return (e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.shows.create({
        nome: form.nome,
        data: form.data,
        local: form.local,
        quantidade_ingressos: parseInt(form.quantidade_ingressos),
        preco_ingresso: parseFloat(form.preco_ingresso),
      })
      setSuccess(true)
      setForm(INITIAL)
      setTimeout(onBack, 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar show')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg anim-fade-up">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--text)] font-mono text-sm transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
        Voltar para shows
      </button>

      {/* Title */}
      <div className="mb-8">
        <p className="font-mono text-[10px] text-accent uppercase tracking-[0.25em] mb-2">
          Área administrativa
        </p>
        <h1 className="font-display text-[clamp(3rem,8vw,5rem)] leading-none text-[var(--text)]">
          NOVO SHOW
        </h1>
      </div>

      {/* Success banner */}
      {success && (
        <div className="mb-6 p-4 bg-ok/15 border border-ok/30 rounded-xl anim-scale-in">
          <p className="font-display text-2xl tracking-widest text-ok">SHOW CRIADO!</p>
          <p className="font-mono text-xs text-ok/70 mt-1">Redirecionando para o catálogo…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm font-mono">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">

        <Field label="Nome do show" type="text" value={form.nome}
          onChange={update('nome')} placeholder="Ex: Festival de Rock 2025" required />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Data do evento" type="date" value={form.data}
            onChange={update('data')} required />
          <Field label="Local / Venue" type="text" value={form.local}
            onChange={update('local')} placeholder="Ginásio Municipal" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Qtd. ingressos" type="number" value={form.quantidade_ingressos}
            onChange={update('quantidade_ingressos')} placeholder="200" min="1" required />
          <Field label="Preço (R$)" type="number" value={form.preco_ingresso}
            onChange={update('preco_ingresso')} placeholder="150.00" min="0.01" step="0.01" required />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-4 bg-accent text-[#080808] font-display text-2xl tracking-widest rounded-xl hover:bg-accent-d active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? 'CRIANDO…' : 'CRIAR SHOW'}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  ...props
}: {
  label: string
  type: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  min?: string | number
  step?: string | number
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text)] text-sm placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-accent/60 focus:bg-[var(--surface)] transition-colors font-mono"
      />
    </div>
  )
}
