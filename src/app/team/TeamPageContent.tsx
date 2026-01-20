"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import VisionBanner from '@/components/team/TrophyRace';
import StatementGames from '@/components/team/StatementGames';
import BiggestWins from '@/components/team/BiggestWins';
import {
    getCompletedMatches,
    getFutureMatches,
    getCurrentSeasonPoints,
    getMatchesByCompetition,
    calculateTeamStatistics,
    analyzeTacticalTrends,
    getMatchResult,
    getBiggestWin,
    getBigGameStats,
    getTopStatementWins,
    getPossessionStats,
    getXGStats,
    getFlickPressStats,
    getDuelsStats,
    getSetPieceStats,
    getHomeAwayStats,
    getFormationStats
} from '@/lib/teamStatistics';
import { getAllPlayers } from '@/lib/playerHelpers';
import {
    simulateSeason,
    estimateSimulationParameters,
    type SeasonProjection,
} from '@/lib/monteCarloSimulator';
import FlickiFlackaStats from '@/components/team/FlickiFlackaStats';
import TacticalWarfare from '@/components/team/TacticalWarfare';
import CampaignTracker from '@/components/team/CampaignTracker';
import HeroesGallery from '@/components/team/HeroesGallery';
import { Match } from '@/lib/teamStatistics';

