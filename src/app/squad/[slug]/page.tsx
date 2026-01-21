
import { notFound } from 'next/navigation';
import { getPlayerBySlug, getAllPlayers } from '@/lib/playerHelpers';
import PlayerProfileContent from './PlayerProfileContent';
import { fetchAllMatches } from '@/lib/dataFetcher';

// Generate static params for all players
export async function generateStaticParams() {
    const matches = await fetchAllMatches();
    const players = getAllPlayers(matches);
    return players.map((player) => ({
        slug: player.slug,
    }));
}

// Enable ISR with 60s revalidation
export const revalidate = 86400;
export const dynamicParams = true; // Allow new details to be generated on demand

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const matches = await fetchAllMatches();
    const player = getPlayerBySlug(slug, matches);

    if (!player) {
        notFound();
    }

    return <PlayerProfileContent player={player} />;
}
