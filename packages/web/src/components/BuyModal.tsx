import { useState, type FormEvent, type ChangeEvent } from 'react'
import type { Show, Pedido } from '../types'
import { METODOS_PAGAMENTO } from '../types'
import { api } from '../api'
import { StatusBadge } from './StatusBadge'

interface Props {
  show: Show
  onClose: () => void
}

type Step = 1 | 2 | 3

interface UserForm { nome: string; cpf: string; email: string }
interface OrderForm { quantidade: number; metodoPagamentoId: number }

const STEPS = ['Dados', 'Ingresso', 'Pagamento'] as const

export function BuyModal({ show, onClose }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userForm, setUserForm] = useState<UserForm>({ nome: '', cpf: '', email: '' })
  const [orderForm, setOrderForm] = useState<OrderForm>({ quantidade: 1, metodoPagamentoId: 3 })
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [payProcessing, setPayProcessing] = useState(false)

  const maxQty = Math.min(5, show.ingressos_disponiveis ?? 0)
  const isPaid = pedido?.status_pagamento === 'PAGO'
  const isDone = isPaid || pedido?.status_pagamento === 'RECUSADO'

  function updateUser(field: keyof UserForm) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const val = field === 'cpf'
        ? e.target.value.replace(/\D/g, '').slice(0, 11)
        : e.target.value
      setUserForm(f => ({ ...f, [field]: val }))
    }
  }

  function handleStep1(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (userForm.cpf.length !== 11) { setError('CPF deve ter 11 dígitos'); return }
    setStep(2)
  }

  async function handleStep2(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const usuario = await api.usuarios.create(userForm)
      const created = await api.pedidos.create({
        usuario_id: usuario.id,
        show_id: show.id,
        quantidade: orderForm.quantidade,
        metodo_pagamento_id: orderForm.metodoPagamentoId,
      })
      setPedido(created)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment(aprovado: boolean) {
    if (!pedido) return
    setPayProcessing(true)
    setError(null)
    try {
      const updated = await api.pedidos.confirmar(pedido.id, aprovado)
      setPedido(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    } finally {
      setPayProcessing(false)
    }
  }

  const methodName = METODOS_PAGAMENTO.find(m => m.id === orderForm.metodoPagamentoId)?.label ?? ''

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm anim-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden anim-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-0.5">Comprar ingresso</p>
            <h2 className="font-display text-2xl leading-none text-accent tracking-wider truncate">
              {show.nome.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="ml-4 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-[var(--border)]">
          {STEPS.map((label, idx) => {
            const s = (idx + 1) as Step
            return (
              <div
                key={s}
                className={[
                  'flex-1 py-2.5 text-center font-mono text-[10px] uppercase tracking-widest transition-colors',
                  step === s ? 'text-accent border-b-2 border-accent' : step > s ? 'text-ok' : 'text-[var(--muted)]',
                ].join(' ')}
              >
                {step > s ? '✓ ' : ''}{label}
              </div>
            )
          })}
        </div>

        <div className="p-5">
          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-mono">
              {error}
            </div>
          )}

          {/* ── Step 1: User data ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <Field label="Nome completo" type="text" value={userForm.nome}
                onChange={updateUser('nome')} placeholder="João da Silva" required />
              <Field label="CPF (somente números)" type="text" value={userForm.cpf}
                onChange={updateUser('cpf')} placeholder="12345678901" required />
              <Field label="E-mail" type="email" value={userForm.email}
                onChange={updateUser('email')} placeholder="joao@email.com" required />
              <button type="submit"
                className="w-full py-3 bg-accent text-[#080808] font-semibold rounded-lg hover:bg-accent-d active:scale-95 transition-all">
                Continuar →
              </button>
            </form>
          )}

          {/* ── Step 2: Order config ── */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-5">
              {/* Quantity */}
              <div>
                <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-2">
                  Quantidade de ingressos
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: maxQty }, (_, i) => i + 1).map(q => (
                    <button
                      key={q} type="button"
                      onClick={() => setOrderForm(f => ({ ...f, quantidade: q }))}
                      className={[
                        'flex-1 py-2.5 rounded-lg font-mono text-sm font-medium transition-all',
                        orderForm.quantidade === q
                          ? 'bg-accent text-[#080808]'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]',
                      ].join(' ')}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-2">
                  Método de pagamento
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {METODOS_PAGAMENTO.map(m => (
                    <button
                      key={m.id} type="button"
                      onClick={() => setOrderForm(f => ({ ...f, metodoPagamentoId: m.id }))}
                      className={[
                        'py-3 px-3 rounded-lg text-sm font-medium text-left transition-all border',
                        orderForm.metodoPagamentoId === m.id
                          ? 'bg-accent/10 border-accent/50 text-accent'
                          : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]',
                      ].join(' ')}
                    >
                      <span className="mr-1.5">{m.icon}</span>{m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] rounded-lg font-medium transition-colors">
                  ← Voltar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-accent text-[#080808] font-semibold rounded-lg hover:bg-accent-d transition-all disabled:opacity-50 disabled:cursor-wait">
                  {loading ? 'Criando pedido…' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Order summary + payment ── */}
          {step === 3 && pedido && (
            <div className="space-y-4">
              {/* Order card */}
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 font-mono">
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1">Pedido</p>
                <p className="text-3xl font-bold text-[var(--text)]">
                  #{String(pedido.id).padStart(6, '0')}
                </p>
                <div className="mt-2">
                  <StatusBadge status={pedido.status_pagamento} />
                </div>
              </div>

              {/* Summary rows */}
              <div className="space-y-2 font-mono text-sm px-1">
                <Row label="Show" value={show.nome} />
                <Row label="Ingressos" value={String(orderForm.quantidade)} />
                <Row label="Pagamento" value={methodName} />
              </div>

              {/* Payment simulation */}
              {pedido.status_pagamento === 'PENDENTE' && (
                <div className="pt-1">
                  <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 text-center">
                    Simular gateway de pagamento
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handlePayment(true)} disabled={payProcessing}
                      className="py-3 bg-ok/15 text-ok border border-ok/40 rounded-lg font-semibold hover:bg-ok/25 transition-colors disabled:opacity-50 disabled:cursor-wait">
                      {payProcessing ? '…' : '✓ Aprovar'}
                    </button>
                    <button onClick={() => handlePayment(false)} disabled={payProcessing}
                      className="py-3 bg-danger/10 text-danger border border-danger/40 rounded-lg font-semibold hover:bg-danger/20 transition-colors disabled:opacity-50 disabled:cursor-wait">
                      {payProcessing ? '…' : '✗ Recusar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Final status result */}
              {isDone && (
                <div className={[
                  'p-5 rounded-xl text-center border',
                  isPaid
                    ? 'bg-ok/10 border-ok/30 text-ok'
                    : 'bg-danger/10 border-danger/30 text-danger',
                ].join(' ')}>
                  <div className={`font-display text-5xl tracking-widest ${isPaid ? 'anim-check' : 'anim-shake'}`}>
                    {isPaid ? 'APROVADO' : 'RECUSADO'}
                  </div>
                  <p className="font-mono text-xs mt-2 opacity-70">
                    {isPaid ? 'Seus ingressos foram confirmados.' : 'Pagamento não foi processado.'}
                  </p>
                </div>
              )}

              <button onClick={onClose}
                className="w-full py-3 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--muted)] rounded-lg font-medium transition-colors">
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Local helpers ── */
function Field({
  label, ...props
}: {
  label: string
  type: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-[var(--text)]">{value}</span>
    </div>
  )
}
