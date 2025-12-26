const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.substring(7); // Remove "Bearer "
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar utilizador
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        error: 'Token inválido - utilizador não encontrado',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Verificar se conta está ativa
    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Conta suspensa ou inativa',
        code: 'ACCOUNT_SUSPENDED'
      });
    }
    
    // Atualizar última atividade
    user.updateLastActive();
    
    // Adicionar utilizador ao request
    req.user = user;
    
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('❌ Erro na autenticação:', error);
    res.status(500).json({
      error: 'Erro interno de autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = authMiddleware;