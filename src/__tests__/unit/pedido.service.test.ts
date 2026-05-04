import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AppError } from '../../shared/errors/AppError.js'

vi.mock('../../database/pool.js', () => ({
  pool: { connect: vi.fn(), query: vi.fn() },
}))

import { pool } from '../../database/pool.js'
import {
  criarPedido,
  confirmarPagamento,
  buscarPedidoPorId,
} from '../../modules/pedido/pedido.service.js'

const mockPool = pool as {
  connect: ReturnType<typeof vi.fn>
  query: ReturnType<typeof vi.fn>
}

function makeClient(responses: Array<{ rows: unknown[] }>) {
  let call = 0
  const client = {
    query: vi.fn().mockImplementation(() => Promise.resolve(responses[call++] ?? { rows: [] })),
    release: vi.fn(),
  }
  return client
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('criarPedido', () => {
  it('cria pedido com ingressos disponíveis', async () => {
    const pedidoEsperado = {
      id: 1,
      usuario_id: 1,
      metodo_pagamento_id: 1,
      status_pagamento: 'PENDENTE',
      criado_em: new Date().toISOString(),
    }
    const client = makeClient([
      { rows: [] },                         // BEGIN
      { rows: [{ total: '0' }] },           // COUNT já reservados
      { rows: [{ id: 10 }, { id: 11 }] },   // SELECT ingressos disponíveis
      { rows: [pedidoEsperado] },            // INSERT pedido
      { rows: [] },                         // UPDATE ingressos
      { rows: [] },                         // COMMIT
    ])
    mockPool.connect.mockResolvedValue(client)

    const result = await criarPedido({ usuario_id: 1, show_id: 1, quantidade: 2, metodo_pagamento_id: 1 })
    expect(result).toEqual(pedidoEsperado)
    expect(client.release).toHaveBeenCalled()
  })

  it('lança AppError 422 quando limite de ingressos excedido', async () => {
    const client = makeClient([
      { rows: [] },               // BEGIN
      { rows: [{ total: '4' }] }, // já tem 4 reservados, pede 2
    ])
    mockPool.connect.mockResolvedValue(client)

    const err = await criarPedido({ usuario_id: 1, show_id: 1, quantidade: 2, metodo_pagamento_id: 1 }).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(422)
  })

  it('lança AppError 409 quando ingressos insuficientes', async () => {
    const client = makeClient([
      { rows: [] },               // BEGIN
      { rows: [{ total: '0' }] }, // sem reservas anteriores
      { rows: [] },               // 0 ingressos disponíveis
    ])
    mockPool.connect.mockResolvedValue(client)

    const err = await criarPedido({ usuario_id: 1, show_id: 1, quantidade: 2, metodo_pagamento_id: 1 }).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(409)
  })

  it('faz rollback e relança erro em caso de falha', async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [] })   // BEGIN
        .mockRejectedValueOnce(new Error('DB error')), // COUNT falha
      release: vi.fn(),
    }
    mockPool.connect.mockResolvedValue(client)

    await expect(
      criarPedido({ usuario_id: 1, show_id: 1, quantidade: 1, metodo_pagamento_id: 1 })
    ).rejects.toThrow('DB error')
    expect(client.release).toHaveBeenCalled()
  })
})

describe('confirmarPagamento', () => {
  const pedidoPendente = {
    id: 1,
    usuario_id: 1,
    metodo_pagamento_id: 1,
    status_pagamento: 'PENDENTE',
    criado_em: new Date().toISOString(),
  }
  const pedidoPago = { ...pedidoPendente, status_pagamento: 'PAGO' }
  const pedidoRecusado = { ...pedidoPendente, status_pagamento: 'RECUSADO' }

  it('aprova pagamento e retorna pedido PAGO', async () => {
    const client = makeClient([
      { rows: [] },                // BEGIN
      { rows: [pedidoPendente] },  // SELECT FOR UPDATE
      { rows: [] },                // UPDATE pedido PAGO
      { rows: [] },                // UPDATE ingresso VENDIDO
      { rows: [] },                // COMMIT
    ])
    mockPool.connect.mockResolvedValue(client)
    mockPool.query.mockResolvedValue({ rows: [pedidoPago] })

    const result = await confirmarPagamento(1, true)
    expect(result.status_pagamento).toBe('PAGO')
  })

  it('recusa pagamento e retorna pedido RECUSADO', async () => {
    const client = makeClient([
      { rows: [] },                // BEGIN
      { rows: [pedidoPendente] },  // SELECT FOR UPDATE
      { rows: [] },                // UPDATE pedido RECUSADO
      { rows: [] },                // UPDATE ingresso DISPONIVEL
      { rows: [] },                // COMMIT
    ])
    mockPool.connect.mockResolvedValue(client)
    mockPool.query.mockResolvedValue({ rows: [pedidoRecusado] })

    const result = await confirmarPagamento(1, false)
    expect(result.status_pagamento).toBe('RECUSADO')
  })

  it('lança AppError 404 para pedido inexistente', async () => {
    const client = makeClient([
      { rows: [] }, // BEGIN
      { rows: [] }, // SELECT retorna vazio
    ])
    mockPool.connect.mockResolvedValue(client)

    const err = await confirmarPagamento(999, true).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(404)
  })

  it('lança AppError 422 para pedido já processado', async () => {
    const pedidoJaPago = { ...pedidoPendente, status_pagamento: 'PAGO' }
    const client = makeClient([
      { rows: [] },             // BEGIN
      { rows: [pedidoJaPago] }, // SELECT FOR UPDATE
    ])
    mockPool.connect.mockResolvedValue(client)

    const err = await confirmarPagamento(1, true).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(422)
  })
})

describe('buscarPedidoPorId', () => {
  it('retorna pedido existente', async () => {
    const pedido = { id: 1, usuario_id: 1, metodo_pagamento_id: 1, status_pagamento: 'PAGO', criado_em: '' }
    mockPool.query.mockResolvedValue({ rows: [pedido] })

    const result = await buscarPedidoPorId(1)
    expect(result).toEqual(pedido)
  })

  it('lança AppError 404 para ID inexistente', async () => {
    mockPool.query.mockResolvedValue({ rows: [] })

    const err = await buscarPedidoPorId(999).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(404)
  })
})
