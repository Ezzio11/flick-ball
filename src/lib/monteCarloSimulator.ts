/**
 * Monte Carlo Simulation Engine for Season Predictions
 * 
 * Uses Poisson distribution to simulate match outcomes and aggregate
 * season-level predictions (points, league position, trophy odds).
 * 
 * Theoretical basis: Soccer goals follow Poisson distribution
 * (see Maher 1982, Dixon & Coles 1997)
 */

import { Match, TeamStatistics, OPPONENT_TIERS } from './teamStatistics';

export interface SimulationParameters {
    // Attack strength (Using xG for better prediction)
    goalsForMean: number;
    goalsForStdDev: number;

    // Base defensive fragility
    goalsAgainstMean: number;
    goalsAgainstStdDev: number;

    // Home advantage boost
    homeAdvantage: number;

    // Data-driven tier adjustments (Goals Conceded vs Tier - Avg Conceded)
    tierAdjustments: {
        elite: number;
        strong: number;
        mid: number;
        weak: number;
    };

    // Phase 8: Chaos Variables
    useChaos: boolean; // Toggle for volatility
    volatility: number; // StdDev for form (e.g., 0.15)
}

export interface MatchPrediction {
    matchId: string;
    opponent: string;
    date: string;
    isHome: boolean;
    competition: string;

    // Probabilities
    probWin: number;
    probDraw: number;
    probLoss: number;

    // Expected score
    expectedGoalsFor: number;
    expectedGoalsAgainst: number;

    // Lambda parameters (for transparency/debugging)
    lambdaFor?: number;
    lambdaAgainst?: number;

    // Most likely scorelines (top 5)
    topScorelines: Array<{
        score: string;
        probability: number;
    }>;
}

export interface SeasonProjection {
    // Points distribution
    totalPoints: {
        mean: number;
        median: number;
        stdDev: number;
        p10: number;  // 10th percentile (pessimistic)
        p90: number;  // 90th percentile (optimistic)
        min: number;
        max: number;
        distribution: number[]; // Full array of simulated points
    };

    // League position odds
    positionOdds: {
        first: number;   // % chance of 1st  
        top3: number;    // % chance of top 3 (CL spots)
        top4: number;    // % chance of top 4
    };

    // Trophy probabilities (simplified heuristics)
    trophyOdds: {
        laLiga: number;
        copa: number;
        championsLeague: number;
    };

    // Records
    probabilities: {
        undefeated: number;
        lessThan3Losses: number;
        moreThan90Points: number;
    };

    // Individual match predictions
    matchPredictions: MatchPrediction[];
}

// ============================================================================
// POISSON SAMPLING
// ============================================================================

/**
 * Sample from Poisson distribution using inverse transform method
 * Fast implementation for Monte Carlo (no external dependencies)
 * 
 * @param lambda - Mean of the Poisson distribution (λ)
 * @returns Random integer from Poisson(λ)
 */
function poissonSample(lambda: number): number {
    // Handle edge case
    if (lambda <= 0) return 0;

    // For large λ, use normal approximation to avoid exp(-λ) → 0
    if (lambda > 30) {
        // Normal approximation: N(λ, λ)
        const z = randomNormal();
        return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * z));
    }

    // Standard algorithm: Knuth's method
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
        k++;
        p *= Math.random();
    } while (p > L);

    return k - 1;
}

/**
 * Sample from standard normal distribution (Box-Muller transform)
 */
function randomNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ============================================================================
// MATCH SIMULATION
// ============================================================================

/**
 * Get the tier of an opponent
 */
function getOpponentTier(opponent: string): keyof typeof OPPONENT_TIERS | 'mid' {
    if (OPPONENT_TIERS.elite.includes(opponent)) return 'elite';
    if (OPPONENT_TIERS.strong.includes(opponent)) return 'strong';
    if (OPPONENT_TIERS.weak.includes(opponent)) return 'weak';
    return 'mid';
}

/**
 * Simulate a single match outcome with Chaos Variables
 */
