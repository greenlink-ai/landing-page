# GreenLink AI Factory — Design System

> Guia visual completo para a landing page (Fase 1) e plataforma (Fase 2).
> Este ficheiro é a referência para qualquer developer que toque no frontend.

---

## 1. Identidade Visual

### 1.1 Conceito

**GreenLink = Infraestrutura de IA soberana + Sustentabilidade.**

A identidade visual comunica: potência técnica, confiança institucional, e consciência ambiental. O visual é **dark-first** (premium, tech-forward) com verde como accent (identidade green, diferenciação). O tom é: sofisticado, não frio; técnico, não clínico; confiável, não corporativo.

**Referências visuais de posicionamento:**
- Vercel (vercel.com) — dark theme, tipografia bold, subtileza nos efeitos
- Linear (linear.app) — gradientes mesh, micro-animações, precisão
- Railway (railway.app) — developer-facing, dark, accent colors vibrantes
- Resend (resend.com) — minimalismo com personalidade

**O que evitar:**
- Estética "corporate tech" (azul genérico, stock photos de handshakes)
- Estética "crypto/web3" (néon excessivo, gradientes roxos, sans-serif genérica)
- Templates genéricos (cards com border sólida colorida, sombras pesadas, cantos muito arredondados)

### 1.2 Key Visual — Árvore Digital

O logo da GreenLink incorpora uma árvore digital (circuitos que formam uma árvore). Este é o asset visual mais forte da marca — memorável, único, e comunica a dualidade tech + natureza.

**Uso na landing page:**
- Hero section: a árvore como elemento visual principal (lado direito do split layout)
- Favicon: versão simplificada da árvore
- Backgrounds subtis: padrão de circuitos derivado da árvore como textura de fundo (muito subtil, ~5% opacidade)
- Nunca usar a árvore como pattern repetido ou marca de água intrusiva

---

## 2. Paleta de Cores

### 2.1 Core Palette

Baseada no Tailwind CSS (zinc + emerald) para consistência com o stack.

```css
:root {
  /* === BACKGROUNDS === */
  --bg-primary:       #09090b;   /* zinc-950 — Fundo principal */
  --bg-elevated:      #111113;   /* Fundo de cards, secções elevadas */
  --bg-hover:         #18181b;   /* zinc-900 — Hover state de cards */
  --bg-surface:       #1c1c1f;   /* Inputs, dropdowns, modais */
  --bg-subtle:        #27272a;   /* zinc-800 — Separadores, dividers */

  /* === ACCENT (Verde GreenLink) === */
  --accent:           #10b981;   /* emerald-500 — Cor primária de marca */
  --accent-light:     #34d399;   /* emerald-400 — Hover de elementos accent */
  --accent-dark:      #059669;   /* emerald-600 — Active/pressed states */
  --accent-glow:      rgba(16, 185, 129, 0.15);  /* Glow para hover effects */
  --accent-glow-strong: rgba(16, 185, 129, 0.25); /* Glow para focus states */
  --accent-border:    rgba(16, 185, 129, 0.3);    /* Borders com accent */
  --accent-bg:        rgba(16, 185, 129, 0.08);   /* Background subtil accent */

  /* === TEXTO === */
  --text-primary:     #fafafa;   /* zinc-50 — Títulos, texto principal */
  --text-secondary:   #a1a1aa;   /* zinc-400 — Parágrafos, descrições */
  --text-muted:       #71717a;   /* zinc-500 — Labels, captions, metadata */
  --text-disabled:    #52525b;   /* zinc-600 — Estados desativados */
  --text-accent:      #10b981;   /* emerald-500 — Links, highlights */

  /* === BORDERS === */
  --border-default:   rgba(255, 255, 255, 0.06);  /* Border subtil padrão */
  --border-hover:     rgba(255, 255, 255, 0.10);  /* Border em hover */
  --border-accent:    rgba(16, 185, 129, 0.3);    /* Border com accent (focus, active) */
  --border-strong:    rgba(255, 255, 255, 0.15);  /* Border mais visível (tabelas, separadores) */

  /* === ESTADOS === */
  --success:          #10b981;   /* emerald-500 */
  --warning:          #f59e0b;   /* amber-500 */
  --error:            #ef4444;   /* red-500 */
  --info:             #3b82f6;   /* blue-500 */

  /* === GRADIENTES === */
  --gradient-glow:    radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 60%);
  --gradient-hero:    radial-gradient(ellipse at 70% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
  --gradient-card:    linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, transparent 50%);
}
```

### 2.2 Regras de Uso

