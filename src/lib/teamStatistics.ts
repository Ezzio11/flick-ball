/**
 * Team Statistical Analysis Engine
 * 
 * Provides comprehensive statistical analysis of Barcelona's performance
 * under Hansi Flick, including parameter estimation for Monte Carlo simulations.
 */

// import { INGESTED_MATCHES } from './data_ingested';

export interface Match {
    id: string | number;
    date: string;
    opponent: string;
    score: string;
    isHome: boolean;
    competition: string;
    season: string;
    stats?: {
        available: boolean;
        possession?: number;
        xG?: string;
        totalShots?: number;
        shotsOnTarget?: number;
        bigChances?: number;
        [key: string]: any;
    };
    scorers?: Array<{
        player: string;
        team: string;
        minute: number;
        assist?: string | null;
        isPenalty?: boolean;
    }>;
    _isFriendly?: boolean;
}

export interface TeamStatistics {
    // Offensive
    avgGoalsFor: number;
    stdDevGoalsFor: number;
    avgXG: number;
    xGOverperformance: number;

    // Defensive
    avgGoalsAgainst: number;
    stdDevGoalsAgainst: number;

    // Possession & Passing
    avgPossession: number;
    avgPassAccuracy: number;

    // Splits
    home: SplitStats;
    away: SplitStats;

    // Competition-specific
    byCompetition: Record<string, SplitStats>;

    // Tier-based analysis
    byTier: Record<string, SplitStats>;
}

