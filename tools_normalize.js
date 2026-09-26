// Oyuncu dosyalarını normalleştir: .replace() gibi ifadeleri değerlendirip düz metin olarak yeniden yaz
const fs = require('fs');
const dir = 'js/db/players';
for (const f of fs.readdirSync(dir)) {
  const path = dir + '/' + f;
  const src = fs.readFileSync(path, 'utf8');
  if (!/\.replace\(/.test(src)) continue;
  const g = { CM: { DB: {} } };
  new Function('window', 'globalThis', src)(g, g);
  const P = g.CM.DB.P;
  const header = src.slice(0, src.indexOf('(function'));
  let out = header + "(function (G) {\n  'use strict';\n  const P = G.CM.DB.P = G.CM.DB.P || {};\n";
  // Yorum satırlarını koru: anahtarların sırasını kaynaktaki sıraya göre al
  const order = [...src.matchAll(/P\.([A-Z0-9]+) = `/g)].map(m => m[1]);
  const comments = {};
  [...src.matchAll(/\n  (\/\/[^\n]*)\n  P\.([A-Z0-9]+) = `/g)].forEach(m => { comments[m[2]] = m[1]; });
  for (const k of order) {
    const lines = P[k].split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (comments[k]) out += '\n  ' + comments[k];
    out += `\n  P.${k} = \`\n${lines.join('\n')}\`;\n`;
  }
  out += "})(typeof window !== 'undefined' ? window : globalThis);\n";
  fs.writeFileSync(path, out);
  console.log('normalized', f);
}
