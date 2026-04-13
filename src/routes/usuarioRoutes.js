const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Obter perfil do usuário
router.get('/perfil', verificarToken, async (req, res) => {
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
});

// Obter recomendações
router.get('/recomendacoes', verificarToken, async (req, res) => {
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
});

module.exports = router;