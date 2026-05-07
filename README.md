# Dr. Família IA

> **System prompt** modular para um agente de Médico de Família Digital, em **Português Europeu (PT-PT)**, com adaptações ao contexto da **Região Autónoma da Madeira (RAM)**.

[![Versão](https://img.shields.io/badge/versão-V26.1-blue)](./prompts/01_meta_changelog.md)
[![Licença](https://img.shields.io/badge/licença-CC--BY--NC--SA%204.0-green)](./LICENSE)
[![Linguagem](https://img.shields.io/badge/PT--PT-📍-yellow)]()

---

## O que é

O **Dr. Família IA** é o *system prompt* de um agente conversacional para apoiar utentes **entre consultas** com o seu médico de família. **Não substitui consulta nem prescreve** — apoia literacia em saúde, prepara consultas, lembra rastreios, e responde a dúvidas frequentes em registo acessível.

**Âmbito explícito:** entre-consultas, não consultório.

Funcionalidades principais:

- **Vacinação** (PNV + extra-PNV) com guias detalhados por vacina
- **Rastreios oncológicos e crónicos** organizados na RAM (SESARAM)
- **PNSIJ pediátrico** — 18 consultas-chave do nascimento aos 18 anos
- **Apoio ao cuidador** — auto-cuidado físico, emocional, social
- **Glossário madeirense** clínico, com avisos de ambiguidade crítica
- **Preparação de consultas** com geração de relatório clínico para o utente levar
- **Modo cuidador** — quando uma terceira pessoa fala pelo utente

## Arquitectura

Modular, com 1 preâmbulo + 9 blocos **core** + 11 anexos (alguns são módulos carregados sob gatilho, outros são meta-documentação).

```
prompts/
├── 00_preambulo.md                    ← cabeçalho do projecto, sempre primeiro
├── 01_meta_changelog.md               ← histórico de versões
├── 02_core_bloco_1_… até bloco_9      ← núcleo sempre presente (~650 linhas)
├── 11_core_anexo_a_…                  ← regras de precedência
├── 12 a 20_m-…                        ← módulos clínicos (vacinação, pediatria, etc.)
└── 21_meta_anexo_k_…                  ← mapa arquitectural
```

Detalhe completo em [`docs/arquitectura.md`](./docs/arquitectura.md) e [`prompts/21_meta_anexo_k_mapa_arquitectural_core_e_modulos.md`](./prompts/21_meta_anexo_k_mapa_arquitectural_core_e_modulos.md).

## Como usar

### Em Claude.ai (recomendado)

1. Cria um **Project** no Claude.ai
2. Carrega os ficheiros da pasta `prompts/` para o **Project Knowledge**
3. Em **Custom Instructions**, cola o conteúdo do **`core.md`** monolítico (gerado por `tools/build.py`)
4. Conversa no Project — o agente herdará a personalidade do Dr. Família IA

### Geração do `core.md` monolítico

```bash
python3 tools/build.py
```

Resultado: `core.md` (concatenação ordenada dos 24 ficheiros modulares).

### Validação do prompt

```bash
python3 tools/lint_core.py             # 4 lints: marcadores, gatilhos, PT-PT, referências
python3 tools/audit_v24_regressoes.py  # confirma que correcções V24 não regrediram
python3 tools/build_metadata.py        # regenera INDEX.md e manifest.json
```

## Princípios de design

- **Soberanos:** Bloco 2 (Segurança e Confidencialidade) e Bloco 7 (Red Lines) prevalecem sobre tudo.
- **Não diagnostica nem prescreve** — excepção única: paracetamol em dose padrão.
- **Acessibilidade por TTS** — nada de tabelas em outputs ao utente, números por extenso quando relevante.
- **Tratamento adequado** — formal a partir dos 20 anos, informal abaixo.
- **Etiqueta madeirense** — "Senhora", "Senhor"; nunca "Dona" sozinho.

## Estrutura do repositório

```
.
├── prompts/             # 24 ficheiros .md modulares + INDEX + manifest
├── tools/               # scripts de build, lint e auditoria
├── docs/                # arquitectura e meta-documentação
├── tests/               # cenários de teste (em construção)
└── .github/workflows/   # GitHub Actions — corre os lints em cada push
```

## Estado actual

- **Versão:** V26.1 *(em desenvolvimento — ver changelog para detalhe)*
- **Validação:** Sprint 0 fechado em 07/05/2026 — zero regressões das 17 correcções V24
- **Próximo:** revisão de conteúdo bloco a bloco (Fase 3A)

## Contribuir

Contribuições são bem-vindas, mas:

- Mantém PT-PT estrito (sem brasileirismos)
- Mantém o registo *médico-para-utente* nos módulos clínicos e *interno* nos blocos do core
- Antes de submeter: corre `python3 tools/lint_core.py` localmente
- Cita sempre fontes (DGS, USPSTF, NICE, sociedades europeias) com ano

## Licença

[CC BY-NC-SA 4.0](./LICENSE) — uso livre desde que **atribuído**, **não comercial sem licença escrita do autor**, partilha com a mesma licença.

Para uso comercial, contactar o autor.

## Autor

**Dr. Roberto Homem de Gouveia**
Médico de Família · Região Autónoma da Madeira

---

> Este projecto não é um produto médico certificado. É uma ferramenta de apoio à literacia em saúde. Em emergências, contactar 112 ou o SNS 24 (808 24 24 24).
