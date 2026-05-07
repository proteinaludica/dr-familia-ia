# Guia: pôr este projecto no GitHub (sem terminal)

Passo-a-passo para fazer upload do conteúdo deste ZIP para um repositório novo no GitHub, **usando apenas o browser**.

## Passo 1 — Criar o repositório no GitHub

1. Vai a [https://github.com/new](https://github.com/new) (precisas de estar com sessão iniciada).
2. **Repository name:** `dr-familia-ia`
3. **Description:** `System prompt modular para Médico de Família Digital em PT-PT, com adaptações à Madeira`
4. **Visibility:** seleccionar **Public** *(ou Private se mudares de ideia agora)*
5. **NÃO marques** "Add a README", "Add .gitignore" nem "Choose a license" — esses ficheiros já vêm no ZIP.
6. Clica em **Create repository**.

## Passo 2 — Descomprimir o ZIP

1. Descarrega o `dr-familia-ia.zip` (entreguei aqui no chat).
2. Descomprime onde quiseres no teu computador. Vai aparecer uma pasta `dr-familia-ia/` com tudo lá dentro.

## Passo 3 — Upload via browser (drag-and-drop)

1. Volta à página do teu novo repo no GitHub. Vais ver um ecrã com instruções "Quick setup".
2. **Procura a frase** *"uploading an existing file"* (está num parágrafo logo abaixo do nome do repo) e clica nessa hiperligação.
3. Vais para uma página com uma zona grande "Drag files here to add them to your repository".
4. **Abre o explorador de ficheiros** na pasta `dr-familia-ia/` que descomprimiste.
5. **Selecciona TODOS os ficheiros e pastas dentro de `dr-familia-ia/`** (não a pasta em si — só o conteúdo). No Windows: `Ctrl+A`. No Mac: `Cmd+A`.
6. **Arrasta tudo** para a zona de drop do GitHub.
7. Espera o upload terminar (pode demorar alguns segundos — são ~250 KB no total).
8. Em baixo da página: na caixa "Commit message", escreve algo como `Initial import V26.1`.
9. Clica em **Commit changes**.

## Passo 4 — Verificar que o GitHub Actions correu

1. Na página do teu repo, clica no separador **Actions** (no topo).
2. Devias ver um workflow chamado *"Lint"* a correr (ícone amarelo) ou já completo (✓ verde / ✗ vermelho).
3. Se ✓: tudo bem. Se ✗: clica para ver onde falhou.

## Passo 5 — Editar e ter feedback rápido

A partir daqui o teu ciclo de trabalho é:

### Para edições simples (1 ficheiro de cada vez)

1. Na página do repo, navega até o ficheiro que queres alterar (ex.: `prompts/02_core_bloco_1_identidade_e_missao.md`).
2. Clica no ícone de **lápis** (canto superior direito do conteúdo do ficheiro) — *"Edit this file"*.
3. Altera no editor web.
4. Em baixo: escreve *commit message* e clica em **Commit changes**.
5. O GitHub Actions corre automaticamente — vais ver ✓ ou ✗ na lista de commits ao fim de ~30 segundos.

### Para edições maiores (Claude Code no VS Code)

1. Instala o **VS Code**: [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. No VS Code, instala a extensão **Claude Code** (procurar no marketplace).
3. No VS Code, faz `File → Clone Repository` e cola o URL do teu repo (formato `https://github.com/<o-teu-utilizador>/dr-familia-ia.git`).
4. Edita no VS Code (com o Claude Code a auxiliar).
5. Para enviar alterações: VS Code tem um separador **Source Control** (ícone com 3 nós) que mostra o que alteraste — clicas no `+` para preparar, escreves a mensagem, e clicas em **Commit** + **Sync Changes**.

### Para feedback rápido sem fazer push

1. No teu computador, abre o terminal na pasta do repo (em VS Code: `Terminal → New Terminal`).
2. Corre: `python3 tools/build.py --watch`
3. Sempre que guardares um ficheiro `.md`, o `core.md` é regenerado automaticamente.
4. Copias o `core.md` para o **Project Knowledge** do teu Project no Claude.ai e testas.

---

## Resolução de problemas comuns

**"O upload não termina":** o GitHub web UI tem limite de ~100 ficheiros por upload. Os 24 .md cabem perfeitamente.

**"GitHub Actions falhou (✗ vermelho):"** clica no commit, depois em Actions, e vê o output. O lint pode ter encontrado uma regressão. Volta atrás à edição.

**"Quero apagar o repo e começar de novo":** Settings → Danger Zone (ao fundo) → Delete this repository.

**"Quero mudar de público para privado depois":** Settings → General → Danger Zone → Change visibility.
