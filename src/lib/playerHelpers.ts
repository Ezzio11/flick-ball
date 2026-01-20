import { TITANS_DATA } from './titans_data';
// import { INGESTED_MATCHES } from './data_ingested';
import { calculateFBI, Position as FBIPosition, TitanMatch } from './fbi-rating';

// Cross-reference titans player data with ingested match metadata
export function enrichPlayerMatches(player: Player, matches: any[]): Player {
    const enrichedMatches = player.matches.map(match => {
        // Find corresponding match in ingested data by ID
        // NOTE: data_ingested uses string IDs, titans uses numbers - must convert
        const ingestedMatch = matches.find((m: any) => m.id === String(match.matchId));

        if (ingestedMatch) {
            // Parse score "Home - Away" (e.g., "1 - 2")
            const scoreParts = ingestedMatch.score.split('-').map((s: string) => parseInt(s.trim()));
            const isHome = ingestedMatch.isHome;
            let teamScore = 0;
            let opponentScore = 0;

            if (scoreParts.length === 2 && !isNaN(scoreParts[0])) {
                teamScore = isHome ? scoreParts[0] : scoreParts[1];
                opponentScore = isHome ? scoreParts[1] : scoreParts[0];
            }

            // Merge: Keep player stats from titans, get date/competition from ingested
            // BUT: If ingested has "Unknown" for competition, prefer the original from titans_data
            return {
                ...match,
                date: ingestedMatch.date,
                competition: (ingestedMatch.competition && ingestedMatch.competition !== 'Unknown')
                    ? ingestedMatch.competition
                    : (match.competition || 'Unknown'),
                opponent: ingestedMatch.opponent,
                isHome: isHome,
                teamScore: teamScore,
                opponentScore: opponentScore,
                isFriendly: ingestedMatch._isFriendly || match.competition?.toLowerCase().includes('friendly') || match.competition?.toLowerCase().includes('gamper'),
                // Add convenient result boolean
                isWin: teamScore > opponentScore,
                isDraw: teamScore === opponentScore,
                isLoss: teamScore < opponentScore
            };
        }

        // If not found in ingested data, keep original but filter out future matches
        const matchDate = new Date(match.date);
        const now = new Date();

        // Filter out future matches (2026+)
        if (matchDate > now) {
            return null;
        }

        return {
            ...match,
            isFriendly: match.competition?.toLowerCase().includes('friendly') || match.competition?.toLowerCase().includes('gamper')
        };
    }).filter(Boolean); // Remove nulls

    // Sort chronologically (oldest first) so timeline starts from Aug 2024
    const sortedMatches = enrichedMatches.sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Calculate FBI Ratings for each match
    const positionType = mapToFBIPosition(player.position);
    const matchesWithFBI = sortedMatches.map((match: any) => {
        const fbiStats = calculateFBI(match as TitanMatch, positionType);
        return {
            ...match,
            fbiRating: fbiStats.final,
            fbiBreakdown: fbiStats
        };
    });

    return {
        ...player,
        matches: matchesWithFBI,
        appearances: matchesWithFBI.length
    };
}

function mapToFBIPosition(fullPosition: string): FBIPosition {
    // Map specific roles to generic FBI categories
    const roleMap: Record<string, FBIPosition> = {
        'GK': 'GK',
        'CB': 'DEF', 'RB': 'DEF', 'LB': 'DEF', 'RWB': 'DEF', 'LWB': 'DEF',
        'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID', 'RM': 'MID', 'LM': 'MID',
        'ST': 'FWD', 'CF': 'FWD', 'LW': 'FWD', 'RW': 'FWD'
    };

    return roleMap[fullPosition] || 'MID'; // Default fallback
}

export interface Player {
    id: number;
    name: string;
    position: string;
    appearances: number;
    matches: any[];
    slug?: string;
}

export interface AggregatedStats {
    appearances: number;
    totalGoals: number;
    totalAssists: number;
    totalMinutes: number;
    avgRating: number;
    totalPOTM: number;

    // Attacking
    totalShots?: number;
    totalShotsOnTarget?: number;
    totalBigChances?: number;
    totalDribbles?: number;
    totalChancesCreated?: number;
    totalTouches?: number;
    totalTouchesBox?: number;

