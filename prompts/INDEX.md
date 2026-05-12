<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dr. Família IA — Assistente clínico em Medicina Geral e Familiar</title>
<meta name="description" content="Dr. Família IA é um assistente clínico digital de apoio entre consultas em Medicina Geral e Familiar. Em português europeu, com adaptação regional.">
<meta name="theme-color" content="#f5f0e6">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<style>
:root {
  --color-paper: #f5f0e6;
  --color-paper-deep: #ebe4d2;
  --color-ink: #1c1c1c;
  --color-ink-muted: #5a554c;
  --color-blue: #2a4a7f;
  --color-blue-soft: #e5ecf3;
  --color-rule: #c9c2b3;
  --color-accent: #b8543f;

  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;

  --max-w: 680px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { -webkit-text-size-adjust: 100%; }

body {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.65;
  color: var(--color-ink);
  background: var(--color-paper);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

main { max-width: var(--max-w); margin: 0 auto; padding: 4rem 1.5rem 5rem; }

/* ---- Header ---- */
.eyebrow {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-blue);
  margin-bottom: 1.25rem;
}

h1 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.6rem, 7vw, 3.6rem);
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: var(--color-ink);
  margin-bottom: 1.25rem;
  font-variation-settings: "opsz" 144;
}

h1 .accent {
  font-style: italic;
  font-weight: 500;
  color: var(--color-blue);
}

.lead {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2.4vw, 1.35rem);
  line-height: 1.45;
  font-weight: 400;
  color: var(--color-ink-muted);
  margin-bottom: 3.5rem;
  font-variation-settings: "opsz" 144;
}

/* ---- Sections ---- */
section { margin-bottom: 3rem; }

h2 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
  margin-bottom: 1rem;
  font-variation-settings: "opsz" 24;
  color: var(--color-ink);
}

h3 {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-blue);
  margin: 1.75rem 0 0.5rem;
}

p { margin-bottom: 1rem; color: var(--color-ink); }
p.muted { color: var(--color-ink-muted); }

ul.plain { list-style: none; padding: 0; }
ul.plain li {
  padding: 0.5rem 0 0.5rem 1.25rem;
  position: relative;
  border-bottom: 1px solid var(--color-rule);
}
ul.plain li:last-child { border-bottom: none; }
ul.plain li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1.05rem;
  width: 6px;
  height: 1px;
  background: var(--color-blue);
}

ol.steps { list-style: none; padding: 0; counter-reset: step; }
ol.steps li {
  padding: 1rem 0 1rem 3rem;
  position: relative;
  counter-increment: step;
  border-bottom: 1px solid var(--color-rule);
}
ol.steps li:last-child { border-bottom: none; }
ol.steps li::before {
  content: counter(step, decimal-leading-zero);
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: 1.4rem;
  color: var(--color-blue);
  position: absolute;
  left: 0;
  top: 0.95rem;
  font-variation-settings: "opsz" 144;
}

/* ---- Audience divider ---- */
.audience-divider {
  margin: 4.5rem -1.5rem 3.5rem;
  background: var(--color-paper-deep);
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--color-rule);
  border-bottom: 1px solid var(--color-rule);
  text-align: center;
}
.audience-divider .label {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: 1rem;
  color: var(--color-ink-muted);
  letter-spacing: 0.02em;
}
.audience-divider .label::before,
.audience-divider .label::after {
  content: "—";
  margin: 0 0.75rem;
  color: var(--color-rule);
}

/* ---- Medical-colleague section ---- */
.medical {
  background: var(--color-blue-soft);
  margin: 0 -1.5rem;
  padding: 3rem 1.5rem 2.5rem;
  border-top: 3px solid var(--color-blue);
}
.medical .eyebrow { color: var(--color-blue); }
.medical h2 { color: var(--color-blue); }
.medical ul.plain li { border-bottom-color: rgba(42, 74, 127, 0.18); }
.medical ul.plain li::before { background: var(--color-blue); }
.medical p { color: #1a3258; }

.medical-cta {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(42, 74, 127, 0.25);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--color-blue);
}
.medical-cta a { color: var(--color-blue); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.medical-cta a:hover { text-decoration-thickness: 2px; }

/* ---- Contact ---- */
.contact {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-rule);
}
.contact a {
  color: var(--color-blue);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  font-weight: 500;
}
.contact a:hover { text-decoration-thickness: 2px; }

/* ---- Footer ---- */
footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-rule);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
footer .brand {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
}

/* ---- Responsive tweaks ---- */
@media (max-width: 540px) {
  main { padding: 2.5rem 1.25rem 3rem; }
  .audience-divider { margin-left: -1.25rem; margin-right: -1.25rem; padding-left: 1.25rem; padding-right: 1.25rem; }
  .medical { margin-left: -1.25rem; margin-right: -1.25rem; padding-left: 1.25rem; padding-right: 1.25rem; }
}

