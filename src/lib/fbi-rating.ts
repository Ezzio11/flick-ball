/**
 * FlickBall Index (FBI) - Player Rating System
 * 
 * A transparent, mathematically rigorous rating system for Barcelona players
 * under Hansi Flick's management. Accounts for position-specific contributions,
 * match context, and tactical system requirements.
 * 
 * Scale: 1.0 (catastrophic) to 10.0 (perfect)
 * Average: ~6.5
 * Standard Deviation: ~1.2
 */

// Match data structure (subset of titans_data format)
export interface TitanMatch {
    matchId: number;
    opponent: string;
    date: string;
    competition: string;
    result: string;
    score?: string;
    minutes: number;
    goals?: number;
    assists?: number;
    rating?: string;
    potm?: boolean;
    yellowCard?: boolean;
    redCard?: boolean;
    rating_title?: number;
    minutes_played?: number;
    total_shots?: number;
    accurate_passes?: number;
    chances_created?: number;
    expected_goals?: number;
    expected_assists?: number;
    xg_and_xa?: number;
    defensive_actions?: number;
    shotsontarget?: number;
    big_chance_missed_title?: number; // Big chances missed - penalty
    offsides?: number; // v1.2: Positioning discipline
    penalties_won?: number; // v1.2: High-value chance creation
    was_fouled?: number; // v1.2: Drawing fouls
    touches?: number;
    touches_opp_box?: number;
    passes_into_final_third?: number;
    accurate_crosses?: number; // v1.2: Crossing quality
    corners?: number; // v1.2: Set piece responsibility
    long_balls_accurate?: number;
    dispossessed?: number;
    expected_goals_non_penalty?: number;
    'matchstats.headers.tackles'?: number;
    shot_blocks?: number;
    clearances?: number; // v1.2: Defensive clearances
    interceptions?: number;
    recoveries?: number;
    dribbled_past?: number; // v1.2: Defensive vulnerability
    duel_won?: number;
    duel_lost?: number;
    ground_duels_won?: number;
    aerials_won?: number; // v1.2: Aerial ability
    fouls?: number; // v1.2: Fouls committed
    dribbles_succeeded?: number;
    // GK-specific stats (v1.4)
    saves?: number;
    goals_conceded?: number;
    expected_goals_on_target_faced?: number; // xG on target (for PSxG calculation)
    goals_prevented?: number; // Saves above expected
    keeper_sweeper?: number; // Sweeper actions (rushes out)
    keeper_high_claim?: number; // High catches/claims
    keeper_diving_save?: number; // Diving saves
    saves_inside_box?: number; // High-danger saves
    punches?: number;
    player_throws?: number; // Quick distribution
    conceded_penalties?: number; // Penalties given away by GK
    [key: string]: any; // Allow additional fields
}

// ============================================================================
// POSITION DEFINITIONS
// ============================================================================

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

/**
 * Position weight matrix for different performance components
 * Ensures fair evaluation across different tactical roles
 */
export const POSITION_WEIGHTS: Record<Position, {
    offensive: number;
    passing: number;
    defensive: number;
    retention: number;
}> = {
    GK: { offensive: 0.2, passing: 0.3, defensive: 1.0, retention: 0.2 },
    DEF: { offensive: 0.4, passing: 0.6, defensive: 1.0, retention: 0.5 },
    MID: { offensive: 0.7, passing: 1.0, defensive: 0.6, retention: 0.8 },
    FWD: { offensive: 1.0, passing: 0.6, defensive: 0.5, retention: 1.0 }
};

// ============================================================================
// COMPONENT CALCULATIONS
// ============================================================================

