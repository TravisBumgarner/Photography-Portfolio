# TODO — social-poster tag overhaul (July 2026)

Follow-ups from the July 2026 tag research
([research](config/tag-research-2026-07.md) · [changes applied](config/tag-changes-2026-07.md) ·
[theme research](config/tag-research-themes-2026-07.md) · [gallery analysis](analysis/)).

## New PhotoTypes (from gallery clustering + theme research)

- [x] Decide which of the 12 candidate PhotoTypes to add to `tags.json` —
      **DECIDED (July 2026): skipping all 12 for now.** The research stays in
      [the theme doc](config/tag-research-themes-2026-07.md) with ready-to-use
      tag lists if any theme is adopted later.
- [ ] ~~Add matching Lightroom keywords under `cameracoffeewander|PhotoType|<Name>`~~
      n/a while the themes are skipped.
- [x] Dogs features are submission-based, not tag-based: email your best 2-3 dog
      shots to dogs.instagram@gmail.com (@dogsofinstagram, 5M).
- [ ] In-app: spend 10 min on #mountainphotography / #forestphotography /
      #desertphotography looking for mid-size (50-500K) curator accounts web
      search can't surface; same for #dogsofbluesky on Bluesky.
- [x] Verify @moodygrams / @nightphotography feature mechanics in-app — DONE
      (July 2026): **@moodygrams confirmed** — bio says "Use our tags for
      repost: #MoodyGrams #MoodyPorts" (scope is broad: travel/lifestyle/
      events/meets, not just moody landscape). **@nightphotography rejected**
      — removed from the Night theme recommendation.

## Lightroom — add 20 keywords

Keyword names must match `tags.json` keys exactly (case-sensitive, no spaces).
All nested under the `cameracoffeewander` root; nothing existing was renamed.

- [ ] `Place > USA > Alaska > State`
- [ ] `Place > USA > Wyoming > State`
- [ ] `Place > USA > Idaho > State`
- [ ] `Place > USA > Oregon > State`
- [ ] `Place > USA > Washington > State`
- [ ] `Place > Canada > Yukon > Province`
- [ ] `Place > Canada > BritishColumbia > Province` (one word)
- [ ] `Place > Canada > Alberta > Province`
- [ ] `Place > NationalPark > Denali`
- [ ] `Place > NationalPark > Katmai`
- [ ] `Place > NationalPark > KenaiFjords`
- [ ] `Place > NationalPark > WrangellStElias`
- [ ] `Place > NationalPark > Yellowstone`
- [ ] `Place > NationalPark > GrandTeton`
- [ ] `Place > NationalPark > Olympic`
- [ ] `Place > NationalPark > Kootenay`
- [ ] `Place > NationalPark > Jasper`
- [ ] `Place > NationalPark > Yoho`
- [ ] `Place > NationalPark > GlacierCanada` (existing `Glacier` stays = Montana)
- [ ] `SocialEvent > WorldCup2026`

## In-app verification — DONE (July 2026, all applied to tags.json)

- [x] `#mundusmag` — REMOVED: content is mostly sexy women, wrong fit for Portrait.
- [x] `#shadows_magazine` — verified, kept.
- [x] `@milkyway_nightscape` / `#milkyway_nightscape_` — verified, kept.
- [x] `#dpsp_rainshots` — REMOVED: account doesn't exist.
- [x] `@only.in.utah`, `#utahscanyoncountry` — verified, kept. Moab fixed to
      canonical casing `@VisitMoab` / `#VisitMoab`.
- [x] `@vermonttourism` — verified, kept.
- [x] `@banff.national.park` — verified, kept (secondary to Parks Canada).
- [x] `@mexico_fotografos` — verified active, kept.
- [x] `@analogsunrise` — ALIVE after all: `#analogsunrise` + `@analogsunrise`
      re-added to all five film cameras.
- [x] NEW: `@onlyinyourstate` added once at `Place > USA` — the tag tree now
      supports buckets on parent nodes, inherited by every child, so it
      applies to all US states without duplication.

## Bluesky actions (one-time)

- [ ] Comment on the pinned post of the **Top Nature Photography** feed
      (@nickchillphoto.com) to request contributor status — allowlist feed, triggers
      #landscape/#wildlife/#astro/#nature; requires alt text, no AI.
- [ ] Engage/follow **@bluesky.photography** (runs the curated Landscapes feed,
      active; selection is manual).
- [x] Add alt text to every Bluesky photo post — DONE (July 2026): the
      publisher derives alt text from the caption's title/description lines
      (gear/setup/tag lines dropped) and sends it to **both** Bluesky
      (`image_alt`) and Instagram (`alt_text`, Graph API param added Mar 2025).
      Hand-written per-photo descriptions would still be better; revisit if a
      feed ever rejects the derived text.
