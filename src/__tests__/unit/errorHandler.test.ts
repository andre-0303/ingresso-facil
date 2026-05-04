import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../../shared/errors/AppError.js'
import { errorHandler } from '../../shared/middleware/errorHandler.js'

function makeMocks() {
  const req = {} as Request
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  const next = vi.fn() as NextFunction
  return { req, res, next }
}

describe('errorHandler', () => {
  it('retorna statusCode e message para AppError', () => {
    const { req, res, next } = makeMocks()
    errorHandler(new AppError('recurso não encontrado', 404), req, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'recurso não encontrado' })
  })

  it('retorna 400 para AppError sem statusCode explícito', () => {
    const { req, res, next } = makeMocks()
    errorHandler(new AppError('dado inválido'), req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('retorna 500 para Error genérico', () => {
    const { req, res, next } = makeMocks()
    errorHandler(new Error('algo quebrou'), req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
  })
})

describe('AppError', () => {
  it('herda de Error', () => {
    const err = new AppError('teste', 422)
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('teste')
    expect(err.statusCode).toBe(422)
  })

  it('statusCode padrão é 400', () => {
    expect(new AppError('x').statusCode).toBe(400)
  })
})