- **Verde como accent, não como dominante.** O verde nunca é fundo de secções inteiras. É usado em: botões primários, títulos de secção, ícones, badges, links, glow effects, e bordas de focus
- **Contraste mínimo:** Todo o texto deve cumprir WCAG AA. Texto primário (#fafafa) sobre fundo (#09090b) = ratio 19.4:1. Texto secundário (#a1a1aa) sobre fundo = ratio 7.1:1. Ambos passam
- **Sem verde sobre verde:** Nunca usar texto verde sobre fundo verde. O accent é sempre sobre fundo escuro
- **Glow com moderação:** Efeitos de glow verde são subtis (8-15% opacidade). Nunca saturados

### 2.3 Dark Mode Only

A landing page e a plataforma são **dark mode exclusivo**. Sem toggle light/dark. Razões:
- Alinhamento com a identidade visual (tech premium)
- Consistência com as referências (Vercel, Linear, Railway são dark-first)
- Reduz scope de desenvolvimento (um tema, não dois)
- O público-alvo (developers, engenheiros de ML) prefere dark mode

---

## 3. Tipografia

### 3.1 Font Stack

| Papel | Fonte | Fallback | Peso | Onde obter |
|-------|-------|----------|------|------------|
| **Display / Títulos** | **Cabinet Grotesk** | `system-ui, sans-serif` | 700 (Bold), 800 (ExtraBold) | [Fontshare](https://www.fontshare.com/fonts/cabinet-grotesk) — gratuita |
| **Body / UI** | **Geist** | `system-ui, sans-serif` | 400 (Regular), 500 (Medium), 600 (SemiBold) | [Vercel Geist](https://vercel.com/font) — gratuita |
| **Monospace / Código** | **Geist Mono** | `ui-monospace, monospace` | 400 (Regular) | [Vercel Geist](https://vercel.com/font) — gratuita |

**Porquê estas fontes:**
- **Cabinet Grotesk** é uma geometric grotesk com personalidade — mais carácter que Inter ou Satoshi, sem ser excêntrica. Os terminais abertos e o peso ExtraBold criam títulos com impacto visual
- **Geist** é a fonte do Vercel, desenhada especificamente para interfaces digitais. Excelente legibilidade em tamanhos pequenos, boa em números e tabelas (pricing), e semanticamente alinhada com o ecossistema Next.js
- **Geist Mono** para code snippets, specs técnicos, e dados numéricos na calculadora de preços

### 3.2 Escala Tipográfica

Sistema modular baseado no ratio 1.25 (Major Third). Responsivo com `clamp()`.

```css
/* Títulos — Cabinet Grotesk */
--text-hero:     clamp(3rem, 5vw + 1rem, 5rem);      /* 48-80px — Hero headline */
--text-h1:       clamp(2.25rem, 3vw + 0.5rem, 3.5rem); /* 36-56px — Títulos de secção */
--text-h2:       clamp(1.75rem, 2vw + 0.5rem, 2.25rem); /* 28-36px — Sub-secções */
--text-h3:       clamp(1.25rem, 1.5vw + 0.25rem, 1.5rem); /* 20-24px — Card titles */

/* Body — Geist */
--text-lg:       1.125rem;   /* 18px — Lead paragraphs */
--text-base:     1rem;       /* 16px — Body text padrão */
--text-sm:       0.875rem;   /* 14px — Captions, labels */
--text-xs:       0.75rem;    /* 12px — Metadata, badges */

/* Line Heights */
--leading-tight:  1.15;      /* Títulos */
--leading-normal: 1.6;       /* Body text */
--leading-relaxed: 1.75;     /* Parágrafos longos */

/* Letter Spacing */
--tracking-tight: -0.02em;   /* Títulos grandes */
--tracking-normal: 0;        /* Body */
--tracking-wide:  0.05em;    /* Labels uppercase, badges */
```

### 3.3 Regras Tipográficas

- **Títulos:** Cabinet Grotesk, peso 700-800, `letter-spacing: -0.02em`, `line-height: 1.15`. Cor: `--text-primary` ou `--text-accent` (verde para títulos de secção)
- **Subtítulos:** Geist, peso 500, cor `--text-secondary`
- **Body text:** Geist Regular (400), cor `--text-secondary`, `line-height: 1.6`, max-width `65ch` para legibilidade
- **Labels/Badges:** Geist SemiBold (600), `text-transform: uppercase`, `letter-spacing: 0.05em`, `font-size: --text-xs`, cor `--text-accent` sobre `--accent-bg`
- **Monospace:** Geist Mono para valores numéricos (preços, specs), code snippets, e terminal output
- **Nunca** usar itálico para ênfase em títulos. Usar cor accent ou peso diferente

---

## 4. Espaçamento e Layout

### 4.1 Grid System

```css
/* Container */
--container-max:   1280px;    /* Max width do conteúdo */
--container-px:    1.5rem;    /* Padding horizontal (24px) */
--container-px-lg: 2rem;      /* Padding horizontal em desktop (32px) */

/* Secções */
--section-py:      6rem;      /* Padding vertical entre secções (96px) */
--section-py-lg:   8rem;      /* Padding vertical em desktop (128px) */

/* Espaçamento interno */
--space-xs:  0.25rem;  /* 4px */
--space-sm:  0.5rem;   /* 8px */
--space-md:  1rem;     /* 16px */
--space-lg:  1.5rem;   /* 24px */
--space-xl:  2rem;     /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### 4.2 Layout Patterns

**Hero Section:** Split layout (60/40 ou 50/50). Texto à esquerda, visual à direita. Full viewport height no mobile, auto em desktop. Background com `--gradient-hero` subtil.

**Feature Sections:** Grid de 3 colunas em desktop, 1 coluna em mobile. Cards com gap de `--space-lg`.

**Pricing Section:** Grid de 2-3 colunas. Card "recomendado" com `--border-accent` e glow subtil.

**CTA Section:** Centrado, com título grande, subtítulo, e botão. Background com `--gradient-glow` radial.

---

## 5. Componentes

### 5.1 Botões

```css
/* Primário — CTA principal */
.btn-primary {
  background: var(--accent);
  color: #000;                        /* Texto preto sobre verde */
  font-family: 'Geist', sans-serif;
  font-weight: 600;
  font-size: var(--text-sm);
  padding: 0.625rem 1.25rem;          /* 10px 20px */
  border-radius: 0.5rem;              /* 8px */
  transition: all 150ms ease;
}
.btn-primary:hover {
  background: var(--accent-light);
  box-shadow: 0 0 20px var(--accent-glow-strong);
}

/* Secundário — Acção alternativa */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  /* Mesmo padding, radius, font do primário */
}
.btn-secondary:hover {
  border-color: var(--border-hover);
  background: var(--bg-hover);
}

/* Ghost — Navegação, acções terciárias */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}
.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}
```

**Regras:**
- Texto dos botões primários é **preto** (#000), não branco — garante contraste sobre o verde accent
- Border-radius consistente: `0.5rem` (8px) em toda a UI. Não variar entre componentes
- Sempre incluir `transition` para hover states
- Botões nunca em full-width no desktop. Max-width de `280px`
- Tamanhos: `sm` (padding 8px 16px), `md` (10px 20px), `lg` (12px 24px)

### 5.2 Cards

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.75rem;             /* 12px */
  padding: var(--space-xl);           /* 32px */
  transition: all 200ms ease;
}
.card:hover {
  border-color: var(--border-hover);
  background: var(--bg-hover);
  /* Opcional: glow subtil */
  box-shadow: 0 0 30px var(--accent-glow);
}

/* Card com destaque (ex: pricing recomendado) */
.card-featured {
  border-color: var(--accent-border);
  background: linear-gradient(135deg, var(--accent-bg), transparent 50%);
}
```

**Regras:**
- **Sem borders verdes sólidos.** Borders são sempre subtis (`rgba(255,255,255,0.06)`)
- O hover adiciona visibilidade à border e opcionalmente um glow verde subtil
- Cards nunca têm `box-shadow` pesada no estado default. Apenas em hover/focus
- Ícones dentro de cards: monocromáticos em `--text-accent`, tamanho `24px`, stroke-width `1.5px` (Lucide icons)

### 5.3 Badges / Section Labels

Os badges de secção (ex: "MARKET OPPORTUNITY", "OUR TECHNOLOGY" do pitch deck):

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;           /* 4px 12px */
  font-family: 'Geist', sans-serif;
  font-size: var(--text-xs);          /* 12px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-accent);
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  border-radius: 9999px;              /* Pill shape */
}
```

### 5.4 Inputs (Formulário de Contacto)

```css
.input {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-family: 'Geist', sans-serif;
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: all 150ms ease;
}
.input::placeholder {
  color: var(--text-muted);
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.input:invalid:not(:placeholder-shown) {
  border-color: var(--error);
}
```

### 5.5 Navegação (Header)

```css
/* Header fixo, com blur de fundo */
.header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 50;
  background: rgba(9, 9, 11, 0.8);   /* --bg-primary com transparência */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-default);
}
```

**Estrutura do header:**
- Logo (árvore digital + "GreenLink") à esquerda
- Links de navegação ao centro
- LanguageSwitcher (PT | EN) + CTA button à direita
- Em mobile: hamburger menu com slide-in panel

---

## 6. Efeitos e Animações

### 6.1 Princípios

- **Subtileza > Espectáculo.** Animações são sentidas, não vistas. Se o utilizador repara "que bonita esta animação", é porque é demasiado
- **Performance first.** Apenas animar `transform` e `opacity`. Nunca `width`, `height`, `top`, `left`
- **Framer Motion** para scroll-triggered reveals e animações de entrada. CSS para hover/transitions
- **Reduzir motion:** Respeitar `prefers-reduced-motion`. Todas as animações devem ter fallback estático

### 6.2 Animações de Entrada (Framer Motion)

```tsx
// Fade-in com slide subtil (para secções ao scroll)
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
};

