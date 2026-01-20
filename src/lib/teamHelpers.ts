import { INGESTED_MATCHES } from './data_ingested';

export interface TeamStats {
    totalMatches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    totalXG: number;
    avgPossession: number;
    avgPassAccuracy: number;
    totalShots: number;
    shotsOnTarget: number;
    bigChances: number;
    cleanSheets: number;
}

export interface CompetitionStats extends TeamStats {
    competition: string;
}

// Parse score string "3 - 1" to get goals for/against
function parseScore(score: string, isHome: boolean): { goalsFor: number; goalsAgainst: number } {
    const [left, right] = score.split(' - ').map(s => parseInt(s.trim()) || 0);
    if (isHome) {
        return { goalsFor: left, goalsAgainst: right };
    } else {
        return { goalsFor: right, goalsAgainst: left };
    }
}

// Determine match result
function getResult(goalsFor: number, goalsAgainst: number): 'W' | 'D' | 'L' {
    if (goalsFor > goalsAgainst) return 'W';
    if (goalsFor < goalsAgainst) return 'L';
    return 'D';
}

// Aggregate team stats from matches
export function aggregateTeamStats(matches: any[]): TeamStats {
    const validMatches = matches.filter(m => {
        // Only count finished matches (not future 0-0s)
        const isFuture = new Date(m.date) > new Date();
        return !isFuture && m.score !== '0 - 0';
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let totalXG = 0;
    let totalPossession = 0;
    let totalPassAccuracy = 0;
    let totalShots = 0;
    let shotsOnTarget = 0;
    let bigChances = 0;
    let cleanSheets = 0;
    let statsCount = 0;

    validMatches.forEach(match => {
        const { goalsFor: gf, goalsAgainst: ga } = parseScore(match.score, match.isHome);
        goalsFor += gf;
        goalsAgainst += ga;

        const result = getResult(gf, ga);
        if (result === 'W') wins++;
        else if (result === 'D') draws++;
        else losses++;

        if (ga === 0) cleanSheets++;

        if (match.stats?.available) {
            statsCount++;
            totalXG += parseFloat(match.stats.xG || '0');
            totalPossession += match.stats.possession || 0;
            totalShots += match.stats.totalShots || 0;
            shotsOnTarget += match.stats.shotsOnTarget || 0;
            bigChances += match.stats.bigChances || 0;

            if (match.stats.accuratePasses?.percentage) {
                totalPassAccuracy += parseFloat(match.stats.accuratePasses.percentage.replace('%', ''));
            }
        }
    });

    return {
        totalMatches: validMatches.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        totalXG,
        avgPossession: statsCount > 0 ? totalPossession / statsCount : 0,
        avgPassAccuracy: statsCount > 0 ? totalPassAccuracy / statsCount : 0,
        totalShots,
        shotsOnTarget,
        bigChances,
        cleanSheets,
    };
}

// Get stats breakdown by competition
export function getCompetitionBreakdown(matches: any[]): CompetitionStats[] {
    const competitions = ['LaLiga', 'Champions League', 'Copa del Rey', 'Supercopa'];
    return competitions.map(comp => {
        const compMatches = matches.filter(m => m.competition === comp);
        return {
            competition: comp,
            ...aggregateTeamStats(compMatches),
        };
    }).filter(c => c.totalMatches > 0);
}

// Get form (last N matches)
export function getFormStreak(matches: any[], count: number = 5): Array<{ result: 'W' | 'D' | 'L'; opponent: string; score: string }> {
    const validMatches = matches
        .filter(m => {
            const isFuture = new Date(m.date) > new Date();
            return !isFuture && m.score !== '0 - 0';
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, count);

    return validMatches.map(m => {
        const { goalsFor: gf, goalsAgainst: ga } = parseScore(m.score, m.isHome);
        return {
            result: getResult(gf, ga),
            opponent: m.opponent,
            score: m.score,
        };
    });
}

// Get all team matches (exported for direct use)
export function getAllTeamMatches() {
    return INGESTED_MATCHES;
}
