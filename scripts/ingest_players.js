const fs = require('fs');
const path = require('path');

const BARCA_ID = 8634;
const MATCHES_FILE = path.join(__dirname, '../public/data/matches.json');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/titans_data.ts');
const COMPETITION_BLOCKLIST = ["Club Friendlies", "Trofeu Joan Gamper", "International Friendlies", "Friendly", "Other Friendlies"];

// Mapping of FotMob stat keys to our internal keys
// We traverse the 'stats' array in playerStats
// Key is what we want, Value is the FotMob key (or we can just flat map everything)

async function run() {
    console.log("Starting Player Ingestion...");
    const isCacheOnly = process.argv.includes('--use-cache');
    const CACHE_DIR = path.join(__dirname, '../.cache');

    // 0. Process batch_export.json if it exists (Explode into individual files)
    const BATCH_FILE = path.join(CACHE_DIR, 'batch_export.json');
    if (fs.existsSync(BATCH_FILE)) {
        console.log("Found batch_export.json. Exploding into individual cache files...");
        try {
            const batchData = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'));
            if (Array.isArray(batchData)) {
                batchData.forEach(item => {
                    const matchId = item.id;
                    const individualPath = path.join(CACHE_DIR, `match_${matchId}.json`);
                    if (!fs.existsSync(individualPath)) {
                        fs.writeFileSync(individualPath, JSON.stringify(item.data, null, 2));
                        console.log(`  - Cached ${matchId}`);
                    }
                });
            }
        } catch (e) {
            console.error("❌ Failed to process batch_export.json:", e.message);
        }
    }

    // 1. Load Existing Data to seed playersMap (ensures history is preserved)
    const playersMap = {}; // id -> Player Object
    const nameToIdMap = {}; // name -> primary id

    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
            // More robust extraction of the JSON array from the TS file
            const eqIndex = content.indexOf('=');
            const start = content.indexOf('[', eqIndex);
            const end = content.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                const jsonStr = content.substring(start, end + 1);
                const existingData = JSON.parse(jsonStr);

                existingData.forEach(p => {
                    if (p.id) {
                        // HISTORICAL CLEANUP: Purge friendlies and bench appearances from loaded history
                        p.matches = (p.matches || []).filter(m => {
                            const isFriendly = COMPETITION_BLOCKLIST.includes(m.competition);
                            if (isFriendly) return false;
                            
                            // Default to played if minutes field is missing (preserves old history)
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

    // 2. Load Matches
    if (!fs.existsSync(MATCHES_FILE)) {
        console.error("Matches file not found!");
        return;
    }
    const matches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
    console.log(`Loaded ${matches.length} matches.`);

    // 3. Iterate Matches
    for (const match of matches) {
        if (!match.id) continue;
        
        // Competition Filter
        if (COMPETITION_BLOCKLIST.includes(match.competition)) {
            console.log(`⏩ Skipping blocklisted competition: ${match.competition} (${match.id})`);
            continue;
        }

        console.log(`Processing match: ${match.opponent} (${match.date})...`);

        let matchData;
        try {
            // For now, reuse temp_match.json if ID matches for debugging, else fetch
            // But for production script, strictly fetch. 
            // We implement a simple cache to avoid spamming
            const cachePath = path.join(__dirname, `../.cache/match_${match.id}.json`);
            if (fs.existsSync(cachePath)) {
                matchData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            } else if (!isCacheOnly) {
                // Ensure cache dir
                if (!fs.existsSync(path.dirname(cachePath))) fs.mkdirSync(path.dirname(cachePath), { recursive: true });

                const url = `https://www.fotmob.com/api/matchDetails?matchId=${match.id}`;
                const res = await fetch(url);
                if (!res.ok) {
                    console.warn(`Failed to fetch match ${match.id}: ${res.status}`);
                    continue;
                }
                matchData = await res.json();
                fs.writeFileSync(cachePath, JSON.stringify(matchData, null, 2));
                // Sleep a bit to be nice
                await new Promise(r => setTimeout(r, 500));
            } else {
                console.warn(`Match ${match.id} not found in cache and --use-cache is active. Skipping...`);
                continue;
            }

            if (!matchData || !matchData.content || !matchData.content.playerStats) {
                console.warn(`No playerStats for match ${match.id}. Falling back to matches.json for basic stats.`);
                
                // Fallback: If we have scorers in matches.json, use them to at least credit goals/assists
                if (match.scorers) {
                    // We don't have a full player list here, so we only update players mentioned in scorers/assists
                    // and we assume everyone in Barca XI played 90 mins (or just skip minutes)
                    match.scorers.forEach(s => {
                        if (s.team !== 'barca') return;
                        
                        // NOTE: This fallback is limited because we don't have the Player ID from matches.json
                        // only player name. This is why the Manual Bridge is preferred.
                        // However, we can try to find the player by name in our existing playerMap or titansData
                        console.log(`  - Crediting goal to ${s.player} (fallback)`);
                    });
                }
                continue; // Still continue for now because we lack Player IDs in matches.json
            }

            const pStats = matchData.content.playerStats;

            // Iterate all players in the stats block
            for (const pid in pStats) {
                const p = pStats[pid];
                if (p.teamId !== BARCA_ID) continue; // Only Barca players

                const playerId = p.id;
                const playerName = p.name;

                let playerRef = playersMap[playerId];

                // NAME-BASED DEDUPLICATION (e.g. Lamine Yamal ID change)
                if (!playerRef && nameToIdMap[playerName]) {
                    const primaryId = nameToIdMap[playerName];
                    console.log(`  - Mapping new ID ${playerId} to existing primary ID ${primaryId} for ${playerName}`);
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

                // Avoid duplicate matches in history (Force String compare for robustness)
                const isMatchIngested = playerRef.matches.some(m => String(m.matchId) === String(match.id));
                if (isMatchIngested) {
                    console.log(`  - Match ${match.id} already in ${playerName}'s history. Skipping stats update.`);
                    continue;
                }

                // Extract Stats - with normalization for backward compatibility
                const matchStats = {
                    matchId: Number(match.id) || match.id,
                    date: match.date,
                    opponent: match.opponent,
                    competition: match.competition,
                    result: match.score || match.result, // Add result field from matches.json
                    score: match.score, // Explicit score field
                    isHome: match.isHome, // Include isHome for proper score parsing
                    // Flatten stats
                };

                // Traverse the FotMob stats structure
                if (p.stats) {
                    p.stats.forEach(category => {
                        // category has title (e.g. "Top stats") and stats object
                        for (const statName in category.stats) {
                            const statObj = category.stats[statName];
                            // key is usually like 'goals', 'notes', etc.
                            // We prefer the 'key' property if available
                            const key = statObj.key || statName;
                            let value = statObj.stat ? statObj.stat.value : statObj.value;

                            // Normalize specific fields for backward compatibility
                            if (key === 'minutes_played') {
                                matchStats.minutes_played = value;
                                matchStats.minutes = value; // ALIAS for old code
                            } else if (key === 'rating_title') {
                                matchStats.rating_title = value;
                                matchStats.rating = value; // ALIAS
                            } else if (key === 'distance_covered' || key === 'physical_metrics_distance_covered') {
                                // Convert meters to kilometers
                                matchStats.totalDistance = value ? (value / 1000) : 0;
                            } else if (key === 'physical_metrics_topspeed') {
                                matchStats.top_speed = value;
                            } else {
                                matchStats[key] = value;
                            }
                        }
                    });

                    // Add rating directly if not already set
                    if (p.rating && p.rating.num && !matchStats.rating) {
                        matchStats.rating = p.rating.num;
                        matchStats.rating_title = p.rating.num;
                    }
                }

                // Only add to history if they actually played (minutes > 0)
                const totalMinutesInMatch = matchStats.minutes_played || matchStats.minutes || 0;
                if (totalMinutesInMatch > 0) {
                    playerRef.matches.push(matchStats);
                } else {
                    console.log(`  - Skipping bench appearance for ${playerName} in match ${match.id}`);
                }
            }

        } catch (err) {
            console.error(`Error processing match ${match.id}:`, err.message);
        }
    }

    // 4. Recalculate Appearances based on unique matches
    console.log("\nFinalizing player data...");
    const finalPlayers = Object.values(playersMap).map(p => {
        // Sort matches by date
        p.matches.sort((a, b) => new Date(a.date) - new Date(b.date));
        // Deduplicate matches by matchId
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

    // 5. Filter: Only include players who have played (total minutes > 0)
    const titansData = finalPlayers.filter(player => {
        const totalMinutes = player.matches.reduce((sum, match) => {
            return sum + (match.minutes || match.minutes_played || 0);
        }, 0);

        if (totalMinutes === 0) {
            console.log(`Excluding ${player.name} (0 minutes played)`);
            return false;
        }
        return true;
    });

    if (titansData.length === 0) {
        console.error("\nFATAL: No players were successfully processed. This likely means public/data/matches.json is empty or invalid.");
        console.error("Aborting write to src/lib/titans_data.ts to prevent data loss.");
        process.exit(1);
    }

    // 6. Build Content
    const fileContent = `import { Player } from './types';

export const TITANS_DATA: Player[] = ${JSON.stringify(titansData, null, 4)};`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Saved ${titansData.length} players to ${OUTPUT_FILE} (excluded ${finalPlayers.length - titansData.length} bench-only players)`);
}

run().catch(err => {
    console.error("FATAL ERROR in run():", err);
    process.exit(1);
});
