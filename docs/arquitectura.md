# Dr. Família IA — Arquitectura Técnica v1.1

**Data:** 2026-05-02
**Versão:** 1.1 (blueprint — adicionado prompt caching ao Stack e ao Roadmap)
**Produto:** Dr. Família IA (Proteína Lúdica LDA)
**Subdomínio:** drfamilia.proteinaludica.com
**Repositório sugerido:** `drfamilia-ia/` (separado da landing estática)

> **Changelog v1.1 (2026-05-02):** adicionado **prompt caching da Anthropic** como camada de optimização de custo. Reflectido no §1 (Stack), §4 (Fluxo de dados), §10 (Estimativa de esforço) e §11 (Próximo passo imediato — novo item 1.5). Zero alteração ao prompt do agente, ao schema ou aos restantes blocos arquitecturais.

---

## 1. Stack escolhido

| Camada | Tecnologia | Justificação |
|---|---|---|
| Frontend + API | Next.js 15 (App Router) | Streaming de LLM nativo, RSC para segredos, deploy Vercel trivial |
| LLM | Claude Sonnet 4.5 via Anthropic SDK | Alinhamento com o design do core. Haiku 4.5 disponível para triagem/classificação (Nível 3 do Anexo K, futuro) |
| **Optimização de tokens** | **Anthropic Prompt Caching (`cache_control`)** | **Reduz ~80% do custo de input em conversas multi-turno. Cache TTL: 5 min default, 1 h em modo extended. Aplicado ao bloco core + módulos carregados — invalidação automática quando o prompt muda.** |
| Autenticação | Supabase Auth (magic link + Google) | Simples para idosos, sem passwords |
| Base de dados | Supabase Postgres (região EU Frankfurt) | RLS robusta, `pgvector` para RAG futuro |
| Storage | Supabase Storage | Fotografias de análises, vacinas, embalagens |
| Pagamentos | Stripe Subscriptions (modo PT) | Multibanco + MB WAY |
| Observabilidade | Vercel Analytics + Sentry (opcional) | Erros e performance |
| Deploy | Vercel | Natural, integração CI/CD |

---

## 2. Estrutura de pastas

```
drfamilia-ia/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                    # página pública do produto
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts           # callback Supabase Auth
│   ├── (app)/
│   │   ├── layout.tsx                  # protege rotas autenticadas
│   │   ├── chat/page.tsx               # conversa principal
│   │   ├── registo/page.tsx            # ver o registo longitudinal
│   │   ├── conta/page.tsx              # subscrição, dados, eliminar
│   │   └── onboarding/page.tsx         # primeiro uso (Bloco 5)
│   ├── api/
│   │   ├── chat/route.ts               # SSE streaming com Claude
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts       # criar sessão
│   │   │   └── webhook/route.ts        # atualizar tier
│   │   ├── upload/route.ts             # fotografias → Supabase Storage
│   │   └── registo/
│   │       ├── route.ts                # CRUD registos
│   │       └── [id]/route.ts
│   └── layout.tsx
├── lib/
│   ├── claude/
│   │   ├── client.ts                   # Anthropic SDK singleton
│   │   ├── prompt-loader.ts            # lê core.md + módulos por tier
│   │   └── stream.ts                   # wrapper SSE
│   ├── supabase/
│   │   ├── server.ts                   # cliente server-side
│   │   └── client.ts                   # cliente browser
│   ├── stripe/
│   │   ├── client.ts
│   │   └── tier-sync.ts                # sincroniza tier via webhook
│   ├── tier/
│   │   ├── load-modules.ts             # Anexo K — retrieval condicional
│   │   └── gate.ts                     # lógica Bloco 2.5
│   └── rgpd/
│       ├── consent.ts
│       └── export-delete.ts            # direito ao esquecimento + portabilidade
├── prompts/
│   ├── core.md                         # ficheiros do projecto actual
│   ├── 00_preambulo.md
│   ├── 02_core_bloco_1_identidade_e_missao.md
│   ├── 03_core_bloco_2_seguranca.md
│   ├── 03b_core_bloco_2_5_camada_de_tier.md    # novo
│   ├── 04_core_bloco_3_multilingue.md
│   ├── ... (todos os outros blocos e módulos)
│   └── 21_meta_anexo_k_mapa_arquitectural.md
├── components/
│   ├── Chat/
│   │   ├── ChatWindow.tsx
│   │   ├── Message.tsx
│   │   ├── InputBar.tsx                # texto + voz (Web Speech API) + upload
│   │   └── TTSPlayer.tsx               # Bloco 4.6 — leitura em voz alta
│   ├── Onboarding/
│   │   └── Wizard.tsx                  # Bloco 5
│   ├── Registo/
│   │   ├── Timeline.tsx
│   │   └── Categoria.tsx
│   ├── Paywall/
│   │   └── RecusaFree.tsx              # fórmula 2.5.5
│   └── UI/                             # design system alinhado à landing
├── db/
│   ├── schema.sql
│   ├── migrations/
│   └── seed.sql
├── middleware.ts                       # auth + tier sync
├── package.json
└── next.config.js
```

