const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando base de dados...');
    
    // Conectar à base de dados
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/txopito-ia');
    console.log('✅ Conectado à base de dados');
    
    // Verificar se já existe utilizador admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Utilizador admin já existe:', existingAdmin.email);
    } else {
      // Criar utilizador admin
      const adminUser = new User({
        name: 'Administrador Txopito',
        email: 'admin@txopito.mz',
        password: 'TxopitoAdmin2024!',
        role: 'admin',
        status: 'active',
        preferences: {
          language: 'Portuguese',
          responseLength: 'detailed',
          theme: 'light',
          favoriteMode: 'general',
          notifications: true,
          aiPersonality: 'technical'
        }
      });
      
      await adminUser.save();
      console.log('✅ Utilizador admin criado:', adminUser.email);
    }
    
    // Verificar se já existe utilizador criador (Anselmo)
    const existingCreator = await User.findOne({ 
      $or: [
        { email: 'anselmo@txopito.mz' },
        { name: { $regex: /anselmo/i } }
      ]
    });
    
    if (existingCreator) {
      console.log('✅ Utilizador criador já existe:', existingCreator.email);
    } else {
      // Criar utilizador criador
      const creatorUser = new User({
        name: 'Anselmo Dora Bistiro Gulane',
        email: 'anselmo@txopito.mz',
        password: 'AnselmoCreator2024!',
        role: 'creator',
        status: 'active',
        preferences: {
          language: 'Portuguese',
          responseLength: 'detailed',
          theme: 'dark',
          favoriteMode: 'programming',
          notifications: true,
          aiPersonality: 'technical'
        }
      });
      
      await creatorUser.save();
      console.log('✅ Utilizador criador criado:', creatorUser.email);
    }
    
    // Criar índices para performance
    console.log('🔄 Criando índices...');
    
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ status: 1 });
    
    console.log('✅ Índices criados');
    
    // Estatísticas
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const creatorCount = await User.countDocuments({ role: 'creator' });
    
    console.log('\n📊 Estatísticas da Base de Dados:');
    console.log(`   Total de utilizadores: ${userCount}`);
    console.log(`   Administradores: ${adminCount}`);
    console.log(`   Criadores: ${creatorCount}`);
    
    console.log('\n🎉 Base de dados inicializada com sucesso!');
    console.log('\n🔐 Credenciais de Acesso:');
    console.log('   Admin: admin@txopito.mz / TxopitoAdmin2024!');
    console.log('   Criador: anselmo@txopito.mz / AnselmoCreator2024!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar base de dados:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado da base de dados');
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;