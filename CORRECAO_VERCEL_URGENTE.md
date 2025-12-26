# 🚨 CORREÇÃO URGENTE PARA VERCEL

## ❌ **PROBLEMA ATUAL**
```
npm error ERESOLVE could not resolve
npm error While resolving: vite-plugin-pwa@0.20.5
npm error Found: vite@6.4.1
```

## ✅ **SOLUÇÃO RÁPIDA**

### **1. Criar package.json Limpo**
```json
{
  "name": "txopito-ia",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
```

### **2. Criar vite.config.ts Simples**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
```

### **3. No Vercel**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

## 🚀 **ALTERNATIVA MAIS RÁPIDA**

### **Usar Netlify em vez de Vercel:**
```bash
# 1. https://netlify.com
# 2. New site from Git
# 3. GitHub: AnselmoXf1/txopito-ia
# 4. Build command: npm run build
# 5. Publish directory: dist
# 6. Environment variables: (copiar do arquivo)
```

### **Ou usar Render para Frontend também:**
```bash
# 1. https://render.com
# 2. New Static Site
# 3. GitHub: AnselmoXf1/txopito-ia
# 4. Build command: npm run build
# 5. Publish directory: dist
```

## ⚡ **SOLUÇÃO IMEDIATA**

**Vou criar versões limpas dos arquivos agora!**