const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    // Login para usuários comuns
    async loginUsuario(req, res) {
        const { email, senha } = req.body;
        
        try {
            const [rows] = await db.execute(
                'SELECT id, nome, email, senha FROM usuarios WHERE email = ?',
                [email]
            );
            
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Email ou senha inválidos' });
            }
            
            const usuario = rows[0];
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ error: 'Email ou senha inválidos' });
            }
            
            const token = jwt.sign(
                { id: usuario.id, tipo: 'usuario' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                message: 'Login realizado com sucesso',
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Login para administradores
    async loginAdmin(req, res) {
        const { login, senha } = req.body;
        
        try {
            const [rows] = await db.execute(
                'SELECT id, login, senha FROM administradores WHERE login = ?',
                [login]
            );
            
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Login ou senha inválidos' });
            }
            
            // A senha está armazenada como SHA2, então comparamos diretamente
            const [senhaHash] = await db.execute(
                'SELECT SHA2(?, 256) as hash',
                [senha]
            );
            
            if (rows[0].senha !== senhaHash[0].hash) {
                return res.status(401).json({ error: 'Login ou senha inválidos' });
            }
            
            const token = jwt.sign(
                { id: rows[0].id, tipo: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                message: 'Login admin realizado com sucesso',
                token,
                admin: {
                    id: rows[0].id,
                    login: rows[0].login
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    // Cadastro de novo usuário
    async cadastrarUsuario(req, res) {
        const { nome, email, senha } = req.body;
        
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        
        try {
            const senhaHash = await bcrypt.hash(senha, 10);
            
            const [result] = await db.execute(
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, senhaHash]
            );
            
            res.status(201).json({
                message: 'Usuário cadastrado com sucesso',
                usuario: {
                    id: result.insertId,
                    nome,
                    email
                }
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'Email já cadastrado' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
}

module.exports = new AuthController();