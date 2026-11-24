/**
 * FlickBall Index (FBI) - Player Rating System
 * 
 * A transparent, mathematically rigorous rating system for Barcelona players
 * under Hansi Flick's management. Accounts for position-specific contributions,
 * match context, and tactical system requirements.
 * 
 * Scale: 1.0 (catastrophic) to 10.0 (perfect). Calibrated per position to
 * average 6.8 with a spread of 1.3 (scripts/calibrate_fbi.mjs; tested in
 * scripts/fbi.test.js). No app imports, so tests and the calibration load it directly.
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const shotsOnTarget = match.ShotsOnTarget || match.shotsontarget || 0; // data key is ShotsOnTarget
    const bigChancesMissed = match.big_chance_missed_title || 0;
    const offsides = match.Offsides || match.offsides || 0; // data key is Offsides
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
    // Match totals: per-90 conversion happens once, in calculateFBI (volumePer90).
    const accuratePasses = match.accurate_passes || 0;
    const passesIntoFinalThird = match.passes_into_final_third || 0;
    const longBallsAccurate = match.long_balls_accurate || 0;
    const touches = match.touches || 0;
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
    const dribblesSucceeded = match.dribbles_succeeded || 0;
    const dispossessed = match.dispossessed || 0;
    const touchesInBox = match.touches_opp_box || 0;
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
// CONTEXT, MINUTES AND CALIBRATION
// ============================================================================

export type OpponentTier = 'elite' | 'strong' | 'mid' | 'weak';

/** Added to the final rating: harder opponents and wins earn a little, weak opponents and losses cost a little. */
export const OPPONENT_BONUS: Record<OpponentTier, number> = { elite: 0.2, strong: 0.1, mid: 0, weak: -0.2 };
export const RESULT_BONUS = { W: 0.3, D: 0, L: -0.2 } as const;

/** Minutes of "average performance" blended into every appearance (see volumePer90). 120 chosen by
 *  sweep (30-180): best balance of FotMob agreement, hat-trick ratings and tame short cameos. */
export const SHRINK_MINUTES = 120;

/** Barca's result. Scores are stored home-first, so "0 - 4" away is a WIN. */
export function matchOutcome(match: TitanMatch): 'W' | 'D' | 'L' {
    let gf = match.teamScore, ga = match.opponentScore;
    if (typeof gf !== 'number' || typeof ga !== 'number') {
        const [h, a] = String(match.result || match.score || '').split('-').map(x => parseInt(x.trim()));
        if (isNaN(h) || isNaN(a)) return 'D';
        [gf, ga] = match.isHome === false ? [a, h] : [h, a];
    }
    return gf > ga ? 'W' : gf < ga ? 'L' : 'D';
}

/**
 * Volume stats (passes, tackles, touches, sweeping...) as a per-90 rate, pulled toward the
 * position's average: SHRINK_MINUTES of average play are blended in, so a 90-minute game keeps
 * 43% of its own rate and a 10-minute cameo 8%. Event stats (goals, assists, chances, cards)
 * are never scaled: a goal off the bench counts in full.
 */
export function volumePer90(volume: number, minutes: number, averagePer90: number): number {
    return (volume * 90 + SHRINK_MINUTES * averagePer90) / (Math.max(0, minutes) + SHRINK_MINUTES);
}

/**
 * Calibration groups: midfielders and forwards keep one set of weights each but are scaled per role,
 * so a poacher isn't measured against wingers on the ball all game, nor a No.10 against the pivots
 * who make the most passes.
 */
export type CalibrationGroup = 'GK' | 'DEF' | 'DM' | 'AM' | 'ST' | 'W';
export const CALIBRATION_GROUPS: CalibrationGroup[] = ['GK', 'DEF', 'DM', 'AM', 'ST', 'W'];

/** `role` is the player's position as stored (e.g. 'CAM', 'LW', 'ST', 'Midfielder'). */
export function calibrationGroup(position: Position, role?: string): CalibrationGroup {
    if (position === 'MID') return ['CAM', 'RM', 'LM'].includes(role ?? '') ? 'AM' : 'DM'; // CDM, CM, broad role
    if (position === 'FWD') return ['LW', 'RW'].includes(role ?? '') ? 'W' : 'ST';           // ST, broad role
    return position;
}

// CALIBRATION:START (written by `node scripts/calibrate_fbi.mjs`; do not edit by hand)
export const CALIBRATION: Record<CalibrationGroup, { volumeMean: number; rawMean: number; rawSd: number; scaleMean: number }> = {
    GK: { volumeMean: 2.8891, rawMean: 3.4828, rawSd: 1.6912, scaleMean: 6.6051 },
    DEF: { volumeMean: 5.9672, rawMean: 6.2121, rawSd: 0.7806, scaleMean: 6.6008 },
    DM: { volumeMean: 7.0007, rawMean: 7.6316, rawSd: 1.2668, scaleMean: 6.5956 },
    AM: { volumeMean: 4.4292, rawMean: 5.6649, rawSd: 1.2860, scaleMean: 6.6274 },
    ST: { volumeMean: 1.8713, rawMean: 3.4713, rawSd: 1.8100, scaleMean: 6.6270 },
    W: { volumeMean: 4.2926, rawMean: 6.9659, rawSd: 2.3152, scaleMean: 6.5915 },
};
// CALIBRATION:END

