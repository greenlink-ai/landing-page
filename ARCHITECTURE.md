# ARCHITECTURE.md — GPU Cloud EU Platform

> **Source of truth** para decisões arquiteturais, stack tecnológica e convenções do projeto.
> Qualquer developer ou agente AI deve ler este ficheiro antes de contribuir.

---

## 1. Visão Geral do Projeto

Plataforma europeia para inferência, fine-tuning e treino de modelos de IA, vocacionada para empresas que desenvolvem soluções sectoriais (saúde, tradução, finanças, entre outros). Modelo de negócio semelhante à Lambda Lads e Together.ai, com foco no mercado europeu, conformidade GDPR e baixa latência local.

### Alinhamento Estratégico: NVIDIA Inception

O projeto está alinhado para candidatura ao programa NVIDIA Inception. Este alinhamento influencia decisões arquiteturais na Fase 2: sempre que existir uma solução NVIDIA madura e adequada ao problema, deve ser preferida sobre alternativas genéricas. Isto demonstra profundidade de integração com o ecossistema NVIDIA, reforça a candidatura, e dá acesso a suporte técnico, pricing preferencial em hardware/software, e exposição à comunidade de investidores.

> **Nota de elegibilidade:** O Inception exclui explicitamente "Cloud Service Providers" da lista de candidatos elegíveis. A candidatura deve posicionar a empresa como uma **plataforma de IA que oferece infraestrutura especializada para soluções sectoriais**, e não como um provedor genérico de cloud. O foco em verticais (saúde, finanças, tradução), em ferramentas de inferência optimizada, e na camada de software diferenciadora é o que distingue esta plataforma de um CSP tradicional. A narrativa da candidatura deve enfatizar que o hardware é o meio, não o produto — o produto é a plataforma que acelera a criação de soluções de IA europeias.

### Infraestrutura

- 104 servidores físicos
- 832 GPUs NVIDIA RTX PRO6000 Blackwell (96 GB VRAM cada)
- 8 GPUs por servidor
- Localização: Portugal

### Fases de Desenvolvimento

| Fase | Âmbito | Estado |
|------|--------|--------|
| **Fase 1** | Landing Page — site público com produto, casos de uso, preçário, contacto | Em desenvolvimento |
| **Fase 2** | Plataforma — dashboard multi-tenant, gestão de instâncias, storage, billing, orquestração | Planeada |
| **Fase 3** | Serverless Inference — endpoints API managed, scale-to-zero, token-based billing | Roadmap |

As fases são incrementais: cada fase constrói sobre a anterior sem refactoring destrutivo. A Fase 3 só arranca depois da Fase 2 estar em produção com clientes reais, pois depende de feedback de mercado para validar o modelo de pricing e os SLAs de latência.

Os diagramas arquiteturais de cada fase estão na raiz do projeto:
- `phase1-architecture.mermaid` — Arquitetura da Landing Page
- `phase2-architecture.mermaid` — Arquitetura da Plataforma Completa (inclui fundações para Fase 3)
- `DESIGN_SYSTEM.md` — Paleta de cores, tipografia, componentes base, efeitos, e estrutura de secções da landing page. **Ler antes de gerar qualquer componente UI.**

---

## 2. Stack Tecnológica

### 2.1 Frontend (Ambas as Fases)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** (App Router) | 15.x | Framework principal — SSG para landing, SSR/dinâmico para dashboard |
| **TypeScript** | 5.x | Tipagem estrita obrigatória em todo o código |
| **Tailwind CSS** | 4.x | Estilização utility-first |
| **Shadcn/UI** | latest | Componentes UI acessíveis e personalizáveis (copiados para o projeto, não dependência) |
| **Framer Motion** | 11.x | Animações e transições (glow effects, scroll animations, page transitions) |
| **React Hook Form** | 7.x | Gestão de formulários (performance superior ao Formik) |
| **Zod** | 3.x | Validação de schemas (formulários e API responses) |

### 2.2 Backend — Fase 1

Na Fase 1, o backend é o próprio Next.js via API Routes e Server Actions. Não criar backend separado nesta fase.

| Tecnologia | Propósito |
|------------|-----------|
| **Next.js API Routes** | Endpoints para formulário de contacto, newsletter, calculadora de preços |
| **Resend** | Envio de emails transacionais (alternativa: SendGrid) |
| **PostgreSQL** | Persistência de leads, contactos, newsletter subscribers |
| **Drizzle ORM** | Type-safe query builder (preferido sobre Prisma — mais leve, mais controlo) |

### 2.3 Backend — Fase 2

Na Fase 2, o backend é inteiramente em Go (Golang). Uma única linguagem para toda a camada backend — API pública e orquestração de infraestrutura.

| Camada | Tecnologia | Propósito |
|--------|------------|-----------|
| **API pública** (client-facing) | **Go (Golang)** | CRUD de instâncias, gestão de tenants, pricing, templates, volumes, billing API. Framework: Gin ou Echo (HTTP router leve) |
| **Orquestração** (infra-level) | **Go (Golang)** | GPU Scheduler, Instance Provisioner, Health Monitor, Auto-Scaler, Spot Manager, Volume Manager |
| **BFF** | **Next.js** | Continua a servir o frontend, comunica com a API Go |

**Porquê Go unificado:** A API pública faz CRUD e orquestração de recursos — não executa código ML. A inferência acontece dentro dos containers dos clientes (Triton, NIM, vLLM). Uma única linguagem simplifica: uma toolchain de build/test/deploy, um runtime, um Dockerfile base, uma linguagem para recrutar. Go compila para binário estático, consome menos memória que Python, e o client-go é o cliente Kubernetes mais maduro. Para o Python SDK que eventualmente ofereceremos aos clientes, geramos a partir da OpenAPI spec da API Go — prática standard.

### 2.4 Base de Dados e Armazenamento (Fase 2 completa)

