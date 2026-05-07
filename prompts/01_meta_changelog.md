<!-- ===== META · Changelog · Carregamento: opcional (histórico) · v26.1 ===== -->
# CHANGELOG — Médico de Família Digital Dr. Família IA

> Histórico de versões. Carregamento opcional — não é necessário em conversa com utente.
> A versão activa está sempre no `00_preambulo.md`.

---

## V26.1 — 07/05/2026 *(actual)*

**Tema:** rebrand + estabilização pós-V25.

- **Rebrand:** *"Médico de Família Digital Dr. Robert IA"* → *"Médico de Família Digital Dr. Família IA"*.
- *(a preencher: outras mudanças desta linha de versão)*

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

## V24 — 22/04/2026

**Tema:** auditoria de bugs e correcções dirigidas.

Auditoria integral à V23.0; 17 itens identificados (B1–B17), sem mudança de funcionalidade nem expansão de âmbito.

### Correcções aplicadas

**Referências cruzadas (Anexo H ↔ Anexo C/I/J):**
- **B1** · 4 referências quebradas ao Anexo C dentro do Anexo H corrigidas (H.8 varicela inexistente; H.10 e H.12 — `C.3` → `C.1`; H.18 meningite ACWY inexistente).
- **B11** · Bloco 8.3 — clarificação: o Anexo I tem 11 entradas (9 de conteúdo + 2 meta — tarja e regras de geração), em vez de "9 secções fixas".
- **B12** · Anexo J.6 — reordenação das referências cruzadas para ordem coerente: VSR (C.3), zona (C.4), pneumonia (C.5).

**Coerência factual e clínica:**
- **B3** · Anexo B.1 — vacina HPV em rapazes: *"desde dois mil e vinte (nascidos a partir de dois mil e nove)"* em vez de *"desde dois mil e nove"*.
- **B10** · Anexo H.9 — descrição da vacina dos 18 meses reescrita de forma coerente com B.1 (eliminada formulação confusa *"Hib + tetravalente"*).

**Coerência de regras internas (4.3 vs 4.7, registo formal, TTS):**
- **B2** · Bloco 4.3 — expressão *"já agora"* removida da lista de proibições; é formulação preferida em 4.7.
- **B5** · Anexo G — duas ocorrências de *"fala com o Dr. Roberto"* substituídas por *"fale com o Dr. Roberto"* (registo formal coerente com Bloco 4.2).
- **B9** · Símbolos `≥` e `≤` em texto dirigido ao utente (H.25 e J.11) substituídos por palavras (*"igual ou superior a"*). Mantidos em 7.1 e 7.2 — registo interno do prompt para o agente, não output ao utente.

**Tipografia e títulos:**
- **B4** · Bloco 2.1 — typo *"RRCCI"* → *"RNCCI"*.
- **B7** · Título do Anexo C: *"VACINAS FORA DO PLANO NACIONAL"* → *"GUIAS DETALHADOS POR VACINA"* (corrige a inexactidão: C.1 e C.2 cobrem gripe e COVID, dentro do PNV para grupos de risco).
- **B8** · Anexo F.10 — typo *"no dúvida"* → *"na dúvida"*.
- **B17** · Anexo H.19 — título reformulado para *"Curvas de crescimento, rastreios de visão, audição e dislipidémias"* (passa a reflectir o conteúdo integral, em vez de só *"Curvas de crescimento OMS"*).

**Glossário madeirense (Anexo F):**
- **B6** · F.8 — adicionada nota de ambiguidade crítica para *"Desistir"*: vocabulário antigo = defecar; português padrão = abandonar propósito. Instrução de nunca assumir o significado.
- **B14** · *"Azoado"* deduplicado entre F.2 e F.4 (uma única entrada).
- **B15** · Variantes fonéticas *"Emantado / Imantado"* (F.4) consolidadas numa entrada única.

### Não-bugs (decisões em aberto, registadas)

- **B13** · Tabelas internas em 4.1 e F.10 — tensão estilística com regra 4.4 (evitar tabelas). Mantidas — são internas ao prompt, não outputs ao utente.
- **B16** · *"Seixal"* ambíguo (Bloco 2.1 referência ao concelho continental vs Bloco 4.8 referência cultural à freguesia do Porto Moniz). Não quebra funcionalidade.

### Validação posterior

Auditoria de regressões realizada em **07/05/2026** após reestruturação arquitectural V25 (modularização) e V26.1 (limpeza estrutural): **zero regressões** — todos os 17 itens preservados nos ficheiros modulares.

---

## Versões anteriores (V23 e antes)

*(histórico não migrado para este ficheiro)*

---

## Convenções deste changelog

- **Formato de versão:** `Vmajor.minor` (ex.: V26.1).
- **Bump major (+1):** mudança arquitectural ou rebrand.
- **Bump minor (+0.x):** correcções, ajustes de conteúdo, novos anexos sem alterar arquitectura.
- **Cada entrada deve listar:** tema da versão, mudanças por bloco/anexo, e (quando aplicável) ficheiros tocados.

<!-- ===== /META · Changelog ===== -->
