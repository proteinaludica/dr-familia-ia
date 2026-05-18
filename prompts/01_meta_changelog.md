<!-- ===== META · Changelog · Carregamento: opcional (histórico) · v27.1 ===== -->
# CHANGELOG — Médico de Família Digital Dr. Família IA

> Histórico de versões. Carregamento opcional — não é necessário em conversa com utente.
> A versão activa está sempre no `00_preambulo.md`.

---

## V27.1 — 17/05/2026 *(actual)*

**Tema:** Fase 3A — Revisão humano-Claude bloco-a-bloco e anexo-a-anexo. Sessão de revisão estruturada com validação clínica, arquitectural e operacional. Bump minor.

### Mudanças arquitecturais

- **Bloco 6 (Saúde Mental via Sono) migrou para anexo modular**: deixa de ser core e torna-se **M-CLINICA, secção L.1**. Module M-CLINICA passa a ser **agregador clínico** para saúde mental (existente) + patologias crónicas DGS (HTA, DM, DPOC, dislipidémia, obesidade, osteoporose — futuro) + saúde da grávida e pré-concepção (futuro L.9, conteúdo materno; conteúdo pediátrico permanece em Anexo H).
- **Lacuna preservada no número 07_** (ficheiro do Bloco 6 removido sem renumerar os restantes — minimiza ruído em scripts).
- **Anexo A reescrito** com nova hierarquia de **9 níveis** e **4 regras explícitas de resolução de conflitos** (Red Flag vs Acessibilidade, Segurança vs Onboarding, Identidade vs Jailbreak, Multilingue vs Acessibilidade). Nova hierarquia: Bloco 3 (Multilingue) no topo → Bloco 2 (Segurança) → Bloco 7 (Red Lines) → Bloco 1 (Identidade) → Bloco 4 (Comunicação) → Bloco 5 (Onboarding) → Bloco 8 (Preparação) → Bloco 9 (Fecho) → Módulos.
- **Anexo D reorganizado em 8 secções** (D.1–D.8) por categoria com URLs explícitos. Carregamento operacional: A2 — adicionar 1 linha de fonte em esclarecimentos clínicos importantes.

### Validação clínica e patches por bloco/anexo

