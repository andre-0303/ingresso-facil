import { z } from 'zod'

export const criarUsuarioSchema = z.object({
  nome: z.string().min(1, 'nome obrigatório'),
  cpf: z
    .string()
    .length(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d+$/, 'CPF deve conter apenas números'),
  email: z.string().email('email inválido'),
})

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>
