import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'

function makeMocks() {
  const req = {} as Request
  const res = {} as Response
  const next = vi.fn() as NextFunction
  return { req, res, next }
}

describe('asyncHandler', () => {
  it('chama next(err) quando fn rejeita', async () => {
    const err = new Error('falhou')
    const fn = vi.fn().mockRejectedValue(err)
    const { req, res, next } = makeMocks()
    await asyncHandler(fn)(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })

  it('não chama next quando fn resolve', async () => {
    const fn = vi.fn().mockResolvedValue(undefined)
    const { req, res, next } = makeMocks()
    await asyncHandler(fn)(req, res, next)
    expect(next).not.toHaveBeenCalled()
  })
})
