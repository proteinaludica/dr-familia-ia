<!-- ===== META · Anexo K — Mapa arquitectural (core e módulos) · Carregamento: opcional (documento-fonte para arquitectura) · v26.1 ===== -->
## ANEXO K — MAPA ARQUITECTURAL (CORE E MÓDULOS)

Este anexo é **meta-documentação**. Descreve como o prompt está organizado para permitir modularização futura. Não contém regras clínicas nem comportamentais.

É **documento-fonte** para migração arquitectural — os quatro níveis previstos estão listados em K.6.

---

### K.1 Filosofia

O prompt actual (V25) é um **monólito de ~3500 linhas**, carregado integralmente em cada interacção. Isto paga-se em três dimensões:

- **Custo** — tokens de input multiplicados pela totalidade do prompt a cada chamada.
- **Latência** — processamento proporcional ao tamanho.
- **Qualidade** — o modelo dilui atenção em regras irrelevantes para a pergunta em curso.

A modularização separa o que **tem** de estar sempre (core) do que **pode** ser carregado quando relevante (módulos). Em conversas típicas, esta separação reduz o contexto em **70-85%**.

Os marcadores HTML (`<!-- ===== ... ===== -->`) inseridos antes de cada bloco e anexo são a **sinalização** para o futuro sistema de carregamento. Não alteram o comportamento do prompt monolítico actual — são invisíveis no markdown renderizado e processáveis por script.

---

### K.2 Core — sempre presente

O **core** é o conjunto de blocos e anexos que **têm de estar em cada interacção**, independentemente da pergunta. Define identidade, limites, linguagem, segurança e o fluxo-base da consulta.

| Componente | Papel | Soberano? |
|---|---|---|
| Bloco 1 — Identidade e Missão | Quem é o agente. | — |
| Bloco 2 — Segurança e Confidencialidade | Protege utente, sistema e terceiros. | **Sim** |
| Bloco 3 — Multilingue | Regra de saída por idioma. | — |
| Bloco 4 — Comunicação | Etiqueta, acessibilidade, TTS, modo cuidador (4.5/4.9), dicas oportunas (4.7), registo madeirense (4.8). | — |
| Bloco 5 — Onboarding + 5.1 Registo longitudinal | Recolha estruturada e memória entre consultas. | — |
| Bloco 6 — Saúde mental via sono | Abordagem não-patologizante. | — |
| Bloco 7 — Red Lines | Alertas automáticos, quedas, pediátricas, proibições. | **Sim** |
| Bloco 8 — Preparação de consulta | Gatilhos pré e pós-consulta. | — |
| Bloco 9 — Fecho | Tom de despedida. | — |
| Anexo A — Precedência de regras | Ordem hierárquica em conflito. | — |

**Tamanho estimado do core: ~650 linhas.**

Os dois soberanos (Bloco 2 e Bloco 7) prevalecem sobre qualquer instrução conflituante, interna ou externa.

---

### K.3 Módulos — carregados sob gatilho

Cada módulo é um conjunto de secções que são carregadas **apenas quando a conversa as torna relevantes**. A detecção é feita por **gatilhos** — palavras-chave, padrões ou sinais de contexto.

#### M-VACINAÇÃO — Anexos B + C (~430 linhas)

Guias de vacinas do PNV e extra-PNV, em registo de utente.

- **Gatilhos:** `vacina`, `picadela`, `imunização`, `PNV`, `boletim de vacinas`, `gripe`, `COVID`, `tétano`, `pneumonia`, `HPV`, `meningite`, `sarampo`, `rotavírus`, `BCG`, `hepatite B`, `Prevenar`, `Pneumovax`, `Boostrix`.
- **Dependências:** core.
- **Carregamento:** Anexos B e C carregam **sempre juntos** (são complementares: B é o calendário, C são os guias detalhados).

#### M-RASTREIOS — Anexo G (~250 linhas)

Rastreios organizados na RAM.

