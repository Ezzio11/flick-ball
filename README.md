# FlickBall

Stats, tactics and player ratings for FC Barcelona under Hansi Flick, from his first match in August 2024 onward. Comic-book look, real numbers.

**Live:** [flickball.ezzio.me](https://flickball.ezzio.me)

## What's on the site

| Page | What it shows |
|---|---|
| `/` | Landing page: trophies, signature moments, the players who defined the era |
| `/team` | Team stats: campaign tracker, biggest wins, statement games, tactical matchups |
| `/matches/[id]` | One match: score, scorers, formation, full stat comparison |
| `/squad` | Every player who has played minutes under Flick |
| `/squad/[slug]` | Player profile, filterable by season and competition, with an AI-written tactical note |
| `/compare` | Two players side by side |
| `/achievements` | Trophies and milestones |
| `/about-fbi` | How the FBI rating works |

**FBI (FlickBall Index)** is the site's own 1 to 10 player rating, weighted per position toward what Flick's system asks for (pressing, verticality, risk-taking). Formula: [`public/documentation/FBI_FORMULA.md`](public/documentation/FBI_FORMULA.md). Code: [`src/lib/fbi-rating.ts`](src/lib/fbi-rating.ts).

## How the data gets in

```
FotMob ──► scripts/ingest_data.js ───► public/data/matches.json + src/lib/data_ingested.ts
              │  (match pages cached in .cache/)
              └► scripts/ingest_players.js ─► src/lib/titans_data.ts
```

- **[`scripts/fotmob.js`](scripts/fotmob.js)** is the only code that talks to FotMob: plain `fetch` with retries, a match-page cache, and the season rule (seasons roll over on Aug 1 UTC).
- **`ingest_data.js`** collects finished fixtures for the current season (team endpoint) and every past Flick season (league endpoints for LaLiga, UCL, Copa del Rey and Supercopa, which fills any gap from a missed run). It parses each new match and merges it in. Existing matches are never dropped, and friendlies are excluded.
- **`ingest_players.js`** reads the match list, fetches player stats only for matches it hasn't ingested yet, and appends them to each player's history.
- **[GitHub Action](.github/workflows/update_stats.yml)** runs both scripts daily at 04:00 UTC and commits any change. Vercel deploys every push to `main`, so that commit is what updates the site.

Run it yourself:

```bash
npm run scrape   # both scripts, about 30s with no cache
npm test         # offline parser tests (node:test, no deps)
```

If the Action goes red, read its log first. The usual cause is FotMob changing its page or API shape, and the fix belongs in `scripts/fotmob.js` or `parseMatchData` in `ingest_data.js`. The test in `scripts/ingest.test.js` replays a real saved match (`scripts/__fixtures__/`) against the stored record, so parser drift shows up there.

## Running locally

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, prerenders every match and player page
npm run lint
```

### Environment variables (all optional)

| Variable | Used by |
|---|---|
| `GROQ_API_KEY`, `GEMINI_API_KEY`, `CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`, `HUGGING_FACE_TOKEN` | `/api/commentary`, tried in that order. Falls back to keyless Pollinations if none are set. |
| `REVALIDATION_TOKEN` | `/api/revalidate?secret=...` to purge cached pages by hand |
| `DATA_URL` | Load matches from a URL instead of the bundled `data_ingested.ts` |

## Stack

Next.js 16 (App Router, React Compiler), React 19, Tailwind CSS 4, Recharts, lucide-react, date-fns. Deployed on Vercel.

## Credits

Built by Ezzio. Data from [FotMob](https://www.fotmob.com). Not affiliated with FC Barcelona or FotMob.
