```
╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                            ║
║        ███████╗██████╗ ███████╗███████╗████████╗██████╗ ██████╗ ██╗   ██╗██╗   ██╗         ║
║        ██╔════╝██╔══██╗██╔════╝██╔════╝╚══██╔══╝╚════██╗██╔══██╗██║   ██║╚██╗ ██╔╝         ║
║        ███████╗██████╔╝█████╗  ███████╗   ██║    █████╔╝██████╔╝██║   ██║ ╚████╔╝          ║
║        ╚════██║██╔══██╗██╔══╝  ╚════██║   ██║   ██╔═══╝ ██╔══██╗██║   ██║  ╚██╔╝           ║
║        ███████║██████╔╝███████╗███████║   ██║   ███████╗██████╔╝╚██████╔╝   ██║            ║
║        ╚══════╝╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚══════╝╚═════╝  ╚═════╝    ╚═╝            ║
║                                                                                            ║
║                    who actually makes it, and can you buy it from them?                    ║
║                                                                                            ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝
```

[5best2buy.com](https://5best2buy.com) — **Worth The Hunt.** Product shelves
for independent makers, where every pick carries its provenance: who makes it,
where, and how that was established.

## The build

`node build-all.js` is the build. It runs every stage in order and emits the
shelves, the aisles, the recipes and the search index from the data files at
the repository root. Individual `batch-*.js` and `*-2.js` scripts are stages,
not entry points.

```
node build-all.js
node verify-makers.js
node audit-outbound.js
```

## The two checks that matter

`verify-makers.js` exists because the site's promise is small independent
makers, and a shelf carrying a Cargill or Land O'Lakes brand is the opposite of
that claim. It resolves each maker URL on the domain the site claims, checks the
domain against an explicit conglomerate list, and reports anything it could not
resolve rather than dropping it. Ownership is not fully machine-checkable, so a
brand absent from that list is **unverified, not cleared**.

`audit-outbound.js` answers where the money actually leaves the site. It
unwraps every outbound link through its redirect layer first, because a raw
host count would report the affiliate redirector as the top destination and
tell you nothing.

## The recipes

Recipes exist to map ingredients onto shelves and hardware onto tools, so a
method page and a product page are two views of the same data rather than two
pieces of writing that can drift apart.

---

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║      ███████╗      ██╗  ██╗███████╗██╗   ██╗███████╗       ║
║      ██╔════╝      ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔════╝       ║
║      █████╗  █████╗█████╔╝ █████╗   ╚████╔╝ ███████╗       ║
║      ██╔══╝  ╚════╝██╔═██╗ ██╔══╝    ╚██╔╝  ╚════██║       ║
║      ██║           ██║  ██╗███████╗   ██║   ███████║       ║
║      ╚═╝           ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝       ║
║                                                            ║
║               ·   C  R  E  A  T  I  V  E   ·               ║
║                                                            ║
║          ────────────────────────────────────────          ║
║                                                            ║
║                      Vincent Gonzalez                      ║
║                         f-keys.com                         ║
║                 ORCID 0009-0005-3640-014X                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

Part of [F-Keys](https://f-keys.com) — independent hardware, software
and internet products. See the [working log](https://f-keys.com/log/)
and [live status](https://f-keys.com/status/).
