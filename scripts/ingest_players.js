const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BARCA_ID = 8634;
const MATCHES_FILE = path.join(__dirname, '../public/data/matches.json');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/titans_data.ts');
const COMPETITION_BLOCKLIST = ["Club Friendlies", "Trofeu Joan Gamper", "International Friendlies", "Friendly", "Other Friendlies"];

async function run() {
    console.log("Starting Player Ingestion...");
    const isCacheOnly = process.argv.includes('--use-cache');
    const CACHE_DIR = path.join(__dirname, '../.cache');

    const playersMap = {}; 
    const nameToIdMap = {}; 

    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
            const eqIndex = content.indexOf('=');
            const start = content.indexOf('[', eqIndex);
            const end = content.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                const jsonStr = content.substring(start, end + 1);
                const existingData = JSON.parse(jsonStr);

                existingData.forEach(p => {
                    if (p.id) {
                        p.matches = (p.matches || []).filter(m => {
                            const isFriendly = COMPETITION_BLOCKLIST.includes(m.competition);
                            if (isFriendly) return false;
                            const mins = m.minutes_played !== undefined ? m.minutes_played : m.minutes;
                            if (mins !== undefined && Number(mins) === 0) return false;
                            return true;
                        });
                        p.appearances = p.matches.length;

                        playersMap[p.id] = p;
                        if (p.name) nameToIdMap[p.name] = p.id;
                    }
                });
                console.log(`Loaded ${Object.keys(playersMap).length} existing players from titans_data.ts.`);
            }
        } catch (e) {
            console.warn("Could not parse existing titans_data.ts, starting fresh.", e.message);
        }
    }

    if (!fs.existsSync(MATCHES_FILE)) {
        console.error("Matches file not found!");
        return;
    }
    const matches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
    console.log(`Loaded ${matches.length} matches.`);

    let browser = null;
    let page = null;

    if (!isCacheOnly) {
        console.log("Launching Playwright to clear Cloudflare...");
        browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        page = await context.newPage();

        console.log("Navigating to FotMob...");
        await page.goto('https://www.fotmob.com');
        
        console.log("Waiting for Cloudflare verification to pass...");
        await page.waitForSelector('input[type="search"], nav', { timeout: 60000 });
        console.log("Cloudflare cleared successfully!");
    }

    for (const match of matches) {
        if (!match.id) continue;
        
        if (COMPETITION_BLOCKLIST.includes(match.competition)) {
            continue;
        }

        console.log(`Processing match: ${match.opponent} (${match.date})...`);

        let matchData;
        try {
            const cachePath = path.join(__dirname, `../.cache/match_${match.id}.json`);
            if (fs.existsSync(cachePath)) {
                matchData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            } else if (!isCacheOnly && page) {
                if (!fs.existsSync(path.dirname(cachePath))) fs.mkdirSync(path.dirname(cachePath), { recursive: true });

                await page.goto(`https://www.fotmob.com/match/${match.id}`);
                await page.waitForSelector('#__NEXT_DATA__', { state: 'attached', timeout: 15000 });
                matchData = await page.evaluate(() => {
                    const el = document.getElementById('__NEXT_DATA__');
                    return el ? JSON.parse(el.textContent).props.pageProps : null;
                });

                fs.writeFileSync(cachePath, JSON.stringify(matchData, null, 2));
                await new Promise(r => setTimeout(r, 500));
            } else {
                console.warn(`Match ${match.id} not found in cache. Skipping...`);
                continue;
            }

            if (!matchData || !matchData.content || !matchData.content.playerStats) {
                continue;
            }

            const pStats = matchData.content.playerStats;

            for (const pid in pStats) {
                const p = pStats[pid];
                if (p.teamId !== BARCA_ID) continue;

                const playerId = p.id;
                const playerName = p.name;

                let playerRef = playersMap[playerId];

                if (!playerRef && nameToIdMap[playerName]) {
                    const primaryId = nameToIdMap[playerName];
                    playerRef = playersMap[primaryId];
                }

                if (!playerRef) {
                    playerRef = {
                        id: playerId,
                        name: playerName,
                        position: p.isGoalkeeper ? 'Goalkeeper' : 'Player',
                        appearances: 0,
                        matches: []
                    };
                    playersMap[playerId] = playerRef;
                    nameToIdMap[playerName] = playerId;
                }

                const isMatchIngested = playerRef.matches.some(m => String(m.matchId) === String(match.id));
                if (isMatchIngested) {
                    continue;
                }

                // Normalize opponent and score strings
                const opponentName = typeof match.opponent === 'object' && match.opponent !== null
                    ? (match.opponent.name || 'Unknown')
                    : String(match.opponent || 'Unknown');

                let resultScore = '0 - 0';
                if (typeof match.score === 'string') {
                    resultScore = match.score;
                } else if (typeof match.result === 'string') {
                    resultScore = match.result;
                } else if (typeof match.result === 'number') {
                    // Fallback or legacy format mapping: if home/away exists or fallback
                    if (match.home && match.away && typeof match.home.score === 'number' && typeof match.away.score === 'number') {
                        resultScore = `${match.home.score} - ${match.away.score}`;
                    } else {
                        resultScore = `${match.result} - 0`;
                    }
                }

                const matchStats = {
                    matchId: Number(match.id) || match.id,
                    date: match.date,
                    opponent: opponentName,
                    competition: match.competition,
                    result: resultScore,
                    score: resultScore,
                    isHome: match.isHome === undefined ? true : match.isHome,
                };

                if (p.stats) {
                    p.stats.forEach(category => {
                        for (const statName in category.stats) {
                            const statObj = category.stats[statName];
                            const key = statObj.key || statName;
                            let value = statObj.stat ? statObj.stat.value : statObj.value;

                            if (key === 'minutes_played') {
                                matchStats.minutes_played = value;
                                matchStats.minutes = value;
                            } else if (key === 'rating_title') {
                                matchStats.rating_title = value;
                                matchStats.rating = value;
                            } else if (key === 'distance_covered' || key === 'physical_metrics_distance_covered') {
                                matchStats.totalDistance = value ? (value / 1000) : 0;
                            } else if (key === 'physical_metrics_topspeed') {
                                matchStats.top_speed = value;
                            } else {
                                matchStats[key] = value;
                            }
                        }
                    });

                    if (p.rating && p.rating.num && !matchStats.rating) {
                        matchStats.rating = p.rating.num;
                        matchStats.rating_title = p.rating.num;
                    }
                }

                const totalMinutesInMatch = matchStats.minutes_played || matchStats.minutes || 0;
                if (totalMinutesInMatch > 0) {
                    playerRef.matches.push(matchStats);
                }
            }

        } catch (err) {
            console.error(`Error processing match ${match.id}:`, err.message);
        }
    }

    if (browser) await browser.close();

    console.log("\nFinalizing player data...");
    const finalPlayers = Object.values(playersMap).map(p => {
        p.matches.sort((a, b) => new Date(a.date) - new Date(b.date));
        const uniqueMatches = [];
        const seenIds = new Set();
        (p.matches || []).forEach(m => {
            const id = String(m.matchId);
            if (!seenIds.has(id)) {
                seenIds.add(id);
                uniqueMatches.push(m);
            }
        });
        p.matches = uniqueMatches;
        p.appearances = p.matches.length;
        return p;
    });

    const titansData = finalPlayers.filter(player => {
        const totalMinutes = player.matches.reduce((sum, match) => {
            return sum + (match.minutes || match.minutes_played || 0);
        }, 0);

        if (totalMinutes === 0) {
            return false;
        }
        return true;
    });

    if (titansData.length === 0) {
        console.error("\nFATAL: No players were successfully processed.");
        process.exit(1);
    }

    const fileContent = `import { Player } from './types';\n\nexport const TITANS_DATA: Player[] = ${JSON.stringify(titansData, null, 4)};`;
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Saved ${titansData.length} players to ${OUTPUT_FILE}`);
}

run().catch(err => {
    console.error("FATAL ERROR in run():", err);
    process.exit(1);
});
