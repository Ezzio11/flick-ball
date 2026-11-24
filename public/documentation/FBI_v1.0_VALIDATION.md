# FBI Validation

How the FlickBall Index (`src/lib/fbi-rating.ts`) behaves on every Barça player-match under Flick: 2,119 ratings, 1,955 of them with a FotMob rating to compare. Reproduce with `npm test` (the last test in `scripts/fbi.test.js` checks these on the live data).

## Before and after the November 2026 fixes

| | Before | After |
|---|---|---|
| Ratings using the wrong match result | 978 (46%): away wins scored as losses | **0** |
| Average / spread (target 6.8 / 1.3) | 7.64 / 2.09 | **6.80 / 1.30**, the same for GK, DEF, MID and FWD |
| Ratings at a perfect 10.0 | 28.2% | **0.2%** (4 games, all 8.7+ on FotMob) |
| Agreement with FotMob (correlation) | 0.67 | **0.77** |
| Goals off the bench (≤ 20 min) | 4.5 – 5.0 | **7.6** on average |
| Hat-tricks | 8.8 – 10 (Ferran's at Valencia: 8.8 because the away win counted as a loss) | **8.8 – 9.9** |

What was wrong: the result was read from the home-first score as if Barça were always home; the 1-10 mapping used fixed constants (mean 3.2, spread 1.5) that no longer matched the data; every stat was multiplied by minutes/60, which buried substitutes; shots on target and offsides were read under names the data doesn't use; cards were never in the data; a goalkeeper's conceded penalty added points.

## Where FBI disagrees with FotMob, on purpose

FBI is built for Flick's system, so it weighs pressing (recoveries, interceptions) and vertical passing more, and punishes red cards harder: Araujo's 44-minute red card in the 3-0 at Chelsea is FBI 1.0 against FotMob's 4.87. A correlation of 0.77 means the two agree on who played well and badly, while still ranking some games differently.

*The earlier v1.0 "validation" (one Clásico, three players) was removed: its stats did not match the match it described.*