// Stagger para grids de cards
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

// Reveal de números/stats (counter)
// Usar framer-motion useInView + animate para contar de 0 ao valor
```

### 6.3 Efeitos Visuais

**Grid Background (Hero):**
```css
.grid-bg {
  background-image:
    linear-gradient(var(--border-default) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-default) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%);
}
```

**Glow Effect (Hero, CTA):**
```css
.glow-green {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
```

**Grain Overlay (subtileza):**
```css
.grain::after {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* noise pattern */
  pointer-events: none;
  z-index: 9999;
}
```

---

## 7. Iconografia

### 7.1 Biblioteca

**Lucide React** (já incluída no stack como dependência de Shadcn/UI).

### 7.2 Estilo

- **Tipo:** Outline (stroke), não filled
- **Stroke width:** 1.5px (default de Lucide)
- **Tamanho padrão:** 24px para feature cards, 20px para UI elements, 16px para inline
- **Cor:** `--text-accent` (#10b981) para ícones decorativos (feature sections), `--text-secondary` para ícones funcionais (nav, formulários)

### 7.3 Ícones por Secção (Referência para Landing Page)

| Secção | Ícone | Lucide Name |
|--------|-------|-------------|
| GPU/Compute | `<Cpu />` | `cpu` |
| VRAM/Memória | `<MemoryStick />` | `memory-stick` |
| Rede/Interconnect | `<Network />` | `network` |
| Segurança | `<ShieldCheck />` | `shield-check` |
| Sustentabilidade | `<Leaf />` | `leaf` |
| Infraestrutura | `<Server />` | `server` |
| Performance | `<Zap />` | `zap` |
| Soberania/EU | `<Flag />` | `flag` |
| Storage NVMe | `<HardDrive />` | `hard-drive` |
| Pricing | `<Calculator />` | `calculator` |
| Contacto | `<Mail />` | `mail` |
| Location | `<MapPin />` | `map-pin` |

---

## 8. Imagens e Media

### 8.1 Regras

- **Árvore digital:** Asset principal. Usar na hero section e como base para o logo/favicon
- **Sem stock photos.** Não usar fotografias de bancos de imagens (handshakes, office, etc.)
- **Sem renderizações hiperrealistas AI-generated** de data centers (perdem credibilidade)
- **Fotografias reais** da infra quando disponíveis (durante e após construção)
- **Visuais abstractos** para backgrounds: grid patterns, ondas de partículas, gradientes mesh, circuitos estilizados derivados da árvore digital
- **Diagramas técnicos** limpos para secções de tecnologia (estilo do mermaid, mas renderizado em SVG ou React component)
- **Formato:** WebP para fotografias, SVG para ícones e ilustrações, PNG apenas para fallback

### 8.2 Tratamento de Imagem

- Todas as imagens sobre fundo dark devem ter edges suavizados (fade-out gradual para o background, não corte abrupto)
- Imagens do pitch deck que migram para a landing page devem ser re-exportadas em alta resolução (2x para retina)
- Vídeos curtos (se aplicável): autoplay, muted, loop, formato MP4 + WebM

---

## 9. Responsividade

### 9.1 Breakpoints

Alinhados com o Tailwind CSS (default):

| Nome | Min-width | Uso |
|------|-----------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop wide |
| `2xl` | 1536px | Desktop ultrawide |

### 9.2 Regras Responsivas

- **Mobile-first.** CSS base é mobile. Media queries adicionam complexidade
- **Hero:** Full-height no mobile (100svh), split layout horizontal em `lg+`
- **Feature grids:** 1 coluna em mobile, 2 em `md`, 3 em `lg`
- **Pricing grid:** 1 coluna em mobile, 2-3 em `lg`
- **Tipografia:** Todos os títulos usam `clamp()` (definidos na secção 3.2). Sem media queries para font-size
- **Navegação:** Hamburger menu abaixo de `lg`. Links visíveis em `lg+`
- **Container:** Max-width `1280px`, centrado, com padding lateral de `1.5rem` (mobile) / `2rem` (desktop)
- **Touch targets:** Mínimo de `44px` para elementos interativos em mobile

---

## 10. Acessibilidade

- **Contraste:** Todos os pares cor-texto/fundo cumprem WCAG AA (ratio >= 4.5:1)
- **Focus states:** Todos os elementos interativos têm focus ring visível (`box-shadow: 0 0 0 3px var(--accent-glow)`)
- **Sem cor como única forma de comunicar estado:** Erros têm ícone + texto, não apenas border vermelha
- **Alt text:** Todas as imagens com `alt` descritivo. Imagens decorativas com `alt=""`
- **Semântica HTML:** `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`. Sem `div` soup
- **Skip to content:** Link oculto no topo para saltar navegação
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` desactiva animações
- **Língua:** `<html lang="pt">` ou `<html lang="en">` conforme a rota i18n

---

## 11. Mapeamento Deck → Landing Page

Tradução directa do conteúdo do pitch deck V3 para as secções da landing page:

| Slide do Deck | Secção na Landing Page | Notas |
|---------------|----------------------|-------|
| Slide 1 (Hero) | **Hero Section** | Split layout. Tagline "TRAIN. FINE-TUNE. INFER." + árvore digital. CTA: "Contacte-nos" / "Ver Preçário" |
| Slide 2 (Executive Summary) | **Features Overview** | Grid 2x2 com os 4 pilares (Soberania, Tecnologia, Sustentabilidade, Marketplace). Usar cards estilo slide 3, não slide 2 |
| Slide 3 (Market Opportunity) | **Porquê GreenLink** | Grid 3 colunas. Adaptar narrativa para o cliente (não investidor). Focar no gap de mercado e EU AI Act |
| Slide 4 (Location) | **Infraestrutura** | Mapa simplificado + specs chave. Não incluir detalhes de lotes (isso é para investidores) |
| Slide 5 (Solar) | **Sustentabilidade** | Gráfico redesenhado com Recharts. Stats chave (169 MWh, PUE). Pode ser sub-secção de Infraestrutura |
| Slide 6 (Technology) | **Tecnologia / Hardware** | Grid 3x2 com ícones — migrar directamente, é o slide mais forte. Adaptar linguagem para developer audience |
| Slide 7 (Timeline) | **Não incluir** | Timeline de construção não é relevante para clientes. Substituir por "Coming Soon" / countdown se aplicável |
| Slide 8 (Financials) | **Não incluir** | Dados de investimento são para o deck de investidores, não para a landing page |
| Slide 9 (Revenue Strategy) | **Não incluir** | Estratégia de revenue é interna |
| Slide 10 (Team) | **Equipa** | Versão simplificada. Nomes, cargos, 1-2 credenciais chave. Sem bullet points extensos |
| Slide 11 (CTA) | **CTA Final** | "Construa o futuro da IA em Portugal" + formulário de contacto ou link para contacto |
| — | **Preçário** | Novo conteúdo. Calculadora interativa com GPU/MIG + Storage NVMe/S3. Não existe no deck |
| — | **Casos de Uso** | Novo conteúdo. Sectores: saúde, finanças, tradução, investigação. Cards com cenário + solução |

---

## 12. Checklist de Implementação Visual

Para cada secção da landing page, verificar:

- [ ] Fundo é `--bg-primary` ou `--bg-elevated` (nunca cores claras, nunca verde)
- [ ] Títulos em Cabinet Grotesk Bold/ExtraBold, cor `--text-primary` ou `--text-accent`
- [ ] Body text em Geist Regular, cor `--text-secondary`, max-width `65ch`
- [ ] Cards com border subtil (`--border-default`), sem sombra no default
- [ ] Hover states em todos os elementos interactivos
- [ ] Ícones Lucide em outline, cor `--text-accent`, 24px
- [ ] Animação de entrada com Framer Motion (fade-in-up ao scroll)
- [ ] Responsivo: testar em 375px (iPhone SE), 768px (iPad), 1280px (Desktop)
- [ ] Contraste WCAG AA cumprido
- [ ] Focus states visíveis em tab navigation
- [ ] Textos em ambas as línguas (PT/EN) via dicionários
