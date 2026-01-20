
import SquadContent from './SquadContent';
import { fetchAllMatches } from '@/lib/dataFetcher';

export const revalidate = 3600;

export default async function SquadPage() {
    const matches = await fetchAllMatches();
    return <SquadContent matches={matches} />;
}
