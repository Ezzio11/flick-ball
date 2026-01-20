import TeamPageContent from './TeamPageContent';
import { fetchAllMatches } from '@/lib/dataFetcher';

export const revalidate = 3600; // Update every hour

export default async function TeamPage() {
    const matches = await fetchAllMatches();
    const officialMatches = matches.filter(m => m.competition !== 'Club Friendlies');
    return <TeamPageContent matches={officialMatches} />;
}