function simulateMatch(
    match: Match,
    params: SimulationParameters
): { goalsFor: number; goalsAgainst: number } {
    // 1. Calculate Base lambda (Attack)
    let lambdaFor = params.goalsForMean;

    // 2. Base lambda (Defense)
    let lambdaAgainst = params.goalsAgainstMean;

    // 3. Apply CHAOS (Daily Form)
    if (params.useChaos) {
        // Sample Form Factor: N(1.0, volatility)
        // Clamp to avoid extreme outliers (0.6x to 1.4x)
        const formFactor = Math.max(0.6, Math.min(1.4, 1.0 + randomNormal() * params.volatility));

        lambdaFor *= formFactor;

        // Defensive form is inverse (Good form = low lambdaAgainst)
        lambdaAgainst /= formFactor;
    }

    // 4. Apply RED CARD Event (~1.5% chance)
    if (params.useChaos && Math.random() < 0.015) {
        lambdaFor *= 0.6; // Attack penalty
        lambdaAgainst *= 1.5; // Defense penalty
    }

    // 5. Home advantage
    if (match.isHome) {
        lambdaFor += params.homeAdvantage;
        lambdaAgainst -= 0.2;
    } else {
        lambdaFor -= 0.2; // Slight away penalty
        lambdaAgainst += 0.3;
    }

    // 6. Opponent strength adjustment (Affects our scoring)
    const tier = getOpponentTier(match.opponent);

    // Heuristic Adjustments based on Opponent Tier
    if (tier === 'elite') lambdaFor -= 0.6;
    else if (tier === 'strong') lambdaFor -= 0.3;
    else if (tier === 'weak') lambdaFor += 0.4;

    // 7. Apply DATA-DRIVEN Tier Adjustments for Defense
    if (params.tierAdjustments[tier] !== undefined) {
        lambdaAgainst += params.tierAdjustments[tier];
    }

    // Sample from Poisson
    const goalsFor = poissonSample(lambdaFor);
    const goalsAgainst = poissonSample(lambdaAgainst);

    return { goalsFor, goalsAgainst };
}

// ============================================================================
// SEASON SIMULATION
// ============================================================================

/**
 * Run Monte Carlo simulation for remaining season
 * 
 * @param futureMatches - Matches to simulate
 * @param params - Simulation parameters
 * @param numSimulations - Number of Monte Carlo iterations (default 50000)
 * @param existingPoints - Points already earned this season (default 0)
 */
