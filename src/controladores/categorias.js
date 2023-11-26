const pool = require('../database/conexao')

const listarCategorias = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id, descricao FROM categorias');
        const categorias = resultado.rows;

        return res.json(categorias);

    } catch (error) {
        console.error('Erro ao obter categorias:', error);
        return res.status(500).json({ mensagem: 'Erro no servidor interno.' });
    }
};

module.exports = { listarCategorias }