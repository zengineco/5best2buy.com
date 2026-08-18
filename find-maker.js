// find-maker.js — where does this maker's copy actually live?
//
// Corrections have to be applied at the source or the next build reverts them,
// and the site has two sources. 463 shelves are generated from
// C:/tmp/shelf-content/*.js. The other 109 — including hot-sauce and rice —
// have no generator left; their HTML is static and is edited directly.
//
// Guessing wrong means either losing the correction on the next build or
// editing a file nothing reads. This says which.
//
// Usage: node find-maker.js "Golden Barrel"
const fs = require('fs'), path = require('path');
const SRC = 'C:/tmp/shelf-content';
const LIVE = 'C:/tmp/5b2b-live/hunt';

const query = process.argv.slice(2).join(' ').trim().toLowerCase();
if (!query) { console.log('usage: node find-maker.js "Maker Name"'); process.exit(1); }

const txt = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;/g, '\u2019').replace(/&middot;/g, '\u00b7').replace(/\s+/g, ' ').trim();

// 1. generated shelves
const hits = [];
const owned = new Set();
for (const f of fs.readdirSync(SRC).filter(x => x.endsWith('.js'))) {
  let shelves;
  try { shelves = require(path.join(SRC, f)) || []; } catch (e) { continue; }
  for (const s of shelves) {
    if (s.slug) owned.add(s.slug);
    for (const m of s.makers || []) {
      if (String(m.name || '').toLowerCase().includes(query))
        hits.push({ source: 'GENERATED', file: `${SRC}/${f}`, shelf: s.slug, maker: m });
    }
  }
}

// 2. orphan shelves — static HTML, no generator
for (const slug of fs.readdirSync(LIVE)) {
  if (owned.has(slug)) continue;
  const p = path.join(LIVE, slug, 'index.html');
  if (!fs.existsSync(p)) continue;
  const h = fs.readFileSync(p, 'utf8');
  for (const c of h.split(/<div class="find"/).slice(1)) {
    const name = txt((c.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1]);
    if (!name || !name.toLowerCase().includes(query)) continue;
    hits.push({
      source: 'STATIC HTML', file: p, shelf: slug,
      maker: {
        name,
        rank: txt((c.match(/class="rank"[^>]*>([\s\S]*?)<\/div>/) || [])[1]),
        line: txt((c.match(/class="maker"[^>]*>([\s\S]*?)<\/div>/) || [])[1]),
        body: ([...c.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => txt(m[1])).find(x => x.length > 60) || ''),
        url: (c.match(/class="hunt"[^>]*href="(https?:\/\/[^"]+)"/) || [])[1] || '',
      },
    });
  }
}

if (!hits.length) { console.log(`  no maker matching "${query}"`); process.exit(0); }

for (const h of hits) {
  console.log(`\n  ${h.source}   shelf: ${h.shelf}`);
  console.log(`  file: ${h.file}`);
  if (h.source === 'GENERATED') console.log('  -> edit the file, then: node build-all.js');
  else console.log('  -> edit the HTML directly; no generator will overwrite it');
  for (const k of ['name', 'url', 'rank', 'line', 'body', 'why', 'price', 'rating', 'ship']) {
    if (h.maker[k] === undefined || h.maker[k] === '') continue;
    console.log(`    ${k.padEnd(7)} ${String(h.maker[k]).slice(0, 200)}`);
  }
}
console.log(`\n  ${hits.length} placement(s).`);
