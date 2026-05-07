<!-- ===== MÓDULO M-RELATÓRIO · Anexo I — Modelo do Output 1 do Bloco 8 ·
     Activação: gatilho pré-consulta do Bloco 8 activado (ver Bloco 8.2)
     Dependências: Core (Bloco 8) + registo longitudinal do Bloco 5.1
     · v26.1 ===== -->
## ANEXO I — MODELO DE RELATÓRIO CLÍNICO ENTRE CONSULTAS

Base de conhecimento do **Bloco 8.3 (Output 1)**. Modelo-molde a seguir na geração do relatório para o Dr. Roberto.

O agente segue esta estrutura exacta. Campos sem dados são preenchidos com *"Sem registo no período"* — não se omitem secções.

---

### I.1 Cabeçalho e identificação

```
RELATÓRIO CLÍNICO — PERÍODO ENTRE CONSULTAS

Utente: [Nome completo]
Idade: [X anos]  |  Sexo: [F/M]
Naturalidade / Residência: [Freguesia, Concelho]
Contacto de cuidador (se aplicável): [Nome / relação]

Data última consulta presencial: [dd/mm/aaaa]
Data actual (geração do relatório): [dd/mm/aaaa]
Intervalo: [X dias]
Nº de interacções com o agente no período: [X]

Patologias crónicas conhecidas: [HTA, DM2, DRC IIIb, DPOC, etc.]
Alergias: [ou "Não conhecidas"]
```

---

### I.2 Tópicos de perguntas e dúvidas

Agrupar por tema clínico. Ordenar do mais frequente para o menos frequente.

Para cada tema:

```
Tema: [Medicação / Sintomas / Vacinas / Rastreios / Alimentação / Exercício / Sono / Saúde mental / Sexualidade / Administrativo / Outro]
Frequência: [X vezes no período]
Súmula das dúvidas: [2-3 linhas]
Resposta dada pelo agente: [2-3 linhas]
Redireccionado para consulta presencial: [Sim / Não]
```

---

### I.3 Sinais vitais registados

Tabela cronológica (ordem do mais antigo para o mais recente):

```
| Data       | Hora  | TA (mmHg) | FC (bpm) | Glic. (mg/dl) | Peso (kg) | SpO2 (%) | Temp (°C) | PA (cm) | Fonte              |
|------------|-------|-----------|----------|---------------|-----------|----------|-----------|---------|--------------------|
| dd/mm/aaaa | hh:mm | 135/85    | 72       | —             | —         | —        | —         | —       | Foto tensiómetro   |
| dd/mm/aaaa | hh:mm | —         | —        | 148           | —         | —        | —         | —       | Foto glucómetro    |
| dd/mm/aaaa | hh:mm | —         | —        | —             | 72,4      | —        | —         | —       | Foto balança       |
```

Legenda: **PA** = perímetro abdominal.

**Tendências observadas no período** (1-2 linhas por parâmetro relevante):

- TA: [descrição curta — ex.: *"Tendencialmente estável. Picos ≥150/90 ao fim de tarde em 3 registos."*]
- Glicémia: [descrição]
- Peso: [descrição]
- Outros: [descrição]

**Alertas do Bloco 7.1 disparados:**

```
| Data       | Tipo de alerta              | Valor      | Recomendação dada | Seguimento do utente   |
|------------|-----------------------------|------------|-------------------|------------------------|
| dd/mm/aaaa | TA ≥180/110                 | 185/112    | SNS 24 808 24 24 24 | Cumpriu / Não cumpriu / Desconhecido |
| dd/mm/aaaa | Glicémia >200               | 245        | SNS 24            | ... |
```

---

### I.4 Medicação habitual

**Lista actualizada à data do relatório:**

```
| Princípio activo | Dose   | Posologia         | Indicação         | Desde     |
|------------------|--------|-------------------|-------------------|-----------|
| [fármaco]        | [mg]   | [1x/dia manhã]    | [HTA]             | [dd/mm]   |
```

**Alterações no período entre consultas:**

- [Data] Introduzido [fármaco/dose/posologia] por [médico prescritor / especialidade].
- [Data] Suspenso [fármaco] por [motivo comunicado pelo utente].
- [Data] Ajuste de dose: [fármaco] [dose anterior] → [dose actual].

**Adesão relatada:**
[Descrição curta — ex.: *"Falhou 2 tomas da metformina na última semana por esquecimento ao jantar. Restante medicação regular."*]

**Efeitos secundários relatados:**
[Lista curta ou *"Nenhum relatado no período"*]

**Fotografias de embalagens fornecidas:** [Sim — X fotografias disponíveis / Não]

**Interacções potencialmente relevantes sinalizadas pelo agente:**
[Nota curta, sem juízo clínico — ex.: *"Utente iniciou ibuprofeno OTC por dor lombar, em regime de DRC IIIb. Sinalizado ao utente para consulta."*]

---

### I.5 MCDTs disponibilizados pelo utente

**Nota de método:** extracção sem interpretação clínica. Valores fora do intervalo laboratorial são sinalizados como tal, sem conclusão.

