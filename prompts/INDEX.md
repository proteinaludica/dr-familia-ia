# ÍNDICE DOS MÓDULOS — Dr. Família IA

**Versão:** V27.1 · **Data:** 17/05/2026

Gerado automaticamente por `build_metadata.py`. Fonte de verdade: ficheiros `.md` modulares.

| # | Tipo | ID | Nome | ⚑ | Activação | Palavras-chave | Ficheiro |
|---|------|----|------|---|-----------|----------------|----------|
| 00 | META | — | Preâmbulo |  | sempre (cabeçalho) | — | `00_preambulo.md` |
| 01 | META | — | Changelog |  | — | — | `01_meta_changelog.md` |
| 02 | CORE | — | Bloco 1 — Identidade e Missão |  | — | — | `02_core_bloco_1_identidade_e_missao.md` |
| 03 | CORE | — | Bloco 2 — Segurança e Confidencialidade | ⚑ | — | — | `03_core_bloco_2_seguranca_e_confidencialidade.md` |
| 04 | CORE | — | Bloco 3 — Multilingue |  | — | — | `04_core_bloco_3_multilingue.md` |
| 05 | CORE | — | Bloco 4 — Comunicação (etiqueta, acessibilidade, TTS, cuidador, madeirense, dicas) |  | — | — | `05_core_bloco_4_comunicacao_etiqueta_acessibilidade_tts_cuidador_mad.md` |
| 06 | CORE | — | Bloco 5 — Onboarding e registo longitudinal |  | — | — | `06_core_bloco_5_onboarding_e_registo_longitudinal.md` |
| 08 | CORE | — | Bloco 7 — Red Lines | ⚑ | — | — | `08_core_bloco_7_red_lines.md` |
| 09 | CORE | — | Bloco 8 — Preparação de consulta (gatilhos pré e pós) |  | — | — | `09_core_bloco_8_preparacao_de_consulta_gatilhos_pre_e_pos.md` |
| 10 | CORE | — | Bloco 9 — Fecho |  | — | — | `10_core_bloco_9_fecho.md` |
| 11 | CORE | — | Anexo A — Precedência de regras |  | — | — | `11_core_anexo_a_precedencia_de_regras.md` |
| 12 | MÓDULO | M-VACINAÇÃO | Anexo B — PNV |  | tema de vacinação detectado no input | vacina, picadela, imunização, PNV… (+14) | `12_m-vacinacao_anexo_b_pnv.md` |
| 13 | MÓDULO | M-VACINAÇÃO | Anexo C — Guias detalhados (FAQ por vacina) |  | co-carregado com Anexo B (mesmo gatilho de M-VACINAÇÃO) | — | `13_m-vacinacao_anexo_c_guias_detalhados_faq_por_vacina.md` |
| 14 | META | — | Anexo D — Fontes e Referências |  | — | — | `14_meta_anexo_d_fontes_e_referencias.md` |
| 15 | MÓDULO | M-DICAS | Anexo E — Dicas por ciclo de vida |  | idade do utente conhecida E fim de conversa (ver Bloco 4.7) | — | `15_m-dicas_anexo_e_dicas_por_ciclo_de_vida.md` |
| 16 | MÓDULO | M-MADEIRA | Anexo F — Glossário madeirense de saúde |  | utente identificado como madeirense (RAM) ou termos regio… | cadeiras, desmentido, agastura, horário… (+9) | `16_m-madeira_anexo_f_glossario_madeirense_de_saude.md` |
| 17 | MÓDULO | M-RAM-RASTREIOS | Anexo G — Rastreios RAM |  | tema de rastreio/prevenção detectado no input | rastreio, prevenção, mamografia, Papanicolau… (+12) | `17_m-ram-rastreios_anexo_g_rastreios_ram.md` |
| 18 | MÓDULO | M-PEDIATRIA | Anexo H — PNSIJ (18 consultas-chave + conteúdos transversais) |  | utente <18 anos OU temas pediátricos/maternos detectados … | criança, bebé, filho, filha… (+19) | `18_m-pediatria_anexo_h_pnsij_18_consultas_chave_conteudos_transversais.md` |
| 19 | MÓDULO | M-RELATÓRIO | Anexo I — Modelo do Output 1 do Bloco 8 |  | gatilho pré-consulta do Bloco 8 activado (ver Bloco 8.2) | — | `19_m-relatorio_anexo_i_modelo_do_output_1_do_bloco_8.md` |
| 20 | MÓDULO | M-CUIDADOR | Anexo J — Auto-cuidado do cuidador |  | Bloco 4.5 (modo cuidador-intermediário) ou Bloco 4.9 (mod… | cuidador, cuidadora, tomo conta, cuido de… (+12) | `20_m-cuidador_anexo_j_auto_cuidado_do_cuidador.md` |
| 21 | META | — | Anexo K — Mapa arquitectural (core e módulos) |  | — | — | `21_meta_anexo_k_mapa_arquitectural_core_e_modulos.md` |
| 22 | META | — | Validador de derivação (V1.3) |  | — | — | `22_meta_validador_de_derivacao_v1_3.md` |
| 23 | MÓDULO | M-AÇORES | Anexo F (regional açoriano) — Glossário açoriano de saúde |  | utente identificado como açoriano (RAA) ou termos regionais açorianos detectados no input | bera, aluado, ramo, caboco, picarôto, calhau, andaço, maleita, mareado, engasgado, fajã, mistério, curral, bagacina, Vossemecê… (+15) | `23_m-acores_anexo_f_glossario_acoriano_de_saude.md` |
| 24 | MÓDULO | M-CLINICA | Anexo L — Clínica geral (saúde mental + patologias crónicas DGS + saúde da grávida) |  | tema clínico detectado: saúde mental, HTA, DM, DPOC, dislipidémia, obesidade, osteoporose, gravidez, pré-concepção, puerpério | depressão, ansiedade, insónia, tensão alta, diabetes, colesterol, grávida, pré-concepção, puerpério, amamentação… (+expansão futura) | `24_m-clinica_anexo_l_clinica_geral.md` |

---

## Notas de V27.1

- **Bloco 6 (Saúde Mental via Sono)** foi reorganizado como **M-CLINICA, secção L.1** — módulo agregador para conteúdo clínico (saúde mental + patologias crónicas DGS).
- **Lacuna no número 07** preservada intencionalmente (ficheiro do Bloco 6 removido; restantes números do core mantidos para não afectar scripts).
- **Soberanos** (⚑): Bloco 2 (Segurança) e Bloco 7 (Red Lines) prevalecem sobre qualquer outra regra.
- **Carregamento opcional:** `01_meta_changelog.md`, `14_meta_anexo_d_fontes_e_referencias.md`, `21_meta_anexo_k_mapa_arquitectural_core_e_modulos.md`.
- **Cross-references inter-módulos:** ver Anexo K para a matriz completa.
- **Hierarquia de precedência:** ver Anexo A (V27.1 reescrito com 9 níveis e 4 regras de resolução de conflitos).
