# PDF Processor

Sistema de processamento de PDFs com frontend em React e backend em Node.js.

## Estrutura do Projeto

- `frontend/`: Aplicação React
- `backend/`: API Node.js
- `uploads/`: Pasta para arquivos temporários

## Deploy

### Frontend (Vercel)

1. Crie uma conta no [Vercel](https://vercel.com)
2. Instale o Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Faça login no Vercel:
   ```bash
   vercel login
   ```
4. Na pasta frontend, execute:
   ```bash
   vercel
   ```

### Backend (Render)

1. Crie uma conta no [Render](https://render.com)
2. Crie um novo Web Service
3. Conecte com seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `NODE_ENV`: production
   - `PORT`: 5000
   - `MONGODB_URI`: sua_string_de_conexao_mongodb

### Variáveis de Ambiente

#### Frontend (.env)
```
REACT_APP_API_URL=https://seu-backend.onrender.com
```

#### Backend (.env)
```
PORT=5000
MONGODB_URI=sua_string_de_conexao_mongodb
NODE_ENV=production
```

## Desenvolvimento Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Configure os arquivos .env
4. Inicie os servidores:
   ```bash
   # Terminal 1
   cd frontend && npm start
   
   # Terminal 2
   cd backend && npm run dev
   ```

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MongoDB (instalado e rodando localmente)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd pdf-processor
```

2. Instale as dependências do frontend:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd backend
npm install
```

4. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na pasta backend com o seguinte conteúdo:
```
MONGODB_URI=mongodb://localhost:27017/pdf-processor
PORT=5000
```

## Executando o projeto

1. Inicie o servidor backend:
```bash
cd backend
npm run dev
```

2. Em outro terminal, inicie o frontend:
```bash
cd ..
npm start
```

O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:5000`.

## Funcionalidades

- Upload e processamento de PDFs
- Visualização de dados em gráficos
- Cálculos automáticos de consumo
- Gerenciamento de ocorrências
- Exportação de dados para Excel

## Tecnologias utilizadas

- React
- Node.js
- MongoDB
- Express
- Chart.js
- PDF-lib
- XLSX
