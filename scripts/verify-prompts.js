const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'prompts', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sections = manifest.sections || [];

function getModulesForTier(tier) {
  const modules = [];
  const pre = sections.find(s => s.filename === '00_preambulo.md');
  if (pre) modules.push(pre.filename);
  // core 2..6
  for (const s of sections) {
    if (s.kind === 'CORE' && typeof s.index === 'number' && s.index >=2 && s.index <=6) modules.push(s.filename);
  }
  // free extras
  for (const id of ['M-DICAS','M-MADEIRA']) {
    const sec = sections.find(s => s.module_id === id);
    if (sec) modules.push(sec.filename);
  }
  if (tier === 'paid') {
    const paidIds = ['M-VACINAÇÃO','M-RAM-RASTREIOS','M-RASTREIOS','M-PEDIATRIA','M-CUIDADOR'];
    for (const id of paidIds) {
      for (const s of sections) {
        if (s.module_id === id) {
          if (!modules.includes(s.filename)) modules.push(s.filename);
        }
      }
    }
    const vacs = sections.filter(s => s.module_id === 'M-VACINAÇÃO');
    for (const v of vacs) if (!modules.includes(v.filename)) modules.push(v.filename);
  }
  return modules;
}

function check(tier) {
  const mods = getModulesForTier(tier);
  const missing = [];
  for (const m of mods) {
    const p = path.join(process.cwd(), 'prompts', m);
    if (!fs.existsSync(p)) missing.push(m);
  }
  return {tier, modules: mods, missing};
}

console.log(JSON.stringify({free: check('free'), paid: check('paid')}, null, 2));
