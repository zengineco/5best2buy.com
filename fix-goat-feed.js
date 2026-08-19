// fix-goat-feed.js — take the conglomerates off the goat shelf.
//
// The shelf carried Manna Pro (private-equity held, national scale) and Purina
// (Land O'Lakes), which is the opposite of what the site says it does, on a
// shelf in the category where makers are actually writing back to us.
//
// The four going on are verified: ownership, location, and the specific
// numbers below all come from the makers' own pages or from cited reporting,
// and none of it is inferred. Where I could not confirm something — Redmond is
// NOT family-owned, Rhett Roberts bought it in 1999 — the card does not say it.
const fs = require('fs');
const FILE = 'C:/tmp/5b2b-live/hunt/goat-feed/index.html';

const BADGES = (price, ship) => {
  const shipTag = ship === 'local'
    ? '<span title="Regional, seasonal, or limited availability" style="color:var(--soft);letter-spacing:.2px;">\u{1F69C} Local / limited</span>'
    : '<span title="Ships ground only \u2014 often frozen, heavy, or slower" style="color:var(--soft);letter-spacing:.2px;">\u{1F69B} Ground only</span>';
  return `<div class="badges" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:-2px 0 13px;font-family:var(--fm);font-size:15px;"><span title="Typical price" style="font-weight:700;color:var(--green);letter-spacing:1.5px;">${price}</span><span title="5best2buy rating: 5 of 5" style="color:var(--gold);letter-spacing:2px;font-size:15px;">\u2605\u2605\u2605\u2605\u2605</span>${shipTag}</div>`;
};

const card = c => `>
    <div class="rank">${c.rank}</div>
    <h2>${c.name}</h2>
    <div class="maker">${c.line}</div>
    ${BADGES(c.price, c.ship)}
    <p>${c.body}</p>
    <p class="why"><b>${c.whyHead}</b>${c.why}</p>
    <a class="hunt" href="${c.url}" rel="sponsored nofollow" target="_blank">See it at ${c.name} \u2192</a>
  </div>`;

const NEW = [
  {
    rank: 'Mined From One Utah Deposit',
    name: 'Redmond Agriculture',
    line: 'Redmond, UT \u00b7 60+ trace minerals, mined rather than blended',
    price: '$$', ship: 'ground',
    url: 'https://agriculture.redmond.com/products/goat-mineral',
    body: 'In 1958 two farming brothers, Milo and Lamar Bosshardt, lost a season to drought and took out a loan to mine the salt deposit under their own ground \u2014 an ancient seabed left by the Sundance Sea and sealed in by volcanic rock. That deposit is still the whole source. The goat mineral is that mined salt, carrying more than sixty naturally occurring trace minerals, then fortified with selenium at 30&nbsp;ppm plus copper, zinc, cobalt, iodine and vitamins A, D and E. Shipping is free over $30, which puts it within reach of a two-goat backyard herd.',
    whyHead: 'Why mined beats blended',
    why: 'Most minerals are assembled from purchased components and taste like it \u2014 goats leave them. This one starts as a single geological deposit with a traceable origin, and palatability is the whole game with free-choice minerals.',
  },
  {
    rank: 'Copper Without The Molybdenum',
    name: 'Premier1Supplies',
    line: 'Washington, IA \u00b7 formulated in-house for small ruminants',
    price: '$$', ship: 'ground',
    url: 'https://www.premier1supplies.com/p/goat-trace-mineral-premix',
    body: 'Stan Potratz came back to the family farm in Iowa from England in 1977, found that none of the sheep equipment he had used over there was sold in the States, and imported enough for himself. Neighbours asked where he got it. He and Jean have owned the business ever since. Their goat trace mineral premix is formulated by their own small-ruminant nutritionist and carries added copper with <b>no added molybdenum</b>, plus high zinc and iodine for hoof and reproductive health.',
    whyHead: 'Why the molybdenum line matters',
    why: 'Molybdenum binds copper in the rumen and makes it unavailable. A mineral can list copper on the tag and still leave a goat deficient if it is loaded with molybdenum \u2014 and sheep minerals, which many people feed goats by mistake, are copper-poor on purpose because copper accumulates and kills sheep.',
  },
  {
    rank: 'Chelated, Since 1932',
    name: 'Poulin Grain',
    line: 'New England \u00b7 995 ppm copper, 25 ppm selenium',
    price: '$$', ship: 'local',
    url: 'https://www.poulingrain.com/products/227/goat-mineral',
    body: 'A family mill running since 1932 and sold through hundreds of independent farm stores across the Northeast rather than shipped to your door. The goat mineral uses chelated trace minerals \u2014 bound to amino acids so more is absorbed instead of passing straight through \u2014 at 995&nbsp;ppm copper and 25&nbsp;ppm selenium, with vitamin&nbsp;E at 750&nbsp;IU per pound and XP yeast for rumen function. If you are in New England, the dealer locator is the way in; if you are not, this one is not for you.',
    whyHead: 'Why chelation is worth paying for',
    why: 'An inorganic mineral can read perfectly on the guaranteed analysis and still pass through the animal. Chelated forms are about how much the goat absorbs, which is a different number from how much is in the bag.',
  },
  {
    rank: 'Blended To Your Herd',
    name: 'Peterson Organic Feeds',
    line: 'Mountain Grove, MO \u00b7 USDA, Ecocert and ICO certified',
    price: '$$$', ship: 'local',
    url: 'https://www.petersonorganicfeeds.com/',
    body: 'A small family operation in the Missouri Ozarks that custom-blends organic livestock rations and mineral mixes to order \u2014 goats, sheep, poultry, cattle, swine. Certified USDA organic, Ecocert and ICO. Ordering means a phone call and a lead time rather than a cart and a tracking number, which is the trade you make for a ration mixed to your herd instead of to a national average.',
    whyHead: 'Why custom blending exists at all',
    why: 'Soil copper and selenium vary enormously by region, and a bagged national mineral is formulated for the average of everywhere. A blender who will adjust to your ground is solving a problem a shelf-stable bag cannot.',
  },
];

let h = fs.readFileSync(FILE, 'utf8');
const parts = h.split(/<div class="find"/);
const head = parts[0];
const cards = parts.slice(1);
console.log(`  cards before: ${cards.length}`);

const nameOf = c => (c.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '';
const keep = cards.filter(c => !/Manna Pro|Purina/i.test(nameOf(c)));
const dropped = cards.length - keep.length;
if (dropped !== 2) { console.log(`  ABORT: expected to drop 2 conglomerates, dropped ${dropped}`); process.exit(1); }
console.log(`  dropped: Manna Pro, Purina`);

const rebuilt = head + [...NEW.map(card), ...keep.map(c => '<div class="find"' + c)]
  .map(c => c.startsWith('<div class="find"') ? c : '<div class="find"' + c).join('');

fs.writeFileSync(FILE, rebuilt);

const after = fs.readFileSync(FILE, 'utf8').split(/<div class="find"/).length - 1;
console.log(`  cards after : ${after}`);
NEW.forEach(c => console.log(`    + ${c.name}`));
keep.forEach(c => console.log(`    = ${nameOf(c)} (kept)`));
