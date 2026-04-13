const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        req.usuarioTipo = decoded.tipo;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

const verificarAdmin = (req, res, next) => {
    if (req.usuarioTipo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    next();
};

module.exports = { verificarToken, verificarAdmin };