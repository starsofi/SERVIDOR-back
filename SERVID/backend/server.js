// server.js - BACKEND COMPLETO DE CLIENTES

// PARTE 1 - IMPORTAR AS FERRAMENTAS NECESSÁRIAS
const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// PARTE 2 - CRIAR O SERVIDOR e abrir o banco de dados
const app = express();
// Abre o arquivo banco.db (se não existir, cria um novo)
const banco = new DatabaseSync(path.join(__dirname, '..', '..', 'SERV', 'banco.db'));


// cria a tabela "clientes" caso ela não exista
banco.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        nome     TEXT NOT NULL,
        email    TEXT NOT NULL,
        telefone TEXT NOT NULL
)`);

// PARTE 3 - CONFIGURAR O SERVIDOR PARA RECEBER REQUISIÇÕES
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public'))); // serve o index.html da pasta public

// PARTE 4 - CRIAR AS ROTAS DA API

// LER (GET /api/clientes) -> retorna todos os clientes do banco
app.get('/api/clientes', (req, res) => {
    const clientes = banco.prepare('SELECT * FROM clientes ORDER BY id DESC').all();
    res.json(clientes);
});

// CRIAR (POST /api/clientes) -> salva um novo cliente no banco
app.post('/api/clientes', (req, res) => {
    const { nome, email, telefone } = req.body; // pega os dados enviados pelo fetch

    // Validação básica se os campos estão preenchidos
    if (!nome || !email || !telefone) {
        return res.status(400).json({ erro: 'Preencha todos os campos!' });
    }

    // INSERT: adiciona o cliente na tabela
    banco.prepare('INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)').run(nome, email, telefone);

    res.json({ ok: true });
});

// APAGAR (DELETE /api/clientes/:id) -> remove o cliente pelo ID
app.delete('/api/clientes/:id', (req, res) => {
    const id = req.params.id;

    // DELETE: remove a linha que tem esse id
    banco.prepare('DELETE FROM clientes WHERE id = ?').run(id);
    res.json({ ok: true });
});

// PARTE 5 - INICIAR O SERVIDOR
app.listen(3000, () => {
    console.log('Servidor de Clientes rodando em http://localhost:3000');
});
