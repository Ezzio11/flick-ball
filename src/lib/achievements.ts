/**
 * Everything the Hall of Glory page shows that can be computed, is computed here:
 * from match data (data_ingested.ts), player data (titans_data.ts) and FotMob's
 * trophy cabinet (honours.json). Pure functions, no app imports, tested by
 * scripts/achievements.test.js.
 */

export interface AchMatch {
    id: number | string;
    date: string;
    opponent: string;
    score: string; // "home - away"
    isHome: boolean;
    competition: string;
    season: string; // "25/26"
    scorers?: { team: string; minute: number }[];
}
export interface AchPlayer {
    name: string;
    matches: { matchId: number | string; date: string; opponent?: string; goals?: number; assists?: number }[];
}
export interface Honours {
    trophies: { name: string; won: number; seasonsWon: string[]; seasonsRunnerup: string[] }[];
    laligaByCoach: { season: string; coach: string; win: number; draw: number; loss: number; pointsPerGame: number }[];
}

export const FLICK_FIRST_SEASON = '2024/2025';
const FLICK_COACH = 'Hans-Dieter Flick';

/** "25/26" -> "2025/2026" (the format FotMob's trophy list uses). */
const fullSeason = (label: string) => `20${label.slice(0, 2)}/20${label.slice(3, 5)}`;
/** "2025/2026" -> "25/26". */
export const shortSeason = (season: string) => `${season.slice(2, 4)}/${season.slice(7, 9)}`;

/** 1 -> "1st", 22 -> "22nd", 29 -> "29th", 13 -> "13th". */
export function ordinal(n: number) {
    const tens = n % 100, ones = n % 10;
    const suffix = tens >= 11 && tens <= 13 ? 'th' : ones === 1 ? 'st' : ones === 2 ? 'nd' : ones === 3 ? 'rd' : 'th';
    return `${n}${suffix}`;
}

/** True when the two most recent seasons in the list are consecutive ("2024/2025", "2025/2026"). */
export function isBackToBack(seasons: string[]) {
    const years = seasons.map(s => Number(s.slice(0, 4))).sort((a, b) => b - a);
    return years.length >= 2 && years[0] - years[1] === 1;
}

export function result(m: AchMatch) {
    const [home, away] = m.score.split(' - ').map(Number);
    const [gf, ga] = m.isHome ? [home, away] : [away, home];
    return { gf, ga, outcome: (gf > ga ? 'W' : gf === ga ? 'D' : 'L') as 'W' | 'D' | 'L' };
}

const byDate = (a: AchMatch, b: AchMatch) => new Date(a.date).getTime() - new Date(b.date).getTime();

/** Trophies won under Flick, newest first, each with its all-time count (e.g. 29th LaLiga). */
export function flickTrophies(honours: Honours) {
    return honours.trophies.flatMap(t => {
        const ascending = [...t.seasonsWon].sort();
        return ascending
            .map((season, i) => ({ competition: t.name, season, nth: i + 1 }))
            .filter(x => x.season >= FLICK_FIRST_SEASON);
    }).sort((a, b) => b.season.localeCompare(a.season) || a.competition.localeCompare(b.competition));
}

/** Cup finals under Flick: a won season is a final won, a runner-up season a final lost. */
export function finalsRecord(honours: Honours) {
    const cups = honours.trophies.filter(t => t.name !== 'LaLiga');
    const flick = (seasons: string[]) => seasons.filter(s => s >= FLICK_FIRST_SEASON).length;
    const won = cups.reduce((n, t) => n + flick(t.seasonsWon), 0);
    const lost = cups.reduce((n, t) => n + flick(t.seasonsRunnerup), 0);
    return { won, played: won + lost };
}

/** Head-to-head record against one opponent, with the biggest win. */
export function headToHead(matches: AchMatch[], opponent: string) {
    const games = matches.filter(m => m.opponent === opponent).sort(byDate);
    const rows = games.map(m => ({ match: m, ...result(m) }));
    const count = (o: string) => rows.filter(r => r.outcome === o).length;
    const biggestWin = rows.filter(r => r.outcome === 'W')
        .reduce<(typeof rows)[number] | null>((best, r) => (!best || r.gf - r.ga > best.gf - best.ga ? r : best), null);
    return { played: rows.length, won: count('W'), drawn: count('D'), lost: count('L'), biggestWin, rows };
}