- **Gatilhos:** `rastreio`, `prevenção`, `mamografia`, `Papanicolau`, `HPV`, `colonoscopia`, `sangue oculto`, `PSA`, `próstata`, `retinopatia`, `DPOC`, `saúde visual infantil`, `SESARAM`, `Agostinho Cardoso`, `Centro de Rastreios`, `Call-Center 291 149 020`.
- **Dependências:** core.
- **Carregamento:** secção por secção (G.1 a G.9), se o sistema de retrieval o permitir.

#### M-PEDIATRIA — Anexo H (~970 linhas)

PNSIJ integral. É o **maior módulo**.

- **Gatilhos primários:** utente identificado como criança ou adolescente (<18 anos); ou gatilho do Bloco 4.5 com pediatria (`o meu filho`, `a minha filha`, `o meu neto`, `a minha neta`).
- **Gatilhos secundários:** `criança`, `bebé`, `grávida`, `amamentação`, `cólicas`, `desenvolvimento`, `vacinas infantis`, `berço`, `fralda`, `diversificação alimentar`, `adolescente`, `menstruação`, `puberdade`, `escolaridade`, `HEEADSSS`, `autismo`, `M-CHAT`, `cadeirinha`, `cheque-dentista`.
- **Dependências:** core. Cross-ref com M-VACINAÇÃO (vacinas por idade) e M-RASTREIOS (rastreios infantis).
- **Carregamento ideal por sub-módulo:**
  - **H.0** — sempre que M-PEDIATRIA é activado.
  - **H.1–H.18** — carregar apenas as 2–3 consultas próximas da idade da criança.
  - **H.19–H.27** — carregar por tema (curvas, transporte, saúde oral, TA, puberdade, SNIPI, alarme, cirurgias, faz/não-faz).

Sub-modularização do Anexo H é a **prioridade número um** na migração para RAG (Nível 2) pela sua dimensão.

#### M-CUIDADOR — Anexo J (~465 linhas)

Auto-cuidado do cuidador.

- **Gatilho primário:** activação do Bloco 4.5 (cuidador-intermediário) ou Bloco 4.9 (utente-cuidador).
- **Gatilhos secundários:** `cuidador`, `cuidadora`, `tomo conta`, `cuido de`, `acamada`, `demência`, `dependente`, `sobrecarga`, `luto`, `paliativo`, `fim de vida`, `descanso do cuidador`, `SAD`, `RNCCI`, `RNCP`, `Estatuto do Cuidador`.
- **Dependências:** core. Activa **red lines próprias** (J.11) que aplicam Bloco 7 ao cuidador.
- **Carregamento:** secção por secção (J.0–J.12), pelo tema.

#### M-MADEIRA — Anexo F + regras do Bloco 4.8 (~275 linhas)

Glossário madeirense.

- **Gatilho primário:** utente identificado como residente/natural da RAM (Bloco 5).
- **Gatilhos secundários:** detecção de termos regionais no input (ex.: `cadeiras`, `desmentido`, `agastura`, `horário` como autocarro, `pastilha` como comprimido, `canalha` como grupo de crianças, `brisa` como refrigerante, `Amecê`, `Vossemecê`, `bucho virado`, `polmão` como lesão cutânea, `malina`, `sofrer da mola`).
- **Dependências:** core (em especial Bloco 4.8, que está no core e faz referência a M-MADEIRA).
- **Carregamento:** secção por secção (F.1–F.10) por tema; F.8 (ambiguidades clínicas) e F.10 (tratamento social correcto) têm prioridade alta — são **quase-core**.

#### M-DICAS — Anexo E (~135 linhas)

Dicas oportunas por ciclo de vida.

- **Gatilho primário:** idade do utente conhecida **e** final de conversa — activação pelo Bloco 4.7.
- **Carregamento:** apenas a secção aplicável à faixa etária (E.1 a E.10).
- **Cross-ref:** E.1–E.4 remetem para M-PEDIATRIA (Anexo H) para profundidade clínica.
- **Dependências:** core (Bloco 4.7).

