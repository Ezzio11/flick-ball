
import { notFound } from 'next/navigation';
import { getMatchById, parseMatchScore, getMatchResult } from '@/lib/matchHelpers';
import MatchPageContent from './MatchPageContent';
import { fetchAllMatches } from '@/lib/dataFetcher';

// Generate static params for all matches
export async function generateStaticParams() {
    const matches = await fetchAllMatches(); // Fetch dynamically
    return matches.map((match: any) => ({
        id: String(match.id), // Ensure ID is string
    }));
}

// Enable ISR with 60s revalidation
export const revalidate = 86400;
export const dynamicParams = true;

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const matches = await fetchAllMatches();
    const match = getMatchById(matches, id);

    if (!match || !match.stats?.available) {
        notFound();
    }

    const { barcelonaGoals, opponentGoals } = parseMatchScore(match.score, match.isHome);
    const result = getMatchResult(barcelonaGoals, opponentGoals);

    return (
        <MatchPageContent
            match={match}
            barcelonaGoals={barcelonaGoals}
            opponentGoals={opponentGoals}
            result={result}
        />
    );
}