/** LaLiga record per Flick season from match data; `complete` once all 38 games are in. */
export function laligaSeasons(matches: AchMatch[]) {
    const seasons = [...new Set(matches.filter(m => m.competition === 'LaLiga').map(m => m.season))].sort();
    return seasons.map(season => {
        const rows = matches.filter(m => m.competition === 'LaLiga' && m.season === season).map(result);
        const won = rows.filter(r => r.outcome === 'W').length, drawn = rows.filter(r => r.outcome === 'D').length;
        const points = 3 * won + drawn;
        return { season, played: rows.length, won, drawn, lost: rows.length - won - drawn, points,
            pointsPerGame: Math.round((points / rows.length) * 100) / 100, complete: rows.length === 38 };
    });
}

/**
 * Flick's best completed LaLiga season, compared with every earlier coach-season FotMob has.
 * `betterSince` is the most recent earlier season with a higher PPG (null if none in the data);
 * `equalled` lists earlier seasons with the same PPG.
 */
export function bestLeagueSeason(matches: AchMatch[], honours: Honours) {
    const best = laligaSeasons(matches).filter(s => s.complete)
        .reduce<ReturnType<typeof laligaSeasons>[number] | null>((b, s) => (!b || s.pointsPerGame > b.pointsPerGame ? s : b), null);
    if (!best) return null;
    const earlier = honours.laligaByCoach.filter(c => c.coach !== FLICK_COACH && c.season < fullSeason(best.season));
    const better = earlier.filter(c => c.pointsPerGame > best.pointsPerGame).sort((a, b) => b.season.localeCompare(a.season));
    return {
        ...best,
        betterSince: better[0] ?? null,
        equalled: earlier.filter(c => c.pointsPerGame === best.pointsPerGame),
        recordsFrom: earlier.map(c => c.season).sort()[0] ?? null,
    };
}

/** Longest run without defeat in any competition. */
export function longestUnbeaten(matches: AchMatch[]) {
    let best: AchMatch[] = [], run: AchMatch[] = [];
    for (const m of [...matches].sort(byDate)) {
        run = result(m).outcome === 'L' ? [] : [...run, m];
        if (run.length > best.length) best = run;
    }
    return best.length ? { length: best.length, from: best[0], to: best[best.length - 1] } : null;
}

/** Share of Barca goals scored after half-time (minute > 45). */
export function secondHalfShare(matches: AchMatch[]) {
    const minutes = matches.flatMap(m => (m.scorers || []).filter(s => s.team === 'barca').map(s => s.minute));
    return minutes.length ? { goals: minutes.length, share: minutes.filter(x => x > 45).length / minutes.length } : null;
}

/** Wins over `opponent` in one competition (e.g. Super Cup wins over Real Madrid). */
export function winsOver(matches: AchMatch[], opponent: string, competition: string) {
    return matches.filter(m => m.opponent === opponent && m.competition === competition && result(m).outcome === 'W').sort(byDate);
}

/** Season label ("25/26") of a date: seasons roll over on Aug 1 UTC. */
function seasonOf(date: string) {
    const d = new Date(date);
    const y = d.getUTCMonth() >= 7 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
    return `${String(y).slice(2)}/${String(y + 1).slice(2)}`;
}

/** Goals/assists per player per season, plus each season's top scorer. */
export function playerSeasons(players: AchPlayer[]) {
    const rows = players.flatMap(p => {
        const bySeason = new Map<string, { goals: number; assists: number; apps: number }>();
        for (const m of p.matches) {
            const s = seasonOf(m.date);
            const r = bySeason.get(s) ?? { goals: 0, assists: 0, apps: 0 };
            r.goals += m.goals || 0; r.assists += m.assists || 0; r.apps += 1;
            bySeason.set(s, r);
        }
        return [...bySeason].map(([season, r]) => ({ name: p.name, season, ...r }));
    });
    const topScorer = (season: string) => rows.filter(r => r.season === season).sort((a, b) => b.goals - a.goals)[0];
    return { rows, topScorer };
}

/** A player's totals under Flick, best season by goals, and hat-tricks. */
export function playerSummary(players: AchPlayer[], name: string) {
    const p = players.find(x => x.name === name);
    if (!p) return null;
    const { rows, topScorer } = playerSeasons([p, ...players.filter(x => x !== p)]);
    const mine = rows.filter(r => r.name === name).sort((a, b) => b.goals - a.goals || a.season.localeCompare(b.season));
    const hatTricks = p.matches.filter(m => (m.goals || 0) >= 3).sort((a, b) => a.date.localeCompare(b.date));
    return {
        goals: mine.reduce((n, r) => n + r.goals, 0),
        assists: mine.reduce((n, r) => n + r.assists, 0),
        apps: p.matches.length,
        bestSeason: mine[0] ?? null,
        topScorerSeasons: mine.filter(r => topScorer(r.season)?.name === name && r.goals > 0).map(r => r.season).sort(),
        hatTricks,
    };
}
