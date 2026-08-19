// maker-swaps.js — verified replacements for the conglomerate placements.
//
// Every claim below traces to the maker's own page or to cited reporting, and
// where a fact could not be confirmed it is simply absent. FarmerDave states no
// city, so no city appears on their card.
module.exports = [

{
  shelf: 'horse-feed',
  drop: ['Nutrena'],                              // Cargill
  add: [
    {
      rank: 'Forage First, Grain Never',
      name: 'Unbeetable Feeds',
      line: 'family-owned, upper Midwest · beet-pulp base, under 8% NSC',
      price: '$$', ship: 'ground',
      url: 'https://unbeetablefeeds.com/',
      body: 'A family-owned mill in the upper Midwest building grain-free feeds on beet pulp sourced from family sugar-beet farms in the region, formulated with Kentucky Equine Research and milled in ionophore-free facilities. The formulas run under 8% NSC, which is the number that matters for a horse with metabolic issues, and the whole approach is built around a horse eating forage all day rather than two large starch meals.',
      whyHead: 'Why NSC is the number to read',
      why: 'A horse with insulin resistance, PSSM or laminitis history cannot process a starch spike, and most bagged feeds are built around grain. Sub-8% is the range where a metabolic horse can be fed normally instead of managed around.',
    },
    {
      rank: 'Fixed Formula Since 1934',
      name: 'Seminole Feed',
      line: 'Ocala, FL · fixed-formula, non-medicated mill',
      price: '$$', ship: 'local',
      url: 'https://seminolefeed.com/',
      body: 'Family-owned in Ocala since 1934, milling in the middle of the horse country it sells into. Seminole is one of the few feed companies still making fixed-formula feeds — the ingredient list stays the same batch to batch instead of shifting with commodity prices, so the bag you buy in March is the bag you bought in November. Everything is milled at their own non-medicated facility. Sold through southeast dealers and three Marion County stores rather than shipped, so this one is regional.',
      whyHead: 'Why fixed formula is worth asking about',
      why: 'Most feeds are least-cost formulated: the guaranteed analysis holds but the actual ingredients change with the commodity market. Horses with sensitive guts react to that even when the tag reads identical.',
    },
  ],
},

{
  shelf: 'chinchilla-food',
  drop: ['Mazuri'],                               // Land O'Lakes / PMI Nutrition
  add: [{
    rank: 'Timothy And Nothing Else',
    name: 'FarmerDave',
    line: "family farm · 100% timothy hay pellets, hand-packed",
    price: '$$', ship: 'ground',
    url: 'https://www.farmerdavepetsupply.com/20-lb-timothy-hay-pellets',
    body: 'Pellets pressed from 100% timothy hay with no binders, grains or additives — 7% protein, 35% max fibre — hand-packed into paper sacks and boxed rather than sealed in plastic, specifically so they do not sweat into mildew in transit. Shipped straight off the family farm. For a chinchilla, a plain compressed-forage pellet alongside free hay is closer to the diet than any fortified mix.',
    whyHead: 'Why a plain pellet beats a fancy mix',
    why: 'Chinchillas selectively eat the sweet bits out of a muesli-style mix and leave the fibre, which is exactly backwards for a hindgut fermenter. A single uniform pellet removes the choice.',
  }],
},

{
  shelf: 'guinea-pig-food',
  drop: ['Mazuri'],
  add: [{
    rank: 'Timothy And Nothing Else',
    name: 'FarmerDave',
    line: "family farm · 100% timothy hay pellets, hand-packed",
    price: '$$', ship: 'ground',
    url: 'https://www.farmerdavepetsupply.com/5-lb-timothy-hay-pellets',
    body: 'Pellets pressed from 100% timothy hay with no binders, grains or additives — 7% protein, 35% max fibre — hand-packed into paper sacks and boxed instead of plastic-sealed, so they do not sweat into mildew on the way. Shipped straight off the family farm. Worth pairing with a vitamin C source, since guinea pigs cannot make their own and a plain forage pellet does not carry it.',
    whyHead: 'Why the vitamin C caveat matters here',
    why: 'Guinea pigs are one of the few mammals that cannot synthesise vitamin C, and it degrades in storage even in fortified pellets. A plain timothy pellet plus fresh peppers is more reliable than trusting a bag that has been on a shelf for months.',
  }],
},

];
