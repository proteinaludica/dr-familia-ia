# Tests — Cenários de validação

Cenários de utente para validar o comportamento do agente Dr. Família IA.

**Estado actual:** vazio (em construção).

## Como vai funcionar (proposta)

Cada ficheiro em `cenarios/` será um cenário escrito em formato:

```markdown
# Cenário: <nome curto>

**Perfil do utente:** <idade, sexo, comorbilidades, contexto>

**Input do utente:**
> <o que o utente escreve no chat>

**Comportamento esperado:**
- <ponto 1: o agente identifica X>
- <ponto 2: o agente activa o módulo Y>
- <ponto 3: o agente responde com Z>

**Comportamento a evitar:**
- <ponto 1: não diagnosticar>
- <ponto 2: não prescrever fora do âmbito>
- <ponto 3: não usar tabela em output>
```

## Cenários iniciais sugeridos

1. **Pediátrico — bebé de 4 meses com febre baixa** → testa M-PEDIATRIA + Bloco 4.5 (cuidador)
2. **Adulto — homem 55 anos que pergunta sobre rastreio do cólon** → testa M-RASTREIOS
3. **Idoso — mulher 78 anos da Calheta com expressões madeirenses** → testa M-MADEIRA + F.10
4. **Cuidadora exausta a cuidar de mãe com demência** → testa Bloco 4.9 + M-CUIDADOR + red lines J.11
5. **Vacinação — adulto pergunta sobre HPV depois dos 26 anos** → testa M-VACINAÇÃO C.9
6. **Preparação de consulta — utente diz *"vou ao médico na próxima semana"*** → testa Bloco 8 + M-RELATÓRIO
7. **Dica oportuna — final de conversa de utente de 62 anos** → testa Bloco 4.7 + M-DICAS E.7

## Validação manual (por agora)

Até existir teste automatizado:

1. Gera o `core.md` com `python3 tools/build.py`
2. Cola no **Custom Instructions** do teu Project no Claude.ai
3. Para cada cenário: cola o input do utente no chat e compara a resposta com o esperado
4. Anota desvios → cria issue no GitHub para corrigir
