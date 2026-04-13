const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // NOVA ROTA
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', cursoRoutes);
app.use('/api/usuario', usuarioRoutes); // NOVA ROTA PARA USUÁRIO
app.use('/api/admin', adminRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando!' });
});

// Middleware de erro 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;