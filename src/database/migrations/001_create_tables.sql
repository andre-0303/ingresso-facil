-- Domínios (tipos enumerados)
CREATE TYPE dm_status_pagamento AS ENUM ('PAGO', 'RECUSADO', 'PENDENTE');
CREATE TYPE dm_status_ingresso  AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO');
CREATE TYPE dm_metodo_pagamento AS ENUM ('CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO');

-- Usuário
CREATE TABLE usuario (
  id    SERIAL       PRIMARY KEY,
  nome  VARCHAR(255) NOT NULL,
  cpf   VARCHAR(11)  NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE
);

-- Método de pagamento (lookup table)
CREATE TABLE metodo_pagamento (
  id              SERIAL              PRIMARY KEY,
  tipo_pagamento  dm_metodo_pagamento NOT NULL UNIQUE
);

INSERT INTO metodo_pagamento (tipo_pagamento)
VALUES ('CARTAO_CREDITO'), ('CARTAO_DEBITO'), ('PIX'), ('BOLETO');

-- Show
CREATE TABLE show (
  id    SERIAL       PRIMARY KEY,
  nome  VARCHAR(255) NOT NULL,
  data  DATE         NOT NULL,
  local VARCHAR(255) NOT NULL
);

-- Pedido
CREATE TABLE pedido (
  id                    SERIAL               PRIMARY KEY,
  usuario_id            INTEGER              NOT NULL REFERENCES usuario(id),
  metodo_pagamento_id   INTEGER              NOT NULL REFERENCES metodo_pagamento(id),
  status_pagamento      dm_status_pagamento  NOT NULL DEFAULT 'PENDENTE',
  criado_em             TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

-- Ingresso
-- pedido_id é NULL quando DISPONIVEL, preenchido ao RESERVAR
CREATE TABLE ingresso (
  id        SERIAL              PRIMARY KEY,
  id_show   INTEGER             NOT NULL REFERENCES show(id),
  pedido_id INTEGER             REFERENCES pedido(id),
  preco     NUMERIC(10, 2)      NOT NULL,
  status    dm_status_ingresso  NOT NULL DEFAULT 'DISPONIVEL'
);

-- Índices para queries frequentes
CREATE INDEX idx_ingresso_show_status ON ingresso (id_show, status);
CREATE INDEX idx_ingresso_pedido      ON ingresso (pedido_id);
CREATE INDEX idx_pedido_usuario       ON pedido (usuario_id);