/** Soft ceiling: unchanged up to 9.0, then eases toward 10 so a 10.0 needs a truly exceptional game. */
export function softCap(x: number): number {
    return x <= 9 ? x : 9 + (1 - Math.exp(-(x - 9)));
}

export const TARGET_MEAN = 6.8;
export const TARGET_SD = 1.3;

// ============================================================================
// GOALKEEPERS
// ============================================================================

/** Shot-stopping and discipline are events; sweeping and distribution are volume. */
function goalkeeperParts(match: TitanMatch) {
    const xGFaced = match.expected_goals_on_target_faced || 0;
    const goalsConceded = match.goals_conceded || 0;
    const shotStopping =
        ((xGFaced - goalsConceded) * 3.5) +       // saves above expected
        ((match.saves || 0) * 0.4) +
        ((match.saves_inside_box || 0) * 0.6) +
        ((match.keeper_diving_save || 0) * 0.8) -
        (goalsConceded * 0.8);
    const sweeping =
        ((match.keeper_sweeper || 0) * 1.8) +     // sweeping is core to Flick's high line
        ((match.keeper_high_claim || 0) * 0.8) +
        ((match.clearances || 0) * 0.2) +
        ((match.recoveries || 0) * 0.15) +
        ((match.aerials_won || 0) * 0.4) +
        ((match.punches || 0) * 0.3);
    const distribution =
        ((match.accurate_passes || 0) * 0.02) +
        ((match.long_balls_accurate || 0) * 0.6) +
        ((match.player_throws || 0) * 0.2);
    const discipline =
        -(match.yellowCard ? 0.5 : 0)
        - (match.redCard ? 2.0 : 0)
        - ((match.conceded_penalties || 0) * 0.8);
    return { event: shotStopping * 0.35 + discipline, volume: sweeping * 0.35 + distribution * 0.30, shotStopping, sweeping, distribution, discipline };
}

// ============================================================================
// MAIN FBI CALCULATION
// ============================================================================

export interface FBIBreakdown {
    offensive: number;   // unweighted component scores (the match modal shows score x weight)
    passing: number;
    defensive: number;
    retention: number;
    discipline: number;
    contextFactors: { opponentBonus: number; resultBonus: number; minutes: number };
    raw: number;         // events + per-90 volume (blended toward average for short games)
    scaled: number;      // raw on the 6.8 / 1.3 scale, before the context bonuses
    final: number;
    position: Position;
    comparison?: { fotmob: number; difference: number };
}

/** Event score and total volume score for one match, before minutes and calibration. */
export function fbiParts(match: TitanMatch, position: Position) {
    if (position === 'GK') {
        const gk = goalkeeperParts(match);
        return { event: gk.event, volume: gk.volume, offensive: 0, passing: gk.distribution, defensive: gk.shotStopping + gk.sweeping, retention: 0, discipline: gk.discipline };
    }
    const w = POSITION_WEIGHTS[position];
    const offensive = calculateOffensiveScore(match);
    const passing = calculatePassingScore(match, position);
    const defensive = calculateDefensiveScore(match);
    const retention = calculateRetentionScore(match);
    const discipline = calculateDisciplineScore(match);
    return {
        event: offensive * w.offensive + discipline,
        volume: passing * w.passing + defensive * w.defensive + retention * w.retention,
        offensive, passing, defensive, retention, discipline,
    };
}

const minutesOf = (match: TitanMatch) => match.minutes_played ?? match.minutes ?? 90;

/** Events in full plus volume as a blended per-90 rate. */
export function rawFBI(match: TitanMatch, position: Position, role?: string): number {
    const parts = fbiParts(match, position);
    return parts.event + volumePer90(parts.volume, minutesOf(match), CALIBRATION[calibrationGroup(position, role)].volumeMean);
}

/**
 * FBI for one player in one match. `opponentTier` comes from src/lib/opponents.ts (that season's
 * real league table); passed in so this file stays free of app imports. `role` is the player's
 * stored position ('CAM', 'LW', 'ST'...), used to pick its calibration group.
 */
export function calculateFBI(match: TitanMatch, position: Position, opponentTier: OpponentTier = 'mid', role?: string): FBIBreakdown {
    const parts = fbiParts(match, position);
    const cal = CALIBRATION[calibrationGroup(position, role)];
    const raw = parts.event + volumePer90(parts.volume, minutesOf(match), cal.volumeMean);
    const scaled = cal.scaleMean + ((raw - cal.rawMean) / cal.rawSd) * TARGET_SD;
    const opponentBonus = OPPONENT_BONUS[opponentTier];
    const resultBonus = RESULT_BONUS[matchOutcome(match)];
    const r1 = (x: number) => Math.round(x * 10) / 10;
    const final = r1(Math.max(1, Math.min(10, softCap(scaled + opponentBonus + resultBonus))));
    const fotmob = match.rating === undefined || match.rating === null ? NaN : parseFloat(String(match.rating));
    return {
        offensive: r1(parts.offensive),
        passing: r1(parts.passing),
        defensive: r1(parts.defensive),
        retention: r1(parts.retention),
        discipline: r1(parts.discipline),
        contextFactors: { opponentBonus, resultBonus, minutes: minutesOf(match) },
        raw: Math.round(raw * 100) / 100,
        scaled: Math.round(scaled * 100) / 100,
        final,
        position,
        comparison: isNaN(fotmob) ? undefined : { fotmob, difference: r1(final - fotmob) },
    };
}
