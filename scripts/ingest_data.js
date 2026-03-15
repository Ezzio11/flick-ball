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

const CACHE_DIR = path.join(__dirname, '../.cache');
const MATCHES_FILE = path.join(__dirname, '../public/data/matches.json');
const COMPETITION_BLOCKLIST = ["Club Friendlies", "Trofeu Joan Gamper", "International Friendlies", "Friendly", "Other Friendlies", "Club Friendlies 2024", "Club Friendlies 2025"];

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
        if (!details || !details.header) {
            console.error(`Invalid API response for match ${matchId}. Keys:`, Object.keys(details || {}));
            if (details && details.error) console.error("API Error:", details.error);
        }

        const matchData = parseMatchData(details, fixtureInfo);

        // Output result to stdout
        console.log("JSON_START");
        console.log(JSON.stringify(matchData));
        console.log("JSON_END");

    } catch (e) {
        console.error("Worker Execution Failed:");
        console.error(e);
        // Log the first 500 chars of the data we got if possible (via another try/catch or just checking if details exists)
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
        season: "24/25",
        stats: stats,
        scorers: scorers,
        formation: formation
    };
}


// ------------------------------------------------------------------
// MASTER MODE
// ------------------------------------------------------------------
const MATCHES_URL = `${BASE_URL}/teams/8634/fixtures/barcelona`;

