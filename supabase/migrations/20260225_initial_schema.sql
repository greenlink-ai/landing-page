-- Tabela de Leads (Pré-registos via Landing Page)
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Informação de Contacto
  full_name text not null,
  email text not null,
  phone text,
  company_name text,
  
  -- Qualificação de Necessidades
  interests text[],          -- Ex: ['training', 'fine-tuning', 'inference', 'rendering']
  estimated_usage text,      -- Ex: '1x MIG (24GB)', '1x GPU', '4x GPU', 'cluster dedicado'
  message text,              -- Campo livre para o visitante descrever o que precisa
  
  -- Contexto de Aquisição
  source text default 'website',  -- 'website', 'referral', 'event', etc.
  locale text default 'pt',       -- Língua em que submeteu o formulário (pt | en)
  
  -- Gestão Interna
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índice no email para queries rápidas de deduplicação
create index idx_leads_email on public.leads (email);

-- Índice no status para filtrar leads por estado
create index idx_leads_status on public.leads (status);

-- Habilitar RLS
alter table public.leads enable row level security;

-- Política: Landing Page apenas pode INSERIR (via anon key)
create policy "Allow anonymous insert" on public.leads 
  for insert with check (true);

-- Política: Apenas service_role pode ler/atualizar (para o admin)
create policy "Service role full access" on public.leads 
  for all using (auth.role() = 'service_role');


-- Tabela de Newsletter (separada das leads — alguém pode subscrever sem ser lead)
create table public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  locale text default 'pt',
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unsubscribed_at timestamp with time zone,
  is_active boolean default true not null
);

alter table public.newsletter_subscribers enable row level security;

create policy "Allow anonymous subscribe" on public.newsletter_subscribers 
  for insert with check (true);

create policy "Service role full access newsletter" on public.newsletter_subscribers 
  for all using (auth.role() = 'service_role');

-- Função para atualizar o timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Trigger para a tabela leads
create trigger update_leads_updated_at
    before update on public.leads
    for each row
    execute procedure update_updated_at_column();