const express = require('express')
const { cadastrarUsuario, loginUsuario, detalharUsuario, atualizarUsuario } = require('./controladores/usuarios')
const verificaLogin = require('./intermediarios/verificaLogin')
const { listarCategorias } = require('./controladores/categorias')
const { listarTransacoes, detalharTransacao, cadastrarTransacao, atualizarTransacao, deletarTransacao, extratoTransacao } = require('./controladores/transacoes')

const rotas = express()

rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', loginUsuario)
rotas.use(verificaLogin)
rotas.get('/usuario', detalharUsuario)
rotas.put('/usuario', atualizarUsuario)

rotas.get('/categorias', listarCategorias)

rotas.get('/transacoes', listarTransacoes)
rotas.get('/transacao/extrato', extratoTransacao)
rotas.get('/transacoes/:id', detalharTransacao)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', atualizarTransacao)
rotas.delete('/transacao/:id', deletarTransacao)

module.exports = rotas