import { z } from 'zod'

export const criarShowSchema = z.object({
  nome: z.string().min(1, 'nome obrigatório'),
  data: z.string().date('data inválida (use YYYY-MM-DD)'),
  local: z.string().min(1, 'local obrigatório'),
  quantidade_ingressos: z.number().int().positive('quantidade deve ser positiva'),
  preco_ingresso: z.number().positive('preço deve ser positivo'),
})

export type CriarShowInput = z.infer<typeof criarShowSchema>
