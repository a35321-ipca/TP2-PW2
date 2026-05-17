# EscolaApp — Node.js + MongoDB

Conversão do projeto PHP/MySQL para **Node.js + Express + MongoDB (Mongoose)**.

---

## Estrutura do Projeto

```
escola-node/
├── app.js                    # Entrada principal / servidor Express
├── seed.js                   # Script para criar utilizadores iniciais
├── package.json
├── middleware/
│   └── auth.js               # isAuth, isPerfil()
├── models/
│   ├── User.js               # Utilizadores (Aluno, Funcionario, Gestor)
│   ├── Curso.js              # Cursos
│   ├── UnidadeCurricular.js  # UCs (disciplinas)
│   ├── FichaAluno.js         # Ficha de aluno com foto, estado, etc.
│   ├── Pauta.js              # Pautas com lista de alunos e notas embutida
│   └── PedidoMatricula.js    # Pedidos de inscrição em UCs
├── routes/
│   ├── auth.js               # /login, /registo, /logout
│   ├── aluno.js              # /aluno, /aluno/ficha, /aluno/matricula
│   ├── funcionario.js        # /funcionario, criar-pauta, gravar-notas
│   └── gestor.js             # /gestor, add-curso, add-uc, validar-*
├── views/
│   ├── partials/             # head.ejs, footer.ejs
│   ├── login.ejs
│   ├── registo.ejs
│   ├── aluno/                # dashboard, ficha, matricula
│   ├── funcionario/          # dashboard
│   └── gestor/               # dashboard
├── public/
│   └── css/style.css
└── uploads/                  # Fotos dos alunos (gerado automaticamente)
```

---

## Instalação e Arranque

### Pré-requisitos
- Node.js 18+
- MongoDB 6+ (local ou Atlas)

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. (Opcional) Ajustar a ligação MongoDB em app.js
#    Por defeito: mongodb://localhost:27017/escola
#    Ou definir variável de ambiente: MONGO_URI=...

# 3. Criar utilizadores iniciais (admin e funcionario)
npm run seed

# 4. Arrancar o servidor
npm start
# ou em modo desenvolvimento (auto-reload):
npm run dev
```

Aceder em: **http://localhost:3000**

---

## Credenciais Iniciais (após seed)

| Username     | Password   | Perfil      |
|-------------|-----------|-------------|
| admin       | admin123  | Gestor      |
| funcionario | func123   | Funcionario |
| (qualquer)  | (definida)| Aluno — registo em /registo |

---

## Fluxo do Sistema

1. **Aluno** regista-se → preenche ficha → aguarda aprovação do Gestor
2. **Gestor** aprova/rejeita fichas e matrículas; gere cursos e UCs
3. **Funcionário** cria pautas → alunos inscrevem-se → funcionário lança notas
4. **Aluno** consulta notas no seu painel

---

## Equivalências PHP → Node.js

| PHP/MySQL          | Node.js/MongoDB            |
|--------------------|---------------------------|
| `config.php` (PDO) | `mongoose.connect()`       |
| `$_SESSION`        | `express-session`          |
| `password_hash`    | `bcryptjs` (pre-save hook) |
| `perfis` table     | campo `perfil` no User     |
| `pautas_alunos`    | array `alunos` embutido em Pauta |
| Views PHP/HTML     | EJS templates              |
| `move_uploaded_file` | `multer`                 |