/**
 * Offensive Contribution Score
 * 
 * Measures goal-scoring threat and chance creation
 * 
 * Formula (v1.3 - Role-Adjusted):
 * OC = (G × 1.6) + (A × 1.1) + (xG × 0.8) + (xA × 0.8) + (KC × 0.4) + (SOT × 0.2)
 *      - (BCM × 0.3) - (Offsides × 0.15) + (PenaltiesWon × 0.6) + (WasFouled × 0.1)
 * 
 * Reasoning (v1.3):
 * - Goals are direct outcome, heavily weighted (1.6)
 * - Assists are crucial to Flick system (1.1)
 * - xG/xA show real offensive threat - a 0.8 xG is 80% chance to score! (0.8)
 * - Key chances show creative threat (0.3)
 * - Shots on target indicate attacking intent (0.2)
 * - Big chances missed penalize wastefulness (-0.4)
 * - Offsides show poor positioning discipline (-0.15)
 * - Penalties won are massive contributions (+0.6, nearly = assist)
 * - Drawing fouls shows threat level (+0.1)
 */
function calculateOffensiveScore(match: TitanMatch): number {
    const goals = match.goals || 0;
    const assists = match.assists || 0;
    const xG = match.expected_goals || 0;
    const xA = match.expected_assists || 0;
    const keyChances = match.chances_created || 0;
    const shotsOnTarget = match.shotsontarget || 0;
    const bigChancesMissed = match.big_chance_missed_title || 0;
    const offsides = match.offsides || 0;
    const penaltiesWon = match.penalties_won || 0;
    const wasFouled = match.was_fouled || 0;

    return (
        (goals * 1.6) +          // Increased from 1.0 - Goals are defining
        (assists * 1.1) +        // Increased from 0.7 - Assists are crucial
        (xG * 0.8) +             // Role-adjusted: Chance creation IS valuable contribution
        (xA * 0.8) +             // Role-adjusted: Expected assists show real threat
        (keyChances * 0.5) +     // v1.6: UP from 0.4 - Rewards main creators (Raphinha 26 key passes, league leader!)
        (shotsOnTarget * 0.2) -
        (bigChancesMissed * 0.3) - // Reduced penalty from 0.4 - Strikers will miss
        (offsides * 0.15) +
        (penaltiesWon * 0.6) +
        (wasFouled * 0.1)
    );
}

/**
 * Passing & Build-Up Score
 * ...
 */
function calculatePassingScore(match: TitanMatch, position: Position): number {
    // ... (unchanged)
    const minutes = match.minutes || 90;
    const per90 = 90 / minutes;

    const accuratePasses = (match.accurate_passes || 0) * per90;
    const passesIntoFinalThird = (match.passes_into_final_third || 0) * per90;
    const longBallsAccurate = match.long_balls_accurate || 0;
    const touches = (match.touches || 0) * per90;
    const accurateCrosses = match.accurate_crosses || 0;
    const corners = match.corners || 0;

    // v1.6: Position-specific crossing weights
    const crossingWeight = position === 'FWD' ? 0.3 :  // Wingers cross frequently
        position === 'DEF' ? 0.2 :  // Full-backs overlap and cross
            0.15;                        // Midfielders less so

    return (
        (accuratePasses * 0.01) +
        (passesIntoFinalThird * 0.3) +    // v1.5: UP from 0.15 - Vertical play!
        (longBallsAccurate * 0.1) +
        (touches * 0.005) +
        (accurateCrosses * crossingWeight) +  // v1.6: Position-aware!
        (corners * 0.05)
    );
}

/**
 * Defensive Contribution Score
 * 
 * Measures defensive work rate and effectiveness
 * 
 * Formula (v1.2):
 * DC = (T × 0.3) + (I × 0.3) + (R × 0.15) + (DW/(DW+DL) × 0.5) + (SB × 0.2)
 *      + (Clearances × 0.15) - (DribbledPast × 0.25) + (AerialsWon × 0.15)
 */
function calculateDefensiveScore(match: TitanMatch): number {
    const tackles = match['matchstats.headers.tackles'] || 0;
    const interceptions = match.interceptions || 0;
    const recoveries = match.recoveries || 0;
    const duelsWon = match.duel_won || 0;
    const duelsLost = match.duel_lost || 0;
    const shotBlocks = match.shot_blocks || 0;
    const clearances = match.clearances || 0;
    const dribbledPast = match.dribbled_past || 0;
    const aerialsWon = match.aerials_won || 0;

    const duelWinRate = (duelsWon + duelsLost) > 0
        ? duelsWon / (duelsWon + duelsLost)
        : 0.5;

    return (
        (tackles * 0.3) +
        (interceptions * 0.5) +      // v1.5: UP from 0.3 - High pressing!
        (recoveries * 0.4) +         // v1.5: UP from 0.15 - Gegenpressing!
        (duelWinRate * 0.5) +
        (shotBlocks * 0.2) +
        (clearances * 0.25) -        // v1.7: UP from 0.15 - High-line defenders clear more
        (dribbledPast * 0.25) +
        (aerialsWon * 0.15)
    );
}

