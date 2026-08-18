// apply-corrections.js — maker corrections, applied at whichever source owns them.
//
// Every edit here came from the maker themselves replying to the outreach email,
// and every one is checkable on their own site. Each replacement asserts the
// target string appears exactly once before writing, so a near-miss fails loudly
// instead of silently editing the wrong card or nothing at all.
const fs = require('fs');

const EDITS = [
  // ---- Teeccino (chicory-coffee) — GENERATED source ----
  // "you might add that gluten-free blends are available and that all of our
  //  products are vegan" — Kumari de Silva, Teeccino, 2026-08-17
  {
    who: 'Teeccino',
    file: 'C:/tmp/shelf-content/gap-beverages2.js',
    from: 'or in tee-bags.',
    to: 'or in tee-bags. Gluten-free blends are available and the entire range is vegan.',
  },

  // ---- Smalls (cat-food) — STATIC HTML, no generator ----
  // "our Fresh recipes ... are gently cooked before being frozen—not raw.
  //  'Ground' and 'Smooth' are the terms we use for the textures rather than
  //  'minced' and 'pâté', and our protein names include Bird, Other Bird, and Cow."
  {
    who: 'Smalls — recipe names and textures',
    file: 'C:/tmp/5b2b-live/hunt/cat-food/index.html',
    from: 'delivered straight to your door in recipes like chicken, turkey, and beef (minced or p\u00e2t\u00e9).',
    to: 'delivered frozen to your door. Recipes are named for what\u2019s in them \u2014 Bird, Other Bird, Cow \u2014 in two textures, Ground and Smooth.',
  },
  // "Fresh recipes are complete and balanced for cats, made with cat-specific
  //  nutrition in mind"
  {
    who: 'Smalls — complete and balanced',
    file: 'C:/tmp/5b2b-live/hunt/cat-food/index.html',
    from: 'It\u2019s cat-specific, thoughtfully formulated, and the transition plans are genuinely good.',
    to: 'It\u2019s complete and balanced, formulated with cat-specific nutrition in mind, and the transition plans are genuinely good.',
    alt: "It's cat-specific, thoughtfully formulated, and the transition plans are genuinely good.",
  },
  // the summary line still said high-moisture rather than frozen
  {
    who: 'Smalls — summary line',
    file: 'C:/tmp/5b2b-live/hunt/cat-food/index.html',
    from: 'human-grade, gently cooked, high-moisture \u00b7 delivered',
    to: 'human-grade, gently cooked, frozen \u00b7 delivered',
  },
];

let applied = 0, failed = 0;
for (const e of EDITS) {
  let src = fs.readFileSync(e.file, 'utf8');
  let needle = e.from;
  let n = src.split(needle).length - 1;

  // some files use a straight apostrophe where the page renders a curly one
  if (n === 0 && e.alt) { needle = e.alt; n = src.split(needle).length - 1; }

  if (n !== 1) {
    console.log(`  FAILED  ${e.who}  — target found ${n} time(s), expected exactly 1`);
    failed++;
    continue;
  }
  fs.writeFileSync(e.file, src.split(needle).join(e.to));
  console.log(`  applied ${e.who}`);
  applied++;
}
console.log(`\n  ${applied} applied, ${failed} failed`);
process.exit(failed ? 1 : 0);
