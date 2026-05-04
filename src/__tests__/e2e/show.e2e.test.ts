import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { truncateAll, closePool } from './setup.js'

beforeAll(async () => { await truncateAll() })
beforeEach(async () => { await truncateAll() })
afterAll(async () => { await closePool() })

const showValido = {
  nome: 'Festival Rock',
  data: '2025-12-31',
  local: 'Ginásio Central',
  quantidade_ingressos: 10,
  preco_ingresso: 150.0,
}

describe('POST /shows', () => {
  it('cria show com ingressos pré-alocados', async () => {
    const res = await request(app).post('/shows').send(showValido)
    expect(res.status).toBe(201)
    expect(res.body.nome).toBe('Festival Rock')
    expect(res.body.id).toBeDefined()
  })

  it('retorna 400 para data no formato errado', async () => {
    const res = await request(app).post('/shows').send({ ...showValido, data: '31-12-2025' })
    expect(res.status).toBe(400)
  })

  it('retorna 400 para quantidade_ingressos zero', async () => {
    const res = await request(app).post('/shows').send({ ...showValido, quantidade_ingressos: 0 })
    expect(res.status).toBe(400)
  })
})

describe('GET /shows', () => {
  it('lista shows com ingressos_disponiveis', async () => {
    await request(app).post('/shows').send(showValido)
    const res = await request(app).get('/shows')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('ingressos_disponiveis')
  })
})

describe('GET /shows/:id', () => {
  it('retorna show com ingressos_disponiveis', async () => {
    const created = await request(app).post('/shows').send(showValido)
    const res = await request(app).get(`/shows/${created.body.id}`)
    expect(res.status).toBe(200)
    expect(Number(res.body.ingressos_disponiveis)).toBe(10)
  })

  it('retorna 404 para show inexistente', async () => {
    const res = await request(app).get('/shows/99999')
    expect(res.status).toBe(404)
  })
})
