// swap-makers.js — replace maker cards on a static shelf, from a data file.
//
// Written after doing goat-feed as a one-off script. The remaining conglomerate
// placements (Mazuri on three shelves, Nutrena, Hikari, Zoo Med) all need the
// same operation, and a bespoke script per shelf is how card markup drifts apart.
//
// Reads C:/tmp/maker-swaps.js — a list of { shelf, drop[], add[] }. Asserts the
// exact number of drops it was told to expect before writing anything, so a
// changed page fails loudly rather than silently doing half the job.
//
// Usage: node swap-makers.js            dry run
//        node swap-makers.js --apply
const fs = require('fs');
const APPLY = process.argv.includes('--apply');
const SWAPS = require('C:/tmp/maker-swaps.js');

const BADGES = (price, ship) => {
  const tag = ship === 'local'
    ? '<span title="Regional, seasonal, or limited availability" style="color:var(--soft);letter-spacing:.2px;">\u{1F69C} Local / limited</span>'
    : ship === 'fast'
      ? '<span title="Ships nationwide, fast or expedited options" style="color:var(--soft);letter-spacing:.2px;">\u2708\uFE0F Ships fast</span>'
      : '<span title="Ships ground only \u2014 often frozen, heavy, or slower" style="color:var(--soft);letter-spacing:.2px;">\u{1F69B} Ground only</span>';
  return `<div class="badges" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:-2px 0 13px;font-family:var(--fm);font-size:15px;"><span title="Typical price" style="font-weight:700;color:var(--green);letter-spacing:1.5px;">${price}</span><span title="5best2buy rating: 5 of 5" style="color:var(--gold);letter-spacing:2px;font-size:15px;">\u2605\u2605\u2605\u2605\u2605</span>${tag}</div>`;
};

const card = c => `<div class="find">
    <div class="rank">${c.rank}</div>
    <h2>${c.name}</h2>
    <div class="maker">${c.line}</div>
    ${BADGES(c.price, c.ship)}
    <p>${c.body}</p>
    <p class="why"><b>${c.whyHead}</b>${c.why}</p>
    <a class="hunt" href="${c.url}" rel="sponsored nofollow" target="_blank">See it at ${c.name} \u2192</a>
  </div>`;

const nameOf = c => (c.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '';

let ok = 0, failed = 0;
for (const s of SWAPS) {
  const file = `C:/tmp/5b2b-live/hunt/${s.shelf}/index.html`;
  if (!fs.existsSync(file)) { console.log(`  FAILED ${s.shelf} — no such shelf`); failed++; continue; }

  const h = fs.readFileSync(file, 'utf8');
  const parts = h.split(/<div class="find"/);
  const head = parts[0];
  const cards = parts.slice(1).map(c => '<div class="find"' + c);

  const dropRe = new RegExp(s.drop.join('|'), 'i');
  const keep = cards.filter(c => !dropRe.test(nameOf(c)));
  const dropped = cards.length - keep.length;

  if (dropped !== s.drop.length) {
    console.log(`  FAILED ${s.shelf} — expected to drop ${s.drop.length} (${s.drop.join(', ')}), dropped ${dropped}`);
    failed++;
    continue;
  }

  const out = head + [...s.add.map(card), ...keep].join('');
  const total = out.split(/<div class="find"/).length - 1;
  console.log(`  ${s.shelf.padEnd(20)} ${cards.length} \u2192 ${total} cards   -${s.drop.join(', ')}   +${s.add.map(a => a.name).join(', ')}`);
  if (APPLY) fs.writeFileSync(file, out);
  ok++;
}

console.log(`\n  ${APPLY ? 'APPLIED' : 'DRY RUN'}  ${ok} shelf/shelves, ${failed} failed`);
if (!APPLY && !failed) console.log('  --apply to write.');
process.exit(failed ? 1 : 0);
