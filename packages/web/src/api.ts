import type { Show, Usuario, Pedido } from './types'

const BASE = '/api'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error: string }).error ?? 'Erro inesperado')
  }
  return res.json() as Promise<T>
}

export const api = {
  shows: {
    list: () => req<Show[]>('/shows'),
    get: (id: number) => req<Show>(`/shows/${id}`),
    create: (data: {
      nome: string
      data: string
      local: string
      quantidade_ingressos: number
      preco_ingresso: number
    }) => req<Show>('/shows', { method: 'POST', body: JSON.stringify(data) }),
    adicionarIngressos: (id: number, data: { quantidade: number; preco_ingresso: number }) =>
      req<Show>(`/shows/${id}/ingressos`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  usuarios: {
    create: (data: { nome: string; cpf: string; email: string }) =>
      req<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  },
  pedidos: {
    create: (data: {
      usuario_id: number
      show_id: number
      quantidade: number
      metodo_pagamento_id: number
    }) => req<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
    confirmar: (id: number, aprovado: boolean) =>
      req<Pedido>(`/pedidos/${id}/pagamento`, {
        method: 'POST',
        body: JSON.stringify({ aprovado }),
      }),
  },
}
