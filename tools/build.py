#!/usr/bin/env python3
"""
build.py — Junta os 24 .md modulares de prompts/ num único core.md monolítico.

Uso:
    python3 tools/build.py            # build único
    python3 tools/build.py --watch    # regenera automaticamente quando guardas um .md
"""
import argparse
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
PROMPTS_DIR = REPO_ROOT / "prompts"
OUTPUT = REPO_ROOT / "core.md"

# Excluir ficheiros que não são prompt (são meta/derivados)
EXCLUDE = {"INDEX.md", "manifest.json"}


def collect_files():
    """Devolve lista de Path dos .md a juntar, ordenados pelo prefixo numérico."""
    files = sorted(PROMPTS_DIR.glob("*.md"))
    return [f for f in files if f.name not in EXCLUDE]


def build():
    files = collect_files()
    if not files:
        print(f"❌ Nenhum .md encontrado em {PROMPTS_DIR}")
        sys.exit(1)

    parts = []
    parts.append(f"<!-- core.md gerado por tools/build.py em {time.strftime('%Y-%m-%d %H:%M:%S')} -->")
    parts.append(f"<!-- Total de blocos: {len(files)} -->\n")

    total_lines = 0
    for f in files:
        content = f.read_text(encoding="utf-8")
        total_lines += content.count("\n") + 1
        parts.append(content)
        parts.append("")  # separador em branco

    OUTPUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"✓ {OUTPUT.name} gerado · {len(files)} blocos · ~{total_lines} linhas · "
          f"{OUTPUT.stat().st_size // 1024} KB")


def watch():
    """Modo watch: regenera o core.md sempre que algum .md em prompts/ é modificado."""
    print(f"👀 a observar {PROMPTS_DIR}/ — Ctrl+C para parar")
    last_mtimes = {}

    while True:
        try:
            files = collect_files()
            current_mtimes = {f: f.stat().st_mtime for f in files}

            if not last_mtimes:
                # Primeiro ciclo: build inicial
                build()
                last_mtimes = current_mtimes
            elif current_mtimes != last_mtimes:
                # Algum ficheiro mudou
                changed = [f.name for f in files
                           if last_mtimes.get(f) != current_mtimes.get(f)]
                print(f"\n→ alteração detectada: {', '.join(changed)}")
                build()
                last_mtimes = current_mtimes

            time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 watcher parado")
            break


def main():
    parser = argparse.ArgumentParser(description="Build do core.md a partir de prompts/")
    parser.add_argument("--watch", action="store_true",
                        help="regenera automaticamente quando há alterações")
    args = parser.parse_args()

    if args.watch:
        watch()
    else:
        build()


if __name__ == "__main__":
    main()
