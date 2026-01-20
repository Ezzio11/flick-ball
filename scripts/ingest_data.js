/**
 * ingest_data.js
 *
 * FOTMOB SCRAPER IMPLEMENTATION v2.1 (Multi-Process & Hybrid Fetch)
 * Fetches comprehensive match data from FotMob's internal API for FC Barcelona (ID 8634).
 * Uses a Master-Worker pattern to spawn a fresh process for each match to bypass session-based anti-scraping.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const OUTPUT_FILE = path.join(__dirname, '../src/lib/data_ingested.ts');
const TEAM_ID = 8634; // FC Barcelona
const BASE_URL = "https://www.fotmob.com/api";

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error("Failed to parse JSON from", url);
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// ------------------------------------------------------------------
// WORKER MODE
// ------------------------------------------------------------------
async function workerMode(matchId, fixtureJsonStr) {
    try {
        const fixtureInfo = JSON.parse(fixtureJsonStr);
        const url = `${BASE_URL}/matchDetails?matchId=${matchId}`;
        const details = await fetchJson(url);

        const matchData = parseMatchData(details, fixtureInfo);

        // Output result to stdout
        console.log("JSON_START");
        console.log(JSON.stringify(matchData));
        console.log("JSON_END");

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

function parseMatchData(details, fixtureInfo) {
    const content = details.content;
    const header = details.header;

    // Basic Info
    const isHome = header.teams[0].id === TEAM_ID;
    const opponentName = isHome ? header.teams[1].name : header.teams[0].name;

    // Score string might be "3 - 0" or we might need to construct it from header.teams
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

    // Robust stats extraction
    let matchStatsGroups = [];
    if (content?.stats?.Periods?.All?.stats) {
        matchStatsGroups = content.stats.Periods.All.stats;
    } else if (content?.stats?.stats) {
        // Fallback to old structure if available
        matchStatsGroups = content.stats.stats;
    }

    if (matchStatsGroups.length > 0) {
        stats.available = true;

        // Helper to find a stat value across ALL groups
        const findStat = (keys) => {
            for (const group of matchStatsGroups) {
                if (!group.stats) continue;
                for (const statItem of group.stats) {
                    if (keys.includes(statItem.key) || keys.includes(statItem.title)) {
                        // Return the correct side's stats
                        return isHome ? statItem.stats[0] : statItem.stats[1];
                    }
                }
            }
            return null;
        };

        const parseValue = (val) => {
            if (val === null || val === undefined) return 0;
            return typeof val === 'string' ? parseFloat(val) : val;
        };

        // Standard Top Stats
        const poss = findStat(["Ball possession", "BallPossesion", "possession"]);
        const xVal = findStat(["Expected goals (xG)", "expected_goals", "xG"]);
        const shots = findStat(["Total shots", "total_shots"]);
        const onTarget = findStat(["Shots on target", "shots_on_target", "ShotsOnTarget"]);

        if (poss) stats.possession = parseFloat(poss);
        if (xVal) stats.xG = String(xVal);
        if (shots) stats.totalShots = parseInt(shots);
        if (onTarget) stats.shotsOnTarget = parseInt(onTarget);

        // Advanced Stats (mapped from debug analysis)
        stats.bigChances = parseInt(findStat(["big_chance", "Big chances"]) || 0);
        stats.bigChancesMissed = parseInt(findStat(["big_chance_missed_title", "Big chances missed"]) || 0);
        stats.corners = parseInt(findStat(["corners", "Corners"]) || 0);
        stats.fouls = parseInt(findStat(["fouls", "Fouls committed"]) || 0);

        const parseStatString = (val) => {
            if (!val) return null;
            if (typeof val === 'object') return val; // Already an object?
            const str = String(val);
            // Matches "123 (45%)" or just "123"
            const match = str.match(/^(\d+)(?:\s*\((\d+)%\))?/);
            if (match) {
                return {
                    value: parseInt(match[1]),
                    percentage: match[2] ? parseInt(match[2]) : null
                };
            }
            return { value: parseInt(str) || 0, percentage: null };
        };

        // Passing
        const accPassesRaw = findStat(["accurate_passes", "Accurate passes"]);
        stats.accuratePasses = parseStatString(accPassesRaw);

        stats.oppositionHalfPasses = parseInt(findStat(["opposition_half_passes", "Opposition half"]) || 0);
        stats.ownHalfPasses = parseInt(findStat(["own_half_passes", "Own half"]) || 0);

        stats.touchesInOppBox = parseInt(findStat(["touches_opp_box", "Touches in opposition box"]) || 0);
        stats.accurateLongBalls = parseStatString(findStat(["long_balls_accurate", "Accurate long balls"]));
        stats.accurateCrosses = parseStatString(findStat(["accurate_crosses", "Accurate crosses"]));

        // Defense
        stats.tackles = parseInt(findStat(["matchstats.headers.tackles", "Tackles"]) || 0);
        stats.interceptions = parseInt(findStat(["interceptions", "Interceptions"]) || 0);
        stats.blocks = parseInt(findStat(["shot_blocks", "Blocks"]) || 0);
        stats.clearances = parseInt(findStat(["clearances", "Clearances"]) || 0);
        stats.keeperSaves = parseInt(findStat(["keeper_saves", "Keeper saves"]) || 0);

        // Shot Breakdown
        stats.shotsOffTarget = parseInt(findStat(["ShotsOffTarget", "Shots off target"]) || 0);
        stats.blockedShots = parseInt(findStat(["blocked_shots", "Blocked shots"]) || 0);

        // Duels
        stats.duelsWon = parseInt(findStat(["duel_won", "Duels won"]) || 0); // Total number usually
        stats.groundDuelsWon = parseStatString(findStat(["ground_duels_won", "Ground duels won"]));
        stats.aerialDuelsWon = parseStatString(findStat(["aerials_won", "Aerial duels won"]));
        stats.successfulDribbles = parseStatString(findStat(["dribbles_succeeded", "Successful dribbles"]));

        // Advanced xG
        stats.xGOpenPlay = String(findStat(["expected_goals_open_play", "xG open play"]) || "0.00");
        stats.xGSetPlay = String(findStat(["expected_goals_set_play", "xG set play"]) || "0.00");
        stats.xGOT = String(findStat(["expected_goals_on_target", "xG on target (xGOT)"]) || "0.00");
    }

    // Scorers extraction
    let scorers = [];
    const events = content?.matchFacts?.events?.events || [];

    events.forEach(event => {
        if (event.type === 'Goal') {
            const eventIsHome = event.isHome;
            const isBarcaGoal = eventIsHome === isHome;
            scorers.push({
                player: event.player.name,
                team: isBarcaGoal ? "barca" : "opponent",
                minute: event.time,
                assist: event.assistInput || event.assistStr || null
            });
        }
    });

    // Formation extraction
    // Try to find lineup info
    let formation = null;
    try {
        const lineupObj = content?.lineup;
        if (lineupObj) {
            const teamLineup = isHome ? lineupObj.homeTeam : lineupObj.awayTeam;
            formation = teamLineup?.formation || null;
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
        season: "24/25",
        stats: stats,
        scorers: scorers,
        formation: formation
    };
}


// ------------------------------------------------------------------
// MASTER MODE
// ------------------------------------------------------------------
async function masterMode() {
    try {
        let allMatches = [];
        const matchesMap = new Map(); // Use Map to deduplicate by ID

        // 1. Fetch CURRENT Season (2025/2026) from Teams Endpoint
        // This works reliably for the active season
        console.log(`\n[1/2] Fetching CURRENT season (25/26) from Team endpoint...`);
        const currentSeasonUrl = `${BASE_URL}/teams?id=${TEAM_ID}&season=2025-2026&tab=fixtures`;
        try {
            const data = await fetchJson(currentSeasonUrl);
            if (data.fixtures?.allFixtures?.fixtures) {
                const fixtures = data.fixtures.allFixtures.fixtures;
                console.log(`Found ${fixtures.length} fixtures for 25/26.`);
                for (const f of fixtures) {
                    if (f.status.finished) {
                        matchesMap.set(f.id, { ...f, _seasonLabel: "25/26" });
                    }
                }
            }
        } catch (e) {
            console.error("Error fetching current season:", e.message);
        }

        // 2. Fetch HISTORICAL Season (2024/2025) from League Endpoints
        // The teams endpoint fails for history, so we query leagues directly and filter for Barca
        console.log(`\n[2/2] Fetching HISTORICAL season (24/25) from League endpoints...`);
        const LEAGUES = [
            { id: 87, name: "LaLiga" },
            { id: 42, name: "Champions League" },
            { id: 138, name: "Copa del Rey" },
            { id: 139, name: "Supercopa" }
        ];

        for (const league of LEAGUES) {
            console.log(`  - Fetching ${league.name} (ID ${league.id})...`);
            // Note: Using "2024/2025" encoded as 2024%2F2025 which seems standard for FotMob
            const url = `${BASE_URL}/leagues?id=${league.id}&season=2024%2F2025&tab=matches`;

            try {
                const data = await fetchJson(url);
                // League endpoint structure: data.fixtures.allMatches (Confirmed via debug)
                let fixtures = [];
                if (data.matches?.allMatches) {
                    fixtures = data.matches.allMatches;
                } else if (data.fixtures?.allMatches) {
                    fixtures = data.fixtures.allMatches;
                } else if (data.fixtures?.allFixtures?.fixtures) {
                    // Fallback for team endpoint style (unlikely for leagues but safe to keep)
                    fixtures = data.fixtures.allFixtures.fixtures;
                }

                // Filter for Barcelona (ID 8634)
                const barcaMatches = fixtures.filter(f =>
                    (String(f.home.id) === String(TEAM_ID) || String(f.away.id) === String(TEAM_ID)) && f.status.finished
                );

                console.log(`    Found ${barcaMatches.length} Barca matches.`);
                for (const f of barcaMatches) {
                    // Ensure we don't overwrite if it somehow exists (e.g. from team endpoint)
                    if (!matchesMap.has(f.id)) {
                        matchesMap.set(f.id, { ...f, _seasonLabel: "24/25" });
                    }
                }

            } catch (e) {
                console.error(`    Failed to fetch ${league.name}: ${e.message}`);
            }

            // Rate limit
            await new Promise(r => setTimeout(r, 500));
        }

        // Convert Map to Array
        const finalFixtureList = Array.from(matchesMap.values());
        console.log(`\nTotal unique matches to process: ${finalFixtureList.length}`);

        // Process all matches
        for (const f of finalFixtureList) {
            process.stdout.write(`Processing match ${f.id} (${f.home.name} vs ${f.away.name}) [${f._seasonLabel}]... `);

            try {
                const fixtureArg = Buffer.from(JSON.stringify(f)).toString('base64');
                const cmd = `node "${__filename}" --worker ${f.id} "${fixtureArg}"`;
                const output = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

                const match = output.match(/JSON_START\n([\s\S]*?)\nJSON_END/);
                if (match && match[1]) {
                    const result = JSON.parse(match[1]);

                    // Assign correct season label
                    result.season = f._seasonLabel;

                    allMatches.push(result);
                    if (result.stats.available) {
                        console.log("OK (Stats found)");
                    } else {
                        console.log("OK (No stats)");
                    }
                } else {
                    console.log("FAILED (Invalid output)");
                }

            } catch (e) {
                console.log("FAILED");
            }

            // Rate limiting
            await new Promise(r => setTimeout(r, 800));
        }

        allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        const fileContent = `// Auto-generated via scripts/ingest_data.js (Source: FotMob API)
// Date: ${new Date().toISOString()}

import { MatchData } from './matchHelpers';

export const INGESTED_MATCHES: MatchData[] = ${JSON.stringify(allMatches, null, 4)};
`;

        fs.writeFileSync(OUTPUT_FILE, fileContent);
        console.log(`\nSUCCESS: Scraped ${allMatches.length} matches to ${OUTPUT_FILE}`);

        // ALSO WRITE JSON FOR DYNAMIC INGESTION
        const JSON_OUTPUT_FILE = path.join(__dirname, '../public/data/matches.json');
        fs.writeFileSync(JSON_OUTPUT_FILE, JSON.stringify(allMatches, null, 4));
        console.log(`SUCCESS: Saved JSON data to ${JSON_OUTPUT_FILE}`);

    } catch (err) {
        console.error("\nFATAL ERROR:", err);
    }
}

// Entry Point
const args = process.argv.slice(2);
if (args[0] === '--worker') {
    const matchId = args[1];
    let fixtureJsonStr = args[2];

    // Check if argument is a file path
    if (fs.existsSync(fixtureJsonStr)) {
        fixtureJsonStr = fs.readFileSync(fixtureJsonStr, 'utf8');
    } else {
        // Assume base64
        try {
            fixtureJsonStr = Buffer.from(fixtureJsonStr, 'base64').toString('utf8');
        } catch (e) {
            // If not base64, maybe it's just raw json string?
        }
    }

    workerMode(matchId, fixtureJsonStr);
} else {
    masterMode();
}
