// Every player-match exactly as the app rates it (mirrors enrichPlayerMatches + mapToFBIPosition in
// src/lib/playerHelpers.ts): used by scripts/calibrate_fbi.mjs and scripts/fbi.test.js.
import fs from 'node:fs';
import { positionGroup } from '../src/lib/positions.ts';
import { opponentTier } from '../src/lib/opponents.ts';

const ROOT = new URL('..', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const FBI_POSITION = { Goalkeeper: 'GK', Defender: 'DEF', Midfielder: 'MID', Forward: 'FWD' };

export function loadRows() {
    const ts = read('src/lib/titans_data.ts');
    const players = JSON.parse(ts.slice(ts.indexOf('[', ts.indexOf('=')), ts.lastIndexOf(']') + 1));
    const matches = new Map(JSON.parse(read('public/data/matches.json')).map(m => [String(m.id), m]));
    const honours = JSON.parse(read('src/lib/honours.json'));
    const ctx = { laligaTables: honours.laligaTables ?? {}, uclQuarterFinalists: honours.uclQuarterFinalists ?? {} };
    const rows = [];
    for (const p of players) {
        const position = FBI_POSITION[positionGroup(p.position)];
        for (const m of p.matches) {
            const minutes = m.minutes_played ?? m.minutes ?? 0;
            const im = matches.get(String(m.matchId));
            if (!minutes || !im) continue;
            const [h, a] = im.score.split('-').map(x => parseInt(x.trim()));
            const match = { ...m, date: im.date, competition: im.competition, opponent: im.opponent, isHome: im.isHome,
                teamScore: im.isHome ? h : a, opponentScore: im.isHome ? a : h };
            rows.push({ player: p.name, position, match, tier: opponentTier(ctx, match) });
        }
    }
    return rows;
}

export const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
export const sd = (xs) => { const m = mean(xs); return Math.sqrt(mean(xs.map(x => (x - m) ** 2))); };