---

## 3. Schema da base de dados (essencial)

```sql
-- Perfil do utente
create table public.user_profiles (
  id uuid references auth.users primary key,
  nome text,
  data_nascimento date,
  sexo text check (sexo in ('M','F','X','N')),
  morada text,
  codigo_postal text,
  telefone text,
  medico_familia_id uuid references public.medicos(id),
  lingua_preferencial text default 'pt-PT',
  modo_acessibilidade text default 'padrao',
  modo_cuidador boolean default false,
  consentimento_rgpd_data timestamptz,
  created_at timestamptz default now()
);

-- Médicos de referência
create table public.medicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  titulo text default 'Dr.',
  especialidade text default 'Medicina Geral e Familiar',
  ordem_cedula text,
  email_clinico text,
  locais text[],
  created_at timestamptz default now()
);
-- Seed inicial: inserir o Dr. Roberto Gouveia

-- Tier (fonte única da verdade, sincronizada por webhook Stripe)
create table public.subscriptions (
  user_id uuid references auth.users primary key,
  tier text not null default 'free' check (tier in ('free','paid')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

-- Registo longitudinal (Bloco 5)
create table public.registos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  categoria text not null check (categoria in (
    'antecedente_patologico','medicacao_habitual','vacina',
    'analise','mcdt_relatorio','sinal_vital',
    'queixa','alergia','intervencao','historia_familiar'
  )),
  conteudo jsonb not null,
  fonte text check (fonte in ('texto_utente','fotografia','cuidador','importado')),
  data_evento date,
  fotografia_url text,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_registos_user_cat on public.registos(user_id, categoria) where activo;
create index idx_registos_evento on public.registos(user_id, data_evento desc) where activo;

-- Conversa
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  conversa_id uuid not null,
  role text not null check (role in ('user','assistant')),
  conteudo text not null,
  modulos_carregados text[],
  tier_snapshot text,
  created_at timestamptz default now()
);

create index idx_msg_conversa on public.mensagens(conversa_id, created_at);

-- Telemetria de tier (Bloco 2.5.9 — opt-in no onboarding)
create table public.tier_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  evento text not null check (evento in (
    'recusa_free','sugestao_upgrade','upgrade','downgrade','cancelamento'
  )),
  modulo_tentado text,
  created_at timestamptz default now()
);

-- Row Level Security — obrigatório
alter table user_profiles enable row level security;
alter table registos enable row level security;
alter table mensagens enable row level security;
alter table subscriptions enable row level security;
alter table tier_events enable row level security;

create policy own_profile on user_profiles for all using (auth.uid() = id);
create policy own_registos on registos for all using (auth.uid() = user_id);
create policy own_mensagens on mensagens for all using (auth.uid() = user_id);
create policy own_subscription on subscriptions for select using (auth.uid() = user_id);
create policy own_events on tier_events for all using (auth.uid() = user_id);
```

---

## 4. Fluxo de dados — pedido conversacional

```
[Utente envia mensagem]
        ↓
POST /api/chat (Next.js route handler)
        ↓
[Middleware de autenticação — Supabase]
        ↓
1. Obter user_id da sessão
2. Ler tier de public.subscriptions (com fallback a 'free')
3. Carregar últimas N mensagens (janela de contexto)
4. Carregar sumário do registo longitudinal do utente
5. Chamar prompt-loader:
     - Tier free  → core.md + M-DICAS + M-MADEIRA + Bloco 6 + Bloco 7
     - Tier paid  → tudo acima + M-VACINAÇÃO + M-RASTREIOS + M-PEDIATRIA +
                    M-CUIDADOR + Bloco 8 + (sub-agente Nefrologia se gatilho)
6. Construir system prompt final com:
     - Core
     - Módulos
     - Variável injectada: <tier>free|paid</tier>
     - Resumo do registo longitudinal
7. Aplicar `cache_control: {type: "ephemeral"}` ao bloco
   estável (core + módulos). Histórico de mensagens e
   registo longitudinal ficam fora do cache (variáveis).
        ↓
[Anthropic API — messages.stream()]
   - 1ª chamada da sessão: cache write (custo +25%)
   - Chamadas seguintes (≤5 min): cache read (custo ~10%)
        ↓
[Streaming SSE → frontend]
        ↓
[Persistir em paralelo]
     - Mensagem user + assistant em public.mensagens
     - Se a resposta menciona novo dado clínico,
       extrair e guardar em public.registos (via segundo prompt Haiku)
     - Se 'recusa_free' aconteceu, log em public.tier_events
     - Métricas de cache (hit/miss, tokens poupados) em public.cache_metrics
```

