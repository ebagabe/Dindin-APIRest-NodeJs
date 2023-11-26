const bcrypt = require('bcrypt')
const pool = require('../database/conexao')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" })
    }

    try {
        const emailExiste = await pool.query('select * from usuarios where email = $1', [email])

        if (emailExiste.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' })
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const query = `
            insert into usuarios (nome, email, senha)
            values ($1, $2, $3) returning *
        `

        const { rows } = await pool.query(query, [nome, email, senhaCriptografada])
        const { senha: _, ...usuario } = rows[0];



        return res.status(201).json(usuario)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body

    try {
        const { rows, rowCount } = await pool.query('select * from usuarios where email = $1', [email])
        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Email ou senha inválidos' })
        }

        const { senha: senhaUsuario, ...usuario } = rows[0]

        const senhaCorreta = await bcrypt.compare(senha, senhaUsuario)

        if (!senhaCorreta) {
            return res.status(400).json({ mensagem: 'Email ou senha inválidos' })
        }

        const token = jwt.sign({ id: usuario.id }, senhaJwt, { expiresIn: '6h' })
        return res.json({
            usuario,
            token
        })

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const detalharUsuario = async (req, res) => {
    try {
        const { id, nome, email } = req.usuario;
        return res.status(200).json({ id, nome, email });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' });
    }
}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body
    const { id } = req.usuario

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' })
    }

    try {
        const emailExistente = await pool.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, id])

        if (emailExistente.rowCount > 0) {
            return res.status(400).json({ mensagem: 'O novo e-mail já está em uso por outro usuário.' })
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10)

        await pool.query('UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4', [nome, email, senhaCriptografada, id])

        return res.status(204).send();
    } catch (error) {
        return res.status(401).json({ mensagem: 'Falha na autenticação.' });
    }

}

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario,
    atualizarUsuario
}