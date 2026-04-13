const db = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminController {
    // ========== CRUD de Cursos ==========
    
    // Criar novo curso
    async criarCurso(req, res) {
        const { profissao_id, titulo, link, ordem, dificuldade } = req.body;
        
        if (!profissao_id || !titulo || !link) {
            return res.status(400).json({ error: 'Campos obrigatórios: profissao_id, titulo, link' });
        }
        
        try {
            const [result] = await db.execute(
                'INSERT INTO cursos (profissao_id, titulo, link, ordem, dificuldade) VALUES (?, ?, ?, ?, ?)',
                [profissao_id, titulo, link, ordem || 999, dificuldade || 'Iniciante']
            );
            
            res.status(201).json({
                message: 'Curso criado com sucesso',
                curso: { id: result.insertId, ...req.body }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Listar todos os cursos (admin)
    async listarCursos(req, res) {
        try {
            const [rows] = await db.execute(
                `SELECT c.*, p.nome as profissao_nome 
                 FROM cursos c 
                 JOIN profissoes p ON c.profissao_id = p.id 
                 ORDER BY c.profissao_id, c.ordem`
            );
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Atualizar curso
    async atualizarCurso(req, res) {
        const { id } = req.params;
        const { profissao_id, titulo, link, ordem, dificuldade } = req.body;
        
        try {
            const [result] = await db.execute(
                'UPDATE cursos SET profissao_id = ?, titulo = ?, link = ?, ordem = ?, dificuldade = ? WHERE id = ?',
                [profissao_id, titulo, link, ordem, dificuldade, id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Curso não encontrado' });
            }
            
            res.json({ message: 'Curso atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Deletar curso
    async deletarCurso(req, res) {
        const { id } = req.params;
        
        try {
            const [result] = await db.execute('DELETE FROM cursos WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Curso não encontrado' });
            }
            
            res.json({ message: 'Curso deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // ========== CRUD de Usuários ==========
    
    async listarUsuarios(req, res) {
        try {
            const [rows] = await db.execute(
                'SELECT id, nome, email, criado_em FROM usuarios ORDER BY criado_em DESC'
            );
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async deletarUsuario(req, res) {
        const { id } = req.params;
        
        try {
            const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            res.json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // ========== CRUD de Profissões ==========
    
    async criarProfissao(req, res) {
        const { nome, descricao, icone } = req.body;
        
        if (!nome) {
            return res.status(400).json({ error: 'Nome da profissão é obrigatório' });
        }
        
        try {
            const [result] = await db.execute(
                'INSERT INTO profissoes (nome, descricao, icone) VALUES (?, ?, ?)',
                [nome, descricao || '', icone || '💻']
            );
            
            res.status(201).json({
                message: 'Profissão criada com sucesso',
                profissao: { id: result.insertId, nome, descricao, icone }
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'Profissão já existe' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
    
    async listarProfissoes(req, res) {
        try {
            const [rows] = await db.execute('SELECT * FROM profissoes ORDER BY nome');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async atualizarProfissao(req, res) {
        const { id } = req.params;
        const { nome, descricao, icone } = req.body;
        
        try {
            const [result] = await db.execute(
                'UPDATE profissoes SET nome = ?, descricao = ?, icone = ? WHERE id = ?',
                [nome, descricao, icone, id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Profissão não encontrada' });
            }
            
            res.json({ message: 'Profissão atualizada com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async deletarProfissao(req, res) {
        const { id } = req.params;
        
        try {
            const [result] = await db.execute('DELETE FROM profissoes WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Profissão não encontrada' });
            }
            
            res.json({ message: 'Profissão deletada com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // ========== Estatísticas ==========
    
    async obterEstatisticas(req, res) {
        try {
            const [totalUsuarios] = await db.execute('SELECT COUNT(*) as total FROM usuarios');
            const [totalCursos] = await db.execute('SELECT COUNT(*) as total FROM cursos');
            const [totalProfissoes] = await db.execute('SELECT COUNT(*) as total FROM profissoes');
            const [totalProgresso] = await db.execute('SELECT COUNT(*) as total FROM progresso_usuario');
            
            res.json({
                usuarios: totalUsuarios[0].total,
                cursos: totalCursos[0].total,
                profissoes: totalProfissoes[0].total,
                progressos: totalProgresso[0].total
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AdminController();