export function simulateSeason(
    futureMatches: Match[],
    params: SimulationParameters,
    numSimulations: number = 50000,
    existingPoints: number = 0
): SeasonProjection {
    // Store results
    const allPoints: number[] = [];
    const matchOutcomes: Map<string, { W: number; D: number; L: number }> = new Map();
    const scorelineFrequency: Map<string, Map<string, number>> = new Map();

    // Initialize trackers
    futureMatches.forEach(m => {
        matchOutcomes.set(String(m.id), { W: 0, D: 0, L: 0 });
        scorelineFrequency.set(String(m.id), new Map());
    });

    // Run simulations
    for (let sim = 0; sim < numSimulations; sim++) {
        let points = 0;

        futureMatches.forEach(match => {
            const { goalsFor, goalsAgainst } = simulateMatch(match, params);

            if (goalsFor > goalsAgainst) {
                points += 3;
                matchOutcomes.get(String(match.id))!.W++;
            } else if (goalsFor === goalsAgainst) {
                points += 1;
                matchOutcomes.get(String(match.id))!.D++;
            } else {
                matchOutcomes.get(String(match.id))!.L++;
            }

            const scoreline = `${goalsFor}-${goalsAgainst}`;
            const freqMap = scorelineFrequency.get(String(match.id))!;
            freqMap.set(scoreline, (freqMap.get(scoreline) || 0) + 1);
        });

        allPoints.push(points + existingPoints); // Add existing points to each simulation
    }

    // Calculate match predictions
    const matchPredictions: MatchPrediction[] = futureMatches.map(match => {
        const outcomes = matchOutcomes.get(String(match.id))!;
        const freqMap = scorelineFrequency.get(String(match.id))!;

        // Top scorelines
        const topScorelines = Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([score, count]) => ({
                score,
                probability: count / numSimulations
            }));

        // Expected goals (weighted average)
        let expectedGF = 0;
        let expectedGA = 0;
        freqMap.forEach((count, scoreline) => {
            const [gf, ga] = scoreline.split('-').map(Number);
            expectedGF += gf * count;
            expectedGA += ga * count;
        });
        expectedGF /= numSimulations;
        expectedGA /= numSimulations;

        // Base Lambda Display (Pre-Chaos, for transparency)
        // We show the "Average Operating Lambda" (Avg Form = 1.0)
        let lambdaFor = params.goalsForMean;
        if (match.isHome) lambdaFor += params.homeAdvantage;
        else lambdaFor -= 0.2;

        const tier = getOpponentTier(match.opponent);
        if (tier === 'elite') lambdaFor -= 0.6;
        else if (tier === 'strong') lambdaFor -= 0.3;
        else if (tier === 'weak') lambdaFor += 0.4;

        let lambdaAgainst = params.goalsAgainstMean;
        if (params.tierAdjustments[tier] !== undefined) {
            lambdaAgainst += params.tierAdjustments[tier];
        }
        if (match.isHome) lambdaAgainst -= 0.2;
        else lambdaAgainst += 0.3;

        return {
            matchId: String(match.id),
            opponent: match.opponent,
            date: match.date,
            isHome: match.isHome,
            competition: match.competition,
            probWin: outcomes.W / numSimulations,
            probDraw: outcomes.D / numSimulations,
            probLoss: outcomes.L / numSimulations,
            expectedGoalsFor: expectedGF,
            expectedGoalsAgainst: expectedGA,
            lambdaFor,
            lambdaAgainst,
            topScorelines
        };
    });

    // Percentiles
    allPoints.sort((a, b) => a - b);
    const p10 = allPoints[Math.floor(numSimulations * 0.10)];
    const p50 = allPoints[Math.floor(numSimulations * 0.50)];
    const p90 = allPoints[Math.floor(numSimulations * 0.90)];

    const meanPoints = allPoints.reduce((a, b) => a + b, 0) / numSimulations;
    const variance = allPoints.reduce((sum, p) => sum + Math.pow(p - meanPoints, 2), 0) / numSimulations;
    const stdDevPoints = Math.sqrt(variance);

    // Calculate trophy odds based on TOTAL season points (existing + simulated)
    // More realistic thresholds based on historical LaLiga data
    const probFirst = allPoints.filter(p => p >= 85).length / numSimulations;  // ~85 pts for title
    const probTop3 = allPoints.filter(p => p >= 70).length / numSimulations;   // ~70 pts for top 3
    const probTop4 = allPoints.filter(p => p >= 65).length / numSimulations;   // ~65 pts for UCL spots

    // Calculate dynamic Copa odds based on simulated performance
    // Use win rate from future matches as proxy for knockout success
    const futureLaLigaWinRate = matchPredictions
        .filter(m => m.competition === 'LaLiga')
        .reduce((sum, m) => sum + m.probWin, 0) /
        Math.max(1, matchPredictions.filter(m => m.competition === 'LaLiga').length);

    const copaOdds = Math.min(0.90, Math.max(0.10, futureLaLigaWinRate * 0.8)); // Scale win rate for Copa

    const trophyOdds = {
        laLiga: probFirst * 0.95 + probTop3 * 0.05,  // High chance if first, small chance if top 3
        copa: copaOdds,  // Now dynamically calculated!
        championsLeague: probTop4 * 0.12  // Top 4 gives UCL spot, ~12% to win from there
    };

    const probUndefeated = matchPredictions.every(m => m.probLoss < 0.05) ?
        matchPredictions.reduce((acc, m) => acc * (1 - m.probLoss), 1) : 0;

    // Simple loss simulation for aggregation
    let simsWithLessThan3Losses = 0;
    for (let sim = 0; sim < 1000; sim++) {
        let losses = 0;
        futureMatches.forEach(match => {
            const { goalsFor, goalsAgainst } = simulateMatch(match, params);
            if (goalsFor < goalsAgainst) losses++;
        });
        if (losses < 3) simsWithLessThan3Losses++;
    }
    const lessThan3LossesProb = simsWithLessThan3Losses / 1000;

    return {
        totalPoints: {
            mean: meanPoints,
            median: p50,
            stdDev: stdDevPoints,
            p10,
            p90,
            min: allPoints[0],
            max: allPoints[numSimulations - 1],
            distribution: allPoints
        },
        positionOdds: {
            first: probFirst,
            top3: probTop3,
            top4: probTop4
        },
        trophyOdds,
        probabilities: {
            undefeated: probUndefeated,
            lessThan3Losses: lessThan3LossesProb,
            moreThan90Points: allPoints.filter(p => p > 90).length / numSimulations
        },
        matchPredictions
    };
}

/**
 * Estimate simulation parameters from historical team statistics
 */
