const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rota pública de teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando!' });
});

// Importando rotas de autenticação
const authRoutes = require('./src/routes/authRoutes');

// Usando rotas de autenticação (públicas)
app.use('/api/auth', authRoutes);

// Importando middleware de token
const { verificarToken } = require('./src/middlewares/authMiddleware');

// A partir daqui, todas as rotas precisam de token
app.use(verificarToken);

// Rotas protegidas
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const cursoRoutes = require('./src/routes/cursoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/usuario', usuarioRoutes);
app.use('/api', cursoRoutes);
app.use('/api/admin', adminRoutes);

// Rota 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Teste: http://localhost:${PORT}/api/health`);
});