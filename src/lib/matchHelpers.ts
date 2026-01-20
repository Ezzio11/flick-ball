// import { INGESTED_MATCHES } from './data_ingested'; // Removing static import
import { format, parseISO } from 'date-fns';

export interface MatchData {
    id: string | number;
    date: string;
    opponent: string;
    score: string;
    isHome: boolean;
    competition: string;
    season: string;
    formation?: string;
    stats?: any;
    scorers?: Array<{
        player: string;
        team: string;
        minute: number;
        assist?: string | null;
    }>;
}

export interface ParsedScore {
    barcelonaGoals: number;
    opponentGoals: number;
}

export interface MatchResult {
    type: 'WIN' | 'DRAW' | 'LOSS';
    label: string;
    color: string;
}

// Get match by ID
export function getMatchById(matches: MatchData[], id: string): MatchData | undefined {
    return matches.find(m => String(m.id) === String(id));
}

// Parse match score
export function parseMatchScore(score: string, isHome: boolean): ParsedScore {
    const [left, right] = score.split(' - ').map(s => parseInt(s.trim()) || 0);
    return {
        barcelonaGoals: isHome ? left : right,
        opponentGoals: isHome ? right : left
    };
}

// Get match result
export function getMatchResult(barcelonaGoals: number, opponentGoals: number): MatchResult {
    if (barcelonaGoals > opponentGoals) {
        return {
            type: 'WIN',
            label: '¡VICTORIA!',
            color: '#22c55e'
        };
    }
    if (barcelonaGoals < opponentGoals) {
        return {
            type: 'LOSS',
            label: 'DEFEAT',
            color: '#ef4444'
        };
    }
    return {
        type: 'DRAW',
        label: 'DRAW',
        color: '#eab308'
    };
}

// Format match date
export function formatMatchDate(dateString: string): string {
    try {
        return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch {
        return dateString;
    }
}

// Get opponent xG (when we add opponent stats)
export function getOpponentXG(match: MatchData): number {
    // For now, estimate based on goals conceded + some variance
    // In real app, this would come from opponent stats
    const { opponentGoals } = parseMatchScore(match.score, match.isHome);
    return opponentGoals * 1.2; // Rough estimate
}

// Organize scorers chronologically
export function organizeScorersByTime(scorers: MatchData['scorers'], isHome: boolean, score: string) {
    const { barcelonaGoals, opponentGoals } = parseMatchScore(score, isHome);

    const safeScorers = scorers || [];
    return safeScorers
        .sort((a, b) => a.minute - b.minute)
        .map((scorer, index) => {
            // Calculate running score
            const barcelonaScorers = safeScorers.slice(0, index + 1).filter(s => s.team === 'barca');
            const opponentScorers = safeScorers.slice(0, index + 1).filter(s => s.team === 'opponent');

            return {
                ...scorer,
                runningScore: `${barcelonaScorers.length}-${opponentScorers.length}`,
                isBarca: scorer.team === 'barca'
            };
        });
}

// export const getAllMatches = () => {
//    return INGESTED_MATCHES;
// };

// Get all Real Madrid matches (for testing)
export function getRealMadridMatches(matches: MatchData[]) {
    return matches.filter(m => m.opponent === 'Real Madrid');
}
