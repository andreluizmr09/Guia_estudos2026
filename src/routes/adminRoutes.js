const express = require('express');
const adminController = require('../controllers/adminController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Todas as rotas de admin exigem autenticação e verificação de admin
router.use(verificarToken);
router.use(verificarAdmin);

// CRUD Cursos
router.post('/cursos', adminController.criarCurso);
router.get('/cursos', adminController.listarCursos);
router.put('/cursos/:id', adminController.atualizarCurso);
router.delete('/cursos/:id', adminController.deletarCurso);

// CRUD Usuários
router.get('/usuarios', adminController.listarUsuarios);
router.delete('/usuarios/:id', adminController.deletarUsuario);

// CRUD Profissões
router.post('/profissoes', adminController.criarProfissao);
router.get('/profissoes', adminController.listarProfissoes);
router.put('/profissoes/:id', adminController.atualizarProfissao);
router.delete('/profissoes/:id', adminController.deletarProfissao);

// Estatísticas
router.get('/estatisticas', adminController.obterEstatisticas);

module.exports = router;