- [x] Adopt the analog caption convention on film posts — DONE (July 2026):
      captions render one `📷 <camera> / 🎞️ <film stock>` line **instead of**
      the Gear/Setup lines whenever a film-camera or film-stock keyword is
      present (scan EXIF settings were scanner noise anyway). Applied on both
      platforms; film-stock display names live in `_FILM_STOCK_NAMES` in
      `scripts/tagging.py` — add an entry there when adding a new FilmType.

## Known gaps from the research (July 2026)

- [x] **Hashtag volume is deprioritized on Instagram (2026):** DONE — captions
      are hard-capped at 5 hashtags total: priority hashtags (feature hubs) fill
      the budget first, then a random draw of general tags tops it up; @mentions
      don't count and are always kept. (Updated July 2026: hubs used to be
      exempt from the cap and could exceed 5 — now the 5-hashtag cap is hard,
      so a photo stacking many hubs keeps only its first 5 priority hashtags.)
      Alt text is now handled (derived from captions, sent to both platforms);
      still open: invest in keyword-rich captions.
- [x] **No Bluesky 300-char handling:** DONE — trailing tags are dropped until
      the caption fits 300 chars. Since lists are trimmed from the end, keep
      each `bluesky` list in tags.json ordered most-important-first (the long
      film-camera lists eat the budget before place/subject tags get in —
      consider slimming them).
- [x] **No feedback loop:** DONE (July 2026) — the publisher now captures each
      published item's platform id (IG media id / Bluesky at:// URI), the edit
      modal has a "Refresh stats" button that snapshots like/comment/repost
      counts into `engagement_snapshots` (append-only, survives deletion), and
      a free-text "Featured by" field logs hub pickups. Caveat: posts published
      *before* this change have no remote id and can't be fetched. Optional
      follow-up: cron `python -m scripts.engagement` (or POST
      `/api/engagement/snapshot`) monthly so history accrues without clicking.
- [ ] **Geotags not used — BLOCKED by API flavor (verified July 2026):** the
      app uses the Instagram-Login flavor (`graph.instagram.com`), which does
      not support `location_id` on media creation; location tagging (and the
      Pages Search API needed to find location ids) requires migrating to the
      Facebook-Login flavor: Facebook Page linked to the IG professional
      account, Facebook OAuth (`instagram_basic`, `instagram_content_publish`,
      `pages_show_list`, `pages_read_engagement`), calls via
      `graph.facebook.com`. Standard Access usually suffices for posting to
      your own account. Interim workaround: add the location by hand in the
      Instagram app after publish. Decide if CDMX local discovery justifies
      the migration.
- [x] **Contests are an unexplored feature pipeline:** DONE (July 2026) —
      deadlines list with verified dates, eligibility, and fit notes:
      [config/contest-deadlines.md](config/contest-deadlines.md). Highlights:
      Cuartoscuro ~Dec 2026 (best fit), Lomography TEN AND ONE ~autumn 2026,
      Tamron's US-only National Park contest is INELIGIBLE from Mexico (but
      Tamron Americas' own contest isn't).
- [ ] **Bluesky depth:** only ~5 of 1,300+ photography feeds verified; no
      starter-pack/follow-graph strategy researched.
- [ ] Stills-only strategy: IG reach in 2026 skews heavily to Reels — out of
      social-poster's scope, but it caps expectations for static-photo growth.

## Process / recurring

- [ ] Ilford **#fridayfavourites** rotates a weekly theme — check
      ilfordphoto.com/blog for the current theme tag before posting Ilford/Kentmere shots.
- [ ] NatGeo Your Shot monthly themed challenges use rotating tags
      (e.g. #NatGeoYourShotOurHOME) — worth checking when a photo fits the theme.
      Rules: public account, photo <6 months old, no AI/heavy manipulation.
- [ ] Decide on Utah's `#YesVisitUtah` permission flow — replying grants a
      perpetual, transferable license incl. paid ads. Only reply if OK with that.
- [ ] Prune WorldCup2026 spike tags (`#WeAre26`, `#Somos26`, `#SomosLeyendas`)
      once the tournament buzz dies (~Sept 2026); keep `#FIFAWorldCup`,
      `#EstadioAzteca`, `#Mundial2026`.
- [ ] Drone work: enter DJI's annual **SkyPixel** contest (skypixel.com) — that's
      where DJI actually features photographers, not Instagram tags.
- [ ] Re-run a staleness audit ~yearly; small feature hubs die often.
