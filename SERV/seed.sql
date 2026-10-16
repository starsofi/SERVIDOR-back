-- database: ./banco.db

CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login VARCHAR(50),
    senha VARCHAR(50),
    tipo VARCHAR(20)
);

CREATE TABLE clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20)
);

CREATE TABLE tecnicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100),
    especialidade VARCHAR(50)
);

CREATE TABLE equipamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100),
    modelo VARCHAR(50),
    cliente_id INT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao_problema TEXT,
    status VARCHAR(20),
    cliente_id INT,
    equipamento_id INT,
    tecnico_id INT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
);


INSERT INTO clientes (nome, email, telefone) VALUES ('Empresa LogTech', 'logtech@gmail.com', '11993455677');
INSERT INTO tecnicos (nome, especialidade) VALUES ('Marina Silva', 'Impressoras');
INSERT INTO equipamentos (nome, modelo, cliente_id) VALUES ('Impressora Laser', 'HP 1020', 1);
INSERT INTO ordens_servico (descricao_problema, status, cliente_id, equipamento_id, tecnico_id) 
VALUES ('Atolamento de papel', 'Aberto', 1, 1, 1);
