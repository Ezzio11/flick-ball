/**
 * fotmob.js - the only place that talks to FotMob.
 * Plain fetch (Node 18+). FotMob currently serves both the JSON API and the
 * match pages without a browser challenge; if that changes, fix it here.
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function get(url, as) {
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, { headers: HEADERS });
            if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
            return as === 'json' ? await res.json() : await res.text();
        } catch (e) {
            lastErr = e;
            if (attempt < 3) await sleep(1000 * attempt);
        }
    }
    throw lastErr;
}

/** GET /api/data/<endpoint>?<params> as JSON. */
function api(endpoint, params) {
    return get(`${BASE}/api/data/${endpoint}?${new URLSearchParams(params)}`, 'json');
}

/** Pull pageProps out of a FotMob match page's __NEXT_DATA__ script. */
function extractPageProps(html) {
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) throw new Error('No __NEXT_DATA__ in match page');
    const props = JSON.parse(m[1]).props?.pageProps;
    if (!props?.content || !props?.header) throw new Error('Unexpected __NEXT_DATA__ shape');
    return props;
}

/** Match pageProps, served from .cache when present (both ingest scripts share it). */
async function getMatch(id) {
    const file = path.join(CACHE_DIR, `match_${id}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    const props = extractPageProps(await get(`${BASE}/match/${id}`, 'text'));
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(props));
    await sleep(500); // be polite on cache misses only
    return props;
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

module.exports = { COMPETITION_BLOCKLIST, api, getMatch, extractPageProps, seasonStartYear, seasonLabel };