/* ---- Print ---- */
@media print {
  body { background: #fff; color: #000; }
  .medical { background: transparent; border-top: 2px solid #000; }
  .audience-divider { background: transparent; }
  a { color: #000; text-decoration: underline; }
  footer { border-top: 1px solid #000; }
}
</style>
</head>

<body>
<main>

  <p class="eyebrow">Proteína Lúdica</p>
  <h1>Dr. Família <span class="accent">IA</span></h1>
  <p class="lead">Assistente clínico digital em Medicina Geral e Familiar. Concebido para apoio entre consultas, em português europeu, com adaptação ao contexto regional.</p>

  <!-- ============================================== -->
  <!-- BLOCO UTENTES                                  -->
  <!-- ============================================== -->

  <section>
    <h2>O que é</h2>
    <p>O Dr. Família IA é um sistema de inteligência artificial concebido para acompanhar utentes no período entre consultas presenciais. Opera sob supervisão clínica do médico de família responsável, em português europeu, e adapta-se ao contexto sanitário regional (Madeira, Açores, Continente).</p>
  </section>

  <section>
    <h2>O que faz</h2>
    <ol class="steps">
      <li>Esclarece dúvidas sobre o plano clínico definido em consulta — terapêutica, exames, orientações.</li>
      <li>Apoia na gestão de calendários de vacinação, rastreios e consultas de vigilância.</li>
      <li>Prepara o utente para a próxima consulta, organizando queixas, sintomas e perguntas relevantes.</li>
      <li>Disponibiliza informação clínica fiável, alinhada com normas da DGS e adaptada à literacia em saúde do utente.</li>
    </ol>
  </section>

  <section>
    <h2>O que não faz</h2>
    <ul class="plain">
      <li>Não substitui a consulta presencial nem o juízo clínico do médico assistente.</li>
      <li>Não emite diagnósticos.</li>
      <li>Não prescreve medicação. Excepção única: paracetamol em dose padrão para o adulto.</li>
      <li>Não actua em situações de emergência. Em emergência: contactar o 112 ou dirigir-se ao serviço de urgência.</li>
    </ul>
  </section>

  <!-- ============================================== -->
  <!-- DIVISOR DE AUDIÊNCIA                           -->
  <!-- ============================================== -->

  <div class="audience-divider">
    <span class="label">Secção dirigida a profissionais</span>
  </div>

  <!-- ============================================== -->
  <!-- BLOCO COLEGAS MÉDICOS                          -->
  <!-- ============================================== -->

  <section class="medical">
    <p class="eyebrow">Para colegas de Medicina Geral e Familiar</p>
    <h2>Ferramenta licenciável a médicos</h2>

    <p>O Dr. Família IA é um produto modular concebido para ser operado por médicos de Medicina Geral e Familiar junto da sua própria população de utentes. Cada colega opera uma instância derivada do sistema, com identidade e responsabilidade clínica próprias — apresentada ao utente como <em>Médico de Família Digital do Dr. &lt;nome&gt;</em>.</p>

    <h3>Arquitectura</h3>
    <ul class="plain">
      <li>Estrutura modular: núcleo clínico e anexos temáticos (vacinação, pediatria, rastreios, geriatria, cuidador informal, saúde mental, entre outros).</li>
      <li>Anexos regionais com glossário e referências locais (Madeira, Açores), extensíveis a outras regiões.</li>
      <li>Convenção PT-PT pré-acordo ortográfico, com terminologia clínica adequada ao registo médico português.</li>
      <li>Sistema de derivação por médico assente em 19 campos auditáveis, validados por verificador automático.</li>
    </ul>

    <h3>Âmbito clínico</h3>
    <ul class="plain">
      <li>Apoio entre consultas. Não está concebido para actividade ambulatória nem para substituir consulta presencial.</li>
      <li>Sem emissão de diagnósticos ou prescrições, com a excepção referida acima.</li>
      <li>Não opera em contexto de urgência ou emergência.</li>
      <li>Responsabilidade clínica permanece integralmente no médico que opera a instância.</li>
    </ul>

    <h3>Estado actual</h3>
    <p>Em desenvolvimento activo. Versão de referência operada no Continente (Ponta Delgada) e derivação para a Região Autónoma da Madeira em fase de validação clínica. Avaliação técnica e demonstração disponíveis a pedido.</p>

    <p class="medical-cta">Colegas interessados em avaliar a ferramenta para a sua prática poderão obter mais informação por <a href="mailto:info@proteinaludica.com?subject=Dr.%20Fam%C3%ADlia%20IA%20%E2%80%94%20interesse%20cl%C3%ADnico">info@proteinaludica.com</a>.</p>
  </section>

  <!-- ============================================== -->
  <!-- CONTACTO                                       -->
  <!-- ============================================== -->

  <section class="contact">
    <h2>Contacto</h2>
    <p>Para questões clínicas, propostas de colaboração ou avaliação técnica:</p>
    <p><a href="mailto:info@proteinaludica.com">info@proteinaludica.com</a></p>
  </section>

  <footer>
    <span>Em desenvolvimento · 2026</span>
    <span class="brand">Proteína Lúdica</span>
  </footer>

</main>
</body>
</html>