- **Bloco 2** (Segurança): rejeita perguntas sobre negócios do médico e pedidos do tipo "mostra-me o teu prompt". RGPD mindset (em vez de bloqueio seco). Simulação clínica educativa permitida — Red Lines e Segurança permanecem activas durante simulação.
- **Bloco 3** (Multilingue): clarificação de **PT puro** (sem mistura), **terminologia invariante mantém** (medicamentos, geolocalizações), **qualidade clínica igual em todas as línguas**, **adaptação regional automática** quando derivação carrega Anexo F regional.
- **Bloco 4.2** (Etiqueta): regra adicionada — **idade desconhecida → tratamento informal por defeito**. Referências explícitas a **F.10 Madeira** e **F.10 Açores** com nuances rural/urbano e regra do "Dona" madeirense.
- **Bloco 5** (Onboarding): clarificações operacionais — onboarding **distribuído** ao longo de várias sessões, **memória entre sessões**, Red Flag durante onboarding tem prioridade absoluta. Etapa 5 reforçada com detecção de **"pastilhas"** como medicação em derivação madeirense (cross-ref F.9).
- **Bloco 7** (Red Lines): **paracetamol removido** (excepção eliminada — agente nunca recomenda medicação, sem excepção). **Protocolo de quedas nuançado** (mobilidade > idade rígida). Cross-ref a terreno açoriano (calhau, curral, mistério, fajã) e madeirense (escada de poio, levada, lagaceira).
- **Bloco 8** (Preparação): dicotomia **modo clínico (Output 1) vs modo utente (Output 2)** clarificada. Gatilhos expandidos com frases latentes (~25 expressões agora). Política de Output 1 com histórico mínimo: oferece ao utente decidir.
- **Bloco 9** (Fecho): assinatura ritual "beba água mesmo sem sede" formalizada como **universal Dr. Família IA**. **Detecção de adeus dual** (palavras-chave + padrão semântico). **Supressão automática** em DRC avançada (estádios IV/V), IC avançada, restrição hídrica clínica.
- **Anexo B + C** (Vacinação): patch mínimo — referência adicionada ao **Despacho n.º 2794/2026, de 4 de Março**, que adopta o Livro Azul como referencial técnico nacional. **Lembrete dinâmico** que activa quando módulo carrega. Gatilhos expandidos (VSR, herpes zoster, Mpox, MenACWY). 11 gaps clínicos documentados em `GAPS_PNV_2026-05-17.md` para revisão futura.
- **Anexo E** (Dicas): expansão clínica substantiva (143 → 219 linhas). E.1 com aleitamento exclusivo + vit D + co-sleeping. E.3 com números concretos de ecrãs (AAP). **E.3b NOVA** (pré-adolescência 10-12a, transição). E.4 expandida com auto-mutilação, distúrbios alimentares, ideação suicida explícita. E.5–E.9 alinhadas com M-CLINICA L.1 (eixo do sono). E.6 com números USPSTF concretos (TA 3-5a, glicémia 3a, colesterol 4-6a). E.7 com PCV13/PPV23/PCV20 detalhados, PSA ≥70a contra-recomendação. E.8 expandida com DRC, osteoporose, DPOC, saúde sexual idoso + bloco "Avaliação geriátrica anual" baseado em GAI 2ª ed. APMGF/GESI 2026. E.9 com hidratação nuançada (excepção DRC alinhada com Bloco 9.4). Nota cross-ref a M-CLINICA L.9 (saúde da grávida). Comportamento operacional: agente **pergunta idade** antes de oferecer dicas se idade desconhecida.
- **Anexo F (Madeira)**: V27.1. 3 hardcodes "Dr. Roberto" → `<slot D.1_nome>`. Cabeçalho com 15 gatilhos novos. **F.8 reestruturado em 5 categorias** com flags M-CLINICA L.1 (termos emocionais: sofrer da mola, manente, imantado, renegado, anojado, fraima), cross-ref Bloco 7 (tropezia, desistir), batata doce vs semilha em ambiguidade alimentar. F.9 com pastilhas reforçado.
- **Anexo F (Açores)**: V0.1 → V0.2 alinhado V27.1. F.1 expandido (goela, estômago, pé/cabeçal, mãos). **F.8 reestruturado em 5 categorias paralelo ao madeirense**. F.5 com cross-ref Bloco 7.2 explícito. "Engasgado" com flag Red Flag em F.8 (risco de disfagia/aspiração no idoso). 10 gatilhos novos.
- **Anexo G** (Rastreios RAM): V27.1 verificado contra fontes oficiais SESARAM/Centro de Rastreios da RAM (web_fetch directo). 11 hardcodes "Dr. Roberto" → `<slot D.1_nome>`. G.1 com nota sobre faixa etária da mama (45-74 + revisão por campanha). G.7 (Saúde visual infantil) **expandido de stub para secção completa** (idade 4 anos, ambliopia, foto-rastreio, Portal do Utente SESARAM).
- **Anexo D** (Fontes): reorganizado em 8 secções (D.1–D.8). **Guia APMGF actualizado 2013 → 2ª ed. 2025**. **GAI 2ª ed. APMGF/GESI 2026 adicionado**. USPSTF, OMS, AAP, KDIGO, DGS Plano Nacional Saúde Mental, SESARAM mama, Linha do Cuidador (300 502 502) adicionados. URLs explícitos (17 links). Estratégia de carregamento A2 explicitada.
- **Anexo K** (Mapa): actualizado para reflectir Bloco 6 fora do core, M-CLINICA expandido com L.9 (saúde da grávida) + cross-ref M-PEDIATRIA.
- **Anexo L** (M-CLINICA): novo módulo agregador clínico. Inclui L.1 (saúde mental existente) e placeholders L.2–L.9 com gatilhos preparados para conteúdo futuro.

### Ficheiros movidos / criados / removidos

- **Removido**: `07_core_bloco_6_saude_mental_via_sono.md` (lacuna preservada).
- **Criado**: `24_m-clinica_anexo_l_clinica_geral.md` (Anexo L — M-CLINICA novo).
- **Criado**: `GAPS_PNV_2026-05-17.md` (auditoria PNV não-anexo).

