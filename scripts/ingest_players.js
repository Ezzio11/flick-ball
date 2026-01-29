const fs = require('fs');
const path = require('path');

const BARCA_ID = 8634;
const MATCHES_FILE = path.join(__dirname, '../public/data/matches.json');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/titans_data.ts');

// Mapping of FotMob stat keys to our internal keys
// We traverse the 'stats' array in playerStats
// Key is what we want, Value is the FotMob key (or we can just flat map everything)

async function run() {
    console.log("Starting Player Ingestion...");

    // 1. Load Existing Data to preserve positions
    const existingPositions = {};
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
            // Robust extract: find the first '[' and the last ']'
            const start = content.indexOf('[');
            const end = content.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                const jsonStr = content.substring(start, end + 1);
                // Remove potential trailing commas or comments if any inside JSON (though usually valid JSON in this file)
                // Assuming it's valid JSON
                const existingData = JSON.parse(jsonStr);

                existingData.forEach(p => {
                    if (p.id && p.position) {
                        existingPositions[p.id] = p.position;
                    }
                });
                console.log(`Loaded ${Object.keys(existingPositions).length} existing player positions.`);
            } else {
                console.warn("Could not find TITANS_DATA array brackets in existing file.");
            }
        } catch (e) {
            console.warn("Could not parse existing titans_data.ts for positions, starting fresh.", e.message);
        }
    }

    // 2. Load Matches
    if (!fs.existsSync(MATCHES_FILE)) {
        console.error("Matches file not found!");
        return;
    }
    const matches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
    console.log(`Loaded ${matches.length} matches.`);

    const playersMap = {}; // id -> Player Object

    // 3. Iterate Matches
    for (const match of matches) {
        if (!match.id) continue;

        console.log(`Processing match: ${match.opponent} (${match.date})...`);

        let matchData;
        try {
            // For now, reuse temp_match.json if ID matches for debugging, else fetch
            // But for production script, strictly fetch. 
            // We implement a simple cache to avoid spamming
            const cachePath = path.join(__dirname, `../.cache/match_${match.id}.json`);
            if (fs.existsSync(cachePath)) {
                matchData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            } else {
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
            }

            if (!matchData.content || !matchData.content.playerStats) {
                console.warn(`No playerStats for match ${match.id}`);
                continue;
            }

            const pStats = matchData.content.playerStats;

            // Iterate all players in the stats block
            for (const pid in pStats) {
                const p = pStats[pid];
                if (p.teamId !== BARCA_ID) continue; // Only Barca players

                const playerId = p.id;
                const playerName = p.name;

                if (!playersMap[playerId]) {
                    // Preserve position or guess
                    const pos = existingPositions[playerId] || (p.isGoalkeeper ? 'Goalkeeper' : 'Player');

                    playersMap[playerId] = {
                        id: playerId,
                        name: playerName,
                        position: pos,
                        appearances: 0,
                        matches: []
                    };
                }

                // Count appearances
                playersMap[playerId].appearances += 1;

                // Extract Stats - with normalization for backward compatibility
                const matchStats = {
                    matchId: match.id,
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

                playersMap[playerId].matches.push(matchStats);
            }

        } catch (e) {
            console.error(`Error processing match ${match.id}:`, e);
        }
    }

    // 4. Write Output
    // Convert map to array and filter out players with zero minutes
    const allPlayers = Object.values(playersMap);

    // Filter: Only include players who have played (total minutes > 0)
    const titansData = allPlayers.filter(player => {
        const totalMinutes = player.matches.reduce((sum, match) => {
            return sum + (match.minutes || match.minutes_played || 0);
        }, 0);

        if (totalMinutes === 0) {
            console.log(`Excluding ${player.name} (0 minutes played)`);
            return false;
        }
        return true;
    });

    // Add header
    const fileContent = `export const TITANS_DATA = ${JSON.stringify(titansData, null, 4)};`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Saved ${titansData.length} players to ${OUTPUT_FILE} (excluded ${allPlayers.length - titansData.length} bench-only players)`);
}

run().catch(err => {
    console.error("FATAL ERROR in run():", err);
    process.exit(1);
});
