import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AppError } from '../../shared/errors/AppError.js'

vi.mock('../../database/pool.js', () => ({
  pool: { query: vi.fn() },
}))

import { pool } from '../../database/pool.js'
import {
  buscarIngressoPorId,
  validarIngresso,
  listarIngressosPorShow,
} from '../../modules/ingresso/ingresso.service.js'

const mockPool = pool as { query: ReturnType<typeof vi.fn> }

beforeEach(() => vi.clearAllMocks())

const ingressoVendido = { id: 1, id_show: 1, pedido_id: 1, preco: 50, status: 'VENDIDO' }
const ingressoDisponivel = { id: 2, id_show: 1, pedido_id: null, preco: 50, status: 'DISPONIVEL' }
const ingressoReservado = { id: 3, id_show: 1, pedido_id: 2, preco: 50, status: 'RESERVADO' }

describe('buscarIngressoPorId', () => {
  it('retorna ingresso existente', async () => {
    mockPool.query.mockResolvedValue({ rows: [ingressoVendido] })
    const result = await buscarIngressoPorId(1)
    expect(result).toEqual(ingressoVendido)
  })

  it('lança AppError 404 para ingresso inexistente', async () => {
    mockPool.query.mockResolvedValue({ rows: [] })
    const err = await buscarIngressoPorId(999).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(404)
  })
})

describe('validarIngresso', () => {
  it('retorna ingresso com status VENDIDO', async () => {
    mockPool.query.mockResolvedValue({ rows: [ingressoVendido] })
    const result = await validarIngresso(1)
    expect(result.status).toBe('VENDIDO')
  })

  it('lança AppError 422 para ingresso DISPONIVEL', async () => {
    mockPool.query.mockResolvedValue({ rows: [ingressoDisponivel] })
    const err = await validarIngresso(2).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(422)
  })

  it('lança AppError 422 para ingresso RESERVADO', async () => {
    mockPool.query.mockResolvedValue({ rows: [ingressoReservado] })
    const err = await validarIngresso(3).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(422)
  })

  it('lança AppError 404 para ingresso inexistente', async () => {
    mockPool.query.mockResolvedValue({ rows: [] })
    const err = await validarIngresso(999).catch(e => e)
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(404)
  })
})

describe('listarIngressosPorShow', () => {
  it('retorna lista de ingressos do show', async () => {
    mockPool.query.mockResolvedValue({ rows: [ingressoVendido, ingressoDisponivel] })
    const result = await listarIngressosPorShow(1)
    expect(result).toHaveLength(2)
  })

  it('retorna lista vazia para show sem ingressos', async () => {
    mockPool.query.mockResolvedValue({ rows: [] })
    const result = await listarIngressosPorShow(99)
    expect(result).toEqual([])
  })
})