**Estratégia de caching (detalhe):**

- **O que é cacheado:** core (~650 linhas) + módulos carregados para o tier do utente. Bloco estável que se repete em todas as chamadas dessa sessão.
- **O que NÃO é cacheado:** histórico de mensagens, registo longitudinal do utente, mensagem actual. São conteúdo variável.
- **TTL:** 5 minutos (default). Se a sessão for activa, cada nova mensagem renova o TTL.
- **Modo extended (1 hora):** considerar para utentes que conversam ao longo do dia (típico em idosos). Custo de cache write é maior, mas amortiza-se em sessões longas.
- **Invalidação:** automática quando o prompt muda (deploy nova versão do core, ou utente muda de tier). Sem trabalho manual.

**Extracção estruturada para o registo (pipeline secundário):**
Após a resposta principal, correr uma chamada Haiku rápida com prompt do tipo *"a partir desta conversa, extrai em JSON: [nova_medicacao?], [vacina_registada?], [sinal_vital?], [queixa_nova?]"*. O resultado é validado e inserido em `registos`. Isto mantém o Bloco 5 vivo sem pedir ao utente que formalize tudo.

---

## 5. Fluxo Stripe — upgrade para Premium

```
Utente clica "Activar Premium" no paywall
        ↓
POST /api/stripe/checkout
        ↓
Cria Checkout Session (subscription mode, EUR, MB/MB WAY activos)
        ↓
Redirect para Stripe Hosted Checkout
        ↓
Utente paga
        ↓
Stripe envia webhook: customer.subscription.created/updated/deleted
        ↓
POST /api/stripe/webhook (verificar assinatura HMAC)
        ↓
lib/stripe/tier-sync.ts:
   UPDATE subscriptions SET
     tier = 'paid' (ou 'free' se deleted),
     stripe_customer_id, stripe_subscription_id,
     current_period_end, status, updated_at
   WHERE user_id = (lookup via stripe_customer_id)
        ↓
Utente volta à app, próxima mensagem já usa tier='paid'
```

**Preços sugeridos** (a decidir contigo):
- Mensal: €6,99/mês
- Anual: €59,99/ano (2 meses grátis)
- Família (até 5 utentes): €9,99/mês ou €99/ano — relevante para ti por causa da mãe acamada e tia com demência

---

## 6. Segurança e RGPD (o essencial técnico)

- **Região EU obrigatória:** Supabase Frankfurt, Stripe Ireland, Vercel EU regions para Edge Functions quando possível.
- **Encriptação em repouso:** Supabase default AES-256.
- **TLS em trânsito:** obrigatório, Vercel força HTTPS.
- **Segredos:** `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET` em Vercel Environment Variables. Nunca no cliente.
- **RLS:** todos os `select/insert/update/delete` passam por políticas `auth.uid() = user_id`.
- **Direito ao esquecimento:** rota `/api/rgpd/delete` que apaga perfil + registos + mensagens + cancelamento Stripe, e emite confirmação por email.
- **Direito de portabilidade:** rota `/api/rgpd/export` que exporta ZIP com JSON de tudo.
- **Logs:** nunca incluir PII. Usar `user_id` uuid em vez de nome/email.
- **Consentimento:** primeiro passo do onboarding é uma página de consentimento explícito para categoria especial (art. 9.º RGPD), guardada em `user_profiles.consentimento_rgpd_data`.
- **Validação jurídica obrigatória** antes de ir para o ar — advogado especialista em RGPD e saúde digital. Tens a Ordem dos Médicos e a APDSI como pontos de contacto.

---

## 7. Integração com a landing (proteinaludica.com)

A landing actual é HTML estático. Duas alterações pequenas:

1. **Adicionar card do Dr. Família IA** no portfolio — entre o Gestor de Saúde e o contacto:
   - Ícone: 🏥 ou 👨‍⚕️
   - Tagline: "Dr. Família IA — Saúde Longitudinal · Utente · Madeira"
   - Tags: PT-PT, RGPD, Freemium, Longitudinal, Registo
   - Badge: "Em desenvolvimento" até ao lançamento, depois "Live"
   - Link: `https://drfamilia.proteinaludica.com`

2. **Actualizar formulário de contacto** para o Supabase ou Formspree em vez do `alert()` actual — fora do scope desta arquitectura mas fica registado.

---

## 8. Deployment — checklist para produção

