import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { truncateAll, closePool } from './setup.js'

beforeAll(async () => { await truncateAll() })
beforeEach(async () => { await truncateAll() })
afterAll(async () => { await closePool() })

describe('POST /usuarios', () => {
  it('cria usuário com dados válidos', async () => {
    const res = await request(app).post('/usuarios').send({
      nome: 'Maria Silva',
      cpf: '11111111101',
      email: 'maria@email.com',
    })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ nome: 'Maria Silva', cpf: '11111111101' })
    expect(res.body.id).toBeDefined()
  })

  it('retorna 400 para CPF inválido', async () => {
    const res = await request(app).post('/usuarios').send({
      nome: 'João',
      cpf: '123',
      email: 'joao11@email.com',
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('retorna 400 para email inválido', async () => {
    const res = await request(app).post('/usuarios').send({
      nome: 'João',
      cpf: '11111111102',
      email: 'nao-e-email',
    })
    expect(res.status).toBe(400)
  })
})

describe('GET /usuarios/:id', () => {
  it('retorna usuário existente', async () => {
    const created = await request(app).post('/usuarios').send({
      nome: 'Ana Costa',
      cpf: '22222222201',
      email: 'ana@email.com',
    })
    const res = await request(app).get(`/usuarios/${created.body.id}`)
    expect(res.status).toBe(200)
    expect(res.body.nome).toBe('Ana Costa')
  })

  it('retorna 404 para ID inexistente', async () => {
    const res = await request(app).get('/usuarios/99999')
    expect(res.status).toBe(404)
  })
})
