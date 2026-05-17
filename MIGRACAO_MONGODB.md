# 🔄 Migração MongoDB - Estrutura Alinhada com tp1.sql

## 📋 Mudanças Realizadas

### ✅ Novos Modelos Criados:

1. **Perfil.js** - Gerencia os tipos de utilizador (Aluno, Funcionario, Gestor)
2. **PlanoEstudos.js** - Associa UCs aos cursos por ano/semestre  
3. **PautaAluno.js** - Registos individuais de notas por aluno

### ✅ Modelos Atualizados:

1. **User.js**
   - `perfil` mudou de String para ObjectId (referencia modelo Perfil)
   - Agora usa estrutura relacional como no SQL

2. **Pauta.js**
   - Removido embedded schema `alunos`
   - Agora apenas referencia UC, Curso, Funcionário
   - Notas de alunos são guardadas em coleção separada `PautaAluno`

3. **PedidoMatricula.js**
   - Removida referência a `pauta`
   - Campos `ano_letivo`, `estado`, `funcionario_id`, `data_decisao` alinhados com SQL

4. **FichaAluno.js**
   - Removido campo `observacoes`
   - Adicionados defaults `null` para campos opcionais
   - Alinhado com estrutura SQL

## 🚀 Como Usar

### 1. **Limpar Base de Dados Antiga**
```bash
# MongoDB
mongo
> use escola
> db.dropDatabase()
> exit
```

### 2. **Executar Script de Seed**
```bash
node seedMongoDB.js
```

Este script vai:
- ✅ Criar 3 perfis (Aluno, Funcionario, Gestor)
- ✅ Criar 2 utilizadores teste (admin, funcionario)
- ✅ Criar 3 cursos
- ✅ Criar 10 unidades curriculares
- ✅ Criar plano de estudos
- ✅ Criar pautas de exemplo

### 3. **Dados Teste Criados**

**Utilizadores:**
- **Admin:** username: `admin` | password: `123456` | perfil: Gestor
- **Funcionário:** username: `funcionario` | password: `123456` | perfil: Funcionario

**Cursos:**
- Licenciatura em Informática (LI)
- Licenciatura em Matemática (LM)
- Mestrado em Inteligência Artificial (MIA)

## 📊 Relações Entre Coleções

```
Perfil
  ↑
  └─→ User (perfil_id)

Curso
  ↓
  ├─→ UnidadeCurricular (curso)
  ├─→ PlanoEstudos (curso)
  ├─→ Pauta (curso)
  └─→ FichaAluno (curso)

UnidadeCurricular
  ├─→ PlanoEstudos (uc)
  └─→ Pauta (uc)

PlanoEstudos
  └─→ (ano + semestre + curso + uc)

Pauta
  ├─→ UCs
  ├─→ Curso
  ├─→ Funcionario (User)
  └─→ PautaAluno[] (referencia)

PautaAluno
  ├─→ Pauta
  └─→ Aluno (User)

FichaAluno
  ├─→ Utilizador (User)
  ├─→ Curso
  └─→ Validador (User - opcional)

PedidoMatricula
  ├─→ Aluno (User)
  └─→ Funcionario (User - opcional)
```

## 🔧 Alterações Necessárias no Código

### Auth.js - Atualizar Middleware

Se estiver a usar `req.user.perfil`, agora é uma ObjectId. Mude para:

```javascript
// Antes
if (req.user.perfil === 'Aluno') { ... }

// Depois - Opção 1: Populate
User.findById(req.user.id).populate('perfil');
if (req.user.perfil.nome === 'Aluno') { ... }

// Opção 2: Guardar perfil no session
// No login, guarde também o nome do perfil
```

### Routes - Atualizar Queries

```javascript
// Antes
const user = await User.findById(id);
if (user.perfil === 'Gestor') { ... }

// Depois
const user = await User.findById(id).populate('perfil');
if (user.perfil.nome === 'Gestor') { ... }
```

## ✨ Próximos Passos

1. ✅ Atualizar middleware de autenticação
2. ✅ Atualizar rotas para fazer `.populate('perfil')`
3. ✅ Atualizar views EJS para usar dados com populate
4. ✅ Testar fluxos de login e autorização

---

**Script criado em:** 2026-05-17  
**Compatível com:** MongoDB + Mongoose 7.x