- [ ] Repositório `drfamilia-ia` no GitHub
- [ ] Projecto Vercel conectado, subdomínio `drfamilia.proteinaludica.com`
- [ ] Projecto Supabase na região EU (Frankfurt), schema aplicado
- [ ] Schema `db/schema.sql` aplicado, RLS verificado
- [ ] Seed: inserir Dr. Roberto em `medicos`
- [ ] Stripe conta PT activada, produtos criados, webhooks configurados
- [ ] Domínio de email de magic link configurado (`noreply@drfamilia.proteinaludica.com`)
- [ ] Variáveis de ambiente em Vercel
- [ ] Teste end-to-end: onboarding → conversa tier free → upgrade → conversa tier paid → cancelamento
- [ ] Validação RGPD por advogado
- [ ] Termos de Uso e Política de Privacidade redigidos
- [ ] Testamento de dados (quem acede em caso de impossibilidade tua — sócios?)
- [ ] Plano de backup e recuperação (Supabase Point-in-time Recovery)

---

## 9. O que fica fora desta v1 (roadmap)

- **Nível 2 do Anexo K** (RAG com `pgvector`) — só faz sentido quando o core ultrapassar a janela de contexto do Claude (hoje 200k tokens, ainda há muita folga).
- **Nível 4 do Anexo K** (sub-agente Nefrologia autónomo) — só depois do core provar tracção com utentes reais.
- **App mobile nativa** — PWA first, nativa só se houver massa crítica.
- **Integração com SNS/RSE** — politicamente e tecnicamente complexa. Fase 2 ou 3.
- **Multi-utente por conta** (cuidador gerir dependentes) — útil para o teu caso pessoal, mas só depois do single-user estar estável.

---

## 10. Estimativa de esforço (conservadora)

| Fase | Esforço | Entregável |
|---|---|---|
| Setup infra (Vercel + Supabase + Stripe sandbox) | 1 semana | Ambiente funcional vazio |
| Onboarding + registo longitudinal + Bloco 5 | 2 semanas | Tier free funcional |
| Integração Claude + prompt loader + tier gate | 2 semanas | Conversa funcional |
| **Prompt caching (`cache_control` + métricas)** | **+1 dia** | **~80% redução no custo de input** |
| Stripe + upgrade flow + webhook | 1 semana | Premium funcional |
| UI polida + TTS + voz input | 2 semanas | UX madura |
| RGPD + compliance + testes | 2 semanas | Pronto para beta fechada |
| **Total MVP** | **~10 semanas** | Beta fechada com 10-20 utentes teus |

Em paralelo com o teu trabalho clínico, assumindo 10-15 horas/semana.

**Custo operacional estimado (com caching activado):**

| Utentes activos | Conversas/mês | Custo Anthropic estimado |
|---|---|---|
| 10 (beta) | ~200 | €3–8/mês |
| 100 | ~2.000 | €30–80/mês |
| 500 | ~10.000 | €150–400/mês |
| 1.000 | ~20.000 | €300–800/mês |

Sem caching, multiplicar por ~5×.

---

## 11. Próximo passo imediato

Escrever em código, na seguinte ordem (cada peça é um entregável isolado que funciona):

1. **`prompts/` loader** — `lib/claude/prompt-loader.ts`. Lê os .md, aplica tier gate, devolve system prompt final. Testável sem base de dados.
   - **1.5 — Prompt caching**. No mesmo `prompt-loader.ts`, marcar o bloco estável (core + módulos) com `cache_control: {type: "ephemeral"}` no formato exigido pela Anthropic SDK. Adicionar contadores de `cache_creation_input_tokens` e `cache_read_input_tokens` ao logging para validar que o cache está a funcionar. Decisão por defeito: TTL 5 min (default); promover a 1 h (extended) quando houver dados de uso real que justifiquem.
2. **Schema + migrations** — `db/schema.sql` aplicável no Supabase. Inclui tabela `cache_metrics` (timestamp, user_id, tokens_cached, tokens_uncached, tier).
3. **Rota `/api/chat`** — SSE streaming com Claude, persistência em `mensagens`. Usa o loader do passo 1 com cache activado.
4. **Frontend chat** — janela mínima funcional, sem design polido.
5. **Onboarding + registo** — wizard do Bloco 5.
6. **Stripe checkout + webhook**.
7. **Polish: TTS, voz, upload de fotografias, acessibilidade.**

Começar pelo **1 + 1.5** — é o cérebro do sistema com a optimização de custo já dentro. Posso entregar-te num ficheiro que corres localmente com `bun` ou `node` para validares que o gate funciona e medires os tokens cacheados antes de investires em infra.

---

**Fim do documento v1.1. Revisões a fazer assim que houver feedback.**
