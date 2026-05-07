#!/usr/bin/env python3
"""
build_metadata.py — Regenera manifest.json e INDEX.md a partir dos ficheiros .md modulares.

Schema dos marcadores HTML (V26.1, normalizado):
    <!-- ===== KIND [· QUALIFICADOR]* · NOME ·
         Activação: <condições contextuais em prosa>
         Palavras-chave: <token1|token2|...>      (opcional)
         Sub-secções: <nota>                       (opcional)
         Dependências: <texto>
         Carregamento: <opcional|sempre>           (META apenas)
         · vXX.Y ===== -->
"""
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent / "prompts"

EXCLUDE = {
    "drfamilia_arquitectura_v1_1.md",
    "INDEX.md",
    "manifest.json",
    "build_metadata.py",
    "split_by_markers.py",
}

RE_MARKER = re.compile(r"<!--\s*=====\s*(?P<body>.+?)\s*=====\s*-->", re.DOTALL)
RE_CLOSE = re.compile(r"<!--\s*=====\s*/\s*(MÓDULO|META|CORE)[^>]*?=====\s*-->", re.DOTALL)


def parse_marker(body: str) -> dict:
    """Parsa marcador HTML multi-linha. Cada campo está numa linha separada,
    excepto o header (KIND · NAME) na primeira linha e a versão (vXX) na última.
    """
    meta = {
        "kind": "", "module_id": "", "name": "", "is_sovereign": False,
        "activation": "", "keywords": [], "sub_sections": "",
        "dependencies": "", "loading": "", "version": "",
    }

    if "SOBERANO" in body:
        meta["is_sovereign"] = True

    # Versão: procurar vXX[.Y] em qualquer parte
    vmatch = re.search(r"·\s*(v\d+(?:\.\d+)?)\s*$", body, re.MULTILINE)
    if vmatch:
        meta["version"] = vmatch.group(1)
    else:
        vmatch2 = re.search(r"\bv\d+(?:\.\d+)?\b", body)
        if vmatch2:
            meta["version"] = vmatch2.group(0)

    # Header: primeira linha não vazia
    lines = [ln.strip() for ln in body.split("\n") if ln.strip()]
    if not lines:
        return meta

    header = lines[0]
    # Split do header por ·
    head_parts = [p.strip() for p in header.split("·") if p.strip()]
    if head_parts:
        first = head_parts[0]
        if first.startswith("MÓDULO"):
            meta["kind"] = "MÓDULO"
            m = re.match(r"MÓDULO\s+(M-[A-ZÇÃÕÁÉÍÓÚÂÊÔ-]+)(?:\s*\(\d+/\d+\))?", first)
            if m:
                meta["module_id"] = m.group(1)
        elif first.startswith("CORE"):
            meta["kind"] = "CORE"
        elif first.startswith("META"):
            meta["kind"] = "META"

        # Nome: primeiro head_part que comece por Bloco/Anexo/Changelog/...
        for p in head_parts:
            if (re.match(r"(Bloco|Anexo|Changelog|Preâmbulo|Mapa)\b", p)
                    and not p.startswith(("Activação", "Palavras-chave", "Gatilhos",
                                          "Dependências", "Carregamento", "Sub-secções"))
                    and not re.match(r"v\d", p)):
                meta["name"] = p
                break

    # Campos linha-a-linha
    for ln in lines[1:]:
        # Limpar bullets/separadores residuais no início (ex.: "· vXX ===== -->")
        if ln.startswith("Activação:"):
            meta["activation"] = ln[len("Activação:"):].strip()
        elif ln.startswith("Palavras-chave:"):
            kw_raw = ln[len("Palavras-chave:"):].strip()
            meta["keywords"] = [t.strip() for t in re.split(r"\s*\|\s*", kw_raw) if t.strip()]
        elif ln.startswith("Gatilhos:"):
            g_raw = ln[len("Gatilhos:"):].strip()
            if "|" in g_raw:
                meta["keywords"] = [t.strip() for t in re.split(r"\s*\|\s*", g_raw) if t.strip()]
            else:
                meta["activation"] = g_raw
        elif ln.startswith("Sub-secções:"):
            meta["sub_sections"] = ln[len("Sub-secções:"):].strip()
        elif ln.startswith("Dependências:"):
            # Pode ter `· v26.1` no fim — strip
            dep = ln[len("Dependências:"):].strip()
            dep = re.sub(r"\s*·\s*v\d+(?:\.\d+)?\s*$", "", dep).strip()
            meta["dependencies"] = dep
        elif ln.startswith("Carregamento:"):
            load = ln[len("Carregamento:"):].strip()
            load = re.sub(r"\s*·\s*v\d+(?:\.\d+)?\s*$", "", load).strip()
            meta["loading"] = load

    return meta


