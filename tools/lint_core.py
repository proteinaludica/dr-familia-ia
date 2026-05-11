#!/usr/bin/env python3
"""
lint_core.py — 4 verificações sobre o core (Blocos 1-9 + Anexo A) + cross-refs.

LINT 1 — Marcadores HTML normalizados
LINT 2 — Cross-ref Anexo K ↔ módulos (gatilhos batem certo)
LINT 3 — PT-PT (sem BR-PT lexical)
LINT 4 — Referências DGS/USPSTF/NICE/ESC/etc. sem ano

Output: relatório markdown.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent / "prompts"

CORE_FILES = [
    "02_core_bloco_1_identidade_e_missao.md",
    "03_core_bloco_2_seguranca_e_confidencialidade.md",
    "04_core_bloco_3_multilingue.md",
    "05_core_bloco_4_comunicacao_etiqueta_acessibilidade_tts_cuidador_mad.md",
    "06_core_bloco_5_onboarding_e_registo_longitudinal.md",
    "07_core_bloco_6_saude_mental_via_sono.md",
    "08_core_bloco_7_red_lines.md",
    "09_core_bloco_8_preparacao_de_consulta_gatilhos_pre_e_pos.md",
    "10_core_bloco_9_fecho.md",
    "11_core_anexo_a_precedencia_de_regras.md",
]

MODULE_FILES = {
    "M-VACINAÇÃO/B": "12_m-vacinacao_anexo_b_pnv.md",
    "M-VACINAÇÃO/C": "13_m-vacinacao_anexo_c_guias_detalhados_faq_por_vacina.md",
    "M-DICAS": "15_m-dicas_anexo_e_dicas_por_ciclo_de_vida.md",
    "M-MADEIRA": "16_m-madeira_anexo_f_glossario_madeirense_de_saude.md",
    "M-RAM-RASTREIOS": "17_m-ram-rastreios_anexo_g_rastreios_ram.md",
    "M-PEDIATRIA": "18_m-pediatria_anexo_h_pnsij_18_consultas_chave_conteudos_transversais.md",
    "M-RELATÓRIO": "19_m-relatorio_anexo_i_modelo_do_output_1_do_bloco_8.md",
    "M-CUIDADOR": "20_m-cuidador_anexo_j_auto_cuidado_do_cuidador.md",
}

ANEXO_K = "21_meta_anexo_k_mapa_arquitectural_core_e_modulos.md"

# Soberanos declarados pelo K
SOBERANOS = {
    "03_core_bloco_2_seguranca_e_confidencialidade.md",
    "08_core_bloco_7_red_lines.md",
}

VERSION = "v27.0"

# =============================================================================
# Helpers
# =============================================================================
def read(p):
    return (ROOT / p).read_text(encoding="utf-8")

def first_marker(txt):
    """Extrai o primeiro marcador HTML do ficheiro."""
    m = re.search(r"<!--\s*=====(.+?)=====\s*-->", txt, re.DOTALL)
    return m.group(1).strip() if m else None


# =============================================================================
# LINT 1 — Marcadores HTML
# =============================================================================
def lint_marcadores():
    out = []
    for fname in CORE_FILES:
        marker = first_marker(read(fname))
        issues = []
        if not marker:
            issues.append("sem marcador HTML")
        else:
            if not marker.startswith("CORE ·") and not marker.startswith("META ·"):
                # Anexo A pode ter marcador CORE ou variante; aceitar ambos
                if "Anexo A" not in marker:
                    issues.append(f"não começa com 'CORE ·' (começa: {marker[:30]!r})")
            if VERSION not in marker:
                issues.append(f"versão {VERSION} ausente")
            if fname in SOBERANOS and "SOBERANO" not in marker:
                issues.append("falta tag SOBERANO")
            if fname not in SOBERANOS and "SOBERANO" in marker and "Bloco" in marker:
                # Apenas Blocos 2 e 7 podem ser soberanos
                issues.append("tag SOBERANO indevida")
            if "Dependências:" not in marker:
                issues.append("falta declaração de Dependências")
        out.append((fname, issues, marker[:90] if marker else "—"))
    return out


# =============================================================================
# LINT 2 — Cross-ref Anexo K ↔ módulos
# =============================================================================
def extrair_gatilhos_marcador(txt):
    """Extrai a lista após 'Palavras-chave:' no marcador do módulo."""
    m = re.search(r"<!--\s*=====(.+?)=====\s*-->", txt, re.DOTALL)
    if not m:
        return None
    body = m.group(1)
    pk = re.search(r"Palavras-chave:\s*([^\n]+)", body)
    if not pk:
        return None
    raw = pk.group(1).strip()
    return [g.strip().lower() for g in re.split(r"[|,]", raw) if g.strip()]


def extrair_gatilhos_anexo_k(modulo_token, k_text):
    """Extrai gatilhos secundários declarados no Anexo K para um módulo."""
    # Procura secção "#### M-XXX" e lê a sub-bullet "Gatilhos:" ou "Gatilhos secundários:"
    pattern = rf"#### {re.escape(modulo_token)}.*?(?=####|\Z)"
    m = re.search(pattern, k_text, re.DOTALL)
    if not m:
        return None
    chunk = m.group(0)
    # Apanhar tanto "Gatilhos:" como "Gatilhos secundários:"
    gatilhos = []
    for trig_line in re.finditer(r"\*\*Gatilhos[^:]*:\*\*\s*([^\n]+)", chunk):
        raw = trig_line.group(1)
        # gatilhos costumam estar em backticks
        gatilhos += [g.strip().lower() for g in re.findall(r"`([^`]+)`", raw)]
    return gatilhos


def lint_gatilhos():
    k_text = read(ANEXO_K)
    out = []
    # Mapear nome no K -> ficheiro
    mapping = {
        "M-VACINAÇÃO": ["12_m-vacinacao_anexo_b_pnv.md",
                         "13_m-vacinacao_anexo_c_guias_detalhados_faq_por_vacina.md"],
        "M-RAM-RASTREIOS": [MODULE_FILES["M-RAM-RASTREIOS"]],
        "M-PEDIATRIA": [MODULE_FILES["M-PEDIATRIA"]],
        "M-CUIDADOR": [MODULE_FILES["M-CUIDADOR"]],
        "M-MADEIRA": [MODULE_FILES["M-MADEIRA"]],
        "M-DICAS": [MODULE_FILES["M-DICAS"]],
        "M-RELATÓRIO": [MODULE_FILES["M-RELATÓRIO"]],
    }
    for mod, files in mapping.items():
        gatilhos_K = extrair_gatilhos_anexo_k(mod, k_text)
        if gatilhos_K is None:
            out.append((mod, [f"módulo não encontrado no Anexo K"], 0, 0))
            continue
        for f in files:
            gatilhos_marker = extrair_gatilhos_marcador(read(f))
            if gatilhos_marker is None:
                out.append((f"{mod} ({f})",
                            ["sem 'Palavras-chave:' no marcador"],
                            len(gatilhos_K), 0))
                continue
            faltam_no_marker = [g for g in gatilhos_K
                                if g not in gatilhos_marker
                                and g not in [m.lower() for m in gatilhos_marker]]
            extras_no_marker = [g for g in gatilhos_marker
                                if g not in gatilhos_K]
            issues = []
            if faltam_no_marker:
                issues.append(f"faltam no marcador ({len(faltam_no_marker)}): "
                              + ", ".join(faltam_no_marker[:5])
                              + ("…" if len(faltam_no_marker) > 5 else ""))
            if extras_no_marker:
                issues.append(f"extras no marcador ({len(extras_no_marker)}): "
                              + ", ".join(extras_no_marker[:5])
                              + ("…" if len(extras_no_marker) > 5 else ""))
            out.append((f"{mod} → {f.split('_anexo_')[1][:30]}…",
                        issues, len(gatilhos_K), len(gatilhos_marker)))
    return out


# =============================================================================
# LINT 3 — PT-PT lexical
# =============================================================================
# Lista conservadora — só termos com baixa probabilidade de falso positivo.
BR_PT_TERMS = [
    (r"\btela\b", "tela → ecrã"),
    (r"\bcelular\b", "celular → telemóvel"),
    (r"\bcardápio\b", "cardápio → ementa"),
    (r"\bônibus\b", "ônibus → autocarro"),
    (r"\bcafé da manhã\b", "café da manhã → pequeno-almoço"),
    (r"\bgeladeira\b", "geladeira → frigorífico"),
    (r"\babacaxi\b", "abacaxi → ananás"),
    (r"\bbanheiro\b", "banheiro → casa de banho/WC"),
    (r"\btrem\b", "trem → comboio"),
    (r"\bmouse\b", "mouse → rato"),
    (r"\barquivo\b", "arquivo → ficheiro (excepto sentido jurídico)"),
    (r"\bsorvete\b", "sorvete → gelado"),
    (r"\bducha\b", "ducha → chuveiro"),
    (r"\bestou\s+\w+ndo\b", "gerúndio brasileiro (estou …ndo) → estou a …r"),
    (r"\bestá\s+\w+ndo\b", "gerúndio brasileiro (está …ndo) → está a …r"),
]

def lint_pt_pt():
    out = []
    for fname in CORE_FILES:
        txt = read(fname)
        hits = []
        for pat, label in BR_PT_TERMS:
            matches = re.findall(pat, txt, re.IGNORECASE)
            if matches:
                hits.append(f"{label} ({len(matches)}×)")
        out.append((fname, hits))
    return out


# =============================================================================
# LINT 4 — Referências sem ano
# =============================================================================
ENTIDADES = ["DGS", "USPSTF", "NICE", "ESC", "EASL", "ERS", "OMS", "WHO",
             "Direção-Geral da Saúde", "Direcção-Geral da Saúde",
             "Norma DGS", "Orientação DGS", "Up-to-Date", "UpToDate",
             "Livro Azul"]

def lint_referencias():
    out = []
    for fname in CORE_FILES:
        txt = read(fname)
        sem_ano = []
        for ent in ENTIDADES:
            for m in re.finditer(rf"\b{re.escape(ent)}\b", txt):
                janela = txt[max(0, m.start()-50):m.end()+150]
                # Procurar ano (4 dígitos 19xx-20xx) ou "dois mil e..." (TTS)
                tem_ano_digito = bool(re.search(r"\b(19|20)\d{2}\b", janela))
                tem_ano_extenso = bool(re.search(
                    r"dois mil(?:\s+e\s+\w+){1,3}", janela, re.IGNORECASE))
                if not (tem_ano_digito or tem_ano_extenso):
                    linha = txt[:m.start()].count("\n") + 1
                    sem_ano.append((ent, linha))
        # Agrupar por entidade
        if sem_ano:
            from collections import Counter
            c = Counter(e for e, _ in sem_ano)
            out.append((fname, c.most_common()))
        else:
            out.append((fname, []))
    return out


# =============================================================================
# Render
# =============================================================================
print("# RELATÓRIO DE LINTS — FASE 3A (CORE)\n")

# --- LINT 1 ---
print("## LINT 1 — Marcadores HTML\n")
print("| Ficheiro | Status | Issues |")
print("|---|:---:|---|")
total_l1 = 0
for fname, issues, _ in lint_marcadores():
    short = fname.replace("_core_", " ").replace(".md", "")[:50]
    if issues:
        total_l1 += len(issues)
        print(f"| {short} | ✗ | {' · '.join(issues)} |")
    else:
        print(f"| {short} | ✓ | — |")
print(f"\n**Total issues:** {total_l1}\n")

# --- LINT 2 ---
print("## LINT 2 — Cross-ref Anexo K ↔ módulos\n")
print("| Módulo → Ficheiro | Status | K | Marcador | Issues |")
print("|---|:---:|:-:|:-:|---|")
total_l2 = 0
for mod_f, issues, k_n, marker_n in lint_gatilhos():
    if issues:
        total_l2 += len(issues)
        print(f"| {mod_f} | ✗ | {k_n} | {marker_n} | {' · '.join(issues)[:80]} |")
    else:
        print(f"| {mod_f} | ✓ | {k_n} | {marker_n} | — |")
print(f"\n**Total issues:** {total_l2}\n")

# --- LINT 3 ---
print("## LINT 3 — PT-PT lexical (BR-PT no core)\n")
print("| Ficheiro | Status | Hits |")
print("|---|:---:|---|")
total_l3 = 0
for fname, hits in lint_pt_pt():
    short = fname.replace("_core_", " ").replace(".md", "")[:50]
    if hits:
        total_l3 += len(hits)
        print(f"| {short} | ✗ | {' · '.join(hits)} |")
    else:
        print(f"| {short} | ✓ | — |")
print(f"\n**Total hits:** {total_l3}\n")

# --- LINT 4 ---
print("## LINT 4 — Referências sem ano (DGS/USPSTF/NICE/ESC/etc.)\n")
print("| Ficheiro | Status | Entidades sem ano (contagem) |")
print("|---|:---:|---|")
total_l4 = 0
for fname, hits in lint_referencias():
    short = fname.replace("_core_", " ").replace(".md", "")[:50]
    if hits:
        c = sum(n for _, n in hits)
        total_l4 += c
        descricao = ", ".join(f"{ent}×{n}" for ent, n in hits)
        print(f"| {short} | ⚠ | {descricao} |")
    else:
        print(f"| {short} | ✓ | — |")
print(f"\n**Total ocorrências sem ano próximo:** {total_l4}\n")

# --- SUMÁRIO ---
print("---\n## SUMÁRIO\n")
print(f"- Lint 1 (marcadores): **{total_l1}** issues")
print(f"- Lint 2 (gatilhos K↔módulos): **{total_l2}** issues")
print(f"- Lint 3 (PT-PT): **{total_l3}** hits")
print(f"- Lint 4 (referências sem ano): **{total_l4}** ocorrências (heurístico — pode ter falsos positivos)")