    // Expected Stats
    totalxG?: number;
    totalxA?: number;
    totalxGxA?: number;
    totalxGOnTarget?: number;
    totalxGNonPenalty?: number;

    // Passing
    totalPasses?: number;
    avgPassAccuracy?: number;
    totalKeyPasses?: number;
    totalLongBalls?: number;
    totalCrosses?: number;
    totalPassesFinalThird?: number;
    totalCorners?: number;

    // Defending
    totalTackles?: number;
    totalInterceptions?: number;
    totalClearances?: number;
    totalDuelsWon?: number;
    totalDuelsLost?: number;
    totalAerialsWon?: number;
    totalBlocks?: number;
    totalRecoveries?: number;
    totalDribbledPast?: number;

    // Discipline
    totalFouls?: number;
    totalWasFouled?: number;
    totalDispossessed?: number;
    totalYellowCards?: number;
    totalRedCards?: number;

    // Physical
    totalDistance?: number;
    avgTopSpeed?: number;
    totalSprints?: number;
    avgWalking?: number;
    avgRunning?: number;
    avgSprinting?: number;

    // Goalkeeper specific
    totalSaves?: number;
    totalGoalsConceded?: number;
    totalCleanSheets?: number;
    avgGoalsPrevented?: number;
}

export interface TrendDataPoint {
    date: string;
    opponent: string;
    goals: number;
    assists: number;
    rating: number;
    ratingSource: string;
    competition: string;
    // Extended Metrics
    saves?: number;
    conceded?: number;
    cleanSheet?: number; // 1 or 0
    tackles?: number;
    interceptions?: number;
    duelsWon?: number;
    xg?: number;
}

// Position mapping for Barcelona squad
const PLAYER_POSITIONS: Record<string, string> = {
    // Goalkeepers
    'Inaki Pena': 'GK',
    'Marc-Andre ter Stegen': 'GK',
    'Wojciech Szczesny': 'GK',
    'Joan Garcia': 'GK',

    // Defenders
    'Jules Koundé': 'RB',
    'Alejandro Balde': 'LB',
    'Pau Cubarsi': 'CB',
    'Inigo Martinez': 'CB',
    'Eric Garcia': 'CB',
    'Ronald Araujo': 'CB',
    'Andreas Christensen': 'CB',
    'Héctor Fort': 'RB',
    'Gerard Martin': 'LB',
    'Sergi Dominguez': 'CB',
    'Andres Cuenca': 'CB',

    // Midfielders
    'Pedri': 'CM',
    'Frenkie de Jong': 'CM',
    'Gavi': 'CM',
    'Dani Olmo': 'CAM',
    'Fermin Lopez': 'CAM',
    'Marc Casado': 'CDM',
    'Pablo Torre': 'CAM',
    'Marc Bernal': 'CDM',
    'Toni Fernandez': 'CAM',
    'Dro Fernandez': 'CM',

    // Forwards
    'Robert Lewandowski': 'ST',
    'Lamine Yamal': 'RW',
    'Raphinha': 'LW',
    'Ferran Torres': 'ST',
    'Ansu Fati': 'LW',
    'Pau Victor': 'ST',
    'Marcus Rashford': 'LW',
    'Roony Bardghji': 'RW',
    'Jofre Torrents': 'RW',
    'Daniel Rodriguez': 'LW',
    'Joao Cancelo': 'RB',
    'Diego Kochen': 'GK',
    'Guillermo Fernandez': 'CM',
};

function getPlayerPosition(name: string): string {
    return PLAYER_POSITIONS[name] || 'Unknown';
}

// Convert name to URL-friendly slug
export function nameToSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}


// Get player by slug
export function getPlayerBySlug(slug: string, matches: any[]): Player | null {
    const player = TITANS_DATA.find(p => nameToSlug(p.name) === slug);
    if (!player) return null;

    // Enrich with correct dates and competitions from ingested data
    const enriched = enrichPlayerMatches(player, matches);
    // Inject correct position and slug
    return {
        ...enriched,
        position: getPlayerPosition(player.name),
        slug: slug  // Add the slug so it's accessible
    };
}

