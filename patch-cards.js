// patch-cards.js — give five existing recipes a card that answers.
//
// batch-125 and batch-126 each contained a recipe that already existed under
// the same slug, so the dedupe in generate-recipes dropped mine silently. The
// existing versions are real from-scratch recipes and there is no reason to
// replace them -- but their cards narrate, so none of them surface as THE
// RATIO. This gives those five a card carrying an actual ratio instead.
//
// Rewrites only the `card:` value inside the matching object, located by brace
// matching rather than a loose regex, and re-requires each file afterwards so a
// mangled write fails here rather than at build time.
const fs = require('fs');
const D = 'C:/tmp/recipe-batches/';

const PATCH = [
  ['batch-118-bread.js',    'flour-tortillas', '3 cups flour + \u2153 cup lard + 1 cup warm water. Rest 20 min, then griddle hot and fast.'],
  ['batch-59-regional.js',  'gremolata',       'Zest of 2 lemons + 1 cup parsley + 1 raw garlic clove, chopped together. On at the last second.'],
  ['batch-118-bread.js',    'brioche',         '500g flour + 6 eggs + 250g butter (50% of the flour) + 10g yeast. Chill overnight before shaping.'],
  ['batch-118-bread.js',    'english-muffins', '500g flour + 400g milk (80% hydration). Griddle, do not bake. Fork-split, never cut.'],
  ['batch-00-flagships.js', 'mole',            '3 chile types + nuts + seeds + spice, each toasted SEPARATELY, then fried in lard. 2 oz chocolate.'],
];

// The batches are not written in one style. Mine use bare keys (slug:"x");
// the older ones are JSON-formatted ("slug": "x"). A matcher that knows only
// one silently finds nothing, which is what made the duplicate check miss five
// collisions and report a clean run.
function findSlug(src, slug) {
  for (const pat of ['slug:"' + slug + '"', '"slug": "' + slug + '"', '"slug":"' + slug + '"']) {
    const i = src.indexOf(pat);
    if (i >= 0) return i;
  }
  return -1;
}

// find the object literal owning `slug`, returning [start,end) in src
function objRange(src, slug) {
  const m = findSlug(src, slug);
  if (m < 0) return null;
  let start = src.lastIndexOf('{', m);
  if (start < 0) return null;
  let depth = 0, inStr = false, q = '', esc = false, i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === q) inStr = false;
      continue;
    }
    if (c === '"' || c === "'") { inStr = true; q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return depth === 0 ? [start, i] : null;
}

// both key styles, and the replacement echoes back whichever one it matched so
// a JSON-formatted file stays JSON-formatted
const CARD_RE = /("?)card\1(\s*):(\s*)"(?:[^"\\]|\\.)*"/;
const DESC_RE = /("?)desc\1(\s*):(\s*)"(?:[^"\\]|\\.)*",/;

let changed = 0;
for (const [file, slug, card] of PATCH) {
  const p = D + file;
  const src = fs.readFileSync(p, 'utf8');
  const range = objRange(src, slug);
  if (!range) { console.log('  SKIP ' + slug + ' — could not locate the object'); continue; }

  const [a, b] = range;
  let obj = src.slice(a, b);
  const esc = card.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  if (CARD_RE.test(obj)) {
    obj = obj.replace(CARD_RE, (m, q, s1, s2) => q + 'card' + q + s1 + ':' + s2 + '"' + esc + '"');
    console.log('  replaced  ' + slug);
  } else if (DESC_RE.test(obj)) {
    obj = obj.replace(DESC_RE, (m, q, s1, s2) => m + '\n    ' + q + 'card' + q + s1 + ':' + s2 + '"' + esc + '",');
    console.log('  INSERTED  ' + slug + ' (had no card)');
  } else {
    console.log('  SKIP ' + slug + ' — no card field and no desc to anchor to');
    continue;
  }

  fs.writeFileSync(p, src.slice(0, a) + obj + src.slice(b));
  changed++;
}
console.log('\n  ' + changed + ' of ' + PATCH.length + ' patched');
