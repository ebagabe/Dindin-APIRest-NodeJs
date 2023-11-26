-- Banco de Dados

CREATE DATABASE dindin;

-- Tabelas

CREATE TABLE usuarios (
    id serial PRIMARY KEY,
    nome text NOT NULL,
    email text NOT NULL UNIQUE,
    senha text NOT NULL
);

CREATE TABLE categorias (
    id serial PRIMARY KEY,
    descricao text NOT NULL
);

CREATE TABLE transacoes (
    id serial PRIMARY KEY,
    descricao text NOT NULL,
    valor integer NOT NULL,
    data timestamp DEFAULT NOW(),
    categoria_id integer REFERENCES categorias(id) NOT NULL,
    usuario_id integer REFERENCES usuarios(id) NOT NULL,
    tipo text NOT NULL
);

-- Categorias 

INSERT INTO categorias
(descricao)
VALUES
('Alimentação'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');