/**
 * Ball Retention & Progression Score
 * 
 * Formula (v1.2):
 * BRP = (DS × 0.4) - (Disp × 0.3) + (TOB/90 × 0.1) - (Fouls × 0.1)
 */
function calculateRetentionScore(match: TitanMatch): number {
    const minutes = match.minutes || 90;
    const per90 = 90 / minutes;

    const dribblesSucceeded = match.dribbles_succeeded || 0;
    const dispossessed = match.dispossessed || 0;
    const touchesInBox = (match.touches_opp_box || 0) * per90;
    const fouls = match.fouls || 0;

    return (
        (dribblesSucceeded * 0.4) -
        (dispossessed * 0.3) +
        (touchesInBox * 0.15) -          // v1.5: UP from 0.1 - Fast transitions!
        (fouls * 0.1)
    );
}

/**
 * Discipline Score
 * Formula (v1.2): Discipline = -(YellowCard × 0.3) - (RedCard × 2.0)
 */
function calculateDisciplineScore(match: TitanMatch): number {
    const yellowCard = match.yellowCard ? 1 : 0;
    const redCard = match.redCard ? 1 : 0;

    return -(yellowCard * 0.3) - (redCard * 2.0);
}

// ============================================================================
// CONTEXT ADJUSTMENTS
// ============================================================================

function getOpponentDifficulty(match: TitanMatch): number {
    const competition = match.competition || '';
    const opponent = match.opponent;

    if (competition.includes('Champions League')) return 1.1;

    const topOpponents = ['Real Madrid', 'Atletico Madrid', 'Athletic Club', 'Girona'];
    const midTableOpponents = ['Real Sociedad', 'Villarreal', 'Betis', 'Sevilla', 'Valencia', 'Celta Vigo', 'Osasuna'];

    if (topOpponents.includes(opponent)) return 1.1;
    if (midTableOpponents.includes(opponent)) return 1.0;
    return 0.9;
}

function getResultModifier(match: TitanMatch): number {
    const score = match.result || match.score || '0 - 0';
    const parts = score.split('-').map(s => parseInt(s.trim()));
    if (parts.length !== 2) return 0;

    if (parts[0] > parts[1]) return 0.3;  // Win
    if (parts[0] < parts[1]) return -0.2; // Loss
    return 0;
}

function getMinutesFactor(minutes: number): number {
    return Math.min(1.0, minutes / 60);
}

/**
 * Normalization
 */
function normalizeToScale(rawScore: number, mean: number = 3.2, stdDev: number = 1.5): number {
    const TARGET_MEAN = 6.8;    // Slight boost to target average
    const TARGET_STDDEV = 1.3;  // Widen spread slightly
    // ...

    // Z-score
    const zScore = (rawScore - mean) / stdDev;

    // Map to target distribution
    const normalized = TARGET_MEAN + (zScore * TARGET_STDDEV);

    // Clamp to 1-10 range
    return Math.max(1.0, Math.min(10.0, normalized));
}

// ============================================================================
// MAIN FBI CALCULATION
// ============================================================================

export interface FBIBreakdown {
    offensive: number;
    passing: number;
    defensive: number;
    retention: number;
    discipline: number; // v1.2: Added discipline
    contextFactors: {
        difficulty: number;
        resultMod: number;
        minutesFactor: number;
    };
    raw: number;
    contextAdjusted: number;
    final: number;
    position: Position;
    comparison?: {
        fotmob: number;
        difference: number;
    };
}

// ============================================================================
// GOALKEEPER-SPECIFIC CALCULATION (v1.4)
// ============================================================================