export function estimateSimulationParameters(stats: TeamStatistics): SimulationParameters {
    const attackMean = stats.avgXG > 0 ? stats.avgXG : stats.avgGoalsFor;
    const avgConceded = stats.avgGoalsAgainst;

    const calculateTierAdj = (tier: string) => {
        const tierStats = stats.byTier?.[tier];
        if (!tierStats || tierStats.matches < 1) return 0;
        return tierStats.avgGoalsAgainst - avgConceded;
    };

    return {
        goalsForMean: attackMean,
        goalsForStdDev: stats.stdDevGoalsFor,
        goalsAgainstMean: avgConceded,
        goalsAgainstStdDev: stats.stdDevGoalsAgainst,
        homeAdvantage: 0.3,
        tierAdjustments: {
            elite: calculateTierAdj('elite'),
            strong: calculateTierAdj('strong'),
            mid: calculateTierAdj('mid'),
            weak: calculateTierAdj('weak')
        },
        // Enable Chaos variables by default
        useChaos: true,
        volatility: 0.15 // 15% Daily Form Standard Deviation
    };
}

// ============================================================================
// COMPETITION-SPECIFIC SIMULATIONS
// ============================================================================

export interface CopaProjection {
    probWinTrophy: number;
    roundProbabilities: {
        currentRound: number;
        nextRound: number;
        semifinals: number;
        final: number;
    };
    isEliminated: boolean;
    matchPredictions: MatchPrediction[];
}

/**
 * Simulate Copa del Rey knockout tournament
 * Single-leg format: P(win_copa) = P(win_R1) × P(win_R2) × ... × P(win_final)
 */
export function simulateCopa(
    futureCopaMatches: Match[],
    params: SimulationParameters,
    numSimulations: number = 10000
): CopaProjection {
    if (futureCopaMatches.length === 0) {
        return {
            probWinTrophy: 0,
            roundProbabilities: { currentRound: 0, nextRound: 0, semifinals: 0, final: 0 },
            isEliminated: true,
            matchPredictions: []
        };
    }

    // Track wins through each round across simulations
    const roundWins: number[] = new Array(futureCopaMatches.length).fill(0);
    let trophyWins = 0;

    for (let sim = 0; sim < numSimulations; sim++) {
        let stillAlive = true;

        for (let r = 0; r < futureCopaMatches.length && stillAlive; r++) {
            const match = futureCopaMatches[r];
            const { goalsFor, goalsAgainst } = simulateMatch(match, params);

            // Single-leg: must win (draws go to ET/penalties, slight advantage to higher-seeded)
            const won = goalsFor > goalsAgainst ||
                (goalsFor === goalsAgainst && Math.random() < 0.55); // 55% in draws

            if (won) {
                roundWins[r]++;
            } else {
                stillAlive = false;
            }
        }

        if (stillAlive) trophyWins++;
    }

    // Calculate match predictions
    const matchPredictions: MatchPrediction[] = futureCopaMatches.map((match, idx) => {
        const probAdvance = roundWins[idx] / numSimulations;
        return {
            matchId: String(match.id),
            opponent: match.opponent,
            date: match.date,
            isHome: match.isHome,
            competition: match.competition,
            probWin: probAdvance,
            probDraw: 0.1, // Rough estimate
            probLoss: 1 - probAdvance - 0.1,
            expectedGoalsFor: params.goalsForMean,
            expectedGoalsAgainst: params.goalsAgainstMean,
            topScorelines: [{ score: '2-1', probability: 0.15 }]
        };
    });

    const rounds = futureCopaMatches.length;
    return {
        probWinTrophy: trophyWins / numSimulations,
        roundProbabilities: {
            currentRound: rounds >= 1 ? roundWins[0] / numSimulations : 1,
            nextRound: rounds >= 2 ? roundWins[1] / numSimulations : 0,
            semifinals: rounds >= 3 ? roundWins[rounds - 2] / numSimulations : 0,
            final: rounds >= 1 ? roundWins[rounds - 1] / numSimulations : 0
        },
        isEliminated: false,
        matchPredictions
    };
}

export interface UCLProjection {
    probWinTrophy: number;
    probQualifyKnockouts: number;
    leaguePhase: {
        projectedPoints: number;
        projectedPosition: number;
    };
    knockoutProb: {
        r16: number;
        qf: number;
        sf: number;
        final: number;
    };
    matchPredictions: MatchPrediction[];
}