// Get all players (for navigation/listing) with basic stats
export function getAllPlayers(matches: any[]): Array<Player & { slug: string; goals: number; assists: number; cleanSheets?: number; avgRating: number; minutes?: number; stats?: AggregatedStats }> {
    return TITANS_DATA.map(player => {
        const enriched = enrichPlayerMatches(player, matches);
        const stats = aggregatePlayerStats(enriched);
        return {
            ...enriched,
            position: getPlayerPosition(player.name), // Inject correct position
            slug: nameToSlug(player.name),
            goals: stats.totalGoals,
            assists: stats.totalAssists,
            minutes: stats.totalMinutes,
            stats: stats, // Allow access to full stats object
            cleanSheets: stats.totalCleanSheets,
            avgRating: stats.avgRating
        };
    });
}

// Aggregate player stats across all matches
export function aggregatePlayerStats(player: Player): AggregatedStats {
    const matches = player.matches;

    let totalGoals = 0;
    let totalAssists = 0;
    let totalMinutes = 0;
    let totalRating = 0;
    let ratingCount = 0;
    let totalPOTM = 0;

    let totalShots = 0;
    let totalShotsOnTarget = 0;
    let totalBigChances = 0;
    let totalDribbles = 0;
    let totalChancesCreated = 0;
    let totalTouches = 0;
    let totalTouchesBox = 0;

    let totalxG = 0;
    let totalxA = 0;
    let totalxGxA = 0;
    let totalxGOnTarget = 0;
    let totalxGNonPenalty = 0;

    const totalAccuratePasses = 0;
    const passCount = 0;
    let totalKeyPasses = 0;
    const totalLongBalls = 0;
    const totalCrosses = 0;
    const totalPassesFinalThird = 0;
    const totalCorners = 0;

    // Use loop to sum values
    let accuratePassesSum = 0;
    let passCountSum = 0;
    let longBallsSum = 0;
    let crossesSum = 0;
    let passesFinalThirdSum = 0;
    let cornersSum = 0;


    let totalTackles = 0;
    let totalInterceptions = 0;
    let totalClearances = 0;
    let totalDuelsWon = 0;
    let totalDuelsLost = 0;
    let totalAerialsWon = 0;
    let totalBlocks = 0;
    let totalRecoveries = 0;
    let totalDribbledPast = 0;

    let totalFouls = 0;
    let totalWasFouled = 0;
    let totalDispossessed = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;

    let totalDistance = 0;
    let totalTopSpeed = 0;
    let speedCount = 0;
    let totalSprints = 0;
    let totalWalking = 0;
    let totalRunning = 0;
    let totalSprinting = 0;
    let physicalCount = 0;

    let totalSaves = 0;
    let totalGoalsConceded = 0;
    let totalCleanSheets = 0;
    let totalGoalsPrevented = 0;
    let gkCount = 0;

    let validMatchesCount = 0;

    matches.forEach(match => {
        // Skip friendly matches for aggregation
        if (match.isFriendly) return;

        validMatchesCount++;

        totalGoals += match.goals || 0;
        totalAssists += match.assists || 0;
        totalMinutes += match.minutes || 0;

        if (match.fbiRating && parseFloat(match.fbiRating) > 0) {
            totalRating += parseFloat(match.fbiRating);
            ratingCount++;
        }

        if (match.potm) totalPOTM++;

        // Attacking - FIX: Use correct field names from titans_data.ts
        if (match.total_shots) totalShots += match.total_shots;
        if (match.shotsontarget) totalShotsOnTarget += match.shotsontarget;
        if (match.big_chance_missed_title) totalBigChances += match.big_chance_missed_title;
        if (match.dribbles_succeeded) totalDribbles += match.dribbles_succeeded;
        if (match.chances_created) totalChancesCreated += match.chances_created;
        if (match.touches) totalTouches += match.touches;
        if (match.touches_opp_box) totalTouchesBox += match.touches_opp_box;

        // Expected Stats
        if (match.expected_goals) totalxG += match.expected_goals;
        if (match.expected_assists) totalxA += match.expected_assists;
        if (match.xg_and_xa) totalxGxA += match.xg_and_xa;
        if (match.expected_goals_on_target_variant) totalxGOnTarget += match.expected_goals_on_target_variant;
        if (match.expected_goals_non_penalty) totalxGNonPenalty += match.expected_goals_non_penalty;

        // Passing
        if (match.accurate_passes) {
            accuratePassesSum += match.accurate_passes;
            passCountSum++;
        }
        if (match.key_passes) {
            totalKeyPasses += match.key_passes;
        } else if (match.chances_created) {
            // Fallback: Key Passes = Chances Created - Assists
            totalKeyPasses += Math.max(0, (match.chances_created || 0) - (match.assists || 0));
        }
        if (match.long_balls_accurate) longBallsSum += match.long_balls_accurate;
        if (match.accurate_crosses) crossesSum += match.accurate_crosses;
        if (match.passes_into_final_third) passesFinalThirdSum += match.passes_into_final_third;
        if (match.corners) cornersSum += match.corners;

        // Defending - FIX: Use correct field names
        if (match['matchstats.headers.tackles']) totalTackles += match['matchstats.headers.tackles'];
        if (match.interceptions) totalInterceptions += match.interceptions;
        if (match.clearances) totalClearances += match.clearances;
        if (match.duel_won) totalDuelsWon += match.duel_won;
        if (match.duel_lost) totalDuelsLost += match.duel_lost;
        if (match.aerials_won) totalAerialsWon += match.aerials_won;
        if (match.shot_blocks) totalBlocks += match.shot_blocks;
        if (match.recoveries) totalRecoveries += match.recoveries;
        if (match.dribbled_past) totalDribbledPast += match.dribbled_past;

        // Discipline
        if (match.fouls) totalFouls += match.fouls;
        if (match.was_fouled) totalWasFouled += match.was_fouled;
        if (match.dispossessed) totalDispossessed += match.dispossessed;
        if (match.yellowCard) totalYellowCards += 1;
        if (match.redCard) totalRedCards += 1;

        // Physical - FIX: Use correct field names
        if (match.physical_metrics_distance_covered) totalDistance += match.physical_metrics_distance_covered;
        if (match.physical_metrics_topspeed) {
            totalTopSpeed += match.physical_metrics_topspeed;
            speedCount++;
        }
        if (match.physical_metrics_number_of_sprints) totalSprints += match.physical_metrics_number_of_sprints;
        if (match.physical_metrics_walking) {
            totalWalking += match.physical_metrics_walking;
            totalRunning += match.physical_metrics_running || 0;
            totalSprinting += match.physical_metrics_sprinting || 0;
            physicalCount++;
        }

        // GK
        if (match.saves) {
            totalSaves += match.saves;
            gkCount++;
        }
        if (match.goals_conceded !== undefined) {
            totalGoalsConceded += match.goals_conceded;
            if (match.goals_conceded === 0) totalCleanSheets++;
        }
        if (match.goals_prevented) totalGoalsPrevented += match.goals_prevented;
    });

    return {
        appearances: validMatchesCount,  // Use actual filtered matches count
        totalGoals,
        totalAssists,
        totalMinutes,
        avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
        totalPOTM,
        totalShots: totalShots > 0 ? totalShots : undefined,
        totalShotsOnTarget: totalShotsOnTarget > 0 ? totalShotsOnTarget : undefined,
        totalBigChances: totalBigChances > 0 ? totalBigChances : undefined,
        totalDribbles: totalDribbles > 0 ? totalDribbles : undefined,
        totalChancesCreated: totalChancesCreated > 0 ? totalChancesCreated : undefined,
        totalTouches: totalTouches > 0 ? totalTouches : undefined,
        totalTouchesBox: totalTouchesBox > 0 ? totalTouchesBox : undefined,
        totalxG: totalxG > 0 ? totalxG : undefined,
        totalxA: totalxA > 0 ? totalxA : undefined,
        totalxGxA: totalxGxA > 0 ? totalxGxA : undefined,
        totalxGOnTarget: totalxGOnTarget > 0 ? totalxGOnTarget : undefined,
        totalxGNonPenalty: totalxGNonPenalty > 0 ? totalxGNonPenalty : undefined,
        totalPasses: accuratePassesSum > 0 ? accuratePassesSum : undefined,
        avgPassAccuracy: passCountSum > 0 ? accuratePassesSum / passCountSum : undefined,
        totalKeyPasses: totalKeyPasses,  // Always return number, even if 0
        totalLongBalls: longBallsSum > 0 ? longBallsSum : undefined,
        totalCrosses: crossesSum > 0 ? crossesSum : undefined,
        totalPassesFinalThird: passesFinalThirdSum > 0 ? passesFinalThirdSum : undefined,
        totalCorners: cornersSum > 0 ? cornersSum : undefined,
        totalTackles: totalTackles > 0 ? totalTackles : undefined,
        totalInterceptions: totalInterceptions > 0 ? totalInterceptions : undefined,
        totalClearances: totalClearances > 0 ? totalClearances : undefined,
        totalDuelsWon: totalDuelsWon > 0 ? totalDuelsWon : undefined,
        totalDuelsLost: totalDuelsLost > 0 ? totalDuelsLost : undefined,
        totalAerialsWon: totalAerialsWon > 0 ? totalAerialsWon : undefined,
        totalBlocks: totalBlocks,  // Always return number, even if 0
        totalRecoveries: totalRecoveries > 0 ? totalRecoveries : undefined,
        totalDribbledPast: totalDribbledPast > 0 ? totalDribbledPast : undefined,
        totalFouls: totalFouls > 0 ? totalFouls : undefined,
        totalWasFouled: totalWasFouled > 0 ? totalWasFouled : undefined,
        totalDispossessed: totalDispossessed > 0 ? totalDispossessed : undefined,
        totalYellowCards: totalYellowCards > 0 ? totalYellowCards : 0,
        totalRedCards: totalRedCards > 0 ? totalRedCards : 0,
        totalDistance: totalDistance > 0 ? totalDistance : undefined,
        avgTopSpeed: speedCount > 0 ? totalTopSpeed / speedCount : undefined,
        totalSprints: totalSprints > 0 ? totalSprints : undefined,
        avgWalking: physicalCount > 0 ? totalWalking / physicalCount : undefined,
        avgRunning: physicalCount > 0 ? totalRunning / physicalCount : undefined,
        avgSprinting: physicalCount > 0 ? totalSprinting / physicalCount : undefined,
        totalSaves: totalSaves > 0 ? totalSaves : undefined,
        totalGoalsConceded: totalGoalsConceded,  // Keep 0 as valid
        totalCleanSheets: totalCleanSheets,      // Keep 0 as valid
        avgGoalsPrevented: gkCount > 0 ? totalGoalsPrevented / gkCount : undefined,
    };
}

