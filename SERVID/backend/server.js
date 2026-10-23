const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const banco = new DatabaseSync(path.join(__dirname, '..', '..', 'SERV', 'banco.db'));

// ==========================================
// 1. CRIAÇÃO DE TODAS AS TABELAS
// ==========================================
banco.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tecnicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        especialidade TEXT NOT NULL,
        email TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        modelo TEXT NOT NULL,
        cliente_id INTEGER NOT NULL,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE TABLE IF NOT EXISTS ordens_servico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        tecnico_id INTEGER,
        equipamento_id INTEGER,
        descricao TEXT NOT NULL,
        status TEXT DEFAULT 'Pendente',
        data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id),
        FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL
    );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==========================================
// 2. ROTAS DE CLIENTES
// ==========================================
app.get('/api/clientes', (req, res) => {
    try {
        const clientes = banco.prepare('SELECT * FROM clientes ORDER BY id DESC').all();
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao procurar clientes: ' + err.message });
    }
});

app.post('/api/clientes', (req, res) => {
    try {
        const { nome, email, telefone } = req.body; 
        if (!nome || !email || !telefone) {
            return res.status(400).json({ erro: 'Preencha todos os campos!' });
        }
        banco.prepare('INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)').run(nome, email, telefone);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao guardar cliente: ' + err.message });
    }
});

app.delete('/api/clientes/:id', (req, res) => {
    try {
        banco.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao eliminar cliente: ' + err.message });
    }
});

// ==========================================
// 3. ROTAS DE TÉCNICOS
// ==========================================
app.get('/api/tecnicos', (req, res) => {
    try {
        const tecnicos = banco.prepare('SELECT * FROM tecnicos ORDER BY id DESC').all();
        res.json(tecnicos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao procurar técnicos: ' + err.message });
    }
});

app.post('/api/tecnicos', (req, res) => {
    try {
        const { nome, especialidade, email } = req.body;
        if (!nome || !especialidade || !email) {
            return res.status(400).json({ erro: 'Preencha todos os campos!' });
        }
        banco.prepare('INSERT INTO tecnicos (nome, especialidade, email) VALUES (?, ?, ?)').run(nome, especialidade, email);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao guardar técnico: ' + err.message });
    }
});

app.delete('/api/tecnicos/:id', (req, res) => {
    try {
        banco.prepare('DELETE FROM tecnicos WHERE id = ?').run(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao eliminar técnico: ' + err.message });
    }
});

// ==========================================
// 4. ROTAS DE EQUIPAMENTOS
// ==========================================
app.get('/api/equipamentos', (req, res) => {
    try {
        const query = `
            SELECT e.*, c.nome AS cliente_nome 
            FROM equipamentos e
            LEFT JOIN clientes c ON e.cliente_id = c.id
            ORDER BY e.id DESC
        `;
        const equipamentos = banco.prepare(query).all();
        res.json(equipamentos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao procurar equipamentos: ' + err.message });
    }
});

app.post('/api/equipamentos', (req, res) => {
    try {
        const { nome, modelo, cliente_id } = req.body;
        if (!nome || !modelo || !cliente_id) {
            return res.status(400).json({ erro: 'Preencha todos os campos!' });
        }
        banco.prepare('INSERT INTO equipamentos (nome, modelo, cliente_id) VALUES (?, ?, ?)').run(nome, modelo, cliente_id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Verifique se o ID do cliente existe na base de dados!' });
    }
});

app.delete('/api/equipamentos/:id', (req, res) => {
    try {
        banco.prepare('DELETE FROM equipamentos WHERE id = ?').run(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao eliminar equipamento: ' + err.message });
    }
});

// ==========================================
// 5. ROTAS DE ORDENS DE SERVIÇO (OS)
// ==========================================
app.get('/api/ordens_servico', (req, res) => {
    try {
        const query = `
            SELECT os.*, c.nome AS cliente_nome, t.nome AS tecnico_nome, e.nome AS equipamento_nome 
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            LEFT JOIN tecnicos t ON os.tecnico_id = t.id
            LEFT JOIN equipamentos e ON os.equipamento_id = e.id
            ORDER BY os.id DESC
        `;
        const osList = banco.prepare(query).all();
        res.json(osList);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao procurar ordens de serviço: ' + err.message });
    }
});

app.post('/api/ordens_servico', (req, res) => {
    try {
        const { cliente_id, tecnico_id, equipamento_id, descricao, status } = req.body;
        if (!cliente_id || !descricao) {
            return res.status(400).json({ erro: 'Informe pelo menos o cliente e a descrição!' });
        }
        banco.prepare('INSERT INTO ordens_servico (cliente_id, tecnico_id, equipamento_id, descricao, status) VALUES (?, ?, ?, ?, ?)')
             .run(cliente_id, tecnico_id || null, equipamento_id || null, descricao, status || 'Pendente');
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Verifique se os IDs informados (Cliente, Técnico, Equipamento) existem!' });
    }
});

app.put('/api/ordens_servico/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        banco.prepare('UPDATE ordens_servico SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar estado: ' + err.message });
    }
});

app.delete('/api/ordens_servico/:id', (req, res) => {
    try {
        banco.prepare('DELETE FROM ordens_servico WHERE id = ?').run(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao eliminar ordem de serviço: ' + err.message });
    }
});

// ==========================================
// 6. ROTAS DE USUÁRIOS
// ==========================================
app.get('/api/usuarios', (req, res) => {
    try {
        const usuarios = banco.prepare('SELECT * FROM usuarios ORDER BY id DESC').all();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao procurar utilizadores: ' + err.message });
    }
});

app.post('/api/usuarios', (req, res) => {
    try {
        const { nome, email } = req.body;
        if (!nome || !email) {
            return res.status(400).json({ erro: 'Preencha todos os campos!' });
        }
        banco.prepare('INSERT INTO usuarios (nome, email) VALUES (?, ?)').run(nome, email);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao guardar utilizador: ' + err.message });
    }
});

app.delete('/api/usuarios/:id', (req, res) => {
    try {
        banco.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao eliminar utilizador: ' + err.message });
    }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});