/**
 * Simulate UCL season: league phase + knockout rounds
 * New format: 8 league games → top 8 auto-qualify, 9-24 playoff, 25+ eliminated
 */
export function simulateUCL(
    futureUCLMatches: Match[],
    params: SimulationParameters,
    numSimulations: number = 10000,
    currentLeaguePoints: number = 0,
    leagueGamesPlayed: number = 0
): UCLProjection {
    const LEAGUE_PHASE_GAMES = 8;
    const leagueGamesRemaining = Math.max(0, LEAGUE_PHASE_GAMES - leagueGamesPlayed);

    // Split matches into league phase and knockouts
    const leagueMatches = futureUCLMatches.slice(0, leagueGamesRemaining);
    const knockoutMatches = futureUCLMatches.slice(leagueGamesRemaining);

    let qualifyCount = 0;
    let trophyWins = 0;
    const knockoutRoundWins = [0, 0, 0, 0]; // R16, QF, SF, Final
    const allLeaguePoints: number[] = [];

    for (let sim = 0; sim < numSimulations; sim++) {
        // Simulate league phase
        let leaguePoints = currentLeaguePoints;

        for (const match of leagueMatches) {
            const { goalsFor, goalsAgainst } = simulateMatch(match, params);
            if (goalsFor > goalsAgainst) leaguePoints += 3;
            else if (goalsFor === goalsAgainst) leaguePoints += 1;
        }

        allLeaguePoints.push(leaguePoints);

        // Qualification logic (simplified)
        // ~18+ pts = top 8, 12-17 pts = playoff (50% advance), <12 = out
        let qualified = false;
        if (leaguePoints >= 18) {
            qualified = true;
        } else if (leaguePoints >= 12) {
            qualified = Math.random() < 0.5; // Playoff
        }

        if (qualified) {
            qualifyCount++;

            // Simulate knockouts (4 rounds: R16, QF, SF, Final)
            let stillAlive = true;
            const knockoutCount = Math.min(knockoutMatches.length, 4);

            for (let r = 0; r < 4 && stillAlive; r++) {
                // Two-leg tie: simulate both legs
                const won = simulateKnockoutRound(params);
                if (won) {
                    knockoutRoundWins[r]++;
                } else {
                    stillAlive = false;
                }
            }

            if (stillAlive) trophyWins++;
        }
    }

    // Calculate projections
    const avgLeaguePoints = allLeaguePoints.reduce((a, b) => a + b, 0) / numSimulations;
    const projectedPosition = avgLeaguePoints >= 18 ? 5 :
        avgLeaguePoints >= 15 ? 10 :
            avgLeaguePoints >= 12 ? 16 : 22;

    // Match predictions for all UCL matches
    const matchPredictions: MatchPrediction[] = futureUCLMatches.map(match => ({
        matchId: String(match.id),
        opponent: match.opponent,
        date: match.date,
        isHome: match.isHome,
        competition: match.competition,
        probWin: 0.5, // Simplified
        probDraw: 0.25,
        probLoss: 0.25,
        expectedGoalsFor: params.goalsForMean,
        expectedGoalsAgainst: params.goalsAgainstMean,
        topScorelines: [{ score: '2-1', probability: 0.15 }]
    }));

    return {
        probWinTrophy: trophyWins / numSimulations,
        probQualifyKnockouts: qualifyCount / numSimulations,
        leaguePhase: {
            projectedPoints: avgLeaguePoints,
            projectedPosition
        },
        knockoutProb: {
            r16: qualifyCount / numSimulations,
            qf: knockoutRoundWins[0] / numSimulations,
            sf: knockoutRoundWins[1] / numSimulations,
            final: knockoutRoundWins[2] / numSimulations
        },
        matchPredictions
    };
}

/**
 * Simulate a single UCL knockout round (two-leg tie)
 */
function simulateKnockoutRound(params: SimulationParameters): boolean {
    // Simplified: ~60% chance for strong team to advance
    const baseWinProb = 0.55 + (params.goalsForMean - params.goalsAgainstMean) * 0.1;
    return Math.random() < Math.min(0.85, Math.max(0.3, baseWinProb));
}

// ============================================================================
// COMBINED TROPHY PROJECTIONS
// ============================================================================

export interface TrophyProjections {
    laLiga: {
        probWin: number;
        projectedPoints: number;
        projectedPosition: number;
        matchesRemaining: number;
    };
    copa: CopaProjection;
    ucl: UCLProjection;
}