| Tecnologia | Propósito |
|------------|-----------|
| **PostgreSQL** | Dados principais — tenants, instâncias, configurações, billing. Row-Level Security para multi-tenancy |
| **Redis** | Cache, sessions, job queues |
| **S3-compatible storage** | Object storage para modelos IA, datasets grandes, snapshots de instâncias. Acesso via API (não block-level). Mais lento, mais barato, ideal para armazenamento de longa duração |
| **NVMe All-Flash Centralizado** | Block storage de alta performance oferecido como produto aos clientes. Volumes persistentes montáveis em instâncias/clusters via CSI driver. Latência de microsegundos vs milisegundos de S3 — diferencial competitivo para treino de modelos e datasets que exigem throughput elevado |
| **Container Registry** | Templates Docker pré-configurados. Base images de `nvcr.io` (NVIDIA NGC) para containers optimizados |

#### Hierarquia de Storage (oferta ao cliente)

O storage é apresentado ao cliente como um espectro de performance e preço:

| Tier | Tecnologia | Latência | Use Case | Pricing |
|------|-----------|----------|----------|---------|
| **Efémero** | NVMe local do servidor | ~10μs | Scratch space, cache de treino. Perdido quando a instância é destruída | Incluído na instância |
| **Persistente (NVMe)** | NVMe All-Flash Centralizado | ~100-200μs | Datasets activos, checkpoints de modelos, volumes de trabalho. Sobrevive à instância | Por GB/hora |
| **Archive (S3)** | Object Storage S3-compatible | ~1-10ms | Modelos finais, datasets de arquivo, backups, snapshots | Por GB/mês |

O volume NVMe persistente é o produto de storage principal. O cliente pode criar volumes, anexá-los a instâncias, redimensioná-los, fazer snapshots (que ficam em S3), e desanexá-los sem destruir dados. O ciclo de vida do volume é independente do ciclo de vida da instância.

### 2.5 Infraestrutura & Orquestração (Fase 2)

#### 2.5.1 Stack NVIDIA (Ecossistema Integrado)

A Fase 2 adopta o ecossistema NVIDIA como stack primário para gestão de GPUs, particionamento, inferência e monitorização. Esta decisão é simultaneamente técnica (são as melhores ferramentas para o hardware que temos) e estratégica (alinhamento com NVIDIA Inception).

| Tecnologia | Propósito | Detalhe |
|------------|-----------|---------|
| **NVIDIA GPU Operator** | Gestão automatizada de GPUs no K8s | Instala e mantém drivers CUDA, device plugins, container toolkit, DCGM e node labelling como containers. Elimina a necessidade de OS images específicas para GPU. Deploy via Helm: `helm install gpu-operator nvidia/gpu-operator` |
| **NVIDIA MIG (Multi-Instance GPU)** | Particionamento de GPU com isolamento hardware | A RTX PRO6000 Blackwell suporta até 4 instâncias MIG (perfil `1g.24gb` — 1 compute slice, 24GB VRAM cada). Cada instância tem SMs, cache L2 e memória fisicamente isolados. Essencial para: clientes que precisam de menos de 96GB, maximização de utilização do cluster, e pricing granular |
| **NVIDIA GPU Time-Slicing** | Partilha de GPU sem isolamento hardware | Para workloads leves onde o isolamento MIG não é necessário. Permite oversubscription — uma GPU anuncia N réplicas ao K8s. Complementa MIG para cenários de dev/test. Configurado via ConfigMap no GPU Operator |
| **NVIDIA Triton Inference Server** | Servidor de inferência multi-framework | Suporta TensorRT, PyTorch, ONNX, TensorFlow nativamente. Batching dinâmico, model ensembles, métricas Prometheus nativas. Oferecido como template pré-configurado para clientes |
| **NVIDIA TensorRT / TensorRT-LLM** | Optimização de modelos para inferência | Compilação de modelos para máxima performance nas Blackwell. TensorRT-LLM especificamente para LLMs com suporte a FP4/FP8 (Tensor Cores 5ª gen). Integrado nos templates Docker da plataforma |
| **NVIDIA NIM (Inference Microservices)** | Deploy de modelos em produção em minutos | Containers pré-optimizados com Triton + TensorRT-LLM para modelos populares (Llama, Mistral, etc.). APIs compatíveis com OpenAI. Pode ser oferecido como opção one-click aos clientes — deploy de LLM de produção sem configuração |
| **NVIDIA DCGM (Data Center GPU Manager)** | Monitorização de GPUs | Métricas detalhadas: utilização, temperatura, VRAM, erros ECC, consumo energético. Exporta para Prometheus via DCGM Exporter (deployado automaticamente pelo GPU Operator) |
| **NVIDIA Container Toolkit** | Runtime GPU-aware para containers | Permite que containers acedam às GPUs. Gerido automaticamente pelo GPU Operator |

#### 2.5.2 Estratégia de Particionamento GPU

O cluster suporta três modos de alocação de GPU, configuráveis por tenant e por instância:

| Modo | Isolamento | Use Case | Config |
|------|-----------|----------|--------|
| **GPU Dedicada** | Total (hardware) | Treino de modelos, workloads pesados | `nvidia.com/gpu: 1` (ou mais) |
| **MIG** | Total (hardware, sub-GPU) | Inferência de modelos médios, multi-tenant compliance | `nvidia.com/mig-1g.24gb: 1` |
| **Time-Slicing** | Nenhum (software) | Dev/test, workloads leves, Jupyter notebooks | `nvidia.com/gpu: 1` (com replicas configuradas) |

O GPU Scheduler (Go service) decide o modo de alocação com base no pedido do cliente, na disponibilidade do cluster, e na política de pricing (Spot vs On-Demand).

#### 2.5.3 Orquestração e Networking

| Tecnologia | Propósito |
|------------|-----------|
| **Kubernetes** | Orquestração do cluster de 104 servidores |
| **KubeVirt** | VMs dentro de K8s para clientes com requisitos de compliance elevados (saúde, finanças) |
| **Cilium** | CNI com Network Policies granulares para isolamento multi-tenant |
| **Keycloak** | Autenticação self-hosted (SSO, RBAC, MFA) — GDPR-friendly |
| **Stripe** | Pagamentos e faturação |

### 2.6 Observabilidade (Desde a Fase 1)