async function masterMode() {
    const isCacheOnly = process.argv.includes('--use-cache');
    const matchesMap = new Map();

    try {
        let allMatches = [];

        // Load existing matches to preserve history
        if (fs.existsSync(MATCHES_FILE)) {
            try {
                const existingMatches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
                console.log(`Loaded ${existingMatches.length} existing matches from ${MATCHES_FILE}`);
                existingMatches.forEach(m => {
                    if (m.id && !COMPETITION_BLOCKLIST.includes(m.competition)) {
                        const sid = String(m.id);
                        m.id = Number(m.id) || m.id;
                        matchesMap.set(sid, m);
                    } else if (m.id) {
                        console.log(`  - Dropping ${m.competition} match: ${m.id}`);
                    }
                });
            } catch (e) {
                console.warn("Could not parse existing matches.json, proceeding with empty history.");
            }
        }

        if (isCacheOnly) {
            console.log("CACHE-ONLY MODE: Scanning .cache/ for match data...");
            if (!fs.existsSync(CACHE_DIR)) {
                fs.mkdirSync(CACHE_DIR, { recursive: true });
            }

            // 1. Check for batch_export.json (Preferred)
            const BATCH_FILE = path.join(CACHE_DIR, 'batch_export.json');
            if (fs.existsSync(BATCH_FILE)) {
                console.log("Found batch_export.json. Processing...");
                try {
                    const batchData = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'));
                    if (Array.isArray(batchData)) {
                        for (const item of batchData) {
                            const matchId = item.id;
                            const content = item.data;
                            if (!content.header) continue;
                            
                            const fixtureInfo = {
                                id: matchId,
                                status: content.header.status,
                                leagueName: content.general?.leagueName,
                                home: content.header.teams[0],
                                away: content.header.teams[1],
                                _seasonLabel: "25/26"
                            };
                            
                            const result = parseMatchData(content, fixtureInfo);
                            
                            if (COMPETITION_BLOCKLIST.includes(result.competition)) {
                                console.log(`⏩ Skipping blocklisted competition: ${result.competition} (${matchId})`);
                                continue;
                            }

                            result.season = fixtureInfo._seasonLabel;
                            result.id = Number(matchId) || matchId; // Ensure numeric ID in output
                            matchesMap.set(String(matchId), result);
                            console.log(`✅ Processed ${matchId} (${result.opponent}) from batch.`);
                        }
                    }
                } catch (e) {
                    console.error("❌ Failed to process batch_export.json:", e.message);
                }
            }

            // 2. Check for individual match_*.json files
            const files = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith('match_') && f.endsWith('.json'));
            if (files.length > 0) {
                console.log(`Found ${files.length} individual match files in cache.`);
                for (const file of files) {
                    const matchId = file.replace('match_', '').replace('.json', '');
                    try {
                        const content = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8'));
                        
                        const fixtureInfo = {
                            id: matchId,
                            status: content.header.status,
                            leagueName: content.general?.leagueName,
                            home: content.header.teams[0],
                            away: content.header.teams[1],
                            _seasonLabel: "25/26"
                        };
                        
                        const result = parseMatchData(content, fixtureInfo);
                        result.season = fixtureInfo._seasonLabel;
                        matchesMap.set(String(matchId), result);
                        console.log(`✅ Processed ${matchId} (${result.opponent}) from individual file.`);
                    } catch (e) {
                        console.error(`❌ Failed to process cached file ${file}:`, e.message);
                    }
                }
            }
        } else {
            // Original fetching logic...
            
            // 1. Fetch CURRENT Season (2025/2026) from Teams Endpoint
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

            // 2. Fetch HISTORICAL Season (2024/2025)
            console.log(`\n[2/2] Fetching HISTORICAL season (24/25) from League endpoints...`);
            const LEAGUES = [
                { id: 87, name: "LaLiga" },
                { id: 42, name: "Champions League" },
                { id: 138, name: "Copa del Rey" },
                { id: 139, name: "Supercopa" }
            ];

            for (const league of LEAGUES) {
                console.log(`  - Fetching ${league.name} (ID ${league.id})...`);
                const url = `${BASE_URL}/leagues?id=${league.id}&season=2024%2F2025&tab=matches`;
                try {
                    const data = await fetchJson(url);
                    let fixtures = data.matches?.allMatches || data.fixtures?.allMatches || data.fixtures?.allFixtures?.fixtures || [];
                    const barcaMatches = fixtures.filter(f =>
                        (String(f.home.id) === String(TEAM_ID) || String(f.away.id) === String(TEAM_ID)) && f.status.finished
                    );
                    console.log(`    Found ${barcaMatches.length} Barca matches.`);
                    for (const f of barcaMatches) {
                        if (!matchesMap.has(f.id)) {
                            matchesMap.set(f.id, { ...f, _seasonLabel: "24/25" });
                        }
                    }
                } catch (e) {
                    console.error(`    Failed to fetch ${league.name}: ${e.message}`);
                }
                await new Promise(r => setTimeout(r, 500));
            }

            const finalFixtureList = Array.from(matchesMap.values());
            console.log(`\nTotal unique matches to process via API: ${finalFixtureList.length}`);

            for (const f of finalFixtureList) {
                process.stdout.write(`Processing match ${f.id} (${f.home.name} vs ${f.away.name}) [${f._seasonLabel}]... `);
                try {
                    const fixtureArg = Buffer.from(JSON.stringify(f)).toString('base64');
                    const cmd = `node "${__filename}" --worker ${f.id} "${fixtureArg}"`;
                    const output = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
                    const match = output.match(/JSON_START\n([\s\S]*?)\nJSON_END/);
                    if (match && match[1]) {
                        const result = JSON.parse(match[1]);
                        result.season = f._seasonLabel;
                        matchesMap.set(String(f.id), result);
                        console.log(result.stats.available ? "OK (Stats found)" : "OK (No stats)");
                    } else {
                        console.log("FAILED (No JSON match)");
                    }
                } catch (e) {
                    console.log("FAILED");
                    if (e.stderr) console.error("Worker Error:", e.stderr.toString());
                }
                await new Promise(r => setTimeout(r, 800));
            }
        }

        allMatches = Array.from(matchesMap.values());
        allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        const fileContent = `// Auto-generated via scripts/ingest_data.js (Source: FotMob API)
// Date: ${new Date().toISOString()}

import { MatchData } from './matchHelpers';

export const INGESTED_MATCHES: MatchData[] = ${JSON.stringify(allMatches, null, 4)};
`;

        if (allMatches.length === 0) {
            console.error("\nFATAL: No matches were successfully processed.");
            process.exit(1);
        }

        fs.writeFileSync(OUTPUT_FILE, fileContent);
        console.log(`\nSUCCESS: Scraped ${allMatches.length} matches to ${OUTPUT_FILE}`);

        const JSON_OUTPUT_FILE = path.join(__dirname, '../public/data/matches.json');
        fs.writeFileSync(JSON_OUTPUT_FILE, JSON.stringify(allMatches, null, 4));
        console.log(`SUCCESS: Saved JSON data to ${JSON_OUTPUT_FILE}`);

    } catch (err) {
        console.error("\nFATAL ERROR:", err);
        process.exit(1);
    }
}

// Entry Point
const args = process.argv.slice(2);
if (args[0] === '--worker') {
    const matchId = args[1];
    let fixtureJsonStr = args[2];
    if (fs.existsSync(fixtureJsonStr)) {
        fixtureJsonStr = fs.readFileSync(fixtureJsonStr, 'utf8');
    } else {
        try {
            fixtureJsonStr = Buffer.from(fixtureJsonStr, 'base64').toString('utf8');
        } catch (e) {}
    }
    workerMode(matchId, fixtureJsonStr);
} else {
    masterMode();
}
