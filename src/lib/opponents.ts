/**
 * Opponent strength, derived from where teams actually finished (FotMob LaLiga
 * tables in honours.json), not from a hand-kept list. Pure functions so they can
 * be tested without the app (scripts/opponents.test.js); src/lib/opponentData.ts
 * binds them to the real tables.
 *
 * Rule: by the opponent's LaLiga rank that season (the live table for the
 * current season, last season's for fixtures before a table exists):
 *   1-4 elite, 5-8 strong, 9-14 mid, 15-20 weak.
 * Not in the LaLiga table: Champions League knockout, or a side that reached that season's
 * UCL quarter-finals (last season's while unresolved) -> elite; other UCL sides -> strong;
 * domestic cup (lower-division side) -> weak; anything else -> mid.
 */

export type Tier = 'elite' | 'strong' | 'mid' | 'weak';
export const TIERS: Tier[] = ['elite', 'strong', 'mid', 'weak'];
export type LeagueTables = Record<string, string[]>; // "25/26" -> team names in rank order
export interface OpponentContext {
    laligaTables: LeagueTables;
    uclQuarterFinalists: Record<string, string[]>; // "25/26" -> team names
}

export interface OpponentMatch {
    opponent: string;
    date: string;
    competition?: string;
    round?: string | null;
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function seasonOf(date: string) {
    const d = new Date(date);
    const y = d.getUTCMonth() >= 7 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
    return { label: `${String(y).slice(2)}/${String(y + 1).slice(2)}`, prev: `${String(y - 1).slice(2)}/${String(y).slice(2)}` };
}

/** The entry for the season of `date`, else the previous season's (current season not resolved yet). */
function bySeason<T>(map: Record<string, T>, date: string): T | undefined {
    const { label, prev } = seasonOf(date);
    return map[label] ?? map[prev];
}

/** 1-based LaLiga rank of `team` in the season of `date`, or null if not in the table. */
export function leagueRank(tables: LeagueTables, team: string, date: string): number | null {
    const table = bySeason(tables, date);
    if (!table) return null;
    const i = table.findIndex(t => fold(t) === fold(team));
    return i === -1 ? null : i + 1;
}

/** Knockout round: "1/16", "1/8", "1/4", "1/2", "final" (league phases are plain numbers). */
export const isKnockout = (round?: string | null) => !!round && (round.includes('/') || /final/i.test(round));
const isUCL = (m: OpponentMatch) => /champions league/i.test(m.competition ?? '');

/** Reached the Champions League quarter-finals in the season of `date` (or the previous one while unresolved). */
export const isUclQuarterFinalist = (ctx: OpponentContext, team: string, date: string) =>
    (bySeason(ctx.uclQuarterFinalists, date) ?? []).some(t => fold(t) === fold(team));

export function opponentTier(ctx: OpponentContext, m: OpponentMatch): Tier {
    const rank = leagueRank(ctx.laligaTables, m.opponent, m.date);
    if (rank !== null) return rank <= 4 ? 'elite' : rank <= 8 ? 'strong' : rank >= 15 ? 'weak' : 'mid';
    if (isUCL(m)) return isKnockout(m.round) || isUclQuarterFinalist(ctx, m.opponent, m.date) ? 'elite' : 'strong';
    if (/copa del rey|super ?cup|supercopa/i.test(m.competition ?? '')) return 'weak';
    return 'mid';
}

/** A big game: a top-4 LaLiga side that season, a Champions League knockout tie or quarter-finalist, or any final. */
export function isBigGame(ctx: OpponentContext, m: OpponentMatch): boolean {
    if (/final/i.test(m.round ?? '')) return true;
    if (isUCL(m) && (isKnockout(m.round) || isUclQuarterFinalist(ctx, m.opponent, m.date))) return true;
    const rank = leagueRank(ctx.laligaTables, m.opponent, m.date);
    return rank !== null && rank <= 4;
}