/**
 * Goalkeeper-Specific FBI Calculation
 * 
 * Evaluates goalkeepers based on Flick's sweeper-keeper system requirements:
 * - Shot-stopping (40%): Quality saves, PSxG (post-shot xG)
 * - Sweeping/Modern GK (30%): Sweeper actions, command, aerial dominance
 * - Distribution (20%): Passing accuracy, quick restarts
 * - Discipline (10%): Errors, penalties conceded
 */
function calculateGoalkeeperScore(match: TitanMatch): number {
    // ===== 1. SHOT-STOPPING SCORE (40% weight) =====
    // PSxG (Post-Shot Expected Goals) - most important GK metric
    const xGFaced = match.expected_goals_on_target_faced || 0;
    const goalsConceded = match.goals_conceded || 0;
    const psxg = xGFaced - goalsConceded; // Saves above expected

    const saves = match.saves || 0;
    const savesInsideBox = match.saves_inside_box || 0;
    const divingSaves = match.keeper_diving_save || 0;

    const shotStoppingScore =
        (psxg * 3.5) +                    // v1.7: UP from 3.0 - Boost GK ratings
        (saves * 0.4) +                   // Volume matters
        (savesInsideBox * 0.6) +          // High-danger saves worth more
        (divingSaves * 0.8) -             // Spectacular saves
        (goalsConceded * 0.8);            // Penalty for conceding

    // ===== 2. SWEEPING/MODERN GK SCORE (30% weight) =====
    // Critical for Flick's high-line system
    const sweeperActions = match.keeper_sweeper || 0;
    const highClaims = match.keeper_high_claim || 0;
    const clearances = match.clearances || 0;
    const recoveries = match.recoveries || 0;
    const aerialsWon = match.aerials_won || 0;
    const punches = match.punches || 0;

    const sweepingScore =
        (sweeperActions * 1.8) +          // v1.7: UP from 1.3 - EXTREMELY important for Flick!
        (highClaims * 0.8) +              // Commanding the box
        (clearances * 0.2) +              // General defensive actions
        (recoveries * 0.15) +             // Ball recoveries/positioning
        (aerialsWon * 0.4) +              // Aerial dominance
        (punches * 0.3);                  // Alternative to catching

    // ===== 3. DISTRIBUTION SCORE (20% weight) =====
    // Build-up from back, normalized per 90
    const per90 = 90 / (match.minutes || 90);
    const accuratePasses = match.accurate_passes || 0;
    const longBallsAccurate = match.long_balls_accurate || 0;
    const throws = match.player_throws || 0;

    const distributionScore =
        (accuratePasses * per90 * 0.02) + // Base passing (normalized)
        (longBallsAccurate * 0.6) +       // Long distribution quality
        (throws * 0.2);                   // Quick restarts

    // ===== 4. DISCIPLINE SCORE (10% - negative only) =====
    const yellowCard = match.yellowCard ? 1 : 0;
    const redCard = match.redCard ? 1 : 0;
    const penaltiesConceded = match.conceded_penalties || 0;

    const disciplineScore =
        -(yellowCard * 0.5) -
        -(redCard * 2.0) -
        -(penaltiesConceded * 0.8);

    // ===== WEIGHTED COMBINATION =====
    const rawGKScore =
        (shotStoppingScore * 0.35) +     // v1.7: DOWN from 0.4 - Still important but not everything
        (sweepingScore * 0.35) +         // v1.7: UP from 0.3 - Sweeping is CORE to Flick!
        (distributionScore * 0.30) +     // v1.7: UP from 0.2 - Passing vital for build-up
        disciplineScore; // Already weighted in calculation

    return rawGKScore;
}

// ============================================================================
// MAIN FBI CALCULATION
// ============================================================================

/**
 * Calculate FlickBall Index (FBI) for a player's match performance
 * 
 * @param match - Player match data
 * @param position - Player's tactical position
 * @returns FBI rating (1-10) with component breakdown
 */
