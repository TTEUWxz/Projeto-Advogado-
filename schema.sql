-- ============================================================
--  SEV7N Company — Schema completo do banco de dados Supabase
--  Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- ─── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── CLIENTES ──────────────────────────────────────────────
create table if not exists clientes (
  id               uuid primary key default uuid_generate_v4(),
  nome             text not null,
  cnpj_cpf         text,
  telefone         text,
  email            text,
  dia_vencimento   int  check (dia_vencimento between 1 and 31),
  valor_contrato   numeric(12,2),
  recorrente       boolean not null default false,
  ativo            boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ─── FUNCIONÁRIOS ──────────────────────────────────────────
create table if not exists funcionarios (
  id               uuid primary key default uuid_generate_v4(),
  nome             text not null,
  cargo            text,
  cpf              text,
  tipo_pagamento   text not null default 'mensal' check (tipo_pagamento in ('diaria','mensal')),
  valor_pagamento  numeric(12,2) not null default 0,
  data_admissao    date not null default current_date,
  ativo            boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ─── CATEGORIAS DE GASTO ───────────────────────────────────
create table if not exists categorias_gasto (
  id         uuid primary key default uuid_generate_v4(),
  nome       text not null,
  tipo       text not null default 'variavel' check (tipo in ('fixo','variavel')),
  icone      text,
  created_at timestamptz not null default now()
);

-- Categorias padrão
insert into categorias_gasto (nome, tipo, icone) values
  ('Aluguel',          'fixo',    '🏢'),
  ('Internet',         'fixo',    '📡'),
  ('Energia Elétrica', 'fixo',    '⚡'),
  ('Água',             'fixo',    '💧'),
  ('Telefone',         'fixo',    '📞'),
  ('Salários',         'fixo',    '👥'),
  ('Material Escritório', 'variavel', '📎'),
  ('Manutenção',       'variavel', '🔧'),
  ('Marketing',        'variavel', '📣'),
  ('Outros',           'variavel', '📌')
on conflict do nothing;

-- ─── GASTOS ────────────────────────────────────────────────
create table if not exists gastos (
  id               uuid primary key default uuid_generate_v4(),
  categoria_id     uuid references categorias_gasto(id) on delete set null,
  descricao        text not null,
  valor            numeric(12,2) not null,
  data_vencimento  date not null,
  data_pagamento   date,
  status           text not null default 'pendente' check (status in ('pendente','pago','atrasado','cancelado')),
  recorrente       boolean not null default false,
  recorrencia      text check (recorrencia in ('mensal','semanal','anual')),
  created_at       timestamptz not null default now()
);

-- ─── RECEBIMENTOS ──────────────────────────────────────────
create table if not exists recebimentos (
  id               uuid primary key default uuid_generate_v4(),
  cliente_id       uuid references clientes(id) on delete cascade,
  valor            numeric(12,2) not null,
  data_vencimento  date not null,
  data_pagamento   date,
  status           text not null default 'pendente' check (status in ('pendente','pago','atrasado')),
  descricao        text,
  created_at       timestamptz not null default now()
);

-- ─── REGISTROS DE TRABALHO (ponto diário) ──────────────────
create table if not exists registros_trabalho (
  id               uuid primary key default uuid_generate_v4(),
  funcionario_id   uuid not null references funcionarios(id) on delete cascade,
  data_trabalho    date not null,
  turno            text not null default 'integral' check (turno in ('integral','manha','tarde','noite')),
  created_at       timestamptz not null default now(),
  unique (funcionario_id, data_trabalho)
);

-- ─── PAGAMENTOS DE FUNCIONÁRIOS ────────────────────────────
create table if not exists pagamentos_funcionarios (
  id               uuid primary key default uuid_generate_v4(),
  funcionario_id   uuid not null references funcionarios(id) on delete cascade,
  periodo_inicio   date not null,
  periodo_fim      date not null,
  dias_trabalhados int,
  valor_total      numeric(12,2) not null,
  status           text not null default 'pendente' check (status in ('pendente','pago')),
  created_at       timestamptz not null default now()
);

-- ============================================================
--  ROW LEVEL SECURITY — acesso apenas para usuários logados
-- ============================================================
alter table clientes              enable row level security;
alter table funcionarios          enable row level security;
alter table categorias_gasto      enable row level security;
alter table gastos                enable row level security;
alter table recebimentos          enable row level security;
alter table registros_trabalho    enable row level security;
alter table pagamentos_funcionarios enable row level security;

-- Políticas: usuário autenticado tem acesso total
create policy "auth_all" on clientes              for all using (auth.role() = 'authenticated');
create policy "auth_all" on funcionarios          for all using (auth.role() = 'authenticated');
create policy "auth_all" on categorias_gasto      for all using (auth.role() = 'authenticated');
create policy "auth_all" on gastos                for all using (auth.role() = 'authenticated');
create policy "auth_all" on recebimentos          for all using (auth.role() = 'authenticated');
create policy "auth_all" on registros_trabalho    for all using (auth.role() = 'authenticated');
create policy "auth_all" on pagamentos_funcionarios for all using (auth.role() = 'authenticated');