| Tecnologia | Propósito |
|------------|-----------|
| **Prometheus** | Recolha de métricas |
| **Grafana** | Dashboards de visualização |
| **NVIDIA DCGM Exporter** | Métricas GPU (temperatura, VRAM, utilização, erros ECC, consumo energético) → Prometheus. Deployado automaticamente pelo GPU Operator |
| **NVIDIA GPU Feature Discovery** | Auto-labelling de nodes K8s com capabilities de GPU (arquitectura, MIG support, driver version). Deployado pelo GPU Operator |
| **Loki** | Logs centralizados (Fase 2) |
| **Alertmanager** | Alertas → PagerDuty/Slack (Fase 2) |

### 2.7 Analytics (Landing Page)

| Tecnologia | Propósito |
|------------|-----------|
| **PostHog** | Analytics GDPR-compliant (sem cookies, sem consent banners) |

---

## 3. Arquitetura de Software

### 3.1 Princípios Fundamentais

Este projeto segue **Clean Architecture** e os princípios **SOLID**:

- **S — Single Responsibility:** Cada módulo, componente ou classe tem uma única razão para mudar. Componentes UI apenas apresentam dados. Use-cases apenas executam lógica de negócio. API routes apenas orquestram request/response.
- **O — Open-Closed:** Código extensível sem modificação. Novos tipos de GPU, novos provedores de pagamento ou novos templates são adicionados sem alterar código existente.
- **L — Liskov Substitution:** Subtipos substituíveis sem quebrar comportamento. Uma instância Spot e uma instância On-Demand implementam a mesma interface `Instance`.
- **I — Interface Segregation:** Interfaces pequenas e específicas. `IPaymentService` não inclui métodos de gestão de instâncias.
- **D — Dependency Inversion:** A lógica de negócio depende de abstrações, não de implementações concretas. O use-case `LaunchInstance` depende de `IInstanceRepository`, não de "Kubernetes" ou "PostgreSQL".

### 3.2 Estrutura de Pastas — Fase 1

Na Fase 1, a estrutura é **intencionalmente simples**. Não implementar a arquitetura completa da Fase 2 prematuramente.

```
project-root/
├── ARCHITECTURE.md                  # Este ficheiro
├── phase1-architecture.mermaid      # Diagrama Fase 1
├── phase2-architecture.mermaid      # Diagrama Fase 2
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── [lang]/                  # Segmento dinâmico de língua (pt | en)
│   │   │   ├── layout.tsx           # Root layout (fonts, metadata, theme, lang param)
│   │   │   ├── page.tsx             # Home / Hero
│   │   │   ├── produto/
│   │   │   │   └── page.tsx         # Página de produto (hardware specs, features)
│   │   │   ├── casos-de-uso/
│   │   │   │   └── page.tsx         # Casos de uso por sector
│   │   │   ├── precario/
│   │   │   │   └── page.tsx         # Preçário com calculadora interativa
│   │   │   ├── sobre/
│   │   │   │   └── page.tsx         # Sobre a empresa
│   │   │   └── contacto/
│   │   │       └── page.tsx         # Formulário de contacto
│   │   └── api/                     # API routes (fora do [lang] — não dependem de língua)
│   │       ├── contact/
│   │       │   └── route.ts         # POST — submissão de contacto
│   │       └── newsletter/
│   │           └── route.ts         # POST — subscrição newsletter
│   ├── components/                  # Componentes UI reutilizáveis
│   │   ├── ui/                      # Shadcn/UI components (Button, Input, Dialog, etc.)
│   │   ├── layout/                  # Header (com LanguageSwitcher), Footer, Navigation, MobileMenu
│   │   ├── sections/                # Secções de página (Hero, Features, CTA, Testimonials)
│   │   └── forms/                   # ContactForm, NewsletterForm
│   ├── lib/                         # Utilitários e configuração
│   │   ├── utils.ts                 # Helpers genéricos (cn(), formatCurrency(), etc.)
│   │   ├── validations.ts           # Schemas Zod partilhados
│   │   ├── constants.ts             # Constantes (pricing tiers, GPU specs, URLs)
│   │   ├── db.ts                    # Conexão PostgreSQL via Drizzle
│   │   └── i18n.ts                  # getDictionary(lang), tipo Locale, validação de lang param
│   ├── dictionaries/                # Ficheiros de tradução por língua
│   │   ├── pt.json                  # Traduções PT-PT (língua por defeito)
│   │   └── en.json                  # Traduções EN
│   ├── templates/
│   │   └── emails/                  # Templates HTML para emails Resend (source of truth local)
│   │       ├── landing-page-income-message.txt  # Notificação interna de novo contacto
│   │       └── landing-page-form-auto-response.txt  # Confirmação enviada ao remetente
│   ├── content/                     # Conteúdo estático (dados, não texto UI)
│   │   ├── pricing.ts               # Dados de preçário (GPU/MIG tiers + storage NVMe/S3 tiers)
│   │   ├── use-cases.ts             # Dados dos casos de uso por sector
│   │   └── hardware.ts              # Especificações das GPUs Blackwell (inclui MIG profiles: 1g.24gb, 2g.48gb, 4g.96gb)
│   └── styles/
│       └── globals.css              # Tailwind directives + custom CSS variables
├── public/                          # Assets estáticos (imagens, favicon, OG images)
├── drizzle/                         # Migrations e schema da BD
│   └── schema.ts
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                       # Variáveis de ambiente (nunca commitar)
```

### 3.3 Estrutura de Pastas — Fase 2 (Evolução)

Quando a plataforma entrar em desenvolvimento, a estrutura evolui para Clean Architecture com separação de camadas. O código da Fase 1 migra para dentro do route group `(marketing)`.

