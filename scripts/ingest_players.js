/**
 * ingest_players.js - per-player, per-match stats into src/lib/titans_data.ts.
 * Run after ingest_data.js (it reads public/data/matches.json). Only matches no
 * player has yet are fetched; existing player history is kept.
 */

const fs = require('fs');
const path = require('path');
const { getMatch, lineupPositions, matchCards, SLOT_ROLE, COMPETITION_BLOCKLIST } = require('./fotmob');

/** Most frequent value; ties go to the one seen most recently (matches are date-sorted). */
function mostCommon(values) {
    const counts = new Map();
    values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    let best = null;
    values.forEach(v => { if (best === null || counts.get(v) >= counts.get(best)) best = v; });
    return best;
}

/**
 * Position from what the player actually did for Barcelona: their most common
 * starting slot, if it agrees with their usual broad role; otherwise the broad
 * role (bench-only players, or a one-off start out of position).
 */
function derivePosition(matches, fallback) {
    const role = mostCommon(matches.map(m => m.lineupRole).filter(Boolean));
    const slot = mostCommon(matches.map(m => m.lineupPosition).filter(Boolean));
    if (slot && SLOT_ROLE[slot] === role) return slot;
    return role || fallback;
}

const BARCA_ID = 8634;
const MATCHES_FILE = path.join(__dirname, '../public/data/matches.json');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/titans_data.ts');

async function run() {
    console.log("Starting Player Ingestion...");

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

    if (!fs.existsSync(MATCHES_FILE)) throw new Error(`Matches file not found: ${MATCHES_FILE}`);
    const matches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
    console.log(`Loaded ${matches.length} matches.`);

    // --rebuild: discard every match record (keeping player identity) and rebuild from FotMob.
    if (process.argv.includes('--rebuild')) Object.values(playersMap).forEach(p => { p.matches = []; });
    const REFRESH_DAYS = 7; // same window as ingest_data.js: pick up FotMob's post-match revisions
    const isRecent = (m) => Date.now() - new Date(m.date) < REFRESH_DAYS * 864e5;

    const ingested = new Set(Object.values(playersMap).flatMap(p => p.matches.map(m => String(m.matchId))));
    // Records from before lineup positions / cards were stored get backfilled once.
    const missingLineup = new Set(Object.values(playersMap).flatMap(p => p.matches.filter(m => !('lineupRole' in m) || !('redCard' in m)).map(m => String(m.matchId))));

    for (const match of matches) {
        if (!match.id) continue;
        
        if (COMPETITION_BLOCKLIST.includes(match.competition) || (ingested.has(String(match.id)) && !missingLineup.has(String(match.id)) && !isRecent(match))) {
            continue;
        }

        console.log(`Processing match: ${match.opponent} (${match.date})...`);

        try {
            const matchData = await getMatch(match.id);

            // Lineup slot/role for players already holding this match (old records, or
            // pages whose playerStats is missing): fill independently of playerStats.
            // Recent match with player stats available: rebuild its records from scratch.
            if (isRecent(match) && matchData?.content?.playerStats) {
                Object.values(playersMap).forEach(p => { p.matches = p.matches.filter(m => String(m.matchId) !== String(match.id)); });
            }

            const lineup = lineupPositions(matchData, BARCA_ID);
            const noLineup = { lineupPosition: null, lineupRole: null };
            const cards = matchCards(matchData);
            const noCards = { yellowCard: false, redCard: false };
            for (const player of Object.values(playersMap)) {
                const rec = player.matches.find(m => String(m.matchId) === String(match.id));
                if (rec) Object.assign(rec, lineup.get(String(player.id)) || noLineup, cards.get(String(player.id)) || noCards);
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
                        position: p.isGoalkeeper ? 'Goalkeeper' : null, // set by derivePosition below
                        appearances: 0,
                        matches: []
                    };
                    playersMap[playerId] = playerRef;
                    nameToIdMap[playerName] = playerId;
                }

                const existing = playerRef.matches.find(m => String(m.matchId) === String(match.id));
                if (existing) continue;

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
                    ...(lineup.get(String(playerId)) || noLineup),
                    ...(cards.get(String(playerId)) || noCards),
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
        p.position = derivePosition(p.matches, p.position || 'Unknown');
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

if (require.main === module) run().catch(err => {
    console.error("FATAL ERROR in run():", err);
    process.exit(1);
});

module.exports = { derivePosition };
