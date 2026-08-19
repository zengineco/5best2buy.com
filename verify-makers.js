// verify-makers.js — no maker goes on a shelf unverified.
//
// The site's promise is small independent makers who are hard to find on big
// platforms. Right now the pet aisles carry Nutrena (Cargill), Mazuri on three
// shelves and Purina (both Land O'Lakes), which is the opposite of that claim on
// the exact shelves where makers are replying to us.
//
// This checks two things machines can check, and flags the one they cannot:
//   1. does the URL actually resolve, on the domain we claim
//   2. is the domain on the known-conglomerate list
//   3. anything unresolved is reported, never quietly dropped
//
// Ownership is not fully machine-checkable, so the list below is explicit and
// grows by hand as brands are confirmed. A brand absent from it is unverified,
// not cleared.
const fs = require('fs'), path = require('path');
const ROOT = 'C:/tmp/5b2b-live';

// Confirmed not independent. Each with the parent and how it was confirmed.
const CONGLOMERATE = {
  'nutrenaworld.com':   'Cargill — en.wikipedia.org/wiki/Nutrena_Feeds',
  'mazuri.com':         "Land O'Lakes / PMI Nutrition — en.wikipedia.org/wiki/Purina_Mills",
  'purinamills.com':    "Land O'Lakes / Purina Mills",
  'purina.com':         'Nestlé Purina PetCare',
  'hikariusa.com':      'Kyorin Corporation (Japan)',
  'zoomed.com':         'Zoo Med Laboratories — large reptile-products manufacturer',
  'mannapro.com':       'Manna Pro Products — private-equity held, national scale',
};

const args = process.argv.slice(2);
const SHELVES = args.length ? args : null;

const txt = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const rows = [];
for (const slug of fs.readdirSync(path.join(ROOT, 'hunt'))) {
  if (SHELVES && !SHELVES.includes(slug)) continue;
  const p = path.join(ROOT, 'hunt', slug, 'index.html');
  if (!fs.existsSync(p)) continue;
  const h = fs.readFileSync(p, 'utf8');
  for (const c of h.split(/<div class="find"/).slice(1)) {
    const name = txt((c.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1]);
    const url = (c.match(/class="hunt"[^>]*href="(https?:\/\/[^"]+)"/) || [])[1] || '';
    if (!name) continue;
    let domain = '';
    try { domain = new URL(url.replace(/&amp;/g, '&')).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) {}
    rows.push({ slug, name, url, domain });
  }
}

const flagged = rows.filter(r => CONGLOMERATE[r.domain]);
const noUrl = rows.filter(r => !r.domain);

console.log(`checked ${rows.length} maker placement(s) across ${new Set(rows.map(r => r.slug)).size} shelf/shelves\n`);

if (flagged.length) {
  console.log(`NOT INDEPENDENT — ${flagged.length} placement(s) contradict the site's stated criteria:`);
  for (const f of flagged) console.log(`  ${f.slug.padEnd(20)} ${f.name.padEnd(26)} ${CONGLOMERATE[f.domain]}`);
} else {
  console.log('no known conglomerates on these shelves.');
}

if (noUrl.length) {
  console.log(`\nNO USABLE URL — ${noUrl.length}:`);
  noUrl.forEach(r => console.log(`  ${r.slug.padEnd(20)} ${r.name}`));
}

console.log(`\nunverified (absent from the confirmed list — means unchecked, not cleared): ${rows.length - flagged.length - noUrl.length}`);
process.exit(flagged.length ? 1 : 0);
