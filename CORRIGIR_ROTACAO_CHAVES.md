# 🔧 CORRIGIR ROTAÇÃO AUTOMÁTICA DE CHAVES

## 🚨 **PROBLEMA IDENTIFICADO:**
Sistema de rotação automática não funciona porque só tem 1 chave configurada.

## ✅ **SOLUÇÕES:**

### **SOLUÇÃO 1: ADICIONAR CHAVES VIA ADMIN DASHBOARD**

#### **Passo a Passo:**
1. **Acesso Admin**: 7 cliques no logo
2. **Dashboard** → Aba "Chaves API"
3. **"Adicionar Nova Chave"**
4. **Repetir** para cada chave adicional

#### **Chaves para Adicionar:**
```
Chave #1: AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ (já configurada)
Chave #2: [Gerar nova em https://aistudio.google.com/app/apikey]
Chave #3: [Gerar nova em https://aistudio.google.com/app/apikey]
```

### **SOLUÇÃO 2: GERAR NOVAS CHAVES GOOGLE**

#### **Criar Chaves Adicionais:**
1. **Vai para**: `https://aistudio.google.com/app/apikey`
2. **"Create API Key"** → Gerar 2-3 chaves novas
3. **Copiar** cada chave
4. **Adicionar** no admin dashboard

### **SOLUÇÃO 3: CONFIGURAR NO CÓDIGO (TEMPORÁRIO)**

Se quiseres adicionar chaves diretamente no código:

```typescript
// Em services/apiKeyManager.ts, linha ~75:
const backupKeys = [
  { key: 'SUA_CHAVE_BACKUP_1', name: 'Chave Backup #1' },
  { key: 'SUA_CHAVE_BACKUP_2', name: 'Chave Backup #2' },
];
```

---

## 🧪 **TESTAR ROTAÇÃO AUTOMÁTICA:**

### **Simular Erro de Quota:**
1. **Console do navegador** (F12):
```javascript
// Forçar rotação para testar
apiKeyManager.markKeyAsQuotaExceeded('current_key_id', 'Teste de rotação');
```

2. **Fazer pergunta** à IA
3. **Verificar logs** se roda para próxima chave

### **Verificar Status das Chaves:**
1. **Admin Dashboard** → "Chaves API"
2. **Ver estatísticas** de uso
3. **Verificar** chave ativa atual

---

## 🔄 **COMO FUNCIONA A ROTAÇÃO:**

### **Automática:**
- ✅ **Quota excedida** → Roda automaticamente
- ✅ **Chave inválida** → Roda automaticamente  
- ✅ **Erro 403/401** → Roda automaticamente
- ✅ **Muitos erros** → Desativa chave e roda

### **Manual:**
- ✅ **Admin pode** ativar/desativar chaves
- ✅ **Admin pode** adicionar/remover chaves
- ✅ **Admin pode** ver estatísticas

---

## 🎯 **RECOMENDAÇÃO IMEDIATA:**

### **1. Gerar 2 Chaves Novas:**
```
https://aistudio.google.com/app/apikey
→ Create API Key (2x)
→ Copiar chaves
```

### **2. Adicionar via Admin:**
```
7 cliques no logo
→ Chaves API
→ Adicionar Nova Chave (2x)
→ Testar rotação
```

### **3. Verificar Funcionamento:**
```
Fazer pergunta → IA responde
Admin → Ver estatísticas de uso
Console → Verificar logs de rotação
```

---

## 🚨 **SE AINDA NÃO FUNCIONAR:**

### **Debug no Console:**
```javascript
// Verificar chaves carregadas
console.log(apiKeyManager.getAllKeys());

// Verificar chave atual
console.log(apiKeyManager.getCurrentKey());

// Forçar rotação
apiKeyManager.rotateToNextKey();
```

### **Logs Esperados:**
```
✅ "Sistema inicializado com 3 chave(s) API"
✅ "Rotação automática ativada"
✅ "Rotação para chave: Chave Backup #1"
```

**Rotação automática vai funcionar com múltiplas chaves!** 🔄🚀