export interface SplitStats {
    matches: number;
    avgGoalsFor: number;
    stdDevGoalsFor: number;
    avgGoalsAgainst: number;
    stdDevGoalsAgainst: number;
    winRate: number;
    wins?: number;
    draws?: number;
    losses?: number;
    history?: ('W' | 'D' | 'L')[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractGoalsScored(match: Match): number {
    const [home, away] = match.score.split('-').map(s => parseInt(s.trim()));
    if (isNaN(home) || isNaN(away)) return 0;
    return match.isHome ? home : away;
}

function extractGoalsConceded(match: Match): number {
    const [home, away] = match.score.split('-').map(s => parseInt(s.trim()));
    if (isNaN(home) || isNaN(away)) return 0;
    return match.isHome ? away : home;
}

function mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = mean(values);
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(mean(squaredDiffs));
}

export function getMatchResult(match: Match): 'W' | 'D' | 'L' {
    const goalsFor = extractGoalsScored(match);
    const goalsAgainst = extractGoalsConceded(match);

    if (goalsFor > goalsAgainst) return 'W';
    if (goalsFor < goalsAgainst) return 'L';
    return 'D';
}

// ============================================================================
// CORE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get all completed matches (stats available)
 * Ignores date to use all available training data
 */
/**
 * Get all completed matches (stats available)
 * Ignores date to use all available training data
 * STRICTLY filters out Friendly Matches to preserve data integrity
 */
export function getCompletedMatches(matches: Match[]): Match[] {
    return matches.filter(m => {
        // Check filtering explicitly
        const isFriendly = (m._isFriendly === true) ||
            m.competition.toLowerCase().includes('friendly') ||
            m.competition.toLowerCase().includes('gamper') ||
            m.competition.toLowerCase().includes('club friendlies');

        return m.stats?.available && !isFriendly;
    });
}

/**
 * Get all future matches (for predictions)
 * Strictly matches where we don't have stats yet
 */
export function getFutureMatches(matches: Match[]): Match[] {
    return matches.filter(m => !m.stats?.available);
}

/**
 * Calculate current season points from completed LaLiga matches
 * Used to add to Monte Carlo projections
 */
export function getCurrentSeasonPoints(matches: Match[]): { points: number; played: number; season: string } {
    // Get current season (use most recent match date)
    const completedMatches = getCompletedMatches(matches);
    const laLigaMatches = completedMatches.filter(m => m.competition === 'LaLiga');

    if (laLigaMatches.length === 0) return { points: 0, played: 0, season: '25/26' };

    // Determine current season from most recent match
    const latestMatch = laLigaMatches.reduce((latest, m) =>
        new Date(m.date) > new Date(latest.date) ? m : latest, laLigaMatches[0]);
    const currentSeason = latestMatch.season;

    // Calculate points for current season only
    const currentSeasonMatches = laLigaMatches.filter(m => m.season === currentSeason);

    let points = 0;
    currentSeasonMatches.forEach(match => {
        const result = getMatchResult(match);
        if (result === 'W') points += 3;
        else if (result === 'D') points += 1;
    });

    return {
        points,
        played: currentSeasonMatches.length,
        season: currentSeason
    };
}

/**
 * Calculate comprehensive team statistics
 */
export function calculateTeamStatistics(matches: Match[]): TeamStatistics {
    const goalsFor = matches.map(extractGoalsScored);
    const goalsAgainst = matches.map(extractGoalsConceded);
    const xGValues = matches
        .filter(m => m.stats?.xG)
        .map(m => parseFloat(m.stats?.xG || '0'));

    const homeMatches = matches.filter(m => m.isHome);
    const awayMatches = matches.filter(m => !m.isHome);

    const possessionValues = matches
        .filter(m => m.stats?.possession)
        .map(m => m.stats?.possession || 50);

    const passAccuracyValues = matches
        .filter(m => m.stats?.accuratePasses?.percentage)
        .map(m => {
            const p = m.stats?.accuratePasses?.percentage;
            return typeof p === 'number' ? p : parseInt(p?.replace('%', '') || '0');
        });

    // Group by competition
    const byCompetition: Record<string, SplitStats> = {};
    const competitions = [...new Set(matches.map(m => m.competition))];

    competitions.forEach(comp => {
        const compMatches = matches.filter(m => m.competition === comp);
        byCompetition[comp] = calculateSplitStats(compMatches);
        byCompetition[comp] = calculateSplitStats(compMatches);
    });

    // Group by opponent tier
    const byTier: Record<string, SplitStats> = {};
    const tiers = Object.keys(OPPONENT_TIERS) as Array<keyof typeof OPPONENT_TIERS>;

    tiers.forEach(tier => {
        const tierOpponents = OPPONENT_TIERS[tier];
        const tierMatches = matches.filter(m => tierOpponents.includes(m.opponent));
        byTier[tier] = calculateSplitStats(tierMatches);
    });

    return {
        avgGoalsFor: mean(goalsFor),
        stdDevGoalsFor: stdDev(goalsFor),
        avgXG: mean(xGValues),
        xGOverperformance: mean(goalsFor) - mean(xGValues),

        avgGoalsAgainst: mean(goalsAgainst),
        stdDevGoalsAgainst: stdDev(goalsAgainst),

        avgPossession: mean(possessionValues),
        avgPassAccuracy: mean(passAccuracyValues),

        home: calculateSplitStats(homeMatches),
        away: calculateSplitStats(awayMatches),

        byCompetition,
        byTier
    };
}

/**
 * Calculate statistics for a subset of matches
 */
function calculateSplitStats(matches: Match[]): SplitStats {
    if (matches.length === 0) {
        return {
            matches: 0,
            avgGoalsFor: 0,
            stdDevGoalsFor: 0,
            avgGoalsAgainst: 0,
            stdDevGoalsAgainst: 0,
            winRate: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            history: []
        };
    }

    // Sort matches chronologically for history sequence
    const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const history = sortedMatches.map(m => getMatchResult(m));

    const goalsFor = matches.map(extractGoalsScored);
    const goalsAgainst = matches.map(extractGoalsConceded);
    const wins = matches.filter(m => getMatchResult(m) === 'W').length;
    const draws = matches.filter(m => getMatchResult(m) === 'D').length;
    const losses = matches.filter(m => getMatchResult(m) === 'L').length;

    return {
        matches: matches.length,
        avgGoalsFor: mean(goalsFor),
        stdDevGoalsFor: stdDev(goalsFor),
        avgGoalsAgainst: mean(goalsAgainst),
        stdDevGoalsAgainst: stdDev(goalsAgainst),
        winRate: wins / matches.length,
        wins,
        draws,
        losses,
        history
    };
}

/**
 * Test for overdispersion (Variance vs Mean)
 * If index ≈ 1.0, Poisson is appropriate
 * If index >> 1.0, consider Negative Binomial
 */
export function calculateDispersionIndex(matches: Match[]): {
    goalsFor: number;
    goalsAgainst: number;
} {
    const goalsFor = matches.map(extractGoalsScored);
    const goalsAgainst = matches.map(extractGoalsConceded);

    return {
        goalsFor: stdDev(goalsFor) ** 2 / mean(goalsFor),
        goalsAgainst: stdDev(goalsAgainst) ** 2 / mean(goalsAgainst)
    };
}

/**
 * Opponent strength classification
 */
export const OPPONENT_TIERS = {
    elite: ['Real Madrid', 'Atletico Madrid', 'Athletic Club', 'Girona'],
    strong: ['Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla'],
    mid: ['Valencia', 'Celta Vigo', 'Osasuna', 'Mallorca', 'Rayo Vallecano'],
    weak: ['Espanyol', 'Getafe', 'Levante', 'Deportivo Alaves', 'Elche', 'Real Oviedo']
};

export function getOpponentStrengthAdjustment(opponent: string): number {
    if (OPPONENT_TIERS.elite.includes(opponent)) return -0.5;
    if (OPPONENT_TIERS.strong.includes(opponent)) return -0.3;
    if (OPPONENT_TIERS.weak.includes(opponent)) return 0.4;
    return 0; // Mid-tier
}

/**
 * Tactical insights from the data
 */
export function analyzeTacticalTrends(matches: Match[]): {
    avgInterceptions: number;
    avgRecoveries: number;
    avgTouchesInBox: number;
    avgSuccessfulDribbles: number;
    highPressingIndex: number; // (interceptions + recoveries) / match
} {
    const withStats = matches.filter(m => m.stats?.available);

    const interceptions = withStats.map(m => m.stats?.interceptions || 0);
    const recoveries = withStats.map(m => m.stats?.tackles || 0); // Using tackles as proxy
    const touchesInBox = withStats.map(m => m.stats?.touchesInOppBox || 0);
    const dribbles = withStats.map(m => m.stats?.successfulDribbles?.value || 0);

    const avgInt = mean(interceptions);
    const avgRec = mean(recoveries);

    return {
        avgInterceptions: avgInt,
        avgRecoveries: avgRec,
        avgTouchesInBox: mean(touchesInBox),
        avgSuccessfulDribbles: mean(dribbles),
        highPressingIndex: avgInt + avgRec
    };
}

// ============================================================================
// COMPETITION-SPECIFIC FUNCTIONS
// ============================================================================

type CompetitionType = 'LaLiga' | 'UCL' | 'Copa' | 'Supercopa';

/**
 * Get matches separated by competition type
 */
export function getMatchesByCompetition(matches: Match[], competition: CompetitionType): {
    completed: Match[];
    future: Match[];
} {
    const competitionMap: Record<CompetitionType, string[]> = {
        'LaLiga': ['LaLiga'],
        'UCL': ['Champions League', 'Champions League Final Stage'],
        'Copa': ['Copa del Rey'],
        'Supercopa': ['Super Cup', 'Supercopa de España']
    };

    const validNames = competitionMap[competition] || [];
    const allMatches = matches.filter(m => validNames.includes(m.competition));

    return {
        completed: allMatches.filter(m => m.stats?.available),
        future: allMatches.filter(m => !m.stats?.available)
    };
}

/**
 * Get Copa del Rey progress and remaining rounds
 */
export function getCopaProgress(matches: Match[]): {
    currentRound: string;
    roundsRemaining: number;
    matchesPlayed: number;
    isEliminated: boolean;
} {
    const { completed, future } = getMatchesByCompetition(matches, 'Copa');

    // Check if eliminated (lost a Copa match)
    const lostMatch = completed.find(m => {
        const result = getMatchResult(m);
        return result === 'L';
    });

    if (lostMatch) {
        return {
            currentRound: 'Eliminated',
            roundsRemaining: 0,
            matchesPlayed: completed.length,
            isEliminated: true
        };
    }

    // Copa rounds mapping (7 rounds total from R128 to Final)
    const roundNames = ['R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'Final'];
    const roundsPlayed = completed.length;
    const currentRoundIndex = Math.min(roundsPlayed, roundNames.length - 1);
    const roundsRemaining = future.length;

    return {
        currentRound: roundsRemaining > 0 ? roundNames[currentRoundIndex] : 'Champion',
        roundsRemaining,
        matchesPlayed: roundsPlayed,
        isEliminated: false
    };
}

/**
 * Get UCL progress - league phase and knockout status
 */
export function getUCLProgress(matches: Match[]): {
    phase: 'league' | 'knockout' | 'eliminated';
    leaguePoints: number;
    leagueGamesPlayed: number;
    leagueGamesRemaining: number;
    knockoutRoundsRemaining: number;
    estimatedPosition: number;
} {
    const { completed, future } = getMatchesByCompetition(matches, 'UCL');

    // UCL 2024-25 format: 8 league phase games, then knockouts
    const LEAGUE_PHASE_GAMES = 8;

    // Calculate league phase points
    let leaguePoints = 0;
    let leagueGamesPlayed = 0;

    // Sort completed by date
    const sortedCompleted = [...completed].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Count league phase games (first 8)
    sortedCompleted.forEach((match, idx) => {
        if (idx < LEAGUE_PHASE_GAMES) {
            const result = getMatchResult(match);
            if (result === 'W') leaguePoints += 3;
            else if (result === 'D') leaguePoints += 1;
            leagueGamesPlayed++;
        }
    });

    // Estimate remaining league games
    const leagueGamesRemaining = Math.max(0, LEAGUE_PHASE_GAMES - leagueGamesPlayed);

    // Check if in knockout phase
    const inKnockouts = leagueGamesPlayed >= LEAGUE_PHASE_GAMES;
    const knockoutGamesPlayed = Math.max(0, sortedCompleted.length - LEAGUE_PHASE_GAMES);

    // Estimate position based on points (rough approximation)
    // ~18 pts usually top 8, ~12 pts usually 9-16
    const estimatedPosition = leaguePoints >= 18 ? 4 :
        leaguePoints >= 15 ? 8 :
            leaguePoints >= 12 ? 12 :
                leaguePoints >= 9 ? 16 : 20;

    // Knockout rounds: R16, QF, SF, Final = 4 rounds max
    // If eliminated in knockouts, we'd know from losses
    const knockoutLosses = sortedCompleted.slice(LEAGUE_PHASE_GAMES)
        .filter(m => getMatchResult(m) === 'L').length;

    if (knockoutLosses >= 2) { // Two-leg elimination
        return {
            phase: 'eliminated',
            leaguePoints,
            leagueGamesPlayed,
            leagueGamesRemaining,
            knockoutRoundsRemaining: 0,
            estimatedPosition
        };
    }

    const knockoutRoundsRemaining = future.filter(m =>
        m.competition.includes('Champions League')
    ).length;

    return {
        phase: inKnockouts ? 'knockout' : 'league',
        leaguePoints,
        leagueGamesPlayed,
        leagueGamesRemaining,
        knockoutRoundsRemaining,
        estimatedPosition
    };
}

/**
 * Get top 3 biggest wins for the highlight reel
 */
export function getTopStatementWins(matches: Match[]): Match[] {
    const wins = matches.filter(m => getMatchResult(m) === 'W');
    if (wins.length === 0) return [];

    // Sort by Goal Difference (descending), then Goals Scored (descending)
    return wins.sort((a, b) => {
        const diffA = extractGoalsScored(a) - extractGoalsConceded(a);
        const diffB = extractGoalsScored(b) - extractGoalsConceded(b);
        if (diffA !== diffB) return diffB - diffA;
        return extractGoalsScored(b) - extractGoalsScored(a);
    }).slice(0, 3);
}

export interface BigGameStats {
    matches: Match[];
    record: { wins: number; draws: number; losses: number };
    winRate: number;
    goalsFor: number;
    goalsAgainst: number;
}

const BIG_GAME_OPPONENTS = [
    'Real Madrid',
    'Atletico Madrid',
    'Bayern München',
    'Paris Saint-Germain',
    'Chelsea',
    'Inter',
    'Athletic Club',
    'Borussia Dortmund'
];

/**
 * Get statistics against elite opponents
 */
export function getBigGameStats(matches: Match[]): BigGameStats {
    const bigGames = matches.filter(m => BIG_GAME_OPPONENTS.includes(m.opponent));

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    bigGames.forEach(m => {
        const result = getMatchResult(m);
        if (result === 'W') wins++;
        else if (result === 'D') draws++;
        else losses++;

        goalsFor += extractGoalsScored(m);
        goalsAgainst += extractGoalsConceded(m);
    });

    return {
        matches: bigGames,
        record: { wins, draws, losses },
        winRate: bigGames.length > 0 ? (wins / bigGames.length) * 100 : 0,
        goalsFor,
        goalsAgainst
    };
}

/**
 * Find the biggest win (by goal difference)
 */
export function getBiggestWin(matches: Match[]): Match | null {
    const wins = matches.filter(m => getMatchResult(m) === 'W');
    if (wins.length === 0) return null;

    return wins.reduce((best, current) => {
        const bestDiff = extractGoalsScored(best) - extractGoalsConceded(best);
        const currentDiff = extractGoalsScored(current) - extractGoalsConceded(current);

        if (currentDiff > bestDiff) return current;
        if (currentDiff === bestDiff && extractGoalsScored(current) > extractGoalsScored(best)) return current;
        return best;
    }, wins[0]);
}


// ============================================================================
// FLICK ERA ADVANCED STATS (COMIC VIZ SUPPORT)
// ============================================================================

export interface PossessionStats {
    avgPossession: number;
    highestPossession: { value: number; match: Match };
    lowestPossession: { value: number; match: Match };
    controlMatches: number; // Matches with > 60% possession
}

export function getPossessionStats(matches: Match[]): PossessionStats {
    const withStats = matches.filter(m => m.stats?.possession);
    if (withStats.length === 0) {
        // Return mostly empty if no stats, but safe defaults
        return {
            avgPossession: 0,
            highestPossession: { value: 0, match: matches[0] || ({} as Match) },
            lowestPossession: { value: 0, match: matches[0] || ({} as Match) },
            controlMatches: 0
        };
    }

    const values = withStats.map(m => ({ value: m.stats!.possession!, match: m }));
    const sum = values.reduce((acc, curr) => acc + curr.value, 0);
    const sorted = [...values].sort((a, b) => b.value - a.value);

    return {
        avgPossession: sum / values.length,
        highestPossession: sorted[0],
        lowestPossession: sorted[sorted.length - 1],
        controlMatches: values.filter(v => v.value >= 60).length
    };
}

export interface XGStats {
    avgXG: number;
    avgGoals: number;
    overperformance: number; // Goals - xG
    highestXG: { value: number; match: Match };
    bestFinishingGame: { diff: number; match: Match }; // Max (Goals - xG)
}

export function getXGStats(matches: Match[]): XGStats {
    const withStats = matches.filter(m => m.stats?.xG && m.stats?.available);
    if (withStats.length === 0) return { avgXG: 0, avgGoals: 0, overperformance: 0, highestXG: { value: 0, match: {} as Match }, bestFinishingGame: { diff: 0, match: {} as Match } };

    const xGValues = withStats.map(m => {
        const xG = parseFloat(m.stats!.xG!);
        const goals = extractGoalsScored(m);
        return { xG, goals, match: m };
    });

    const totalXG = xGValues.reduce((acc, curr) => acc + curr.xG, 0);
    const totalGoals = xGValues.reduce((acc, curr) => acc + curr.goals, 0);

    // Find match with highest xG
    const sortedByXG = [...xGValues].sort((a, b) => b.xG - a.xG);

    // Find match with biggest overperformance
    const sortedByDiff = [...xGValues].sort((a, b) => (b.goals - b.xG) - (a.goals - a.xG));

    return {
        avgXG: totalXG / xGValues.length,
        avgGoals: totalGoals / xGValues.length,
        overperformance: (totalGoals - totalXG) / xGValues.length, // Avg overperformance per game
        highestXG: { value: sortedByXG[0].xG, match: sortedByXG[0].match },
        bestFinishingGame: { diff: sortedByDiff[0].goals - sortedByDiff[0].xG, match: sortedByDiff[0].match }
    };
}

export interface FlickPressStats {
    avgTouchesInOppBox: number;
    avgDefensiveActions: number; // Tackles + Interceptions + Blocks
    avgHighTurnovers: number; // Interceptions (rough proxy for high turnovers if not explicit)
    intensityScore: number; // Computed metric 0-100
}

export function getFlickPressStats(matches: Match[]): FlickPressStats {
    const withStats = matches.filter(m => m.stats?.available);
    if (withStats.length === 0) return { avgTouchesInOppBox: 0, avgDefensiveActions: 0, avgHighTurnovers: 0, intensityScore: 0 };

    const stats = withStats.map(m => ({
        touches: m.stats!.touchesInOppBox || 0,
        actions: (m.stats!.tackles || 0) + (m.stats!.interceptions || 0) + (m.stats!.blocks || 0),
        turnovers: m.stats!.interceptions || 0
    }));

    const avgTouches = mean(stats.map(s => s.touches));
    const avgActions = mean(stats.map(s => s.actions));
    const avgTurnovers = mean(stats.map(s => s.turnovers));

    // Arbitrary intensity score calculation for the gauge
    // Baseline: 30 touches, 20 actions = 50. Max realistic ~ 100.
    const intensityScore = Math.min(100, (avgTouches * 1.2) + (avgActions * 1.5));

    return {
        avgTouchesInOppBox: avgTouches,
        avgDefensiveActions: avgActions,
        avgHighTurnovers: avgTurnovers,
        intensityScore
    };
}

export interface DuelsStats {
    groundDuelsWonPct: number;
    aerialDuelsWonPct: number;
    totalDuelsWonPct: number;
}

export function getDuelsStats(matches: Match[]): DuelsStats {
    const withStats = matches.filter(m => m.stats?.available);
    if (withStats.length === 0) return { groundDuelsWonPct: 0, aerialDuelsWonPct: 0, totalDuelsWonPct: 0 };

    // We must parse the strings like "53%" to numbers, or use value/total if available.
    // The ingested data structure shows percentage as string "53%" inside an object.

    // Helper to parse % string to number
    const parsePct = (s?: string | number) => {
        if (typeof s === 'number') return s;
        return s ? parseInt(s.replace('%', '')) : 50;
    };

    const groundPcts = withStats.map(m => parsePct(m.stats?.groundDuelsWon?.percentage));
    const aerialPcts = withStats.map(m => parsePct(m.stats?.aerialDuelsWon?.percentage));

    // Total duels is just "duelsWon", but we don't have total percentage usually, just count.
    // However, ground + aerial usually make up total. Let's average the percentages for now or check if we have total.
    // We'll use the average of the two percentages as a proxy for "Physical Domination"

    return {
        groundDuelsWonPct: mean(groundPcts),
        aerialDuelsWonPct: mean(aerialPcts),
        totalDuelsWonPct: mean([...groundPcts, ...aerialPcts])
    };
}

export interface SetPieceStats {
    goalsFromSetPieces: number; // We'd need to parse this or trust xGSetPlay
    xGSetPlayPerGame: number;
    cornersPerGame: number;
    threatLevel: number; // 0-10
}

export function getSetPieceStats(matches: Match[]): SetPieceStats {
    const withStats = matches.filter(m => m.stats?.available);
    if (withStats.length === 0) return { goalsFromSetPieces: 0, xGSetPlayPerGame: 0, cornersPerGame: 0, threatLevel: 0 };

    const xGSetPlays = withStats.map(m => parseFloat(m.stats?.xGSetPlay || '0'));
    const corners = withStats.map(m => m.stats?.corners || 0);

    const avgXG = mean(xGSetPlays);
    const avgCorners = mean(corners);

    return {
        goalsFromSetPieces: 0, // Not explicitly tracked in simple stats, use xG proxy
        xGSetPlayPerGame: avgXG,
        cornersPerGame: avgCorners,
        threatLevel: Math.min(10, (avgXG * 10) + (avgCorners / 2))
    };
}

export interface HomeAwayStats {
    home: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; matches: number };
    away: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; matches: number };
}

