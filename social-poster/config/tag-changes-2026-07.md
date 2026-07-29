# tags.json changes — July 2026

Applied from the research in [tag-research-2026-07.md](tag-research-2026-07.md).
All 37 tests pass after these changes; no existing tag-tree keys were renamed,
so existing Lightroom keywords keep working. New keywords needed are listed in
[../TODO.md](../TODO.md).

## Corrections (things that were wrong or dead)

| Change | Why |
|---|---|
| `Special > NatGeoYourShot`: `#yourshotphotographer` → `#NatGeoYourShot` | NatGeo's own FAQ (Jan 2025): the year-round submission tag is #NatGeoYourShot. The old tag isn't monitored. |
| Removed `@analogsunrise` / `#analogsunrise` from all film cameras | No trace of the account anywhere (searches + Reddit film community). Presumed dead. **CORRECTION (in-app check, July 2026): alive — re-added to all five film cameras.** |
| Removed the malformed `"#filmphotography 🎞️"` Bluesky entries (5 places) | The 🎞️ emoji is a caption convention on Bluesky (`📷 camera / 🎞️ film stock` lines), not part of a hashtag. The literal string was never a valid tag. |
| Fixed `Camera > DJIMini3Pro` Bluesky list | It contained film-photography tags (copy-paste bug). Now: #dronephotography, #AerialPhotography, #dji. |
| `Place > Mexico > Country`: dropped `#fotoexploramx` from priority | @fotoexplora.mx is a commercial photo-tour company, not a curator; no evidence tagged photos get featured. |

## New feature hubs on existing entries

| Entry | Added to `priority` |
|---|---|
| NikonD5300, NikonD7500 | `#NikonNoFilter`, `@nikonusa` |
| NikonZ5 | `#NikonNoFilter`, `#Zcreators`, `@nikonusa` |
| All film cameras (NikonSLR, OlympusPS, PentaxK1000, YashicaC, UnknownFilmCamera) | `#RedditAnalog`, `@redditanalog` (r/Analog's official feature account) |
| IlfordHP5, IlfordDelta3200, Kentmere400 | `#ilfordphoto`, `#fridayfavourites`, `@ilfordphoto` — weekly feature program, works on Instagram AND Bluesky (tags added to both buckets) |
| All Kodak stocks (TMax400, Gold200, Portra 160/400/800, Ektar100, Ultramax400, 400TX) | `@kodakprofessional` (Ultramax400 and 400TX also gained `#MadeWithKodak`, which they were missing) |
| Fuji stocks (Across100, FujifilmXtra400, FujiPro160) | `#ishootfujifilm`, `@fujifilm_profilm` |
| Mexico > Country | `#mexico_fotografos`, `@mexico_fotografos`, `#Mexico_Maravilloso`, `@mexico_maravilloso` |
| USA > Montana | `#MontanaMoment`, `@visitmontana` |
| USA > Utah | `#VisitUtah`, `@visitutah` (existing Moab tags kept but unverified) |
| NationalPark > Banff | `#ParksCanada`, `@parks.canada` (official; kept `@banff.national.park` as secondary fan hub) |
| PhotoType > Street | `#SDMfeatures` (Street Dreams Mag's feature tag); general gained `#fotografiacallejera` |
| SocialEvent > PrideCelebration | `@marchalgbtcdmx`; general gained `#orgullocdmx`, `#marchalgbtcdmx` |

## New entries

**Places — USA states** (leaf `State`, like Montana):
Alaska (`#TravelAlaska` `@travelalaska`), Wyoming (`#ThatsWY` `@visitwyoming`),
Idaho (`#VisitIdaho` `@visitidaho`), Oregon (`#traveloregon` `@traveloregon`),
Washington (`#TrueToNature` `@stateofwatourism`).

**Places — new `Canada` branch** (leaf `Province`):
Yukon (`#ExploreYukon` `@travelyukon`), BritishColumbia (`#exploreBC` `@hellobc` —
they curate features daily from the tag), Alberta (`#ExploreAlberta` `@travelalberta`).

**National parks** — Canadian parks all carry `#ParksCanada` + `@parks.canada`
("Use #ParksCanada to be featured"); US parks carry their official handle +
`#nationalparkgeek`:
- Kootenay, Jasper, Yoho, GlacierCanada (kept separate from the existing
  Montana `Glacier` entry)
- Denali (`@denalinps`), Katmai (`@katmainpp` — note the `pp`), KenaiFjords
  (`@kenaifjordsnps`), WrangellStElias (no own account — `@alaskanps`),
  Yellowstone (`@yellowstonenps`), GrandTeton (`@grandtetonnps`), Olympic
  (`@olympic_nps` — NOT @olympicnationalpark)
- The four Alaska parks also carry `@alaskanps` (covers all 15 AK units).

**SocialEvent > WorldCup2026:** priority `@mexicocity26_` (official CDMX host-city
account), `@fifaworldcup`, `#SomosLeyendas`; general includes lasting tags
(`#FIFAWorldCup`, `#Mundial2026`, `#EstadioAzteca`) and 2026 spike tags
(`#WeAre26`, `#Somos26`) that should be pruned after the tournament fades.

**SocialEvent > DayOfTheDead** general gained Spanish tags: `#catrina`,
`#cempasuchil`, `#desfilediademuertoscdmx`, `#2denoviembre`, `#tradicionesmexicanas`.

## Bluesky bucket tune-ups

- Mexico > Country: added `#fotografia` (the top Bluesky photo feed matches both
  #photography and #fotografia — real Spanish-language reach).
- Landscape: added `#naturephotography`; Animals: added `#wildlife`; Stars:
  `#astro` replaces `#astrophoto` — these are the trigger tags for the curated
  nature/landscape feeds (Top Nature Photography, @bluesky.photography Landscapes).
- Architecture (Instagram general): added `#arquitectura`.