export function calculateFBI(match: TitanMatch, position: Position): FBIBreakdown {
    // Route to goalkeeper-specific calculation if GK
    if (position === 'GK') {
        const rawGKScore = calculateGoalkeeperScore(match);

        // Apply context adjustments (same as outfield)
        const difficulty = getOpponentDifficulty(match);
        const resultMod = getResultModifier(match);
        const minutesFactor = getMinutesFactor(match.minutes || 90);

        const contextScore = rawGKScore * difficulty * (1 + resultMod) * minutesFactor;

        // Normalize to 1-10 scale
        const finalRating = normalizeToScale(contextScore);
        const rounded = Math.round(finalRating * 10) / 10;

        // Return with GK-specific breakdown
        return {
            offensive: 0, // Not applicable for GK
            passing: 0,   // Included in GK distribution score
            defensive: 0, // Included in GK shot-stopping/sweeping
            retention: 0, // Not applicable for GK
            discipline: 0, // Included in GK discipline score
            contextFactors: {
                difficulty,
                resultMod,
                minutesFactor
            },
            raw: Math.ceil(rawGKScore * 10) / 10,
            contextAdjusted: Math.ceil(contextScore * 10) / 10,
            final: rounded,
            position,
            comparison: match.rating ? {
                fotmob: parseFloat(match.rating),
                difference: Math.round((rounded - parseFloat(match.rating)) * 10) / 10
            } : undefined
        };
    }

    // Standard outfield player calculation
    // Calculate component scores
    const offensive = calculateOffensiveScore(match);
    const passing = calculatePassingScore(match, position);
    const defensive = calculateDefensiveScore(match);
    const retention = calculateRetentionScore(match);
    const discipline = calculateDisciplineScore(match); // v1.2: Added

    // Apply position weights
    const weights = POSITION_WEIGHTS[position];
    const weightedOffensive = offensive * weights.offensive;
    const weightedPassing = passing * weights.passing;
    const weightedDefensive = defensive * weights.defensive;
    const weightedRetention = retention * weights.retention;

    // Sum weighted components + discipline (not position-weighted)
    const rawScore = weightedOffensive + weightedPassing + weightedDefensive + weightedRetention + discipline;

    // Apply context adjustments
    const difficulty = getOpponentDifficulty(match);
    const resultMod = getResultModifier(match);
    const minutesFactor = getMinutesFactor(match.minutes || 90);

    const contextScore = rawScore * difficulty * (1 + resultMod) * minutesFactor;

    // Normalize to 1-10 scale
    const finalRating = normalizeToScale(contextScore);

    // Round to 1 decimal place (v1.7: ALWAYS round UP - good teacher!)
    const rounded = Math.ceil(finalRating * 10) / 10;

    return {
        offensive: Math.ceil(weightedOffensive * 10) / 10,
        passing: Math.ceil(weightedPassing * 10) / 10,
        defensive: Math.ceil(weightedDefensive * 10) / 10,
        retention: Math.ceil(weightedRetention * 10) / 10,
        discipline: Math.ceil(discipline * 10) / 10,
        contextFactors: {
            difficulty,
            resultMod,
            minutesFactor
        },
        raw: Math.ceil(rawScore * 10) / 10,
        contextAdjusted: Math.ceil(contextScore * 10) / 10,
        final: rounded,
        position,
        comparison: match.rating ? {
            fotmob: parseFloat(match.rating),
            difference: Math.round((rounded - parseFloat(match.rating)) * 10) / 10
        } : undefined
    };
}

/**
 * Helper to infer position from player name
 * TODO: Replace with actual position data from squad info
 */
export function inferPosition(playerName: string): Position {
    // Temporary inference based on known players
    const forwards = ['Lewandowski', 'Ferran Torres', 'Raphinha', 'Ansu Fati'];
    const midfielders = ['Pedri', 'Gavi', 'De Jong', 'Casado', 'Olmo'];
    const defenders = ['Araujo', 'Christensen', 'Kounde', 'Balde', 'Cubarsi', 'Martinez', 'Fort'];
    const goalkeepers = ['ter Stegen', 'Pena'];

    if (goalkeepers.some(gk => playerName.includes(gk))) return 'GK';
    if (defenders.some(def => playerName.includes(def))) return 'DEF';
    if (midfielders.some(mid => playerName.includes(mid))) return 'MID';
    if (forwards.some(fwd => playerName.includes(fwd))) return 'FWD';

    return 'MID'; // Default
}

