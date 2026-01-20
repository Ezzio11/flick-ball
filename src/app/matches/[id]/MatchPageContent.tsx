"use client";

import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { formatMatchDate, MatchResult } from '@/lib/matchHelpers';
import MatchHero from '@/components/match/MatchHero';
import StatsComparison from '@/components/match/StatsComparison';
import TeamStatsGrid from '@/components/match/TeamStatsGrid';
import RainEffect from '@/components/effects/RainEffect';
import dynamicImport from 'next/dynamic';

// Lazy load heavy components
const GoalTimeline = dynamicImport(() => import('@/components/match/GoalTimeline'), {
    loading: () => <div className="h-48 bg-gray-100 animate-pulse border-4 border-black/10 rounded mb-8" />
});

const MatchCharts = dynamicImport(() => import('@/components/match/MatchCharts'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse border-4 border-black/10 rounded mb-8" />
});

interface MatchPageContentProps {
    match: any;
    barcelonaGoals: number;
    opponentGoals: number;
    result: MatchResult;
}

export default function MatchPageContent({ match, barcelonaGoals, opponentGoals, result }: MatchPageContentProps) {
    const formattedDate = formatMatchDate(match.date);
    const id = match.id;

    // Determine match theme
    const isRainyNight = id === '4621537'; // Benfica match
    // const isSunnyDay = id === '4507097'; // Madrid 4-3
    // const isNight = id === '4506859' || id === '4621509'; // Madrid 4-0 or Bayern

    return (
        <div className={`min-h-screen relative flex flex-col ${isRainyNight ? 'bg-[#0f1419]' : 'bg-[#fffdf5]'}`}>
            {/* Background Pattern */}
            <div className={`absolute inset-0 pointer-events-none fixed ${isRainyNight ? 'opacity-5' : 'opacity-10'}`} style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}></div>

            {/* Canvas Rain Effect for Rainy Night */}
            {isRainyNight && <RainEffect />}


            <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 py-8 relative z-10">
                {/* Back Button */}
                <Link href="/" className={`inline-block mb-6 comic-button px-6 py-2 text-xl font-bold uppercase transform -skew-x-10 shadow-[6px_6px_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 active:bg-black active:text-white transition-all border-3 border-black ${isRainyNight ? 'bg-[#1a1f2e] text-white' : 'bg-white text-black'}`}>
                    ← Back Home
                </Link>

                {/* Match Hero */}
                <MatchHero
                    match={match}
                    barcelonaGoals={barcelonaGoals}
                    opponentGoals={opponentGoals}
                    result={result}
                    formattedDate={formattedDate}
                />

                {/* Stats Comparison */}
                <StatsComparison match={match} />

                {/* Goal Timeline */}
                {match.scorers && match.scorers.length > 0 && (
                    <GoalTimeline
                        scorers={match.scorers}
                        isHome={match.isHome}
                        score={match.score}
                    />
                )}

                {/* Match Charts */}
                <MatchCharts match={match} />

                {/* Team Stats Grid */}
                <TeamStatsGrid match={match} />
            </div>

            <Footer />
        </div>
    );
}