```
src/
├── app/
│   ├── [lang]/                      # Segmento de língua (pt | en) — aplica-se a marketing e platform
│   │   ├── (marketing)/             # Landing Page (código da Fase 1 migra para aqui)
│   │   │   ├── layout.tsx           # Layout público (header com LanguageSwitcher, footer)
│   │   │   ├── page.tsx
│   │   │   ├── produto/
│   │   │   ├── casos-de-uso/
│   │   │   ├── precario/
│   │   │   ├── sobre/
│   │   │   └── contacto/
│   │   ├── (platform)/              # Dashboard autenticado
│   │   │   ├── layout.tsx           # Layout com sidebar, topbar, auth guard
│   │   │   ├── dashboard/
│   │   │   ├── instances/
│   │   │   │   ├── page.tsx         # Lista de instâncias
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # Wizard de criação (GPU picker, templates)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Detalhe da instância (terminal, metrics)
│   │   │   ├── templates/
│   │   │   ├── storage/             # Volumes NVMe (criar, anexar, redimensionar, snapshots)
│   │   │   ├── billing/
│   │   │   └── settings/            # Inclui opção de alterar língua (preferredLocale)
│   │   └── api/                     # BFF — proxy para FastAPI (fora de [lang])
│   │       └── v1/
├── core/                            # Lógica de negócio — FRAMEWORK AGNOSTIC
│   ├── domain/                      # Entidades
│   │   ├── gpu-instance.ts          # GPUInstance, InstanceStatus, InstanceConfig
│   │   ├── tenant.ts                # Tenant, TenantPlan, preferredLocale (pt | en)
│   │   ├── invoice.ts               # Invoice, UsageRecord, UsageType (compute | storage)
│   │   ├── gpu.ts                   # GPU, GPUPool, GPUAllocation, MIGProfile, MIGInstance
│   │   └── storage-volume.ts        # StorageVolume, VolumeStatus, VolumeTier (nvme | s3), VolumeAttachment
│   ├── use-cases/                   # Regras de negócio
│   │   ├── launch-instance.ts       # LaunchInstanceUseCase
│   │   ├── scale-instance.ts        # ScaleInstanceUseCase
│   │   ├── calculate-cost.ts        # CalculateCostUseCase (compute + storage)
│   │   ├── allocate-gpus.ts         # AllocateGPUsUseCase
│   │   ├── create-volume.ts         # CreateVolumeUseCase
│   │   └── attach-volume.ts         # AttachVolumeUseCase (attach/detach/resize/snapshot)
│   └── ports/                       # Interfaces (contratos)
│       ├── instance-repository.ts   # IInstanceRepository
│       ├── payment-service.ts       # IPaymentService
│       ├── gpu-scheduler.ts         # IGPUScheduler
│       ├── gpu-partitioner.ts       # IGPUPartitioner (MIG/TimeSlicing abstraction)
│       ├── storage-provider.ts      # IStorageProvider (NVMe CSI / S3 abstraction)
│       └── notification-service.ts  # INotificationService
├── infrastructure/                  # Implementações concretas
│   ├── api/                         # Clients para Go backend API
│   ├── db/                          # Drizzle schemas, migrations, repository implementations
│   ├── auth/                        # Keycloak adapter
│   ├── nvidia/                      # NVIDIA ecosystem adapters (MIG Manager, GPU Operator API, DCGM client)
│   ├── storage/                     # Storage adapters (NVMe CSI driver client, S3 client, snapshot manager)
│   └── services/                    # Stripe adapter, email adapter, etc.
└── shared/                          # Componentes e utils partilhados entre marketing e platform
    ├── components/
    └── hooks/
```

**Nota crítica:** A pasta `core/` não importa nada de `app/`, `infrastructure/` ou `shared/`. As dependências apontam sempre para dentro (Dependency Inversion). A `infrastructure/` implementa as interfaces definidas em `core/ports/`.

---

## 4. Convenções de Código

### 4.1 Nomenclatura

