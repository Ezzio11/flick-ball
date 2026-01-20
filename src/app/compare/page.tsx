
import ComparisonSelectionContent from './ComparisonSelectionContent';
import { fetchAllMatches } from '@/lib/dataFetcher';

export const revalidate = 3600;

export default async function ComparePage() {
    const matches = await fetchAllMatches();
    return <ComparisonSelectionContent matches={matches} />;
}