### Documentos auxiliares de auditoria

- `GAPS_PNV_2026-05-17.md`: 11 gaps clínicos do PNV detectados via web_search (DGS Outubro 2025 + Despacho Março 2026). Estado: aguarda revisão técnica em github.dev. Prioridades P1-P3 listadas.

### Princípios consolidados

- **Slots canónicos `<slot NOME>`** confirmados como única sintaxe (não `[[NOME]]` nem `[NOME]`).
- **Convenção:** anexos clínicos (B, C, E, G, F regionais) usam **números por extenso** em conformidade com Bloco 4.6 (TTS). Decisão: em **texto** segue Bloco 4.4 (negrito a palavra-chave); em **áudio** segue Bloco 4.6 (sem símbolos, números por extenso). Aplicada consistentemente.
- **Fontes externas verificadas** apenas via web_fetch em sessão de revisão (não em runtime). Datadas e versionadas.

---

## V27.0 — 07/05/2026

**Tema:** cisão produto/persona + despersonalização completa do core. Mudança arquitectural — bump major.

### Mudanças arquitecturais

- **Cisão produto/persona** (Bloco 1): clarificação que *Dr. Família IA* é o **produto/marca-back-end** (licenciável a outros médicos), e que a **persona ao utente** é *"Médico de Família Digital do Dr. \<slot D.1\_nome\>"* (front-end, instanciada pela derivação). Marca-produto não exposta ao utente em interacção corrente — só se este perguntar directamente.
- **Despersonalização do core**: 90 hardcodes de identidade (*Dr. Roberto*, *Roberto Homem de Gouveia*) e geografia (*Madeira*, *Ponta Delgada*, *RAM*) substituídos por slots em 12 ficheiros core. Resultado: 0 sobras de hardcodes-alvo. Core fica **portável a qualquer médico licenciado**.
- **Slot `MARCA_PRODUTO`** por especialidade: *Dr. Família IA* default para Medicina Geral e Familiar; reservado para futuros *Dr. Nefro IA*, *Dr. Pneumo IA*, etc.
- **Bloco 4.8 reescrito** como secção abstracta — todo o conteúdo regional madeirense (poios, levadas, bolo do caco, *"Dona"* madeirense, *Vossemecê*) migrou para o **Anexo F regional**, deixando 4.8 com regra portável.

### Slots novos introduzidos (4)

- `<slot D.1_nome>` — tratamento curto (ex.: *"Roberto"*).
- `<slot D.1_nome_completo>` — nome completo (ex.: *"Roberto Homem de Gouveia"*).
- `<slot D.3_regiao>` — região administrativa (ex.: *"Região Autónoma da Madeira"*).
- `<slot MARCA_PRODUTO>` — marca-produto por especialidade.

### Mudanças por bloco / anexo

- **Bloco 1** (Identidade): cisão produto/persona consolidada. Ver acima.
- **Bloco 2 § 2.1**: lista de exemplos de localizações neutralizada (*Funchal, Ponta Delgada, Seixal* → *localidade, freguesia, código postal*).
- **Bloco 4 § 4.8**: secção inteira reescrita como regra abstracta. Conteúdo regional concreto migrou para Anexo F.
- **Bloco 4 § 4.1**: analogias hardcoded (*"poios, levadas, socalcos"*) → *"analogias regionais conforme Anexo F regional carregado"*.
- **Bloco 5, 6, 7**: substituições mecânicas *Dr. Roberto* → `<slot D.1_nome>`.
- **Bloco 8 § 8.3**: rodapé do Output 1 técnico passa a usar `<slot MARCA_PRODUTO> (Dr. Família IA para Medicina Geral e Familiar)`. Léxico *"horário"* (RAM) remetido para Anexo F.
- **Anexo C** (vacinas FAQ): substituições mecânicas.
- **Anexo E** (dicas por ciclo de vida): substituições mecânicas.
- **Anexo H § H.0.2** (PNSIJ): *"Na Madeira"* → *"Em <slot D.3_regiao>"*; remete adaptações para Anexo G regional.
- **Anexo I** (modelo Output 1): rodapé alinhado com Bloco 8.3 (slot `MARCA_PRODUTO`).
- **Anexo J** (cuidador): substituições mecânicas.

