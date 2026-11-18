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
        cpf TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS registros_clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        cpf TEXT,
        telefone TEXT,
        senha TEXT,
        equipamento TEXT,
        modelo TEXT,
        problema TEXT,
        data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Garante a coluna cpf caso a tabela já tenha sido criada antes
try {
    banco.exec('ALTER TABLE registros_clientes ADD COLUMN cpf TEXT');
} catch (e) {}

// ==========================================
// 2. CADASTRO FIXO DOS 4 USUÁRIOS AUTORIZADOS
// ==========================================
const inserirUsuarioFixo = banco.prepare('INSERT OR IGNORE INTO usuarios (nome, cpf, senha) VALUES (?, ?, ?)');
inserirUsuarioFixo.run('Agnes Aisha', '111.111.111-11', 'senha1');
inserirUsuarioFixo.run('Ananda Ventura', '222.222.222-22', 'senha2');
inserirUsuarioFixo.run('Isabelli Firmino', '333.333.333-33', 'senha3');
inserirUsuarioFixo.run('Sofia Gonçalves', '444.444.444-44', 'senha4');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==========================================
// 3. ROTAS DO PAINEL RESTRITO (CLIENTES, TÉCNICOS, EQUIPAMENTOS, OS, USUÁRIOS)
// ==========================================
app.get('/api/clientes', (req, res) => {
    res.json(banco.prepare('SELECT * FROM clientes ORDER BY id DESC').all());
});
app.post('/api/clientes', (req, res) => {
    const { nome, email, telefone } = req.body;
    if (!nome || !email || !telefone) return res.status(400).json({ erro: 'Preencha todos os campos!' });
    banco.prepare('INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)').run(nome, email, telefone);
    res.json({ ok: true });
});
app.delete('/api/clientes/:id', (req, res) => {
    banco.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

app.get('/api/tecnicos', (req, res) => {
    res.json(banco.prepare('SELECT * FROM tecnicos ORDER BY id DESC').all());
});
app.post('/api/tecnicos', (req, res) => {
    const { nome, especialidade, email } = req.body;
    if (!nome || !especialidade || !email) return res.status(400).json({ erro: 'Preencha todos os campos!' });
    banco.prepare('INSERT INTO tecnicos (nome, especialidade, email) VALUES (?, ?, ?)').run(nome, especialidade, email);
    res.json({ ok: true });
});
app.delete('/api/tecnicos/:id', (req, res) => {
    banco.prepare('DELETE FROM tecnicos WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

app.get('/api/equipamentos', (req, res) => {
    res.json(banco.prepare(`
        SELECT e.*, c.nome AS cliente_nome FROM equipamentos e
        LEFT JOIN clientes c ON e.cliente_id = c.id ORDER BY e.id DESC
    `).all());
});
app.post('/api/equipamentos', (req, res) => {
    const { nome, modelo, cliente_id } = req.body;
    if (!nome || !modelo || !cliente_id) return res.status(400).json({ erro: 'Preencha todos os campos!' });
    banco.prepare('INSERT INTO equipamentos (nome, modelo, cliente_id) VALUES (?, ?, ?)').run(nome, modelo, cliente_id);
    res.json({ ok: true });
});
app.delete('/api/equipamentos/:id', (req, res) => {
    banco.prepare('DELETE FROM equipamentos WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

app.get('/api/ordens_servico', (req, res) => {
    res.json(banco.prepare(`
        SELECT os.*, c.nome AS cliente_nome, t.nome AS tecnico_nome, e.nome AS equipamento_nome 
        FROM ordens_servico os
        LEFT JOIN clientes c ON os.cliente_id = c.id
        LEFT JOIN tecnicos t ON os.tecnico_id = t.id
        LEFT JOIN equipamentos e ON os.equipamento_id = e.id
        ORDER BY os.id DESC
    `).all());
});
app.post('/api/ordens_servico', (req, res) => {
    const { cliente_id, tecnico_id, equipamento_id, descricao, status } = req.body;
    if (!cliente_id || !descricao) return res.status(400).json({ erro: 'Informe o cliente e a descrição!' });
    banco.prepare('INSERT INTO ordens_servico (cliente_id, tecnico_id, equipamento_id, descricao, status) VALUES (?, ?, ?, ?, ?)')
         .run(cliente_id, tecnico_id || null, equipamento_id || null, descricao, status || 'Pendente');
    res.json({ ok: true });
});
app.put('/api/ordens_servico/:id/status', (req, res) => {
    banco.prepare('UPDATE ordens_servico SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    res.json({ ok: true });
});
app.delete('/api/ordens_servico/:id', (req, res) => {
    banco.prepare('DELETE FROM ordens_servico WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

app.get('/api/usuarios', (req, res) => {
    res.json(banco.prepare('SELECT id, nome, cpf FROM usuarios ORDER BY id ASC').all());
});
app.post('/api/login', (req, res) => {
    const { nome, cpf, senha } = req.body;
    const usuario = banco.prepare('SELECT id, nome, cpf FROM usuarios WHERE nome = ? AND cpf = ? AND senha = ?').get(nome, cpf, senha);
    if (!usuario) return res.status(401).json({ erro: 'Nome, CPF ou senha incorretos!' });
    res.json({ ok: true, usuario });
});

// ==========================================
// 4. ROTAS RESERVADAS DO SITE DOS CLIENTES (registros_clientes)
// ==========================================
app.post('/api/site/criar-conta', (req, res) => {
    try {
        const { nome, email, cpf, telefone, senha } = req.body;
        if (!nome || !email || !cpf || !telefone || !senha) {
            return res.status(400).json({ erro: 'Preencha todos os campos!' });
        }
        const jaExiste = banco.prepare('SELECT id FROM registros_clientes WHERE email = ?').get(email.trim());
        if (jaExiste) {
            return res.status(400).json({ erro: 'Este e-mail já possui cadastro!' });
        }
        banco.prepare('INSERT INTO registros_clientes (nome, email, cpf, telefone, senha) VALUES (?, ?, ?, ?, ?)')
            .run(nome.trim(), email.trim(), cpf.trim(), telefone.trim(), senha.trim());
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar conta: ' + err.message });
    }
});

app.post('/api/site/login', (req, res) => {
    try {
        const { email, senha } = req.body;
        const cliente = banco.prepare('SELECT id, nome, email, telefone FROM registros_clientes WHERE email = ? AND senha = ?')
            .get((email || '').trim(), (senha || '').trim());
        if (!cliente) return res.status(401).json({ erro: 'E-mail ou senha incorretos!' });
        res.json({ ok: true, cliente });
    } catch (err) {
        res.status(500).json({ erro: 'Erro no login: ' + err.message });
    }
});

app.post('/api/site/registrar-pedido', (req, res) => {
    try {
        const { nome, email, telefone, equipamento, modelo, problema } = req.body;
        if (!nome || !email || !equipamento || !modelo || !problema) {
            return res.status(400).json({ erro: 'Preencha todos os campos!' });
        }

        // Procura a conta que o cliente já criou pelo e-mail
        const contaExistente = banco.prepare('SELECT id FROM registros_clientes WHERE email = ? ORDER BY id ASC LIMIT 1')
            .get(email.trim());

        if (contaExistente) {
            // Atualiza a MESMA linha com o equipamento, modelo e problema (sem duplicar!)
            banco.prepare(`
                UPDATE registros_clientes 
                SET nome = ?, telefone = ?, equipamento = ?, modelo = ?, problema = ?, data_envio = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(nome.trim(), (telefone || '').trim(), equipamento.trim(), modelo.trim(), problema.trim(), contaExistente.id);

            return res.json({ ok: true, protocolo: contaExistente.id });
        }

        // Caso não ache a conta, cria uma nova
        const info = banco.prepare(`
            INSERT INTO registros_clientes (nome, email, telefone, equipamento, modelo, problema)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(nome.trim(), email.trim(), (telefone || '').trim(), equipamento.trim(), modelo.trim(), problema.trim());

        res.json({ ok: true, protocolo: Number(info.lastInsertRowid) });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao salvar registro: ' + err.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});