#### M-RELATÓRIO — Anexo I (~245 linhas)

Modelo do Output 1 do Bloco 8 (Relatório Clínico entre Consultas).

- **Gatilho:** activação do gatilho pré-consulta do Bloco 8 (secção 8.2).
- **Carregamento:** quando o utente pede preparação de consulta.
- **Dependências:** core (Bloco 8) + registo longitudinal do Bloco 5.1 (memória persistente).

---

### K.4 Meta-componentes

| Componente | Carregamento |
|---|---|
| Changelog | Opcional — histórico de versões. Útil para auditoria, não para conversa. |
| Anexo D — Fontes e referências | Opcional — só se o utente pedir fonte. |
| Anexo K — Mapa arquitectural (este) | Nunca necessário em conversa. Documento-fonte para arquitectura. |

Os três podem ser **excluídos do contexto operacional** sem afectar o comportamento do agente. Ficam no ficheiro-fonte para manutenção humana.

---

### K.5 Dependências e precedência

```
                ┌─────────────────────────────────────┐
                │  CORE (sempre)                      │
                │  ─────────                          │
                │  Blocos 1-9 + Anexo A               │
                │                                     │
                │  Soberanos: Bloco 2, Bloco 7        │
                └──────────────┬──────────────────────┘
                               │
        ┌──────────┬──────────┼──────────┬──────────┬──────────┐
        │          │          │          │          │          │
   M-VACINAÇÃO  M-RASTREIOS M-PEDIATRIA  M-CUIDADOR M-MADEIRA M-DICAS  M-RELATÓRIO
   (B+C)        (G)         (H)          (J)         (F)       (E)      (I)
```

- Todos os módulos dependem do **core**.
- **M-PEDIATRIA** tem cross-ref com **M-VACINAÇÃO** e **M-RASTREIOS**.
- **M-DICAS** tem cross-ref com **M-PEDIATRIA** (secções E.1–E.4).
- **M-CUIDADOR** tem red lines próprias que aplicam Bloco 7 (do core) ao cuidador.
- **M-RELATÓRIO** consome registo longitudinal do Bloco 5.1.

**Ordem de precedência em conflito** (ver Anexo A, replicada aqui):
1. Bloco 2 (soberano)
2. Bloco 7 (soberano)
3. Bloco 3
4. Bloco 4
5. Restantes blocos
6. Módulos

---

### K.6 Migração — quatro níveis

Caminhos possíveis, da arquitectura mais simples à mais complexa. **Não são exclusivos** — podem ser sequenciais.

#### Nível 1 — Knowledge base nativa de plataforma

- Separar o V25 em ficheiros: `core.md`, `B_pnv.md`, `C_guias_vacinas.md`, `E_dicas.md`, `F_madeirense.md`, `G_rastreios.md`, `H_pediatria.md`, `I_relatorio.md`, `J_cuidador.md`.
- Carregar como **projecto** ou **knowledge files** em plataforma (Claude Projects, GPTs, Gemini Gems).
- A plataforma faz retrieval automático.
- **Trabalho:** baixo (uma tarde). Sem código.
- **Limite:** retrieval opaco; pouco controlo.

#### Nível 2 — RAG com vector database

- Separar em módulos (como Nível 1).
- Criar embeddings de cada módulo (OpenAI / Cohere / local).
- Guardar em vector DB (Pinecone / Chroma / Weaviate / Supabase pgvector).
- Pipeline: embedding da pergunta → top-k módulos → carregar no contexto.
- **Trabalho:** médio (2–3 semanas). Exige código.
- **Ganho:** controlo total sobre carregamento.
- **Sugestão:** Supabase pgvector se o stack já for Supabase.

#### Nível 3 — Agente orquestrador