- **Ficheiros e pastas:** kebab-case (`gpu-instance.ts`, `launch-instance.ts`)
- **Componentes React:** PascalCase (`HeroSection.tsx`, `PricingCalculator.tsx`)
- **Funções e variáveis:** camelCase (`calculateCost`, `instanceStatus`)
- **Tipos e Interfaces:** PascalCase com prefixo I para interfaces de ports (`IGPUScheduler`, `GPUInstance`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_GPUS_PER_INSTANCE`, `DEFAULT_VRAM_GB`)
- **Enums:** PascalCase com valores PascalCase (`InstanceStatus.Running`, `PricingTier.Spot`)

### 4.2 Regras TypeScript

- `strict: true` no tsconfig — sem exceções
- Sem `any` — usar `unknown` quando o tipo é desconhecido e fazer type narrowing
- Todos os componentes com props tipadas via `interface` (não `type` inline)
- Funções exportadas devem ter return type explícito
- Zod schemas como source of truth para validação — types inferidos com `z.infer<typeof schema>`

### 4.3 Componentes React

- Apenas functional components (sem class components)
- Um componente por ficheiro
- Props destrutured no parâmetro da função
- Sem lógica de negócio dentro de componentes — delegar para hooks custom ou use-cases
- Composição sobre herança (compound components pattern quando aplicável)
- Server Components por defeito; `'use client'` apenas quando necessário (interatividade, hooks de browser)

### 4.4 Estilo e Design

- Tailwind utility classes directamente nos elementos — sem ficheiros CSS por componente
- `cn()` helper (clsx + tailwind-merge) para classes condicionais
- Design system definido em `tailwind.config.ts` (cores, fontes, spacing, breakpoints)
- Dark theme como base (estética AI/cyberpunk — fundos escuros, glow effects, gradientes subtis)
- Animações via Framer Motion — nunca CSS animations inline para animações complexas
- Responsivo mobile-first

### 4.5 Internacionalização (i18n)

**Línguas suportadas:** PT-PT (default) e EN.

**Estratégia:** Route-based i18n nativo do Next.js App Router via segmento `[lang]`. Sem bibliotecas externas (next-intl, i18next) — desnecessário para duas línguas.

- **URLs:** `/pt/precario`, `/en/pricing`. O Google indexa cada versão como página distinta (SEO)
- **Língua por defeito:** PT-PT. Acesso a `/` redireciona para `/pt/` (middleware Next.js)
- **Detecção automática:** O middleware lê o header `Accept-Language` do browser na primeira visita e redireciona para `/pt/` ou `/en/`. Visitas subsequentes respeitam a escolha do utilizador (cookie `NEXT_LOCALE`)
- **Seletor de língua:** Componente `LanguageSwitcher` no header, ao lado do botão da plataforma. Dropdown discreto (PT | EN) que redireciona para a mesma página na outra língua
- **Ficheiros de tradução:** `src/dictionaries/pt.json` e `src/dictionaries/en.json`. Estrutura flat com namespaces por secção (`hero.title`, `pricing.calculator.label`, `contact.form.name`)
- **Type-safety:** O tipo `Dictionary` é inferido do ficheiro PT (source of truth). O ficheiro EN deve satisfazer o mesmo tipo — erros de compilação se faltar uma chave
- **Conteúdo vs. UI:** Os ficheiros em `dictionaries/` contêm texto de UI (botões, labels, títulos, parágrafos). Os ficheiros em `content/` (pricing.ts, hardware.ts) também devem suportar ambas as línguas — exportam objetos indexados por locale
- **Componentes:** Recebem o dicionário via props (server components) ou via context (client components). Nunca hardcoded strings no JSX
- **Fase 2:** No registo na plataforma, a língua seleccionada é guardada no perfil do tenant (`preferredLocale` na entidade `Tenant`). O dashboard apresenta a UI na língua do perfil, com possibilidade de alterar nas definições

### 4.6 Git & Branching

- `main` — produção, protegido
- `develop` — integração
- `feature/<nome>` — features individuais
- `fix/<nome>` — correções
- Commits em inglês, convenção Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- Pull Requests obrigatórios para `develop` e `main`

---

## 5. Decisões Arquiteturais (ADR)

### ADR-001: Next.js como framework frontend único

**Contexto:** Precisamos de SSG para a landing page (SEO, performance) e SSR/dinâmico para o futuro dashboard.
**Decisão:** Next.js App Router serve ambas as fases. Na Fase 2, route groups `(marketing)` e `(platform)` separam os dois contextos com layouts distintos.
**Consequência:** Um único codebase frontend. Sem necessidade de migrar tecnologia entre fases.

### ADR-002: Sem backend separado na Fase 1

**Contexto:** A landing page precisa apenas de formulário de contacto e calculadora de preços.
**Decisão:** Usar Next.js API Routes. Não introduzir Go até que a plataforma esteja em desenvolvimento.
**Consequência:** Setup mais simples, deploy mais rápido, menos infraestrutura para manter inicialmente.

### ADR-003: Go unificado na Fase 2 (substituindo FastAPI + Go)

**Contexto:** A plataforma precisa de uma API client-facing (CRUD, billing, templates, volumes) e de serviços de orquestração de infraestrutura (provisioning, scheduling, health-checking). A decisão original propunha FastAPI (Python) para a API pública e Go para a orquestração, com o argumento de que o ecossistema IA é Python-first.
**Decisão:** Go (Golang) como linguagem única para todo o backend. A API pública não executa código ML — faz CRUD e orquestração de recursos. A inferência acontece dentro dos containers dos clientes (Triton, NIM, vLLM), não na API da plataforma. O argumento "Python para IA" não se aplica quando a API não faz IA.
**Consequência:** Uma única linguagem backend. Simplifica recrutamento (uma skill, não duas), toolchain (um pipeline de build/test), deploy (um Dockerfile base), e manutenção. Go é compilado, consome menos memória, e o client-go é o cliente K8s mais maduro. O Python SDK para clientes é gerado a partir da OpenAPI spec. Trade-off aceite: menor afinidade com bibliotecas Python de data science para tooling interno (scripts de análise, etc.) — resolúvel com scripts isolados quando necessário.

### ADR-004: Drizzle ORM sobre Prisma

**Contexto:** Precisamos de um ORM TypeScript para PostgreSQL.
**Decisão:** Drizzle — mais leve, SQL-like, type-safe, melhor performance, mais controlo sobre queries.
**Consequência:** Curva de aprendizagem ligeiramente maior que Prisma, mas código mais previsível e performante.

### ADR-005: Shadcn/UI sobre Material UI / Chakra

**Contexto:** Precisamos de componentes UI acessíveis e personalizáveis.
**Decisão:** Shadcn/UI — componentes copiados para o projeto (não dependência), personalizáveis a 100%, baseados em Radix primitives.
**Consequência:** Controlo total sobre o design system. Sem limitações de theming de terceiros. Mais trabalho inicial de setup.

### ADR-006: Keycloak para autenticação (Fase 2)

**Contexto:** Multi-tenancy requer autenticação robusta com SSO, RBAC e MFA. GDPR exige controlo sobre dados de autenticação.
**Decisão:** Keycloak self-hosted em infraestrutura europeia.
**Consequência:** Mais complexidade operacional que Auth0, mas controlo total sobre dados e sem dependência de terceiros americanos para dados sensíveis.

### ADR-007: Observabilidade desde o dia zero

**Contexto:** 832 GPUs precisam de monitorização antes de ter clientes.
**Decisão:** Prometheus + Grafana + NVIDIA DCGM Exporter deployados na Fase 1, mesmo que o site seja apenas uma landing page.
**Consequência:** Quando os primeiros clientes chegarem, o cluster já está monitorizado e os baselines de performance estão estabelecidos.

### ADR-008: NVIDIA ecosystem-first na Fase 2

**Contexto:** O cluster é 100% NVIDIA (832x RTX PRO6000 Blackwell). Existe uma candidatura planeada ao programa NVIDIA Inception. Ferramentas NVIDIA (GPU Operator, MIG, Triton, TensorRT-LLM, NIM, DCGM) resolvem problemas reais do nosso stack e são as mais maduras para este hardware.
**Decisão:** Sempre que existir uma solução NVIDIA que resolva o problema de forma adequada, deve ser preferida sobre alternativas genéricas. Especificamente: GPU Operator para gestão de GPUs no K8s, MIG para particionamento sub-GPU, Triton/NIM como templates de inferência, TensorRT-LLM para optimização de modelos, DCGM para monitorização.
**Consequência:** Forte acoplamento ao ecossistema NVIDIA. Aceitável porque: o hardware é 100% NVIDIA (não há cenário de multi-vendor), as ferramentas são open-source ou com licenciamento flexível, e o alinhamento estratégico com Inception traz benefícios tangíveis (suporte, pricing, rede de investidores). O princípio de Dependency Inversion continua a aplicar-se — a camada `core/` não referencia NVIDIA directamente; as interfaces em `core/ports/` (ex: `IGPUScheduler`, `IGPUPartitioner`) são implementadas na camada `infrastructure/` com os SDKs NVIDIA.

### ADR-009: MIG como mecanismo primário de particionamento GPU

**Contexto:** Muitos clientes precisarão de menos de 96GB de VRAM. Alocar uma GPU inteira a cada instância resulta em subutilização massiva do cluster. A RTX PRO6000 Blackwell suporta até 4 instâncias MIG com perfil `1g.24gb`.
**Decisão:** MIG é o mecanismo padrão de particionamento para instâncias de inferência. GPU dedicada para treino e workloads que necessitem de >24GB VRAM ou dos 96GB completos. Time-Slicing como opção económica para dev/test sem isolamento.
**Consequência:** Multiplica a capacidade efectiva do cluster até 4x para workloads de inferência (832 GPUs → até 3328 instâncias MIG). Requer MIG Manager no GPU Operator e lógica de scheduling que gira perfis MIG dinamicamente. O preçário na landing page deve reflectir esta granularidade (preço por MIG slice vs GPU completa).

### ADR-010: Storage NVMe como recurso independente com lifecycle próprio

**Contexto:** A plataforma oferecerá armazenamento NVMe All-Flash centralizado como produto. Os clientes precisam de storage persistente que sobreviva ao ciclo de vida das instâncias GPU — para datasets, checkpoints de treino e modelos. O storage NVMe centralizado é ordens de magnitude mais rápido que S3 e é o diferencial competitivo que justifica que os clientes usem o nosso storage em vez de soluções externas.
**Decisão:** O storage é uma entidade de domínio autónoma (`StorageVolume`) com lifecycle independente da `GPUInstance`. Volumes são criados, redimensionados, snapshotted e eliminados independentemente. O attachment a instâncias é uma relação N:1 (um volume, uma instância de cada vez, mas reutilizável). A implementação usa Kubernetes CSI drivers para provisioning dinâmico. O billing regista capacidade provisionada por hora, como dimensão separada do compute.
**Consequência:** O modelo de dados, o billing, o scheduler e a UI devem tratar storage como first-class citizen desde o design. A calculadora de preços na landing page (Fase 1) deve incluir uma dimensão de storage. O Go service de orquestração ganha um Volume Manager. A interface `IStorageProvider` na camada de ports abstrai o backend de storage (NVMe CSI vs S3), permitindo extensão futura.

### ADR-011: Serverless Inference como Fase 3 (não Fase 2)

**Contexto:** O serviço serverless de inferência (upload de modelo → endpoint API → scale-to-zero → billing por token) é o produto com maior potencial de margem e diferenciação. Requer KServe/Knative, service mesh (Istio ou Cilium SM), model registry, token-based billing, e optimização de cold start. É a feature mais complexa de todo o roadmap.
**Decisão:** O serverless é documentado como Fase 3. Não é implementado nem detalhado ao nível de código até a Fase 2 estar em produção com clientes reais. As decisões da Fase 2 (MIG, NVMe, Triton/NIM, GPU Operator, metering extensível) já providenciam as fundações necessárias. As decisões específicas do serverless (Istio vs Cilium SM, cold start SLAs, token metering) são adiadas porque dependem de benchmarking no cluster real e de feedback de mercado.
**Consequência:** Evita over-engineering. A landing page pode referenciar "Serverless Inference — em breve" como posicionamento de mercado. A Fase 2 não requer alterações para acomodar a Fase 3 — as fundações estão lá by design. O detalhe de implementação é refinado quando houver dados reais (latências medidas, modelos de pricing validados com clientes, capacidade real do cluster sob carga).

---

## 6. Modelo de Dados — Fase 1

Esquema mínimo para a landing page. Expandido significativamente na Fase 2.

```typescript
// drizzle/schema.ts

import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  sector: varchar('sector', { length: 100 }),  // saude, traducao, financas, outro
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
});
```

---

## 7. Configuração de Ambiente

### Variáveis de ambiente (`.env.local`)

```bash
# Base de Dados
DATABASE_URL=postgresql://user:password@host:5432/gpucloud

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gpucloud.eu

