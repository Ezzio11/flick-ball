
import ComparisonContent from './ComparisonContent';
import { fetchAllMatches } from '@/lib/dataFetcher';
import { getAllPlayers } from '@/lib/playerHelpers';

// Enable ISR
export const revalidate = 3600;

// Update static params to use dynamic fetch as well?
// Actually generateStaticParams runs at build time.
// But we can revalidate.
export async function generateStaticParams() {
    // This part is tricky if we want ALL combinations.
    // Usually we don't pre-render ALL combinations for a matrix this big.
    // But existing code might have done it?
    // Let's check if the previous file had generateStaticParams.
    // I didn't see one in the view. It was client component. Next.js defaults to dynamic for params not generated.
    // But if we want it statically optimized, we can provide some top ones.
    // For now, let's just make it dynamic or empty params.
    return [];
}

export default async function ComparisonPage({ params }: { params: Promise<{ player1: string; player2: string }> }) {
    const matches = await fetchAllMatches();
    return <ComparisonContent params={params} matches={matches} />;
}
