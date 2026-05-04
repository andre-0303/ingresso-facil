import { useState, type FormEvent } from 'react'

const ADMIN_EMAIL = 'admin@teste.com'
const ADMIN_PASSWORD = 'admin123'

interface Props {
  onSuccess: () => void
  onBack: () => void
}

export function Login({ onSuccess, onBack }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    setTimeout(() => {
      if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('admin', '1')
        onSuccess()
      } else {
        setError('E-mail ou senha inválidos')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center anim-fade-up">
      <div className="w-full max-w-sm">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--text)] font-mono text-sm transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
          Voltar
        </button>

        {/* Title */}
        <div className="mb-8">
          <p className="font-mono text-[10px] text-accent uppercase tracking-[0.25em] mb-2">
            Acesso restrito
          </p>
          <h1 className="font-display text-[clamp(3rem,8vw,5rem)] leading-none text-[var(--text)]">
            LOGIN
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4"
        >
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@teste.com"
              required
              autoComplete="email"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text)] text-sm placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-accent/60 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text)] text-sm placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-accent/60 transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-[#080808] font-display text-2xl tracking-widest rounded-xl hover:bg-accent-d active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'ENTRANDO…' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