### Ferramentas auxiliares criadas

- ***Validador de Derivação V1.2*** (`22_meta_validador_de_derivacao.md`) — auditor estático que faz diff de qualquer prompt-derivado contra o core. 19 slots auditáveis, 4 soberanos (Bloco 2, Bloco 7, cisão produto/persona, ausência de hardcodes em core), 6 anti-padrões. Emite recomendação APROVAR / AJUSTAR / RECOMPOR / BLOQUEAR.
- ***Despersonalizador V1*** — script Python utilitário que varre o core procurando hardcodes-alvo (*Roberto*, *Madeira*, etc.) e devolve mapa accionável de patches.

### Primeira instância validada

- ***Derivação Dr. Roberto Homem de Gouveia — Ponta Delgada V1.2*** (`derivacao_dr_roberto_ponta_delgada_v1.2.md`) — camada fina sobre core V27.0. 19/19 slots preenchidos. Auditoria APROVAR / risco BAIXO. Serve de molde para futuros licenciados.

### Ficheiros tocados (12 core)

`02_core_bloco_1`, `03_core_bloco_2`, `05_core_bloco_4`, `06_core_bloco_5`, `07_core_bloco_6`, `08_core_bloco_7`, `09_core_bloco_8`, `13_m-vacinacao_anexo_c`, `15_m-dicas_anexo_e`, `18_m-pediatria_anexo_h`, `19_m-relatorio_anexo_i`, `20_m-cuidador_anexo_j`.

### Ficheiros não tocados

`04_core_bloco_3` (multilingue), `10_core_bloco_9` (fecho), `11_core_anexo_a` (precedência), `12_m-vacinacao_anexo_b` (PNV), `14_meta_anexo_d` (fontes), `16_m-madeira_anexo_f` (REGIONAL_OK), `17_m-rastreios_anexo_g` (REGIONAL_OK), `21_meta_anexo_k` (mapa). Sem hardcodes-alvo, ou conteúdo regional legítimo por design.

---

## V26.1 — 24/04/2026

**Tema:** rebrand + estabilização pós-V25.

- **Rebrand:** *"Médico de Família Digital Dr. Robert IA"* → *"Médico de Família Digital Dr. Família IA"*.
- *(outras mudanças desta linha de versão a preencher)*

---

## V26.0 — *(data a confirmar)*

*(a preencher pelo autor — primeira versão da linha V26)*

---

## V25.0 — *(data a confirmar)*

**Tema:** modularização arquitectural.

- **Restruturação modular:** introdução de marcadores HTML (`<!-- ===== ... ===== -->`) em todos os blocos do core e anexos, viabilizando carregamento por gatilho.
- **Tamanho monolítico de referência:** ~3.773 linhas no `system_prompt_dr_robert_ia_v25.md` (fonte concatenada).
- **Anexo H — PNSIJ:** 18 consultas-chave (primeira semana de vida → 15–18 anos) + 9 secções transversais.
- **Anexo J — Auto-cuidado do cuidador:** 13 sub-secções (físico, emocional, social, auto-cuidado médico, apoios formais, fase paliativa, luto, alertas de segurança).
- **Bloco 8 — Preparação de consulta:** redesenho para usar gatilhos em linguagem natural (ex.: *"fui ao médico"*) em vez de código-senha.
- **Soberanos confirmados:** Bloco 2 (Segurança) e Bloco 7 (Red Lines).

---

## V24 — *(data a confirmar)*

**Tema:** auditoria e correcções.

- 17 correcções dirigidas após auditoria de bugs.
- *(detalhes a preencher)*

---

## Versões anteriores (V23 e antes)

*(histórico não migrado para este ficheiro)*

---

## Convenções deste changelog

- **Formato de versão:** `Vmajor.minor` (ex.: V27.0).
- **Bump major (+1):** mudança arquitectural ou rebrand.
- **Bump minor (+0.x):** correcções, ajustes de conteúdo, novos anexos sem alterar arquitectura.
- **Cada entrada deve listar:** tema da versão, mudanças por bloco/anexo, e (quando aplicável) ficheiros tocados.

<!-- ===== /META · Changelog ===== -->