# App
NEXT_PUBLIC_SITE_URL=https://gpucloud.eu
```

### Fase 2 (variáveis adicionais)

```bash
# Keycloak
KEYCLOAK_URL=https://auth.gpucloud.eu
KEYCLOAK_REALM=gpucloud
KEYCLOAK_CLIENT_ID=web-app
KEYCLOAK_CLIENT_SECRET=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxxxx

# Go Backend API
API_BASE_URL=https://api.gpucloud.eu/v1

# Redis
REDIS_URL=redis://host:6379

# S3
S3_ENDPOINT=https://s3.gpucloud.eu
S3_ACCESS_KEY=xxxxx
S3_SECRET_KEY=xxxxx
S3_BUCKET=gpucloud-models
```

---

## 8. Funcionalidades Críticas (Roadmap Fase 2)

Estas funcionalidades devem ser tidas em conta durante o design, mesmo na Fase 1:

### 8.1 Spot vs. On-Demand Pricing
Clientes podem alugar GPUs ociosas a preço reduzido (Spot). Instâncias Spot podem ser interrompidas com aviso de 30s se um cliente On-Demand precisar das GPUs. O preçário na landing page deve já reflectir esta distinção, incluindo a granularidade MIG (preço por MIG slice `1g.24gb` vs GPU completa `96GB`).

### 8.2 Templates Pré-configurados (NVIDIA-optimized)
Templates baseados em imagens do NVIDIA NGC Registry (`nvcr.io`) para máxima compatibilidade e performance:

| Template | Base Image | Propósito |
|----------|-----------|-----------|
| **PyTorch + CUDA 12** | `nvcr.io/nvidia/pytorch` | Treino e inferência genérica |
| **TensorRT-LLM** | `nvcr.io/nvidia/tritonserver` + TRT-LLM | Inferência optimizada de LLMs (FP4/FP8 Blackwell) |
| **Triton Inference Server** | `nvcr.io/nvidia/tritonserver` | Model serving multi-framework (ONNX, PyTorch, TRT) |
| **NVIDIA NIM** | NIM containers | Deploy one-click de modelos populares (Llama, Mistral, etc.) com APIs OpenAI-compatible |
| **vLLM** | `vllm/vllm-openai` | Inferência de LLMs open-source |
| **Jupyter Lab** | Custom + CUDA toolkit | Desenvolvimento interativo com acesso GPU |
| **Stable Diffusion WebUI** | Custom + PyTorch | Geração de imagem |

Clientes podem também usar imagens Docker custom, desde que compatíveis com NVIDIA Container Toolkit.

### 8.3 Configuração Base + Auto-Scaling
Clientes que não sabem que hardware precisam lançam com uma configuração base (ex: 1x MIG slice `1g.24gb` — 24GB VRAM). O sistema monitoriza uso via DCGM e sugere (ou auto-escala) quando necessário: upgrade para MIG slice maior, GPU completa, ou multi-GPU.

### 8.4 SSH & Jupyter Embebidos
O dashboard expõe acesso terminal (SSH) e Jupyter Notebooks directamente no browser via proxy reverso seguro (WebSocket).

### 8.5 Billing & Metering
Sistema de metering com duas dimensões, ambas registadas pelo metering service (Go) e alimentando o billing via Stripe:

| Dimensão | Métrica | Granularidade | Fonte |
|----------|---------|---------------|-------|
| **Compute (GPU)** | Tempo de GPU alocada | Por segundo por tenant | DCGM Exporter + GPU Scheduler |
| **Storage (NVMe)** | Capacidade provisionada | Por GB por hora por tenant | CSI driver metrics + Volume Manager |
| **Storage (S3)** | Capacidade utilizada | Por GB por mês por tenant | S3 API metrics |

O `CalculateCostUseCase` agrega ambas as dimensões numa fatura unificada. O preçário na landing page deve já reflectir os três eixos de custo: compute (GPU/MIG), storage NVMe (alta performance), e storage S3 (archive).

### 8.6 Armazenamento NVMe Centralizado (Diferencial Competitivo)
O storage NVMe All-Flash centralizado é um produto com lifecycle próprio, não um sub-componente das instâncias GPU.

**Conceitos de domínio:**
- **Volume**: Unidade de storage persistente com tamanho, tier (NVMe/S3) e estado (available, attached, resizing, snapshotting)
- **Attachment**: Ligação entre um volume e uma instância. Um volume pode estar attached a uma instância de cada vez, mas pode ser detached e re-attached a outra instância sem perda de dados
- **Snapshot**: Cópia point-in-time de um volume NVMe, armazenada em S3. Permite restaurar volumes ou criar novos a partir de snapshots

**Fluxo típico do utilizador:**
1. Cria volume NVMe de 500GB via dashboard ou API
2. Lança instância GPU e anexa o volume durante a criação (ou depois)
3. Volume montado automaticamente em `/mnt/data` (ou path custom) via K8s PersistentVolumeClaim + CSI driver
4. Trabalha, treina modelos, armazena checkpoints no volume
5. Destrói a instância — volume persiste, dados intactos
6. Lança nova instância (possivelmente com hardware diferente), re-anexa o mesmo volume
7. Pode fazer snapshot do volume a qualquer momento para backup em S3

**Implementação Kubernetes:** Os volumes NVMe são expostos como StorageClass no K8s, provisionados dinamicamente via CSI driver do storage array. O Volume Manager (Go service) gere o lifecycle e comunica com a API do storage centralizado.

### 8.7 Multi-Tenant Isolation
Isolamento em cinco camadas:
- **Compute:** Kubernetes namespaces + MIG (isolamento hardware de GPU a nível sub-GPU) para instâncias de inferência; GPU dedicada ou KubeVirt (VMs) para clientes enterprise com compliance elevado (saúde, finanças)
- **Storage:** Volumes NVMe isolados por tenant via Kubernetes PersistentVolumes + RBAC. Cada tenant só acede aos seus volumes. Snapshots e S3 buckets igualmente isolados
- **Rede:** Cilium Network Policies granulares entre namespaces
- **Dados:** PostgreSQL Row-Level Security por tenant
- **Acesso:** Keycloak RBAC com MFA obrigatório para acções destrutivas

---

## 9. Fase 3 — Serverless Inference (Roadmap)

> **Estado:** Roadmap. Não implementar antes da Fase 2 estar em produção com clientes reais.
> Esta secção documenta a intenção e os princípios arquitecturais para garantir que as decisões da Fase 2 não fecham portas. O detalhe de implementação será refinado com base em feedback do mercado.

### 9.1 Conceito de Produto

O cliente faz upload de um modelo treinado (ou selecciona um do catálogo), a plataforma devolve um endpoint API. O modelo é "acordado" quando chega um pedido HTTP e escalado a zero quando está inactivo. O cliente paga por token gerado (ou por request), não por tempo de GPU.

**Fluxo do utilizador:**
1. Upload do modelo treinado (ou fine-tuned) para o Model Registry
2. Configuração: limites de auto-scaling (min 0, max N réplicas), modelo de pricing, SLA de latência
3. A plataforma devolve um endpoint API (ex: `https://api.gpucloud.eu/v1/inference/{endpoint-id}`)
4. O cliente integra o endpoint na sua aplicação
5. Quando chega um request, o modelo é carregado para GPU (cold start) ou responde imediatamente (warm)
6. Sem requests durante X minutos → scale-to-zero (custo zero para o cliente)

