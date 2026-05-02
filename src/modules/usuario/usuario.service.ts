import { pool } from '../../database/pool.js'
import { AppError } from '../../shared/errors/AppError.js'
import type { Usuario } from '../../shared/types/index.js'
import type { CriarUsuarioInput } from './usuario.schema.js'

export async function criarUsuario(data: CriarUsuarioInput): Promise<Usuario> {
  const { rows } = await pool.query<Usuario>(
    'INSERT INTO usuario (nome, cpf, email) VALUES ($1, $2, $3) RETURNING *',
    [data.nome, data.cpf, data.email],
  )
  return rows[0]
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario> {
  const { rows } = await pool.query<Usuario>(
    'SELECT * FROM usuario WHERE id = $1',
    [id],
  )
  if (!rows[0]) throw new AppError('Usuário não encontrado', 404)
  return rows[0]
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { rows } = await pool.query<Usuario>('SELECT * FROM usuario ORDER BY id')
  return rows
}
