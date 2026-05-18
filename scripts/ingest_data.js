/**
 * ingest_data.js
 *
 * FOTMOB SCRAPER IMPLEMENTATION v3.0 (Playwright Hybrid)
 * Fetches comprehensive match data from FotMob's internal API for FC Barcelona (ID 8634).
 * Uses a visible Playwright browser to inherit anti-bot headers and bypass Cloudflare Turnstile.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const CACHE_DIR = path.join(__dirname, '../.cache');
const MATCHES_FILE = path.join(__dirname, '../public/data/matches.json');
const COMPETITION_BLOCKLIST = ["Club Friendlies", "Trofeu Joan Gamper", "International Friendlies", "Friendly", "Other Friendlies", "Club Friendlies 2024", "Club Friendlies 2025"];

const OUTPUT_FILE = path.join(__dirname, '../src/lib/data_ingested.ts');
const TEAM_ID = 8634; // FC Barcelona
const BASE_URL = "https://www.fotmob.com/api/data";

function parseMatchData(details, fixtureInfo) {
    const content = details.content;
    const header = details.header;

    // Basic Info
    const isHome = header.teams[0].id === TEAM_ID;
    const opponentName = isHome ? header.teams[1].name : header.teams[0].name;

    let scoreStr = header.status.scoreStr;
    if (!scoreStr) {
        scoreStr = `${header.teams[0].score} - ${header.teams[1].score}`;
    }

    let stats = {
        available: false,
        possession: 50,
        xG: "0.00",
        totalShots: 0,
        shotsOnTarget: 0
    };

    let matchStatsGroups = [];
    if (content?.stats?.Periods?.All?.stats) {
        matchStatsGroups = content.stats.Periods.All.stats;
    } else if (content?.stats?.stats) {
        matchStatsGroups = content.stats.stats;
    }

    if (matchStatsGroups.length > 0) {
        stats.available = true;

        const findStat = (keys) => {
            for (const group of matchStatsGroups) {
                if (!group.stats) continue;
                for (const statItem of group.stats) {
                    if (keys.includes(statItem.key) || keys.includes(statItem.title)) {
                        return isHome ? statItem.stats[0] : statItem.stats[1];
                    }
                }
            }
            return null;
        };

        const poss = findStat(["Ball possession", "BallPossesion", "possession"]);
        const xVal = findStat(["Expected goals (xG)", "expected_goals", "xG"]);
        const shots = findStat(["Total shots", "total_shots"]);
        const onTarget = findStat(["Shots on target", "shots_on_target", "ShotsOnTarget"]);

        if (poss) stats.possession = parseFloat(poss);
        if (xVal) stats.xG = String(xVal);
        if (shots) stats.totalShots = parseInt(shots);
        if (onTarget) stats.shotsOnTarget = parseInt(onTarget);

        stats.bigChances = parseInt(findStat(["big_chance", "Big chances"]) || 0);
        stats.bigChancesMissed = parseInt(findStat(["big_chance_missed_title", "Big chances missed"]) || 0);
        stats.corners = parseInt(findStat(["corners", "Corners"]) || 0);
        stats.fouls = parseInt(findStat(["fouls", "Fouls committed"]) || 0);

        const parseStatString = (val) => {
            if (!val) return null;
            if (typeof val === 'object') return val;
            const str = String(val);
            const match = str.match(/^(\d+)(?:\s*\((\d+)%\))?/);
            if (match) {
                return {
                    value: parseInt(match[1]),
                    percentage: match[2] ? parseInt(match[2]) : null
                };
            }
            return { value: parseInt(str) || 0, percentage: null };
        };

        const accPassesRaw = findStat(["accurate_passes", "Accurate passes"]);
        stats.accuratePasses = parseStatString(accPassesRaw);

        stats.oppositionHalfPasses = parseInt(findStat(["opposition_half_passes", "Opposition half"]) || 0);
        stats.ownHalfPasses = parseInt(findStat(["own_half_passes", "Own half"]) || 0);
        stats.touchesInOppBox = parseInt(findStat(["touches_opp_box", "Touches in opposition box"]) || 0);
        stats.accurateLongBalls = parseStatString(findStat(["long_balls_accurate", "Accurate long balls"]));
        stats.accurateCrosses = parseStatString(findStat(["accurate_crosses", "Accurate crosses"]));

        stats.tackles = parseInt(findStat(["matchstats.headers.tackles", "Tackles"]) || 0);
        stats.interceptions = parseInt(findStat(["interceptions", "Interceptions"]) || 0);
        stats.blocks = parseInt(findStat(["shot_blocks", "Blocks"]) || 0);
        stats.clearances = parseInt(findStat(["clearances", "Clearances"]) || 0);
        stats.keeperSaves = parseInt(findStat(["keeper_saves", "Keeper saves"]) || 0);

        stats.shotsOffTarget = parseInt(findStat(["ShotsOffTarget", "Shots off target"]) || 0);
        stats.blockedShots = parseInt(findStat(["blocked_shots", "Blocked shots"]) || 0);

        stats.duelsWon = parseInt(findStat(["duel_won", "Duels won"]) || 0);
        stats.groundDuelsWon = parseStatString(findStat(["ground_duels_won", "Ground duels won"]));
        stats.aerialDuelsWon = parseStatString(findStat(["aerials_won", "Aerial duels won"]));
        stats.successfulDribbles = parseStatString(findStat(["dribbles_succeeded", "Successful dribbles"]));

        stats.xGOpenPlay = String(findStat(["expected_goals_open_play", "xG open play"]) || "0.00");
        stats.xGSetPlay = String(findStat(["expected_goals_set_play", "xG set play"]) || "0.00");
        stats.xGOT = String(findStat(["expected_goals_on_target", "xG on target (xGOT)"]) || "0.00");
    }

    let scorers = [];
    const events = content?.matchFacts?.events?.events || [];
    events.forEach(event => {
        if (event.type === 'Goal') {
            const isBarcaGoal = event.isHome === isHome;
            scorers.push({
                player: event.player.name,
                team: isBarcaGoal ? "barca" : "opponent",
                minute: event.time,
                assist: event.assistInput || event.assistStr || null
            });
        }
    });

    let formation = "";
    try {
        const lineupObj = content?.lineup;
        if (lineupObj) {
            const teamLineup = isHome ? lineupObj.homeTeam : lineupObj.awayTeam;
            formation = teamLineup?.formation || "";
        }
    } catch (e) {
        // ignore
    }

    return {
        id: fixtureInfo.id,
        date: fixtureInfo.status.utcTime,
        opponent: opponentName,
        score: scoreStr.includes(" - ") ? scoreStr : scoreStr.replace("-", " - "),
        isHome: isHome,
        competition: fixtureInfo.leagueName || details.general?.leagueName || "Unknown",
        season: fixtureInfo._seasonLabel || "24/25",
        stats: stats,
        scorers: scorers,
        formation: formation
    };
}

async function fetchWithPlaywright(page, url) {
    return await page.evaluate(async (targetUrl) => {
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }, url);
}

async function runScraper() {
    const isCacheOnly = process.argv.includes('--use-cache');
    const matchesMap = new Map();

    try {
        if (fs.existsSync(MATCHES_FILE)) {
            try {
                const existingMatches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
                console.log(`Loaded ${existingMatches.length} existing matches from ${MATCHES_FILE}`);
                existingMatches.forEach(m => {
                    if (m.id && !COMPETITION_BLOCKLIST.includes(m.competition)) {
                        const sid = String(m.id);
                        m.id = Number(m.id) || m.id;
                        matchesMap.set(sid, m);
                    }
                });
            } catch (e) {
                console.warn("Could not parse existing matches.json, proceeding with empty history.");
            }
        }

        console.log("Launching Playwright (Visible Mode) to clear Cloudflare...");
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();

        console.log("Navigating to FotMob...");
        await page.goto('https://www.fotmob.com');
        
        console.log("Waiting for Cloudflare verification to pass... (Please click the checkbox if prompted!)");
        // We wait until the main FotMob search bar or content appears
        await page.waitForSelector('input[type="search"], nav', { timeout: 60000 });
        console.log("Cloudflare cleared successfully!");

        console.log(`\n[1/2] Fetching CURRENT season (25/26) from Team endpoint...`);
        const currentSeasonUrl = `${BASE_URL}/teams?id=${TEAM_ID}&tab=fixtures`;
        try {
            const data = await fetchWithPlaywright(page, currentSeasonUrl);
            if (data.fixtures?.allFixtures?.fixtures) {
                const fixtures = data.fixtures.allFixtures.fixtures;
                for (const f of fixtures) {
                    if (f.status.finished) {
                        matchesMap.set(f.id, { ...f, _seasonLabel: "25/26" });
                    }
                }
            }
        } catch (e) {
            console.error("Error fetching current season:", e.message);
        }

        console.log(`\n[2/2] Fetching HISTORICAL season (24/25) from League endpoints...`);
        const LEAGUES = [
            { id: 87, name: "LaLiga" },
            { id: 42, name: "Champions League" },
            { id: 138, name: "Copa del Rey" },
            { id: 139, name: "Supercopa" }
        ];

        for (const league of LEAGUES) {
            const url = `${BASE_URL}/leagues?id=${league.id}&season=2024%2F2025&tab=matches`;
            try {
                const data = await fetchWithPlaywright(page, url);
                let fixtures = data.matches?.allMatches || data.fixtures?.allMatches || data.fixtures?.allFixtures?.fixtures || [];
                const barcaMatches = fixtures.filter(f =>
                    (String(f.home.id) === String(TEAM_ID) || String(f.away.id) === String(TEAM_ID)) && f.status.finished
                );
                for (const f of barcaMatches) {
                    if (!matchesMap.has(f.id)) {
                        matchesMap.set(f.id, { ...f, _seasonLabel: "24/25" });
                    }
                }
            } catch (e) {}
            await new Promise(r => setTimeout(r, 500));
        }

        const finalFixtureList = Array.from(matchesMap.values());
        console.log(`\nTotal unique matches to process: ${finalFixtureList.length}`);

        for (const f of finalFixtureList) {
            // Check if we already have full stats for this match so we don't re-fetch unnecessarily
            if (f.stats && f.stats.available) {
                continue; // Already processed
            }

            process.stdout.write(`Processing match ${f.id} (${f.home?.name || f.opponent}) [${f._seasonLabel || "Unknown"}]... `);
            try {
                await page.goto(`https://www.fotmob.com/match/${f.id}`);
                await page.waitForSelector('#__NEXT_DATA__', { state: 'attached', timeout: 15000 });
                const details = await page.evaluate(() => {
                    const el = document.getElementById('__NEXT_DATA__');
                    return el ? JSON.parse(el.textContent).props.pageProps : null;
                });
                
                if (!details || !details.content) {
                    throw new Error("Invalid __NEXT_DATA__ structure");
                }
                
                const fixtureInfo = {
                    id: f.id,
                    status: f.status,
                    leagueName: f.leagueName || details.general?.leagueName,
                    home: f.home || details.header?.teams[0],
                    away: f.away || details.header?.teams[1],
                    _seasonLabel: f._seasonLabel || "24/25"
                };

                const result = parseMatchData(details, fixtureInfo);
                matchesMap.set(String(f.id), result);
                console.log(result.stats.available ? "OK (Stats found)" : "OK (No stats)");

                // Cache it
                if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
                fs.writeFileSync(path.join(CACHE_DIR, `match_${f.id}.json`), JSON.stringify(details, null, 2));

            } catch (e) {
                console.log("FAILED", e.message);
                matchesMap.delete(String(f.id));
                matchesMap.delete(f.id);
            }
            await new Promise(r => setTimeout(r, 800)); // Rate limiting
        }

        await browser.close();

        let allMatches = Array.from(matchesMap.values());
        allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        const fileContent = `// Auto-generated via scripts/ingest_data.js (Source: FotMob API via Playwright)
// Date: ${new Date().toISOString()}

import { MatchData } from './matchHelpers';

export const INGESTED_MATCHES: MatchData[] = ${JSON.stringify(allMatches, null, 4)};
`;

        if (allMatches.length === 0) {
            console.error("\nFATAL: No matches were successfully processed.");
            process.exit(1);
        }

        fs.writeFileSync(OUTPUT_FILE, fileContent);
        fs.writeFileSync(MATCHES_FILE, JSON.stringify(allMatches, null, 4));
        console.log(`\nSUCCESS: Scraped ${allMatches.length} matches.`);

    } catch (err) {
        console.error("\nFATAL ERROR:", err);
        process.exit(1);
    }
}

runScraper();
