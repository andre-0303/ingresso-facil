import 'dotenv/config'
import express from 'express'
import { errorHandler } from './shared/middleware/errorHandler.js'
import { usuarioRoutes } from './modules/usuario/usuario.routes.js'
import { showRoutes } from './modules/show/show.routes.js'
import { pedidoRoutes } from './modules/pedido/pedido.routes.js'
import { ingressoRoutes } from './modules/ingresso/ingresso.routes.js'

export const app = express()

app.use(express.json())

app.get('/ping', (_, res) => {
  res.json({ message: 'pong' })
})

app.use('/usuarios', usuarioRoutes)
app.use('/shows', showRoutes)
app.use('/pedidos', pedidoRoutes)
app.use('/ingressos', ingressoRoutes)

app.use(errorHandler)