export default function TeamPageContent({ matches: initialMatches }: { matches: Match[] }) {
    // 1. hydrate from props, but allow client-side update
    const [matches, setMatches] = useState<Match[]>(initialMatches);
    const [simCount] = useState<number>(10000);
    const [isSimulating, setIsSimulating] = useState(false);
    const [projection, setProjection] = useState<SeasonProjection | null>(null);

    // 2. Fetch fresh data on mount (bypassing the static build)
    useEffect(() => {
        const fetchFreshData = async () => {
            try {
                const RAW_DATA_URL = 'https://raw.githubusercontent.com/Ezzio11/flick-ball/main/public/data/matches.json';

                const res = await fetch(RAW_DATA_URL);
                if (res.ok) {
                    const freshMatches = await res.json();
                    if (Array.isArray(freshMatches) && freshMatches.length > 0) {
                        console.log("Updated with fresh stats from GitHub!");
                        setMatches(freshMatches);
                    }
                }
            } catch (e) {
                console.warn("Could not fetch fresh stats, keeping build data", e);
            }
        };
        fetchFreshData();
    }, []);

    // Data Hooks (use 'matches' state instead of 'initialMatches' prop)
    const completedMatches = useMemo(() => getCompletedMatches(matches), [matches]);
    const futureMatches = useMemo(() => getFutureMatches(matches), [matches]);
    const laLigaMatches = useMemo(() => getMatchesByCompetition(matches, 'LaLiga'), [matches]);
    const stats = useMemo(() => calculateTeamStatistics(completedMatches), [completedMatches]);
    const currentPoints = useMemo(() => getCurrentSeasonPoints(matches), [matches]);
    const simParams = useMemo(() => estimateSimulationParameters(stats), [stats]);

    // Statement Games Stats
    const topWins = useMemo(() => getTopStatementWins(completedMatches), [completedMatches]);
    const bigGameStats = useMemo(() => getBigGameStats(completedMatches), [completedMatches]);

    // Flick Era Advanced Stats (Chapter 5)
    const possessionStats = useMemo(() => getPossessionStats(completedMatches), [completedMatches]);
    const xGStats = useMemo(() => getXGStats(completedMatches), [completedMatches]);
    const pressingStats = useMemo(() => getFlickPressStats(completedMatches), [completedMatches]);
    const duelsStats = useMemo(() => getDuelsStats(completedMatches), [completedMatches]);
    const setPieceStats = useMemo(() => getSetPieceStats(completedMatches), [completedMatches]);
    const homeAwayStats = useMemo(() => getHomeAwayStats(completedMatches), [completedMatches]);
    const formationStats = useMemo(() => getFormationStats(completedMatches), [completedMatches]);

    // Heroes Gallery Data (Using PlayerHelpers for enriched data)
    const allPlayers = useMemo(() => getAllPlayers(matches), [matches]);
    const heroesData = useMemo(() => {
        return {
            scorers: [...allPlayers].sort((a, b) => b.goals - a.goals),
            assisters: [...allPlayers].sort((a, b) => b.assists - a.assists),
            workhorses: [...allPlayers].sort((a, b) => (b.minutes || 0) - (a.minutes || 0))
        };
    }, [allPlayers]);

    // Derived Stats
    const record = useMemo(() => {
        const results = completedMatches.map(m => getMatchResult(m));
        return {
            wins: results.filter(r => r === 'W').length,
            draws: results.filter(r => r === 'D').length,
            losses: results.filter(r => r === 'L').length,
            total: results.length
        };
    }, [completedMatches]);

    const winRate = ((record.wins / record.total) * 100).toFixed(0);

    useEffect(() => {
        if (laLigaMatches.future.length === 0) {
            setProjection(null);
            return;
        }

        let cancelled = false;
        setIsSimulating(true);

        setTimeout(() => {
            if (cancelled) return;
            const result = simulateSeason(laLigaMatches.future, simParams, simCount, currentPoints.points);
            setProjection(result);
            setIsSimulating(false);
        }, 50);

        return () => { cancelled = true; };
    }, [laLigaMatches.future, simParams, simCount, currentPoints.points]);

    return (
        <div className="min-h-screen bg-[#0a0f1c] font-sans selection:bg-[#A50044] selection:text-white">

            {/* Back Nav */}
            <div className="absolute top-8 left-4 md:left-8 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white/80 hover:text-[#EDBB00] transition-colors font-bold uppercase tracking-wider text-sm"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* ==================================================================
               CHAPTER 1: THE REVOLUTION (HERO)
               ================================================================== */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b-8 border-[#A50044]">
                {/* Background: Flick Image + Gradient */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/flicktreble.webp"
                        alt="Hansi Flick"
                        fill
                        className="object-cover object-top opacity-50 md:opacity-100 mix-blend-overlay md:mix-blend-normal"
                        priority
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#004D98] via-[#004D98]/80 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-[1400px] px-6 grid md:grid-cols-2">
                    <div className="pt-20 md:pt-0">
                        <div className="inline-block bg-[#EDBB00] text-[#004D98] font-black px-3 py-1 text-sm uppercase mb-4 tracking-widest transform -skew-x-12">
                            HANSI ARRIVES
                        </div>
                        <h1 className="text-7xl md:text-[8rem] font-black uppercase leading-[0.85] text-white tracking-tighter mb-8" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Total<br />
                            <span className="text-[#A50044]">Dominance</span>
                        </h1>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 max-w-md">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-gray-300 font-bold uppercase text-sm tracking-wider">Win Rate</span>
                                <span className="text-5xl font-black text-white" style={{ fontFamily: 'var(--font-bangers)' }}>{winRate}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/20">
                                <div className="h-full bg-[#EDBB00]" style={{ width: `${winRate}%` }}></div>
                            </div>
                            <div className="mt-4 flex gap-4 text-sm font-mono text-gray-300">
                                <span><strong className="text-white">{record.wins}</strong> Wins</span>
                                <span><strong className="text-white">{record.draws}</strong> Draws</span>
                                <span><strong className="text-white">{record.losses}</strong> Losses</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================================================================
               CHAPTER 2: THE CAMPAIGN (STATUS REPORT)
               ================================================================== */}
            <section className="bg-white py-12 relative overflow-hidden">
                {/* Background Pattern: Halftone */}
                <div className="absolute inset-0 pointer-events-none z-0 comic-halftone opacity-10"></div>

                {/* A. CampaignTracker (The Quest) */}
                <div className="mb-24">
                    <CampaignTracker
                        homeAway={homeAwayStats}
                        formations={formationStats}
                        stats={stats}
                    />
                </div>

                {/* B. HeroesGallery (The Squad) */}
                <div className="mb-24">
                    <HeroesGallery
                        scorers={heroesData.scorers}
                        assisters={heroesData.assisters}
                        workhorses={heroesData.workhorses}
                    />
                </div>

                {/* C. The System (Stats) */}
                <div className="max-w-[1400px] mx-auto px-6 mb-16">
                    <div className="flex flex-col items-center mb-12">
                        <h2 className="text-6xl md:text-8xl font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-bangers)' }}>
                            THE SYSTEM
                        </h2>
                        <div className="w-32 h-2 bg-[#A50044] mt-2"></div>
                    </div>

                    <FlickiFlackaStats
                        possession={possessionStats}
                        xG={xGStats}
                        stats={stats}
                    />

                    <div className="mt-16">
                        <TacticalWarfare
                            pressing={pressingStats}
                            duels={duelsStats}
                            setPieces={setPieceStats}
                        />
                    </div>
                </div>
            </section>

            {/* ==================================================================
               CHAPTER 3: STATEMENT GAMES (THE PROOF)
               ================================================================== */}
            <section className="bg-[#0a0f1c] py-24 px-6 relative border-t-8 border-[#EDBB00]">
                <div className="max-w-[1400px] mx-auto">
                    <BiggestWins topWins={topWins} />
                    <StatementGames
                        bigGameStats={bigGameStats}
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
}
