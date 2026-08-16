// audit-outbound.js -- where does the money actually leave the site?
//
// The question this answers: the Awin MasterTag sits on 670 of 2,382 pages.
// Blanketing it across the other 1,712 is only worth doing if those pages link
// to merchants in an affiliate network. If they link to independent makers who
// are in no network at all, the tag converts nothing and the fix is different.
//
// Every outbound href is unwrapped through any redirect layer first, because a
// raw host count on this site would report "awin1.com" as the top destination
// and tell us nothing. Handles the HTML-escaped &amp; form, which is how these
// are actually written in the files.
const fs = require('fs'), path = require('path');
const ROOT = 'C:/tmp/5b2b-live';

const SELF = /(^|\.)5best2buy\.com$/i;
// redirect hosts and the query param carrying the real destination
const REDIR = {
  'awin1.com': ['ued', 'p'], 'www.awin1.com': ['ued', 'p'],
  'dwin1.com': ['ued', 'p'], 'www.dwin1.com': ['ued', 'p'],
  'go.skimresources.com': ['url'], 'go.redirectingat.com': ['url'],
  'shareasale.com': ['urllink'], 'www.shareasale.com': ['urllink'],
  'click.linksynergy.com': ['murl'], 'anrdoezrs.net': ['url'], 'tkqlhce.com': ['url'],
};

function unwrap(href) {
  let u;
  try { u = new URL(href.replace(/&amp;/g, '&')); } catch (e) { return null; }
  for (let hop = 0; hop < 4; hop++) {
    const params = REDIR[u.hostname.toLowerCase()];
    if (!params) break;
    let inner = null;
    for (const p of params) {
      let v = u.searchParams.get(p);
      if (!v) continue;
      // these are often double-encoded
      for (let d = 0; d < 3 && /%3A|%2F/i.test(v); d++) { try { v = decodeURIComponent(v); } catch (e) { break; } }
      if (/^https?:/i.test(v)) { inner = v; break; }
    }
    if (!inner) break;
    try { u = new URL(inner); } catch (e) { break; }
  }
  return u;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const hostTotals = new Map();          // host -> {links, pages:Set, tagged, withMT, withoutMT}
let pagesWithMT = 0, pagesWithout = 0, pagesWithSkim = 0;
let linksOnMT = 0, linksOffMT = 0;

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const rel = f.slice(ROOT.length).replace(/\\/g, '/');
  const hasMT = h.includes('dwin2.com/pub.2961345');
  const hasSkim = h.includes('skimresources.com');
  if (hasMT) pagesWithMT++; else pagesWithout++;
  if (hasSkim) pagesWithSkim++;

  const seen = new Set();
  for (const m of h.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const u = unwrap(m[1]);
    if (!u) continue;
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (SELF.test(host)) continue;
    // infrastructure, not destinations
    if (/^(pagead2\.googlesyndication|googletagmanager|google-analytics|s\.skimresources|dwin2)\.com$/.test(host)) continue;
    if (/(schema\.org|w3\.org|creativecommons\.org|github\.com|fonts\.g)/.test(host)) continue;

    let rec = hostTotals.get(host);
    if (!rec) hostTotals.set(host, rec = { links: 0, pages: new Set(), tagged: 0, onMT: 0, offMT: 0 });
    rec.links++; rec.pages.add(rel);
    // Test the NORMALISED href. In the files these are written &amp;tag=, so a
    // [?&] class run against the raw string matches nothing and the audit
    // reports a confident zero -- which it did, on 4,924 tagged links.
    if (/[?&](tag|awinmid|awinaffid|ascsubtag)=/i.test(m[1].replace(/&amp;/g, '&'))) rec.tagged++;
    if (hasMT) { rec.onMT++; linksOnMT++; } else { rec.offMT++; linksOffMT++; }
    seen.add(host);
  }
}

const rows = [...hostTotals.entries()].sort((a, b) => b[1].links - a[1].links);
const AMZ = /(^|\.)amazon\.(com|co\.uk|ca)$/;

console.log(`pages: ${files.length}   with MasterTag ${pagesWithMT}   without ${pagesWithout}   with Skimlinks ${pagesWithSkim}`);
console.log(`outbound links: ${linksOnMT + linksOffMT}   on MasterTag pages ${linksOnMT}   on pages with no rewriter ${linksOffMT}`);

console.log(`\ndistinct outbound destinations: ${rows.length}`);
const amazon = rows.filter(r => AMZ.test(r[0]));
const amzLinks = amazon.reduce((s, r) => s + r[1].links, 0);
const amzTagged = amazon.reduce((s, r) => s + r[1].tagged, 0);
const other = rows.filter(r => !AMZ.test(r[0]));
const otherLinks = other.reduce((s, r) => s + r[1].links, 0);
const otherTagged = other.reduce((s, r) => s + r[1].tagged, 0);

console.log(`\n  Amazon        : ${amzLinks} links, ${amzTagged} carrying a tag (${(100 * amzTagged / (amzLinks || 1)).toFixed(1)}%)`);
console.log(`  everything else: ${otherLinks} links across ${other.length} hosts, ${otherTagged} carrying any affiliate param (${(100 * otherTagged / (otherLinks || 1)).toFixed(1)}%)`);

console.log(`\ntop 30 non-Amazon destinations (links | pages | tagged | on-MT / off-MT):`);
for (const [host, r] of other.slice(0, 30)) {
  console.log(`  ${host.padEnd(34)} ${String(r.links).padStart(5)} | ${String(r.pages.size).padStart(5)} | ${String(r.tagged).padStart(4)} | ${r.onMT}/${r.offMT}`);
}

// the long tail is the point: how many hosts get exactly one or two links
const tail = other.filter(r => r[1].links <= 2).length;
console.log(`\nlong tail: ${tail} of ${other.length} non-Amazon hosts are linked <=2 times (${(100 * tail / (other.length || 1)).toFixed(0)}%)`);
