import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { truncateAll, closePool, getMetodoPagamentoId } from './setup.js'

let metodoPagamentoId: number

beforeAll(async () => {
  await truncateAll()
  metodoPagamentoId = await getMetodoPagamentoId('PIX')
})
beforeEach(async () => { await truncateAll() })
afterAll(async () => { await closePool() })

async function criarUsuario(cpf = '12345678901') {
  const res = await request(app).post('/usuarios').send({
    nome: 'Comprador Teste',
    cpf,
    email: `${cpf}@email.com`,
  })
  return res.body as { id: number }
}

async function criarShow(quantidade = 10) {
  const res = await request(app).post('/shows').send({
    nome: 'Show Teste',
    data: '2025-12-31',
    local: 'Arena',
    quantidade_ingressos: quantidade,
    preco_ingresso: 100,
  })
  return res.body as { id: number }
}

describe('POST /pedidos — fluxo básico', () => {
  it('cria pedido e retorna status PENDENTE', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow()

    const res = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 2,
      metodo_pagamento_id: metodoPagamentoId,
    })

    expect(res.status).toBe(201)
    expect(res.body.status_pagamento).toBe('PENDENTE')
    expect(res.body.id).toBeDefined()
  })

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app).post('/pedidos').send({ usuario_id: 1 })
    expect(res.status).toBe(400)
  })

  it('retorna 409 quando show não tem ingressos suficientes', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow(1)

    const res = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 5,
      metodo_pagamento_id: metodoPagamentoId,
    })

    expect(res.status).toBe(409)
  })
})

describe('Limite de 5 ingressos por usuário', () => {
  it('bloqueia pedido que excede 5 ingressos no mesmo show', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow(10)

    // Reserva 4 ingressos
    await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 4,
      metodo_pagamento_id: metodoPagamentoId,
    })

    // Tenta reservar mais 2 (total seria 6)
    const res = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 2,
      metodo_pagamento_id: metodoPagamentoId,
    })

    expect(res.status).toBe(422)
    expect(res.body.error).toMatch(/Limite/)
  })

  it('permite reservar exatamente 5 no total', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow(10)

    await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 3,
      metodo_pagamento_id: metodoPagamentoId,
    })

    const res = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 2,
      metodo_pagamento_id: metodoPagamentoId,
    })

    expect(res.status).toBe(201)
  })
})

describe('POST /pedidos/:id/pagamento', () => {
  it('aprova pagamento → status PAGO, ingressos VENDIDO', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow()

    const pedidoRes = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 2,
      metodo_pagamento_id: metodoPagamentoId,
    })
    const pedidoId = pedidoRes.body.id

    const pagRes = await request(app)
      .post(`/pedidos/${pedidoId}/pagamento`)
      .send({ aprovado: true })

    expect(pagRes.status).toBe(200)
    expect(pagRes.body.status_pagamento).toBe('PAGO')
  })

  it('recusa pagamento → status RECUSADO, ingressos voltam para DISPONIVEL', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow()

    const pedidoRes = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 2,
      metodo_pagamento_id: metodoPagamentoId,
    })
    const pedidoId = pedidoRes.body.id

    const pagRes = await request(app)
      .post(`/pedidos/${pedidoId}/pagamento`)
      .send({ aprovado: false })

    expect(pagRes.status).toBe(200)
    expect(pagRes.body.status_pagamento).toBe('RECUSADO')

    // Verifica ingressos voltaram para DISPONIVEL
    const showRes = await request(app).get(`/shows/${show.id}`)
    expect(Number(showRes.body.ingressos_disponiveis)).toBe(10)
  })

  it('retorna 422 para pedido já processado', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow()

    const pedidoRes = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 1,
      metodo_pagamento_id: metodoPagamentoId,
    })
    const pedidoId = pedidoRes.body.id

    await request(app).post(`/pedidos/${pedidoId}/pagamento`).send({ aprovado: true })
    const res = await request(app).post(`/pedidos/${pedidoId}/pagamento`).send({ aprovado: true })
    expect(res.status).toBe(422)
  })

  it('retorna 404 para pedido inexistente', async () => {
    const res = await request(app).post('/pedidos/99999/pagamento').send({ aprovado: true })
    expect(res.status).toBe(404)
  })
})

describe('GET /pedidos/:id', () => {
  it('retorna pedido existente', async () => {
    const usuario = await criarUsuario()
    const show = await criarShow()

    const pedidoRes = await request(app).post('/pedidos').send({
      usuario_id: usuario.id,
      show_id: show.id,
      quantidade: 1,
      metodo_pagamento_id: metodoPagamentoId,
    })

    const res = await request(app).get(`/pedidos/${pedidoRes.body.id}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(pedidoRes.body.id)
  })

  it('retorna 404 para pedido inexistente', async () => {
    const res = await request(app).get('/pedidos/99999')
    expect(res.status).toBe(404)
  })
})
