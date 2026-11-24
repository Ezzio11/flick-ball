/**
 * fotmob.js - the only place that talks to FotMob.
 * Plain fetch (Node 18+) against FotMob's JSON API, which currently needs no
 * browser or challenge; if that changes, fix it here.
 */

const fs = require('fs');
const path = require('path');

const BASE = 'https://www.fotmob.com';
const CACHE_DIR = path.join(__dirname, '../.cache');
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
};

// Friendlies are excluded everywhere (union of the lists both scripts used to carry).
const COMPETITION_BLOCKLIST = ['Club Friendlies', 'Trofeu Joan Gamper', 'International Friendlies', 'Friendly', 'Other Friendlies', 'Club Friendlies 2024', 'Club Friendlies 2025'];

// Lineup slot codes (starters' `positionId`). Every pair is FotMob's own: taken from
// playerData's positions[].position + strPosShort. Exception: 65, seen once, sits
// between 64/66 (DM) and is the single-pivot slot. DM/AM renamed to the app's CDM/CAM.
const SLOT_CODES = {
    11: 'GK', 32: 'RB', 34: 'CB', 36: 'CB', 38: 'LB', 51: 'RWB',
    64: 'CDM', 65: 'CDM', 66: 'CDM', 71: 'RM', 72: 'RM', 73: 'CM', 75: 'CM', 76: 'CM', 77: 'CM', 78: 'LM', 79: 'LM',
    82: 'RW', 83: 'RW', 84: 'CAM', 85: 'CAM', 86: 'CAM', 87: 'LW',
    103: 'RW', 104: 'ST', 105: 'ST', 106: 'ST', 107: 'LW', 115: 'ST',
};
// Lineup `usualPlayingPositionId` (starters and subs): the player's broad role.
const ROLE_CODES = { 0: 'Goalkeeper', 1: 'Defender', 2: 'Midfielder', 3: 'Attacker' };
const SLOT_ROLE = {
    GK: 'Goalkeeper', CB: 'Defender', RB: 'Defender', LB: 'Defender', RWB: 'Defender', LWB: 'Defender',
    CDM: 'Midfielder', CM: 'Midfielder', CAM: 'Midfielder', RM: 'Midfielder', LM: 'Midfielder',
    RW: 'Attacker', LW: 'Attacker', ST: 'Attacker',
};

/** Barcelona's lineup in a match as Map(String(playerId) -> { lineupPosition, lineupRole }). */
function lineupPositions(props, teamId) {
    const lineup = props.content?.lineup || {};
    const team = [lineup.homeTeam, lineup.awayTeam].find(t => t?.id === teamId);
    const out = new Map();
    if (!team) return out;
    for (const [list, started] of [[team.starters, true], [team.subs, false]]) {
        for (const p of list || []) {
            const slot = started ? SLOT_CODES[p.positionId] : undefined;
            if (started && !slot) console.warn(`Unknown FotMob slot ${p.positionId} for ${p.name}: add it to SLOT_CODES`);
            out.set(String(p.id), { lineupPosition: slot || null, lineupRole: ROLE_CODES[p.usualPlayingPositionId] || null });
        }
    }
    return out;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getJson(url) {
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, { headers: HEADERS });
            if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
            return await res.json();
        } catch (e) {
            lastErr = e;
            if (attempt < 3) await sleep(1000 * attempt);
        }
    }
    throw lastErr;
}

/** GET /api/data/<endpoint>?<params> as JSON. */
function api(endpoint, params) {
    return getJson(`${BASE}/api/data/${endpoint}?${new URLSearchParams(params)}`, 'json');
}

/** True when a matchDetails payload is usable and really is match `id`. */
function isMatch(details, id) {
    return Boolean(details?.content && details?.header) && String(details.general?.matchId) === String(id);
}

/**
 * matchDetails for one match, served from .cache when present (both ingest scripts share it).
 * The id check matters: the old Playwright scraper cached the wrong match under 71 of 136 ids.
 */
async function getMatch(id, { fresh = false } = {}) {
    const file = path.join(CACHE_DIR, `match_${id}.json`);
    if (!fresh && fs.existsSync(file)) {
        const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (isMatch(cached, id)) return cached;
        console.warn(`Cache for ${id} holds match ${cached.general?.matchId}: refetching`);
    }
    const details = await api('matchDetails', { matchId: id });
    if (!isMatch(details, id)) throw new Error(`FotMob returned match ${details.general?.matchId} for ${id}`);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(details));
    await sleep(500); // be polite on cache misses only
    return details;
}

/** Start year of the season a date falls in. Seasons roll over on Aug 1 (matches the UI filter). */
function seasonStartYear(date) {
    const d = new Date(date);
    return d.getUTCMonth() >= 7 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
}

/** "25/26" style label used throughout the app. */
function seasonLabel(date) {
    const y = seasonStartYear(date);
    return `${String(y).slice(2)}/${String(y + 1).slice(2)}`;
}

module.exports = { COMPETITION_BLOCKLIST, SLOT_ROLE, lineupPositions, api, getMatch, isMatch, seasonStartYear, seasonLabel };
