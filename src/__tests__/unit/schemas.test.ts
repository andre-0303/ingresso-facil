import { describe, it, expect } from 'vitest'
import { criarPedidoSchema, confirmarPagamentoSchema } from '../../modules/pedido/pedido.schema.js'
import { criarShowSchema } from '../../modules/show/show.schema.js'
import { criarUsuarioSchema } from '../../modules/usuario/usuario.schema.js'

describe('criarUsuarioSchema', () => {
  it('aceita dados válidos', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'João Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita CPF com letras', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'João',
      cpf: '1234567890A',
      email: 'joao@email.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita CPF com menos de 11 dígitos', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'João',
      cpf: '1234567890',
      email: 'joao@email.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita email inválido', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'João',
      cpf: '12345678901',
      email: 'nao-e-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita nome vazio', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: '',
      cpf: '12345678901',
      email: 'joao@email.com',
    })
    expect(result.success).toBe(false)
  })
})

describe('criarShowSchema', () => {
  it('aceita dados válidos', () => {
    const result = criarShowSchema.safeParse({
      nome: 'Show do Bando',
      data: '2025-12-31',
      local: 'Ginásio Central',
      quantidade_ingressos: 100,
      preco_ingresso: 50.0,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita data no formato errado', () => {
    const result = criarShowSchema.safeParse({
      nome: 'Show',
      data: '31/12/2025',
      local: 'Local',
      quantidade_ingressos: 10,
      preco_ingresso: 50,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita quantidade_ingressos zero', () => {
    const result = criarShowSchema.safeParse({
      nome: 'Show',
      data: '2025-12-31',
      local: 'Local',
      quantidade_ingressos: 0,
      preco_ingresso: 50,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita preco negativo', () => {
    const result = criarShowSchema.safeParse({
      nome: 'Show',
      data: '2025-12-31',
      local: 'Local',
      quantidade_ingressos: 10,
      preco_ingresso: -1,
    })
    expect(result.success).toBe(false)
  })
})

describe('criarPedidoSchema', () => {
  it('aceita dados válidos', () => {
    const result = criarPedidoSchema.safeParse({
      usuario_id: 1,
      show_id: 1,
      quantidade: 2,
      metodo_pagamento_id: 1,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita quantidade maior que 5', () => {
    const result = criarPedidoSchema.safeParse({
      usuario_id: 1,
      show_id: 1,
      quantidade: 6,
      metodo_pagamento_id: 1,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita quantidade zero', () => {
    const result = criarPedidoSchema.safeParse({
      usuario_id: 1,
      show_id: 1,
      quantidade: 0,
      metodo_pagamento_id: 1,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita usuario_id negativo', () => {
    const result = criarPedidoSchema.safeParse({
      usuario_id: -1,
      show_id: 1,
      quantidade: 1,
      metodo_pagamento_id: 1,
    })
    expect(result.success).toBe(false)
  })
})

describe('confirmarPagamentoSchema', () => {
  it('aceita aprovado: true', () => {
    expect(confirmarPagamentoSchema.safeParse({ aprovado: true }).success).toBe(true)
  })

  it('aceita aprovado: false', () => {
    expect(confirmarPagamentoSchema.safeParse({ aprovado: false }).success).toBe(true)
  })

  it('rejeita string no lugar de boolean', () => {
    expect(confirmarPagamentoSchema.safeParse({ aprovado: 'true' }).success).toBe(false)
  })
})
