const db = require('../config/database');

class CursoController {
    // Listar todos os cursos de uma profissão (ordem recomendada)
    async listarCursosPorProfissao(req, res) {
        const { profissaoId } = req.params;
        
        try {
            const [rows] = await db.execute(
                'SELECT * FROM cursos WHERE profissao_id = ? ORDER BY ordem ASC',
                [profissaoId]
            );
            
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Listar todas as profissões disponíveis
    async listarProfissoes(req, res) {
        try {
            const [rows] = await db.execute('SELECT * FROM profissoes ORDER BY nome');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Obter detalhes de um curso específico
    async obterCurso(req, res) {
        const { id } = req.params;
        
        try {
            const [rows] = await db.execute(
                `SELECT c.*, p.nome as profissao_nome 
                 FROM cursos c 
                 JOIN profissoes p ON c.profissao_id = p.id 
                 WHERE c.id = ?`,
                [id]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Curso não encontrado' });
            }
            
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Marcar curso como concluído
    async marcarConcluido(req, res) {
        const { cursoId } = req.params;
        const usuarioId = req.usuarioId;
        
        try {
            // Verificar se já existe
            const [exists] = await db.execute(
                'SELECT * FROM progresso_usuario WHERE usuario_id = ? AND curso_id = ?',
                [usuarioId, cursoId]
            );
            
            if (exists.length > 0) {
                await db.execute(
                    'UPDATE progresso_usuario SET status = "concluido", data_modificacao = NOW() WHERE usuario_id = ? AND curso_id = ?',
                    [usuarioId, cursoId]
                );
            } else {
                await db.execute(
                    'INSERT INTO progresso_usuario (usuario_id, curso_id, status) VALUES (?, ?, "concluido")',
                    [usuarioId, cursoId]
                );
            }
            
            res.json({ message: 'Curso marcado como concluído' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Pular curso
    async pularCurso(req, res) {
        const { cursoId } = req.params;
        const usuarioId = req.usuarioId;
        
        try {
            const [exists] = await db.execute(
                'SELECT * FROM progresso_usuario WHERE usuario_id = ? AND curso_id = ?',
                [usuarioId, cursoId]
            );
            
            if (exists.length > 0) {
                await db.execute(
                    'UPDATE progresso_usuario SET status = "pulado", data_modificacao = NOW() WHERE usuario_id = ? AND curso_id = ?',
                    [usuarioId, cursoId]
                );
            } else {
                await db.execute(
                    'INSERT INTO progresso_usuario (usuario_id, curso_id, status) VALUES (?, ?, "pulado")',
                    [usuarioId, cursoId]
                );
            }
            
            res.json({ message: 'Curso pulado' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Obter progresso do usuário
    async obterProgresso(req, res) {
        const usuarioId = req.usuarioId;
        
        try {
            const [rows] = await db.execute(
                `SELECT c.id, c.titulo, c.profissao_id, p.status 
                 FROM cursos c 
                 LEFT JOIN progresso_usuario p ON c.id = p.curso_id AND p.usuario_id = ?
                 ORDER BY c.profissao_id, c.ordem`,
                [usuarioId]
            );
            
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CursoController();