# Dr. Família IA

> **System prompt** modular para um agente de Médico de Família Digital, em **Português Europeu (PT-PT)**, com adaptações regionais.

[![Versão](https://img.shields.io/badge/versão-V27.0-blue)](prompts/01_meta_changelog.md) [![Licença](https://img.shields.io/badge/licença-CC--BY--NC--SA%204.0-green)](LICENSE) [![Linguagem](https://img.shields.io/badge/PT--PT-📍-yellow)](#)

---

## O que é

O Dr. Família IA é um sistema clínico digital concebido para apoiar utentes no intervalo entre consultas presenciais com o seu médico de família. Esclarece dúvidas sobre o plano clínico definido em consulta, organiza calendários de vacinação, rastreios e vigilância, e prepara o utente para a próxima consulta.

O sistema opera sempre sob supervisão clínica do médico que licencia a instância. Não substitui a consulta presencial, não emite diagnósticos e não prescreve medicação — com uma única excepção tipificada: paracetamol em dose padrão para o adulto.

**Âmbito explícito:** entre-consultas, não actividade ambulatória.

Funcionalidades principais:

- **Vacinação** (PNV e extra-PNV) com guias detalhados por vacina
- **Rastreios oncológicos e crónicos** com adaptação regional
- **PNSIJ pediátrico** — 18 consultas-chave do nascimento aos 18 anos
- **Apoio ao cuidador informal** — auto-cuidado físico, emocional e social
- **Glossários regionais clínicos** com avisos de ambiguidade crítica
- **Preparação de consultas** com geração de relatório clínico para o utente
- **Modo cuidador** — adaptação quando uma terceira pessoa fala pelo utente

---

## Arquitectura

Estrutura em três camadas:

- **Núcleo clínico:** 9 blocos fixos e auditáveis (sempre presentes)
- **Anexos temáticos transversais:** módulos partilháveis (vacinação, pediatria, rastreios, cuidador, ciclo de vida, fontes, etc.)
- **Anexos regionais:** específicos por região (Madeira, Açores), extensíveis a outras

```
prompts/
├── 00_preambulo.md
├── 01_meta_changelog.md
├── 02–10  → blocos do núcleo clínico
├── 11     → anexo de precedência de regras
├── 12–20  → módulos temáticos e regionais
└── 21     → mapa arquitectural
```

Descrição detalhada em `prompts/21_meta_anexo_k_mapa_arquitectural_core_e_modulos.md`.

---

## Como usar em Claude.ai

1. Criar um Project no Claude.ai
2. Carregar os ficheiros da pasta `prompts/` para o Project Knowledge
3. Em Custom Instructions, colar o conteúdo do `core.md` monolítico gerado por `tools/build.py`
4. Conversar dentro do Project — o agente herdará a personalidade configurada para a derivação específica

---

## Geração e validação

Gerar o `core.md` monolítico a partir dos módulos:

```
python3 tools/build.py
```

Validação estrutural:

```
python3 tools/lint_core.py             # marcadores, gatilhos, PT-PT, referências
python3 tools/build_metadata.py        # regenera INDEX.md e manifest.json
```

---

## Princípios de design

- **Soberanos:** Bloco 2 (Segurança e Confidencialidade) e Bloco 7 (Red Lines) prevalecem sobre todo o restante conteúdo.
- **Não diagnostica nem prescreve** — excepção única: paracetamol em dose padrão para o adulto.
- **Acessibilidade por TTS** — sem tabelas em outputs ao utente; números por extenso quando relevante.
- **Tratamento adequado** — formal a partir dos 20 anos, informal abaixo.
- **Etiqueta regional** — saudações e formas de tratamento adaptadas ao contexto.

---

## Estrutura do repositório

```
.
├── prompts/             # ficheiros modulares + INDEX + manifest
├── tools/               # scripts de build, lint e auditoria
├── tests/               # cenários de teste (em construção)
├── .github/workflows/   # lint automático em cada push
├── index.html           # landing page pública
├── LICENSE              # CC-BY-NC-SA 4.0
└── README.md            # este ficheiro
```

---

## Estado actual

- **Versão:** V27.0
- **Estado:** em desenvolvimento activo
- **Validação:** lints estruturais limpos; zero regressões verificadas

---

## Licença

[CC BY-NC-SA 4.0](LICENSE) — uso livre desde que atribuído, partilha com a mesma licença.

---

## Contacto

`info@proteinaludica.com`

---

> Este projecto não é um produto médico certificado. É uma ferramenta de apoio à literacia em saúde do utente, operada sob responsabilidade clínica do médico que licencia a instância. Em situações de urgência ou emergência, contactar o 112 ou o SNS 24 (808 24 24 24).