def parse_file(path: Path) -> dict:
    name = path.name
    idx = int(name.split("_", 1)[0]) if name[:2].isdigit() else None
    text = path.read_text(encoding="utf-8")

    if name == "00_preambulo.md":
        return {
            "index": 0, "filename": name, "kind": "META", "module_id": "",
            "name": "Preâmbulo", "is_sovereign": False,
            "activation": "sempre (cabeçalho)", "keywords": [],
            "sub_sections": "", "dependencies": "", "loading": "sempre",
            "version": "v26.1", "has_explicit_close": False,
        }

    open_match = RE_MARKER.search(text)
    if not open_match:
        return {
            "index": idx, "filename": name, "kind": "?", "module_id": "",
            "name": "(sem marcador)", "is_sovereign": False,
            "activation": "", "keywords": [], "sub_sections": "",
            "dependencies": "", "loading": "", "version": "",
            "has_explicit_close": False,
            "_warning": "ficheiro sem marcador HTML reconhecível",
        }

    meta = parse_marker(open_match.group("body"))
    meta["index"] = idx
    meta["filename"] = name
    meta["has_explicit_close"] = bool(RE_CLOSE.search(text))
    return meta


def main():
    md_files = sorted(
        f for f in os.listdir(ROOT)
        if f.endswith(".md") and f not in EXCLUDE
    )
    sections = [parse_file(ROOT / f) for f in md_files]

    manifest = {
        "source": "modular per-block files (single source of truth)",
        "generator": "build_metadata.py",
        "schema": "v26.1 (Activação + Palavras-chave separados)",
        "product": "Dr. Família IA",
        "version": "v26.1",
        "date": "2026-04-24",
        "total_sections": len(sections),
        "sections": sections,
    }
    (ROOT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"✓ manifest.json regenerado ({len(sections)} secções)")

    lines = [
        "# ÍNDICE DOS MÓDULOS — Dr. Família IA",
        "",
        "**Versão:** V26.1 · **Data:** 24/04/2026",
        "",
        "Gerado automaticamente por `build_metadata.py`. Fonte de verdade: ficheiros `.md` modulares.",
        "",
        "| # | Tipo | ID | Nome | ⚑ | Activação | Palavras-chave | Ficheiro |",
        "|---|------|----|------|---|-----------|----------------|----------|",
    ]
    for s in sections:
        idx = f"{s['index']:02d}" if s["index"] is not None else "??"
        kind = s["kind"]
        mid = s["module_id"] or "—"
        name = s["name"] or "(sem nome)"
        sov = "⚑" if s["is_sovereign"] else ""
        act = s["activation"] if s["activation"] else "—"
        if len(act) > 60:
            act = act[:57] + "…"
        if s["keywords"]:
            kw = ", ".join(s["keywords"][:4])
            if len(s["keywords"]) > 4:
                kw += f"… (+{len(s['keywords'])-4})"
        else:
            kw = "—"
        fn = f"`{s['filename']}`"
        lines.append(f"| {idx} | {kind} | {mid} | {name} | {sov} | {act} | {kw} | {fn} |")

    lines.extend([
        "",
        "---",
        "",
        "## Notas",
        "",
        "- **Soberanos** (⚑): Bloco 2 (Segurança) e Bloco 7 (Red Lines) prevalecem sobre qualquer outra regra.",
        "- **Carregamento opcional:** `01_meta_changelog.md`, `14_meta_anexo_d_fontes_e_referencias.md`, `21_meta_anexo_k_mapa_arquitectural_core_e_modulos.md`.",
        "- **Cross-references inter-módulos:** ver Anexo K para a matriz completa.",
        "- **Schema do marcador HTML:** `Activação` (condições contextuais em prosa) + `Palavras-chave` (tokens lexicais detectáveis) + `Sub-secções` (carregamento parcial) + `Dependências`.",
        "",
    ])

    (ROOT / "INDEX.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"✓ INDEX.md regenerado")

    warnings = [s for s in sections if s.get("_warning")]
    if warnings:
        print("\n⚠ AVISOS:")
        for w in warnings:
            print(f"  - {w['filename']}: {w['_warning']}")


if __name__ == "__main__":
    main()
