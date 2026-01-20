import { INGESTED_MATCHES } from './data_ingested';
import { Match } from './teamStatistics';

export async function fetchAllMatches(): Promise<Match[]> {
    const dataUrl = process.env.DATA_URL;

    if (dataUrl) {
        try {
            console.log(`Fetching data from ${dataUrl}...`);
            const res = await fetch(dataUrl, {
                next: { revalidate: 3600 } // Revalidate every hour
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch data: ${res.statusText}`);
            }

            const data = await res.json();

            // Basic validation to ensure it looks like an array of matches
            if (Array.isArray(data) && data.length > 0 && data[0].id) {
                console.log(`Successfully fetched ${data.length} matches from external source.`);
                return data as Match[];
            } else {
                console.warn("Fetched data invalid format, falling back to local.");
            }
        } catch (error) {
            console.error("Error fetching external data, using fallback:", error);
        }
    }

    return INGESTED_MATCHES as unknown as Match[];
}
