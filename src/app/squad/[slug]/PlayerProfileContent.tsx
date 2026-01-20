"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { History as HistoryIcon } from 'lucide-react';
import { aggregatePlayerStats, getTrendData, enrichPlayerMatches } from '@/lib/playerHelpers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/player/HeroBanner';
import MatchTimeline from '@/components/player/MatchTimeline';
import FormChart from '@/components/player/FormChart';
import DetailedStats from '@/components/player/DetailedStats';
import AICommentary from '@/components/player/AICommentary';
import ComparisonButton from '@/components/player/ComparisonButton';
import FilterBar from '@/components/player/FilterBar';
import dynamicImport from 'next/dynamic';
import { Player } from '@/lib/playerHelpers';

const AdvancedCharts = dynamicImport(() => import('@/components/player/AdvancedCharts'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 border-4 border-black font-mono animate-pulse">LOADING ANALYTICS ENGINE...</div>
});

interface PlayerProfileContentProps {
    player: Player;
}

export default function PlayerProfileContent({ player }: PlayerProfileContentProps) {
    const router = useRouter();
    const [season, setSeason] = useState('All');
    const [competition, setCompetition] = useState('All');

    // Normalize competition name for comparison
    const normalizeCompetition = (comp: string): string => {
        if (!comp) return '';
        const lower = comp.toLowerCase();
        if (lower.includes('laliga') || lower === 'la liga') return 'LaLiga';
        if (lower.includes('champions league')) return 'Champions League';
        if (lower.includes('copa del rey')) return 'Copa del Rey';
        if (lower.includes('super cup') || lower.includes('supercopa')) return 'Super Cup';
        return comp;
    };

    // Filter matches based on season and competition
    const filteredPlayerMatches = {
        ...player,
        matches: player.matches.filter(m => {
            // Season filter
            if (season !== 'All') {
                const matchDate = new Date(m.date);
                if (season === '24/25' && (matchDate < new Date('2024-08-01') || matchDate >= new Date('2025-08-01'))) return false;
                if (season === '25/26' && (matchDate < new Date('2025-08-01') || matchDate >= new Date('2026-08-01'))) return false;
            }
            // Competition filter (normalized)
            if (competition !== 'All') {
                const normalizedMatch = normalizeCompetition(m.competition);
                const normalizedFilter = normalizeCompetition(competition);
                if (normalizedMatch !== normalizedFilter) return false;
            }
            return true;
        })
    };

    const aggregatedStats = aggregatePlayerStats(filteredPlayerMatches);
    const trendData = getTrendData(filteredPlayerMatches);

    // Comic Background Colors Rotating based on ID or Name length to vary it up
    const bgPattern = player.id % 2 === 0 ? 'bg-[#e5e5f7]' : 'bg-[#fffdf5]';

    return (
        <div className={`min-h-screen ${bgPattern} relative flex flex-col font-sans text-black`}>
            {/* Dot Pattern Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none fixed" style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}></div>

            <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 py-8 relative z-10">
                <Navbar />

                {/* Global Filter Bar */}
                <FilterBar
                    season={season}
                    competition={competition}
                    onSeasonChange={setSeason}
                    onCompetitionChange={setCompetition}
                />

                {/* Hero Banner Section with Compare Button */}
                <div className="mb-12 relative">
                    <div className="absolute top-4 right-4 z-30">
                        <ComparisonButton
                            currentPlayer={player.name}
                            onCompare={() => router.push(`/compare?select=${player.slug}`)}
                        />
                    </div>
                    <HeroBanner
                        name={player.name}
                        position={player.position}
                        profileImage={`/images/players/${player.slug}-profile.webp`}
                        stats={aggregatedStats}
                    />
                </div>

                {/* Stats Panels Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* Left Column: AI Commentary */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* AI Commentary Panel (with speech bubble) */}
                        <div className="pb-6">
                            <AICommentary
                                playerName={player.name}
                                position={player.position}
                                stats={aggregatedStats}
                            />
                        </div>
                    </div>

                    {/* Right Column: Form, Advanced Charts & Timeline */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Form Chart Panel */}
                        <div className="relative bg-white border-4 border-black p-1 shadow-[8px_8px_0_#000]">
                            <div className="absolute -top-3 -right-3 bg-red-600 text-white border-4 border-black px-4 py-1 transform rotate-1 z-20">
                                <span className=" text-2xl uppercase" style={{ fontFamily: "var(--font-bangers)" }}>Monthly Form</span>
                            </div>
                            <div className="p-4 bg-slate-50 border-2 border-black">
                                <FormChart
                                    data={trendData}
                                    playerName={player.name}
                                    position={player.position}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Advanced Analytics Section (Full Width) */}
                <div className="mb-12">
                    <AdvancedCharts
                        stats={aggregatedStats}
                        matches={filteredPlayerMatches.matches}
                        playerName={player.name}
                        position={player.position}
                    />
                </div>

                {/* Match Timeline Section */}
                <div className="mb-12">
                    <div className="bg-blue-900 border-4 border-black p-1 shadow-[8px_8px_0_#000]">
                        <div className="bg-white border-2 border-black p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-black text-white flex items-center justify-center  text-2xl rounded-full border-4 border-yellow-400">
                                    <HistoryIcon className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h3 className=" text-4xl uppercase" style={{ fontFamily: "var(--font-bangers)" }}>Match History</h3>
                            </div>
                            <MatchTimeline matches={filteredPlayerMatches.matches} playerName={player.name} playerSlug={player.slug} />
                        </div>
                    </div>
                </div>

                {/* Full Detailed Stats Section */}
                <div className="mb-12">
                    <DetailedStats stats={aggregatedStats} position={player.position} />
                </div>

            </div>

            <Footer />


        </div>
    );
}
