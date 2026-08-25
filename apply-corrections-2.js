// apply-corrections-2.js — second round of maker replies.
//
// Sorbet Sorority sent a fact we did not have. Amadeus Vanilla Beans built an
// affiliate programme and sent the link — the first on this site that exists
// because a maker went and made one, and they built it in-house rather than on
// a platform so nothing sits between the commission and them.
//
// The Amadeus edit changes the URL and NOTHING ELSE. Cassie said the write-up
// needs no change either way, and the site's rule is the same: a commission
// never moves a word of the copy. Anyone comparing the card before and after
// should find only the link different.
//
// Each replacement asserts its target appears exactly once before writing.
const fs = require('fs');

const EDITS = [
  {
    who: 'Sorbet Sorority — collagen and protein',
    file: 'C:/tmp/shelf-content/gap-frozen-desserts.js',
    // "Each pint has 28-29g of collagen, so it is dairy free and high protein."
    from: 'shipped Monday through Wednesday so it arrives fast.',
    to:   'shipped Monday through Wednesday so it arrives fast. Each pint carries 28\u201329g of collagen, so it is high in protein as well as dairy-free.',
  },
  {
    who: 'Amadeus Vanilla Beans — affiliate link',
    file: 'C:/tmp/shelf-content/baking.js',
    from: 'url: "https://amadeusvanillabeans.com/"',
    to:   'url: "https://amadeusvanillabeans.com/?utm_source=5best2buy&utm_medium=affiliate"',
    alt:  "url: 'https://amadeusvanillabeans.com/'",
  },
];

let applied = 0, failed = 0;
for (const e of EDITS) {
  const src = fs.readFileSync(e.file, 'utf8');
  let needle = e.from;
  let n = src.split(needle).length - 1;
  if (n === 0 && e.alt) { needle = e.alt; n = src.split(needle).length - 1; }

  if (n !== 1) {
    console.log(`  FAILED  ${e.who} — target found ${n} time(s), expected 1`);
    failed++;
    continue;
  }
  fs.writeFileSync(e.file, src.split(needle).join(needle === e.alt ? e.to.replace(/"/g, "'") : e.to));
  console.log(`  applied ${e.who}`);
  applied++;
}
console.log(`\n  ${applied} applied, ${failed} failed`);
process.exit(failed ? 1 : 0);