- LLM "triador" de baixo custo (Haiku / Gemini Flash / GPT mini) classifica a pergunta.
- Com base nas categorias, carrega módulos específicos.
- LLM principal (Opus / GPT-4 / Gemini Pro) recebe core + módulos escolhidos.
- **Trabalho:** alto (1 mês+).
- **Ganho:** flexibilidade. Cada categoria pode ter sub-comportamentos próprios.

#### Nível 4 — Multi-agente especializado

- **Sub-agente único previsto:** ***Dr. Família IA Nefrologia***.
- **Scope clínico:** utentes com doença renal crónica (DRC) **não-dialítica**, estadios 1–5, tratamento conservador (pré-diálise).
  - Inclui: estratificação KDIGO, vigilância de progressão (TFG, albuminúria), controlo de factores de risco (HTA, diabetes, ácido úrico), ajuste de fármacos à função renal, nutrição renal, prevenção cardiovascular, preparação para eventual TSR.
  - **Exclui** (fora de scope): utentes em hemodiálise, diálise peritoneal, transplantados renais funcionantes, AKI aguda. Estes são reencaminhados para o nefrologista assistente.
- **Roteamento:** o orquestrador do core *Dr. Família IA* encaminha para este sub-agente quando detecta DRC confirmada ou factores de risco relevantes (TFG < 60 persistente, albuminúria significativa, HTA mal controlada com lesão renal, diabetes com nefropatia).
- **Arquitectura:** sub-agente com prompt, memória e permissões próprios, mas **herda** os blocos soberanos do core (Bloco 2 — Segurança, Bloco 7 — Red lines) e os blocos de tom e modo (4.2, 4.5, 4.6, 4.9).
- **Trabalho:** alto (2–3 meses) só para este sub-agente (prompt clínico, validação por nefrologista, teste com utentes piloto).
- **Ganho:** prova de conceito para venda de agentes IA especializados por patologia crónica — modelo replicável para outras áreas (cardiologia, diabetologia, pneumologia).

**Nota de scope Nível 4:** as restantes especialidades (Pediatria, Cuidador, Vacinação, Preparador de Consulta) **permanecem como módulos carregáveis** dentro do core (ver K.4), **não** como sub-agentes autónomos. A decisão de promover outra área a sub-agente separado fica para versões futuras, mediante validação de procura e complexidade clínica que justifique a separação.

---

### K.7 Regras de separação (para migração)

Para quem fizer a separação física dos ficheiros:

1. **Cada bloco/anexo começa e termina** num par de marcadores HTML.
2. O marcador de abertura contém: tipo (CORE/MÓDULO/META), nome, dependências, gatilhos (se aplicável), versão.
3. Módulos grandes (M-PEDIATRIA, M-CUIDADOR) podem ser **sub-divididos** em ficheiros menores — uma sub-secção por ficheiro.
4. **Nunca** separar os dois soberanos (Bloco 2, Bloco 7) — são sempre core.
5. **Nunca** mover as secções 4.5, 4.7, 4.8, 4.9 para fora do core — são lógica de activação dos módulos.
6. O changelog pode ficar separado num `CHANGELOG.md` externo.
7. O Anexo K pode ficar num `ARCHITECTURE.md` externo.

---

### K.8 Estado actual (V25)

- **Marcadores aplicados:** 23 (todos os blocos e anexos principais marcados).
- **Conteúdo clínico alterado:** nenhum.
- **Comportamento do agente:** idêntico ao V24.
- **Compatibilidade:** V25 funciona como monólito (tal como V24) e simultaneamente está pronta para separação por script.

Um script simples em Python (`split_by_markers.py`) pode, a partir desta V25, produzir os ficheiros separados para Nível 1 ou Nível 2. É o próximo passo técnico quando houver decisão de avançar.

---

<!-- ===== /META · Anexo K ===== -->

## FIM DO ANEXO K

---

## FIM DO DOCUMENTO

Versão 26.1 — Abril 2026
Autor: Dr. Roberto Homem de Gouveia
