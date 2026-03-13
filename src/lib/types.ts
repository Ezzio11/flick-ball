export interface PlayerMatch {
    matchId: number | string;
    date: string;
    opponent: string;
    competition: string;
    minutes?: number;
    goals?: number;
    assists?: number;
    rating?: number;
    fbiRating?: number;
    isFriendly?: boolean;
    isHome?: boolean;
    teamScore?: number;
    opponentScore?: number;
    isWin?: boolean;
    isDraw?: boolean;
    isLoss?: boolean;
    potm?: boolean;
    [key: string]: any; // Allow for dynamic stats from FotMob
}

export interface Player {
    id: number;
    name: string;
    position: string;
    appearances: number;
    matches: PlayerMatch[];
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
