const express = require('express');
const cursoController = require('../controllers/cursoController');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rotas públicas (requerem token)
router.get('/profissoes', verificarToken, cursoController.listarProfissoes);
router.get('/profissao/:profissaoId/cursos', verificarToken, cursoController.listarCursosPorProfissao);
router.get('/cursos/:id', verificarToken, cursoController.obterCurso);
router.get('/progresso', verificarToken, cursoController.obterProgresso);
router.post('/cursos/:cursoId/concluir', verificarToken, cursoController.marcarConcluido);
router.post('/cursos/:cursoId/pular', verificarToken, cursoController.pularCurso);

module.exports = router;