### 9.2 Stack Técnica (Direção Provável)

| Componente | Opção Primária | Alternativa | Notas |
|------------|---------------|-------------|-------|
| **Serverless Engine** | KServe | Custom controller | KServe é o standard para model serving serverless em K8s. Suporta Triton e NIM nativamente |
| **Scale-to-Zero** | KServe + Knative | KServe RawDeployment + custom HPA | Knative requer Istio (service mesh) — avaliar se Cilium Service Mesh serve como substituto para evitar dois planos de controlo de rede |
| **Request Routing** | Istio ou Cilium Service Mesh | Envoy standalone | Necessário para traffic splitting (A/B testing de modelos, canary deployments) |
| **Model Runtime** | Triton / NIM / vLLM | Custom runtime | Já presentes no stack da Fase 2 como templates |
| **Model Registry** | MLflow ou custom sobre S3 + PostgreSQL | NVIDIA NGC private | Versionamento de modelos, metadata, lineage |

### 9.3 Decisões Arquitecturais a Tomar na Fase 3

Estas decisões são intencionalmente adiadas porque dependem de dados reais:

**Istio vs. Cilium Service Mesh:** KServe depende de um service mesh para routing avançado. A Fase 2 usa Cilium como CNI. Introduzir Istio adiciona um segundo plano de controlo de rede. A alternativa é Cilium Service Mesh (que o stack já suporta). Esta decisão requer testes de performance no cluster real.