export function getHomeAwayStats(matches: Match[]): HomeAwayStats {
    const homeMatches = matches.filter(m => m.isHome);
    const awayMatches = matches.filter(m => !m.isHome && m.stats?.available); // Only completed

    const calc = (ms: Match[]) => {
        let w = 0, d = 0, l = 0, gf = 0, ga = 0;
        ms.forEach(m => {
            const res = getMatchResult(m);
            if (res === 'W') w++;
            else if (res === 'D') d++;
            else l++;
            gf += extractGoalsScored(m);
            ga += extractGoalsConceded(m);
        });
        return { wins: w, draws: d, losses: l, goalsFor: gf, goalsAgainst: ga, matches: ms.length };
    };

    return {
        home: calc(homeMatches),
        away: calc(awayMatches)
    };
}

export interface FormationStats {
    formation: string;
    played: number;
    won: number;
    winRate: number;
    avgGoals: number;
}

export function getFormationStats(matches: Match[]): FormationStats[] {
    const formationMap: Record<string, { played: number; won: number; goals: number }> = {};

    matches.filter(m => m.stats?.available).forEach(m => {
        const form = (m as any).formation || '4-3-3'; // Default to 4-3-3 if missing (common Flick)
        if (!formationMap[form]) formationMap[form] = { played: 0, won: 0, goals: 0 };

        formationMap[form].played++;
        if (getMatchResult(m) === 'W') formationMap[form].won++;
        formationMap[form].goals += extractGoalsScored(m);
    });

    return Object.entries(formationMap).map(([fmt, stats]) => ({
        formation: fmt,
        played: stats.played,
        won: stats.won,
        winRate: (stats.won / stats.played) * 100,
        avgGoals: stats.goals / stats.played
    })).sort((a, b) => b.played - a.played);
}

export interface PlayerStats {
    name: string;
    goals: number;
    assists: number;
    minutes: number;
    appearances: number;
}

export function getTopScorersAndAssisters(matches: Match[]): { scorers: PlayerStats[], assisters: PlayerStats[] } {
    const playerMap: Record<string, PlayerStats> = {};

    const ensurePlayer = (name: string) => {
        if (!playerMap[name]) playerMap[name] = { name, goals: 0, assists: 0, minutes: 0, appearances: 0 };
    };

    matches.forEach(m => {
        if (m.scorers) {
            m.scorers.forEach(scorer => {
                if (scorer.team === 'barca') { // Only count our players
                    ensurePlayer(scorer.player);
                    playerMap[scorer.player].goals++;

                    if (scorer.assist) {
                        ensurePlayer(scorer.assist);
                        playerMap[scorer.assist].assists++;
                    }
                }
            });
        }
    });

    const players = Object.values(playerMap);

    return {
        scorers: [...players].sort((a, b) => b.goals - a.goals).slice(0, 5),
        assisters: [...players].sort((a, b) => b.assists - a.assists).slice(0, 5)
    };
}