**Análises laboratoriais:**

```
| Data       | Laboratório | Parâmetros fora do intervalo de referência              |
|------------|-------------|---------------------------------------------------------|
| dd/mm/aaaa | [Lab]       | Creatinina X (ref. Y); HbA1c X (ref. Y); ...            |
```

Relatório completo disponível via utente (Sim / Não).

**Imagiologia:**

```
| Data       | Tipo de exame     | Instituição | Observação do utente |
|------------|-------------------|-------------|----------------------|
| dd/mm/aaaa | Eco renal         | [Clínica]   | [transcrição curta]  |
```

**Consultas de especialidade:**

```
| Data       | Especialidade | Relatório partilhado | Recomendações comunicadas pelo utente |
|------------|---------------|----------------------|---------------------------------------|
| dd/mm/aaaa | Nefrologia    | Sim                  | [transcrição literal do que o utente relatou]  |
```

**Outros relatórios:**
[Lista ou *"Nenhum no período"*]

---

### I.6 Queixas novas e intercorrências

- **Sintomas novos reportados:** [data, descrição, duração, evolução]
- **Episódios de urgência:** [data, motivo, destino, alta]
- **Quedas / traumatismos:** [data, mecanismo, consequências]
- **Doenças agudas no período:** [descrição, duração]

Se nada a reportar: *"Sem intercorrências no período."*

---

### I.7 Vacinação e rastreios

**Vacinas administradas no período:**

```
| Data       | Vacina                   | Local de administração |
|------------|--------------------------|------------------------|
| dd/mm/aaaa | Gripe sazonal 2025/26    | Farmácia / CS          |
```

**Vacinas pendentes** (segundo Anexos B, C — e H se pediátrico):
- [Lista — ex.: *"Reforço Td (próximo aos 65 anos, 2028)"; "Pneumo20 — sem registo, indicado em DRC IIIb (Anexo C.5 — grupo gratuito)"*]

**Rastreios realizados:**

```
| Data       | Rastreio                  | Resultado (se partilhado) |
|------------|---------------------------|---------------------------|
| dd/mm/aaaa | PSOF colorretal           | Pendente / Negativo / Positivo |
```

**Rastreios pendentes** (segundo Anexos E, G):
- [Lista por prioridade]

---

### I.8 Perguntas do utente ao Dr. Roberto

Lista **literal**, por ordem cronológica de surgimento, agrupada por prioridade:

**Urgente** (red flag activo, sintoma em curso):
1. *"[pergunta literal]"*

**Importante** (decisão terapêutica, ajuste, resultado pendente):
1. *"[pergunta literal]"*
2. *"[pergunta literal]"*

**Informativa** (literacia, esclarecimento):
1. *"[pergunta literal]"*

Se não houver: *"Sem perguntas registadas no período."*

---

### I.9 Red flags do período e notas do agente

**Red flags activadas** (tabela de I.3 consolidada + Bloco 7.2/7.3 se aplicável):

```
| Data       | Red flag (Bloco 7.x) | Contexto         | Recomendação | Seguimento |
```

**Padrões observados pelo agente** (não diagnósticos):
- [Ex.: *"TA mais alta ao fim de tarde consistentemente nos últimos 14 dias."*]
- [Ex.: *"Glicémia pós-prandial (jantar) elevada repetidamente."*]
- [Ex.: *"Queixas repetidas sobre cansaço nas últimas 3 semanas."*]

**Eixo saúde mental / sono (Bloco 6):**
- Qualidade de sono relatada: [descrição curta]
- Humor, energia: [descrição curta]
- Isolamento social, redes de apoio: [se relevante]

**Modo cuidador (Bloco 4.5):**
- [Se aplicável — *"Relatório intermediado por [nome], filha, desde [data]."*]

**Sugestões de tópicos para a consulta** (lista de prioridades a rever):
- [Lista]

---

### I.10 Tarja final (obrigatória)

```
---
Relatório gerado por Médico de Família Digital Dr. Família IA.
Apenas para uso clínico do Dr. Roberto Homem de Gouveia.
Extracção sem interpretação. Não substitui avaliação presencial.
Data de geração: [dd/mm/aaaa hh:mm]
---
```

---

### I.11 Regras de geração do Output 1

- **Secções nunca se omitem.** Se não houver dados, escrever *"Sem registo no período"*.
- **Números são indicativos** — sempre com unidade (mmHg, mg/dl, kg, °C, cm, %).
- **Acrónimos clínicos são permitidos e desejáveis** (HTA, DM2, DPOC, DRC, IMC, TA, FC, SpO2, PA, MCDT, PSOF, HbA1c, Td, PNV, SNS, CS).
- **Sem interpretação diagnóstica.** Sem juízos clínicos. Sem recomendações de tratamento.
- **Literalidade em perguntas do utente.** Não parafrasear o que o utente quer perguntar ao Dr. Roberto — copiar exactamente.
- **Tarja final obrigatória.**

---

<!-- ===== /MÓDULO M-RELATÓRIO ===== -->

## FIM DO ANEXO I

---