**Cold Start SLA:** O tempo de cold start depende de: scheduling K8s (1-5s), pull da imagem container (0s se pre-cached, 10-30s se não), inicialização CUDA (1-2s), carregamento do modelo do NVMe para VRAM (depende do tamanho), warm-up do modelo. Com optimizações agressivas (pre-pulling, CUDA context pools, model caching em RAM dos nodes), cold starts de <5s são realistas para modelos até 7B. Sem optimização, 15-30s. O SLA real será definido após benchmarking no cluster.

**Token-based billing vs. request-based:** Para LLMs, billing por token é standard (input tokens + output tokens). Para modelos de visão ou classificação, billing por request faz mais sentido. O metering service precisa de suportar ambos. A integração com Triton metrics para extracção de contagem de tokens é não-trivial e requer desenvolvimento dedicado.

### 9.4 Porquê a Fase 2 Já Suporta a Fase 3

As decisões da Fase 2 foram tomadas de forma a não fechar portas. Concretamente:

| Decisão da Fase 2 | Como habilita a Fase 3 |
|-------------------|----------------------|
| **MIG (1g.24gb slices)** | Modelos serverless correm em MIG slices isolados. Um modelo 7B cabe em 24GB. Isolamento hardware entre endpoints de clientes diferentes |
| **NVMe Centralizado** | Cold start rápido. Modelo carregado do NVMe para VRAM em vez de S3 (100-200μs vs 1-10ms por I/O op). Cache local nos nodes acelera ainda mais |
| **Triton / NIM** | Já são os runtimes que o KServe usa nativamente. Não há nova dependência |
| **GPU Operator + GPU Feature Discovery** | KServe usa labels de GPU para scheduling. O GFD já os publica |
| **`IStorageProvider` port** | O Model Registry é uma especialização do storage. A interface já existe |
| **Metering service (Go)** | Extensível para uma terceira dimensão (tokens) além de compute-time e storage-capacity |
| **Cilium** | Potencialmente extensível para service mesh, evitando Istio |

### 9.5 O que Muda na Fase 2 para Preparar a Fase 3

Nada. As fundações já estão lá. A única recomendação é: quando implementares os templates de Triton/NIM na Fase 2, verifica que eles funcionam com KServe `InferenceService` CRDs, para garantir compatibilidade futura. Isto é um teste, não uma feature.

### 9.6 Modelo de Pricing (Direção)

| Componente | Métrica | Exemplo |
|------------|---------|---------|
| **Endpoint activo** | Custo fixo mensal (cobre storage do modelo + IP/DNS) | €5-20/mês por endpoint |
| **Inferência (LLM)** | Por 1k tokens (input + output separados) | €X por 1k input tokens, €Y por 1k output tokens |
| **Inferência (Outros)** | Por 1k requests | €Z por 1k requests |
| **Cold start guarantee** | SLA tier (básico: <30s, premium: <5s) | Premium com pre-warming cobra mais |

### 9.7 Impacto na Landing Page (Fase 1)

O preçário na landing page pode já mencionar "Serverless Inference — em breve" como teaser, sem detalhar pricing. Isto posiciona a plataforma como mais do que "alugar GPUs" e alinha com a narrativa de NVIDIA Inception (plataforma de IA, não CSP genérico). Não implementar funcionalidade, apenas marketing.

---

## 10. Deploy — Fase 1

| Componente | Plataforma | Notas |
|------------|------------|-------|
| Frontend (Next.js) | **Vercel** | Edge network europeia, CI/CD automático via GitHub |
| PostgreSQL | **Supabase** | Managed PostgreSQL com região EU |
| Monitorização | **Cluster próprio** | Prometheus + Grafana + DCGM nos servidores físicos |

### CI/CD

- GitHub Actions para lint, type-check e testes em cada PR
- Deploy automático para Vercel em push para `main`
- Preview deploys automáticos para cada PR (feature do Vercel)

---

## 11. Checklist — Arranque do Projeto (Fase 1)

- [x] Inicializar projecto Next.js com TypeScript e App Router
- [x] Configurar Tailwind CSS 4
- [x] Instalar e configurar Shadcn/UI (dark theme base)
- [x] Instalar Framer Motion
- [x] Instalar React Hook Form + Zod
- [x] Configurar Drizzle ORM + PostgreSQL
- [x] Configurar i18n: estrutura `[lang]`, middleware de detecção/redirect, `getDictionary()` helper
- [x] Criar ficheiros de tradução base (`dictionaries/pt.json`, `dictionaries/en.json`)
- [x] Criar estrutura de rotas dentro de `[lang]/` (home, produto, casos-de-uso, precario, sobre, contacto)
- [x] Implementar layout base (Header com LanguageSwitcher, Footer, Navigation)
- [x] Implementar Hero section com animações
- [x] Implementar calculadora de preços interativa
- [x] Implementar formulário de contacto com validação
- [x] Configurar PostHog analytics
- [x] Configurar variáveis de ambiente
- [ ] Deploy para Vercel
- [ ] Configurar monitoring do cluster (Prometheus + Grafana + DCGM) — Fase 2/3
