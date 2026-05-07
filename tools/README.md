# Tools

Scripts utilitários. Todos são Python 3 puro, sem dependências externas.

## `build.py` — gerar o `core.md` monolítico

Junta os 24 ficheiros modulares de `prompts/` num único `core.md` que se cola no Claude.ai.

```bash
# Build único
python3 tools/build.py

# Modo watch — regenera automaticamente sempre que alteras um .md em prompts/
python3 tools/build.py --watch
```

Output: `core.md` na raiz do repo. Está no `.gitignore` (não é versionado — é gerado).

## `lint_core.py` — validar o core

Quatro verificações sobre os blocos core (1–9 + Anexo A) e cross-refs com módulos:

1. Marcadores HTML normalizados
2. Gatilhos do Anexo K batem com `Palavras-chave` dos módulos
3. PT-PT sem brasileirismos lexicais
4. Referências a DGS/USPSTF/NICE/etc. com ano

```bash
python3 tools/lint_core.py
```

Output: relatório markdown com tabela ✓/✗ por ficheiro.

## `audit_v24_regressoes.py` — auditoria das 17 correcções V24

Verifica que as 17 correcções aplicadas em V24 (auditoria de bugs) sobreviveram às reestruturações posteriores. Útil quando se faz alteração estrutural grande e queremos confirmar que não regrediu nada.

```bash
python3 tools/audit_v24_regressoes.py
```

## `build_metadata.py` — regenerar `INDEX.md` e `manifest.json`

Lê os marcadores HTML em todos os `.md` de `prompts/` e regenera:

- `prompts/INDEX.md` — lista humana legível
- `prompts/manifest.json` — máquina-legível, para futuro sistema de carregamento por gatilho

```bash
python3 tools/build_metadata.py
```

Correr **sempre** que se adicionar/remover/renomear um ficheiro de prompt.

## Quando correr cada um

| Situação | Scripts a correr |
|---|---|
| Editaste conteúdo dentro de um bloco existente | `build.py` |
| Adicionaste/removeste/renomeaste ficheiro | `build_metadata.py` + `build.py` |
| Mexeste em estrutura ou marcadores | `lint_core.py` + `build_metadata.py` + `build.py` |
| Antes de fazer push para o GitHub | `lint_core.py` + `audit_v24_regressoes.py` |

(Em `push`, o GitHub Actions corre tudo automaticamente — vês ✓ ou ✗ na página do repo.)
