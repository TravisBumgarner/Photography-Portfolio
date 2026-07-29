---
name: find-contests
description: Sweep curated sources for photography contests that fit Travis's gear and subjects, reject rights-grab TOS and ineligible contests, verify everything on official pages, and update contest-scout/config/contest-deadlines.md. Use when asked to find photo contests, check contest deadlines, or refresh the contest list.
---

# Find photo contests

Maintain `contest-scout/config/contest-deadlines.md`: find new contests,
refresh deadlines, retire closed ones. Every fact in that file must come from
an official contest page — never trust aggregator listings or SEO listicles
as final sources; they are leads to verify.

## Profile (who is entering)

- Lives in **Mexico City**; contests must be open to **Mexico residents or US
  residents**. Mexican-resident-only contests (Cuartoscuro) are top-tier fits.
- Subjects: US/Canada national parks + mountain landscape, CDMX
  street/documentary, fog/night, festivals, drone aerial, film photography.
- Gear (contests gear-locked to anything else are ineligible):
  - Digital: Nikon Z5 / D7500 / D5300 with **Tamron and Sigma** lenses,
    **DJI Mini 3 Pro**, iPhone 13/15, Pixel 3
  - Film: **Pentax K1000** (35mm), **Yashica C** (TLR, 120), Nikon film SLR,
    Olympus point-&-shoot
  - Film stocks: Kodak (Portra/Ektar/Gold/UltraMax/Tri-X/T-Max), Ilford
    (HP5/Delta 3200/Kentmere), Fuji (Acros/Pro 160/X-Tra), Lomography stocks
- Not a student (student-only contests: note but mark ineligible unless told
  otherwise). Amateur/semi-pro — "professionals only" calls are edge cases,
  flag rather than drop.

## Hard filters

**Rights/TOS — read the actual rules PDF/terms page for every new contest.**
REJECT (list in the Rejected table with the quoted clause) when terms applied
to ALL entries (not just winners) include any of:

- "entries become the property of" the organizer
- perpetual or irrevocable license + commercial/"any purpose"/"any other
  reason" use, uncompensated
- derivative-works + "exploit in any manner" language
- moral-rights waivers

Winners-only licenses are normal and fine (that's the trade). Promo-scoped,
time-limited, or credited licenses on entries = CAUTION, note it but keep.
Known standing rejects (don't re-litigate unless terms change): Lomography
(site terms grab commercial rights on all uploads), Tamron Americas, Ricoh GR
Photo Festival, Smithsonian, CEWE, AlaskaTravel.

**Mills — never list:** GuruShots, ViewBug, Photocrowd, and anything whose
"contest" is peer-voting with paid boosts or subscription upsells.

**Fees:** free strongly preferred; note small fees (≤~$10/entry) for
high-value fits (Cuartoscuro); skip pay-per-photo awards mills (IPPA-style).

## Sources (verified fetchable July 2026 — adjust as they rot)

Primary sweep, in order:

1. `https://photocontestdeadlines.com/all-photo-competitions/` — plain HTML,
   inline deadline + **Free/Paid flag**; filter Landscape/Street/Nature + Free.
2. `https://convocatorias.cultura.gob.mx/vigentes` — Mexico's federal
   convocatorias portal, "Fotografía" filter; free, real prize money,
   Mexican-resident calls no English aggregator carries.
3. `https://www.all-about-photo.com/photo-contests/photo-contests.php` —
   curated, chronological; fees hidden behind detail pages (fetch per lead).
4. `https://free-photo-contests.com/` — free-only by policy; hobby-heavy,
   cross-check against #1.
5. `https://mexicoescultura.com/disciplina/75/convocatorias` — catches Centro
   de la Imagen / CDMX institutional calls the federal portal misses.

Brand/recurring direct checks (cheap, do every run):

- `https://www.worldphoto.org/sony-world-photography-awards/open` (Sony WPA)
- `https://www.nikon-photocontest.com/en/` (Nikon Film & Photo Contest)
- `https://analoguewonderland.co.uk/blogs/competitions` (best film-comp terms)
- `https://www.lensculture.com/competitions` (JSON-LD embedded — parse fee
  from structured data; free single-image windows appear irregularly)
- `https://revistacuartoscuro.com/category/noticias/convocatorias/` (~Dec)
- `https://www.skypixel.com/` (~Dec) · Banff `banffcentre.ca/film-fest/competitions` (~Feb–Apr)

Annual seed (January runs only): Digital Camera World's "best photography
awards to enter in {year}, ranked by deadline" article.

Known-blocked (don't burn time): Picter (403/JS), Reddit (403 without OAuth),
amateurphotographer.com (403), forphotographersonly.com (JS-only),
photocontestinsider.com (flaky origin — retry once, then skip). Film-specific
calendars don't exist; keyword-match "film / analog / analogue / 35mm / 120"
across sources 1, 3, 4 instead.

## Procedure

1. Read `contest-scout/config/contest-deadlines.md` (current state + standing
   rejects). Note today's date; anything whose deadline passed moves out of
   "Open now" (to Watchlist with next-cycle estimate, or drop).
2. Sweep the primary sources + direct checks (WebFetch; WebSearch when a page
   fails). Collect candidate contests not already tracked.
3. For each candidate: fetch the OFFICIAL rules/terms page and extract
   deadline (with year + timezone if tight), fee, eligibility (Mexico? US?),
   rights clause (quote the operative sentence), gear locks, and fit.
   Apply the hard filters. When rules are unfetchable, mark ⚠ UNVERIFIED
   rather than guessing — never present unverified terms as checked.
4. Update `contest-deadlines.md` in place, preserving its section structure
   (Open now / Watchlist / Rejected / Cadence) and the "last sweep" date.
   Rejections keep the quoted clause so future runs don't re-litigate.
5. Report: what's newly open, what closes within ~6 weeks, what changed, what
   was rejected and why. Lead with deadlines that need action soon.

Automation: `contest-scout/` in this repo ships a container image that runs
this skill headless on the Pi monthly and sends the summary through the
contact-form relay — see `contest-scout/README.md`. This file is baked into
that image, so edits here only reach the Pi on the next tagged release. Its
prompt names a deadlines file in the Pi's data volume; when a target file is
given, maintain THAT file instead of the repo copy, and make the final reply
the short notification summary the runner asks for.
