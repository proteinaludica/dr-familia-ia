#!/usr/bin/env python3
"""
audit_v24_regressoes.py — Verifica se as 17 correcções V24 sobreviveram a V25 (modularização)
e V26.1 (limpeza estrutural).

Cada bug Bn é testado por 1+ asserções:
  - POS: string que tem de existir (estado corrigido)
  - NEG: string que não pode existir (estado regredido)
  - STR: lógica estrutural (contagem, ordem)

Output: tabela markdown ✓ / ✗ / ⚠ + diagnóstico por bug.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent / "prompts"

# Mapa rápido de ficheiros por nome curto
F = {
    "B2": ROOT / "03_core_bloco_2_seguranca_e_confidencialidade.md",
    "B4": ROOT / "05_core_bloco_4_comunicacao_etiqueta_acessibilidade_tts_cuidador_mad.md",
    "B7": ROOT / "08_core_bloco_7_red_lines.md",
    "B8": ROOT / "09_core_bloco_8_preparacao_de_consulta_gatilhos_pre_e_pos.md",
    "ANX_B": ROOT / "12_m-vacinacao_anexo_b_pnv.md",
    "ANX_C": ROOT / "13_m-vacinacao_anexo_c_guias_detalhados_faq_por_vacina.md",
    "ANX_F": ROOT / "16_m-madeira_anexo_f_glossario_madeirense_de_saude.md",
    "ANX_G": ROOT / "17_m-rastreios_anexo_g_rastreios_ram.md",
    "ANX_H": ROOT / "18_m-pediatria_anexo_h_pnsij_18_consultas_chave_conteudos_transversais.md",
    "ANX_J": ROOT / "20_m-cuidador_anexo_j_auto_cuidado_do_cuidador.md",
}

# Cache de leituras
_cache = {}
def read(key):
    if key not in _cache:
        _cache[key] = F[key].read_text(encoding="utf-8")
    return _cache[key]

def has(key, s):
    return s in read(key)

def count(key, s):
    return read(key).count(s)

def find_in(key, regex):
    return re.findall(regex, read(key))


# =============================================================================
# Bateria de testes
# =============================================================================
results = []

# -----------------------------------------------------------------------------
# B1 — referências quebradas ao Anexo C dentro do H
# Após correcção: H.8 sem varicela em "Anexo C", H.10/H.12 referem "C.1" (gripe),
# H.18 sem meningite ACWY no Anexo C.
# Heurística: contar referências a "Anexo C" no H. Tem de haver pelo menos uma
# referência a C.1 (gripe pediátrica) e nenhuma referência a "varicela" + "Anexo C"
# no mesmo parágrafo. Faço busca grosseira.
# -----------------------------------------------------------------------------
h = read("ANX_H")
b1_neg_varicela = bool(re.search(r"varicela[^.]{0,80}Anexo C", h, re.IGNORECASE))
b1_neg_acwy = bool(re.search(r"meningite ACWY[^.]{0,80}Anexo C", h, re.IGNORECASE))
b1_pos_c1 = bool(re.search(r"Anexo C\.1|C\.1\b", h))
status = "✓" if (not b1_neg_varicela and not b1_neg_acwy and b1_pos_c1) else "✗"
results.append(("B1", status, "ref Anexo C no H",
    f"varicela+C={b1_neg_varicela} | ACWY+C={b1_neg_acwy} | C.1 presente={b1_pos_c1}"))

# -----------------------------------------------------------------------------
# B2 — "já agora" não pode aparecer numa lista de proibições no Bloco 4
# -----------------------------------------------------------------------------
b4 = read("B4")
# Procurar contexto de proibição perto de "já agora"
b2_problem = False
for m in re.finditer(r"já agora", b4, re.IGNORECASE):
    janela = b4[max(0, m.start()-200):m.end()+50]
    if re.search(r"(proib|evit|nunca|não dizer|não usar)", janela, re.IGNORECASE):
        # Verificar se não é a contradição que estávamos a resolver
        # Se aparecer "evitar" ou "proibido" antes do "já agora" → suspeita
        b2_problem = True
        break
status = "⚠" if b2_problem else "✓"
results.append(("B2", status, "'já agora' fora de proibição",
    "regressão suspeita" if b2_problem else "OK"))

# -----------------------------------------------------------------------------
# B3 — HPV rapazes: "nascidos a partir de 2009" deve aparecer no Anexo B
# -----------------------------------------------------------------------------
ab = read("ANX_B")
b3_pos = "nascidos a partir de 2009" in ab or "rapazes a partir de 2020" in ab
b3_neg = bool(re.search(r"HPV[^.]{0,150}rapazes[^.]{0,80}desde 2009", ab))
status = "✓" if (b3_pos and not b3_neg) else "✗"
results.append(("B3", status, "HPV rapazes 2020 não 2009",
    f"pos={b3_pos} | neg={b3_neg}"))

# -----------------------------------------------------------------------------
# B4 — "RRCCI" → "RNCCI"
# -----------------------------------------------------------------------------
b2c = read("B2")
b4_pos = "RNCCI" in b2c
b4_neg = "RRCCI" in b2c
status = "✓" if (b4_pos and not b4_neg) else "✗"
results.append(("B4", status, "RRCCI→RNCCI", f"RNCCI={b4_pos} | RRCCI={b4_neg}"))

# -----------------------------------------------------------------------------
# B5 — Anexo G: "fale" não "fala"
# -----------------------------------------------------------------------------
ag = read("ANX_G")
b5_neg = count("ANX_G", "fala com o Dr. Roberto")
b5_pos = count("ANX_G", "fale com o Dr. Roberto")
status = "✓" if (b5_neg == 0 and b5_pos >= 1) else "✗"
results.append(("B5", status, "tratamento formal Anexo G",
    f"'fala'={b5_neg} (deve ser 0) | 'fale'={b5_pos} (≥1)"))

# -----------------------------------------------------------------------------
# B6 — "Desistir" com nota de ambiguidade crítica em F.8
# -----------------------------------------------------------------------------
af = read("ANX_F")
b6_pos = bool(re.search(r"Desistir.{0,500}(ambig|nunca assumir|risco interpretativo|defecar)",
                        af, re.IGNORECASE | re.DOTALL))
status = "✓" if b6_pos else "✗"
results.append(("B6", status, "Desistir/ambiguidade em F",
    f"nota presente={b6_pos}"))

# -----------------------------------------------------------------------------
# B7 — Título Anexo C: NÃO "VACINAS FORA DO PLANO NACIONAL", SIM novo título
# -----------------------------------------------------------------------------
ac = read("ANX_C")
b7_neg = "FORA DO PLANO NACIONAL" in ac.upper() or "FORA DO PNV" in ac.upper()
b7_pos = ("GUIAS DETALHADOS" in ac.upper()) or ("FAQ" in ac.upper() and "VACINA" in ac.upper())
status = "✓" if (not b7_neg and b7_pos) else "✗"
results.append(("B7", status, "Título Anexo C corrigido",
    f"título antigo={b7_neg} | título novo={b7_pos}"))

# -----------------------------------------------------------------------------
# B8 — "no dúvida" → "na dúvida" em F
# -----------------------------------------------------------------------------
b8_neg = "no dúvida" in af
b8_pos = "na dúvida" in af
status = "✓" if (not b8_neg and b8_pos) else "✗"
results.append(("B8", status, "'na dúvida' em F", f"'no dúvida'={b8_neg} | 'na dúvida'={b8_pos}"))

# -----------------------------------------------------------------------------
# B9 — Símbolos ≥/≤ em texto ao utente: NÃO em H.25/J.11; OK em B7 (Red Lines)
# -----------------------------------------------------------------------------
ge_le_h = "≥" in h or "≤" in h
ge_le_j = "≥" in read("ANX_J") or "≤" in read("ANX_J")
# Dedicado a H.25 e J.11 — busca aproximada
def has_ge_le_near(text, marker):
    idx = text.find(marker)
    if idx < 0:
        return False
    return ("≥" in text[idx:idx+3000]) or ("≤" in text[idx:idx+3000])
b9_h25 = has_ge_le_near(h, "H.25") if "H.25" in h else ge_le_h
b9_j11 = has_ge_le_near(read("ANX_J"), "J.11") if "J.11" in read("ANX_J") else ge_le_j
status = "✓" if (not b9_h25 and not b9_j11) else "✗"
results.append(("B9", status, "≥/≤ fora de H.25 e J.11",
    f"H={b9_h25} | J={b9_j11}"))

# -----------------------------------------------------------------------------
# B10 — H.9 não deve dizer "Hib + tetravalente"
# -----------------------------------------------------------------------------
b10_neg = "Hib + tetravalente" in h
b10_pos = ("cinco doenças" in h) or ("pentavalente" in h.lower())
status = "✓" if (not b10_neg and b10_pos) else "✗"
results.append(("B10", status, "H.9 vacina 18m coerente",
    f"'Hib+tetra'={b10_neg} | descrição correcta={b10_pos}"))

# -----------------------------------------------------------------------------
# B11 — Bloco 8.3: ou diz "11 secções" ou clarifica relação 9 conteúdo + 2 meta
# -----------------------------------------------------------------------------
b8m = read("B8")
b11_problem = bool(re.search(r"nove secções fixas|9 secções fixas", b8m, re.IGNORECASE))
b11_ok = bool(re.search(r"onze secções|11 secções|nove secções de conteúdo", b8m, re.IGNORECASE))
status = "✓" if (not b11_problem or b11_ok) else "✗"
results.append(("B11", status, "8.3 contagem secções",
    f"'nove secções fixas'={b11_problem} | clarificação={b11_ok}"))

# -----------------------------------------------------------------------------
# B12 — J.6: ordem dos nomes "VSR, zona, pneumonia" + "C.3, C.4, C.5"
# -----------------------------------------------------------------------------
aj = read("ANX_J")
b12_old = "pneumonia, zona e VSR" in aj
b12_new = bool(re.search(r"VSR.{0,30}zona.{0,30}pneumonia", aj))
status = "✓" if (not b12_old and (b12_new or "C.3, C.4, C.5" in aj)) else "✗"
results.append(("B12", status, "J.6 ordem nomes vs C.x",
    f"ordem antiga={b12_old} | ordem nova={b12_new}"))

# -----------------------------------------------------------------------------
# B13 — tabelas em 4.1 e F.10 (tensão estilística — informativo)
# -----------------------------------------------------------------------------
def count_tables(txt):
    return len(re.findall(r"^\s*\|.+\|\s*$", txt, re.MULTILINE))
t41_total = count_tables(b4)
tF_total = count_tables(af)
results.append(("B13", "ℹ", "tabelas em 4 e F (estilo)",
    f"linhas tabela bloco4={t41_total} | F={tF_total}"))

# -----------------------------------------------------------------------------
# B14 — "Azoado" só num sítio em F
# -----------------------------------------------------------------------------
b14_count = len(re.findall(r"\bAzoado\b", af))
status = "✓" if b14_count <= 1 else "✗"
results.append(("B14", status, "'Azoado' deduplicado", f"ocorrências={b14_count}"))

# -----------------------------------------------------------------------------
# B15 — "Emantado"/"Imantado" deduplicado em F
# -----------------------------------------------------------------------------
b15_em = len(re.findall(r"\bEmantado\b", af))
b15_im = len(re.findall(r"\bImantado\b", af))
total = b15_em + b15_im
status = "✓" if total <= 1 else "✗"
results.append(("B15", status, "Emantado/Imantado deduplicado",
    f"Emantado={b15_em} | Imantado={b15_im}"))

# -----------------------------------------------------------------------------
# B16 — "Seixal" ambiguo entre 2.1 e 4.8 — informativo (clarificação opcional)
# -----------------------------------------------------------------------------
seixal_b2 = "Seixal" in b2c
seixal_b4 = "Seixal" in b4
results.append(("B16", "ℹ", "Seixal 2.1 vs 4.8",
    f"em B2={seixal_b2} | em B4={seixal_b4}"))

# -----------------------------------------------------------------------------
# B17 — H.19 título não pode ser só "Curvas de crescimento" se cobre visão/audição/dislipidémias
# -----------------------------------------------------------------------------
m_h19 = re.search(r"H\.19[^\n]*\n", h)
b17_title = m_h19.group(0) if m_h19 else "(H.19 não encontrado)"
# Heurística: se o título tem só "crescimento" e não menciona visão/auditivo/dislipidémia → bug
title_has_visao = "vis" in b17_title.lower() or "audit" in b17_title.lower() or "dislipid" in b17_title.lower()
status = "✓" if title_has_visao else "✗"
results.append(("B17", status, "H.19 título reflecte conteúdo",
    f"título='{b17_title.strip()[:80]}'"))

# =============================================================================
# Output
# =============================================================================
print("\n" + "="*78)
print("AUDITORIA V24 — REGRESSÕES PÓS V25/V26.1")
print("="*78 + "\n")

print("| Bug | Status | Tema | Diagnóstico |")
print("|-----|:---:|------|-------------|")
for bug, status, tema, diag in results:
    diag_short = diag[:80]
    print(f"| **{bug}** | {status} | {tema} | {diag_short} |")

# Sumário
n_ok = sum(1 for _,s,_,_ in results if s == "✓")
n_fail = sum(1 for _,s,_,_ in results if s == "✗")
n_warn = sum(1 for _,s,_,_ in results if s == "⚠")
n_info = sum(1 for _,s,_,_ in results if s == "ℹ")
print(f"\n**Sumário:** ✓ {n_ok} mantidas · ✗ {n_fail} regrediram · ⚠ {n_warn} suspeita · ℹ {n_info} informativo")

if n_fail or n_warn:
    print("\n**Acção:** ver lista acima e corrigir antes de avançar para Fase 3.")
else:
    print("\n**Acção:** zero regressões — pronto para Fase 3.")
