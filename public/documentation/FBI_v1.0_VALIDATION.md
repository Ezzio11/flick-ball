# FBI Validation

How the FlickBall Index (`src/lib/fbi-rating.ts`) behaves on every Barça player-match under Flick: 2,119 ratings, 1,955 of them with a FotMob rating to compare. Reproduce with `npm test` (the last test in `scripts/fbi.test.js` checks these on the live data).

## Before and after the November 2026 fixes

| | Before | After |
|---|---|---|
| Ratings using the wrong match result | 978 (46%): away wins scored as losses | **0** |
| Average / spread (target 6.8 / 1.3) | 7.64 / 2.09 | **6.80 / 1.30**, the same for every role: goalkeepers, centre-backs, full-backs, holding and attacking midfielders, strikers and wingers |
| Ratings at a perfect 10.0 | 28.2% | **0.2%** (4 games, all 8.7+ on FotMob) |
| Agreement with FotMob (correlation) | 0.67 | **0.75** |
| Goals off the bench (≤ 20 min) | 4.5 – 5.0 | **7.8** on average |
| Hat-tricks | 8.8 – 10 (Ferran's at Valencia: 8.8 because the away win counted as a loss) | **8.8 – 9.9** |

What was wrong: the result was read from the home-first score as if Barça were always home; the 1-10 mapping used fixed constants (mean 3.2, spread 1.5) that no longer matched the data; every stat was multiplied by minutes/60, which buried substitutes; shots on target and offsides were read under names the data doesn't use; cards were never in the data; a goalkeeper's conceded penalty added points.

## Where FBI disagrees with FotMob, on purpose

FBI is built for Flick's system, so it weighs pressing (recoveries, interceptions) and vertical passing more, and punishes red cards harder: Araujo's 44-minute red card in the 3-0 at Chelsea is FBI 1.0 against FotMob's 4.87. A correlation of 0.75 means the two agree on who played well and badly, while still ranking some games differently.

Roles are scaled separately: a poacher is compared with other strikers, not with wingers who are on the ball all game, a No.10 with attacking midfielders rather than the pivots, and a full-back with full-backs rather than centre-backs (Lewandowski averages 7.0, FotMob 7.2; before the split 6.4). FotMob rates high-volume wingers more generously than FBI does (Lamine: FBI 7.4, FotMob 8.3), which is most of the remaining gap.

*The earlier v1.0 "validation" (one Clásico, three players) was removed: its stats did not match the match it described.*
