 const db = require('../config/database');

class UsuarioController {
    async obterPerfil(req, res) {
        try {
            const [rows] = await db.execute(
                'SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?',
                [req.usuarioId]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async obterRecomendacoes(req, res) {
        try {
            const [rows] = await db.execute(
                `SELECT c.*, p.nome as profissao_nome 
                 FROM cursos c
                 JOIN profissoes p ON c.profissao_id = p.id
                 LEFT JOIN progresso_usuario pr ON c.id = pr.curso_id AND pr.usuario_id = ?
                 WHERE pr.status IS NULL OR pr.status = 'pulado'
                 ORDER BY c.profissao_id, c.ordem
                 LIMIT 10`,
                [req.usuarioId]
            );
            
            res.json({
                recomendacoes: rows,
                total: rows.length
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UsuarioController();