// Format matches into trend data for charts
export function getTrendData(player: Player): TrendDataPoint[] {
    return player.matches
        .map(match => ({
            date: match.date,
            opponent: match.opponent,
            goals: match.goals || 0,
            assists: match.assists || 0,
            rating: match.fbiRating || parseFloat(match.rating) || 0,
            ratingSource: (match.fbiRating && match.fbiRating > 0) ? 'FBI' : 'FotMob',
            competition: match.competition || 'Unknown',
            // Extended Metrics
            saves: match.saves || 0,
            conceded: match.goals_conceded !== undefined ? match.goals_conceded : undefined,
            cleanSheet: (match.goals_conceded === 0) ? 1 : 0,
            tackles: match['matchstats.headers.tackles'] || 0,
            interceptions: match.interceptions || 0,
            duelsWon: match.duel_won || 0,
            xg: match.expected_goals || 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Calculate percentiles relative to all players
export function calculatePercentiles(stats: AggregatedStats): Record<string, number> {
    const allPlayers = TITANS_DATA.map(p => aggregatePlayerStats(p));

    const percentile = (value: number | undefined, allValues: number[]) => {
        if (value === undefined || allValues.length === 0) return 0;
        const sorted = allValues.filter(v => v !== undefined).sort((a, b) => a - b);
        const index = sorted.findIndex(v => v >= value);
        return index === -1 ? 100 : (index / sorted.length) * 100;
    };

    return {
        goals: percentile(stats.totalGoals, allPlayers.map(p => p.totalGoals)),
        assists: percentile(stats.totalAssists, allPlayers.map(p => p.totalAssists)),
        rating: percentile(stats.avgRating, allPlayers.map(p => p.avgRating)),
        tackles: percentile(stats.totalTackles, allPlayers.map(p => p.totalTackles || 0)),
        dribbles: percentile(stats.totalDribbles, allPlayers.map(p => p.totalDribbles || 0)),
        duels: percentile(stats.totalDuelsWon, allPlayers.map(p => p.totalDuelsWon || 0)),
    };
}
