const pool = require("../database/conexao")

const listarTransacoes = async (req, res) => {
    try {

        const { id } = req.usuario

        const resultado = await pool.query('SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes t JOIN categorias c ON t.categoria_id = c.id WHERE t.usuario_id = $1', [id])
        const transacoes = resultado.rows

        return res.json(transacoes)

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro no servidor interno.' })
    }
}

const detalharTransacao = async (req, res) => {
    try {
        const { id } = req.usuario
        const transacaoId = req.params.id

        const resultado = await pool.query('SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes t JOIN categorias c ON t.categoria_id = c.id WHERE t.id = $1 AND t.usuario_id = $2', [transacaoId, id])

        if (resultado.rowCount === 1) {
            const transacao = resultado.rows[0]
            return res.json(transacao)
        } else {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' })
        }

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro no servidor interno.' })
    }
}

const cadastrarTransacao = async (req, res) => {
    try {
        const { id } = req.usuario

        const { tipo, descricao, valor, data, categoria_id } = req.body

        if (!tipo || !descricao || !valor || !data || !categoria_id) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
        }

        const categoriaExistente = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id])

        if (categoriaExistente.rowCount !== 1) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' })
        }

        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' })
        }

        const resultado = await pool.query('INSERT INTO transacoes (tipo, descricao, valor, data, usuario_id, categoria_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [tipo, descricao, valor, data, id, categoria_id])

        const transacaoCadastrada = resultado.rows[0]

        return res.json(transacaoCadastrada)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro no servidor interno.' });
    }
}

const atualizarTransacao = async (req, res) => {
    try {
        const { id } = req.usuario

        const transacaoId = req.params.id

        const { descricao, valor, data, categoria_id, tipo } = req.body

        const transacaoExistente = await pool.query('SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2', [transacaoId, id])

        if (transacaoExistente.rowCount !== 1) {
            return res.status(404).json({ mensagem: 'Transação não encontrada ou não pertence ao usuário logado.' })
        }

        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        }

        const categoriaExistente = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id]);

        if (categoriaExistente.rowCount !== 1) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
        }

        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' });
        }

        await pool.query('UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6', [descricao, valor, data, categoria_id, tipo, transacaoId]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro no servidor interno.' });
    }
}

const deletarTransacao = async (req, res) => {
    try {
        
        const {id} = req.usuario
        
        const transacaoId = req.params.id

        const transacaoExistente = await pool.query('SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2', [transacaoId, id])

        if (transacaoExistente.rowCount !== 1) {
            return res.status(404).json({ mensagem: 'Transação não encontrada ou não pertence ao usuário logado.' })
        }

        await pool.query('DELETE FROM transacoes WHERE id = $1', [transacaoId])

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro no servidor interno.' })
    }
}

const extratoTransacao = async (req, res) => {
    try {
        const {id} = req.usuario

        const resultadoEntrada = await pool.query('SELECT COALESCE(SUM(valor), 0) as entrada FROM transacoes WHERE usuario_id = $1 AND tipo = $2', [id, 'entrada'])
        const entrada = resultadoEntrada.rows[0].entrada

        const resultadoSaida = await pool.query('SELECT COALESCE(SUM(valor), 0) as saida FROM transacoes WHERE usuario_id = $1 AND tipo = $2', [id, 'saida'])
        const saida = resultadoSaida.rows[0].saida

        return res.status(200).json({ entrada, saida })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro no servidor interno.' })
    }
};

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTransacao,
    extratoTransacao
}