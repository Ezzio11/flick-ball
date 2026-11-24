/**
 * ingest_data.js - match-level stats for FC Barcelona (FotMob team 8634).
 * Merges new finished matches into public/data/matches.json and
 * src/lib/data_ingested.ts. Existing matches are never dropped.
 */

const fs = require('fs');
const path = require('path');
const { api, getMatch, seasonStartYear, seasonLabel, COMPETITION_BLOCKLIST } = require('./fotmob');

const MATCHES_FILE = path.join(__dirname, '../public/data/matches.json');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/data_ingested.ts');
const TEAM_ID = 8634; // FC Barcelona
const FIRST_SEASON = 2024; // Flick's first season (2024/25)
const LEAGUES = [87, 42, 138, 139];
const REFRESH_DAYS = 7; // FotMob revises xG and other stats for a few days after a match // LaLiga, Champions League, Copa del Rey, Supercopa

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
        season: seasonLabel(fixtureInfo.status.utcTime),
        stats: stats,
        scorers: scorers,
        formation: formation
    };
}


/** Finished fixtures to consider, keyed by String(id): current season + every past Flick season. */
async function collectFixtures() {
    const fixtures = new Map();
    const add = (f) => { if (f.status?.finished) fixtures.set(String(f.id), f); };

    // A failure here means FotMob changed or blocked us: fail loudly so CI goes red.
    const team = await api('teams', { id: TEAM_ID, tab: 'fixtures' });
    const current = team.fixtures?.allFixtures?.fixtures;
    if (!Array.isArray(current)) throw new Error('Team endpoint returned no fixtures list');
    current.forEach(add);

    // Past seasons via league endpoints: fills any gap left by a missed run.
    for (let y = FIRST_SEASON; y < seasonStartYear(new Date()); y++) {
        for (const league of LEAGUES) {
            try {
                const data = await api('leagues', { id: league, season: `${y}/${y + 1}`, tab: 'matches' });
                const all = data.matches?.allMatches || data.fixtures?.allMatches || [];
                all.filter(f => String(f.home?.id) === String(TEAM_ID) || String(f.away?.id) === String(TEAM_ID)).forEach(add);
            } catch (e) {
                console.warn(`League ${league} ${y}/${y + 1}: ${e.message}`);
            }
        }
    }
    return fixtures;
}

/** Sort and write both match outputs. Returns the sorted list. */
function writeMatches(matches) {
    const allMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (allMatches.length === 0) throw new Error('No matches to write');
    fs.writeFileSync(MATCHES_FILE, JSON.stringify(allMatches, null, 4));
    fs.writeFileSync(OUTPUT_FILE, `// Auto-generated by scripts/ingest_data.js (source: FotMob). Do not edit.

import { MatchData } from './matchHelpers';

export const INGESTED_MATCHES: MatchData[] = ${JSON.stringify(allMatches, null, 4)};
`);
    return allMatches;
}

async function runScraper() {
    const matchesMap = new Map(); // String(id) -> parsed match
    if (fs.existsSync(MATCHES_FILE)) {
        for (const m of JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'))) {
            if (m.id && !COMPETITION_BLOCKLIST.includes(m.competition)) matchesMap.set(String(m.id), m);
        }
        console.log(`Loaded ${matchesMap.size} existing matches.`);
    }
    const before = matchesMap.size;

    const fixtures = await collectFixtures();
    let added = 0, failed = 0;
    for (const [id, f] of fixtures) {
        const stored = matchesMap.get(id);
        const recent = Date.now() - new Date(f.status.utcTime) < REFRESH_DAYS * 864e5;
        if (stored?.stats?.available && !recent) continue;
        if (COMPETITION_BLOCKLIST.includes(f.tournament?.name || f.leagueName)) continue;

        process.stdout.write(`Match ${id} (${f.home?.name} vs ${f.away?.name})... `);
        try {
            const details = await getMatch(id, { fresh: recent });
            const result = parseMatchData(details, {
                id: Number(id),
                status: f.status,
                leagueName: f.tournament?.name || f.leagueName || details.general?.leagueName,
            });
            if (COMPETITION_BLOCKLIST.includes(result.competition)) { console.log('skipped (friendly)'); continue; }
            if (!matchesMap.has(id)) added++;
            matchesMap.set(id, result);
            console.log(result.stats.available ? 'OK' : 'OK (no stats yet)');
        } catch (e) {
            failed++;
            console.log(`FAILED: ${e.message}`); // keeps any existing entry for this match
        }
    }

    const allMatches = writeMatches([...matchesMap.values()]);
    console.log(`\nDone: ${allMatches.length} matches (${before} before, ${added} new, ${failed} failed).`);
}

if (require.main === module) {
    runScraper().catch(err => { console.error('FATAL:', err); process.exit(1); });
}

module.exports = { parseMatchData, writeMatches };
