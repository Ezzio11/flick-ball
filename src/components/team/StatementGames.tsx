"use client";

import Link from 'next/link';
import { Trophy, Zap, MessageCircle, BarChart2, User, Activity } from 'lucide-react';
import { getMatchResult, type Match } from '@/lib/teamStatistics';

interface BigGameStats {
    matches: Match[];
    record: { wins: number; draws: number; losses: number };
    winRate: number;
    goalsFor: number;
    goalsAgainst: number;
}

interface StatementGamesProps {
    bigGameStats: BigGameStats;
}

export default function StatementGames({ bigGameStats }: StatementGamesProps) {
    // Sort matches by date descending AND filter out Losses (keep Wins/Draws)
    const sortedBigGames = [...bigGameStats.matches]
        .filter(m => getMatchResult(m) !== 'L')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="w-full">
            <h3 className="text-5xl font-black uppercase mb-12 text-[#EDBB00] tracking-widest text-center" style={{ fontFamily: 'var(--font-bangers)', textShadow: '4px 4px 0 #000' }}>
                The Anthology
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. MATCH CARDS GRID (Left 2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {sortedBigGames.map((match, idx) => (
                        <Link href={`/matches/${match.id}`} key={idx} className="block group cursor-pointer">
                            {/* COMIC CARD */}
                            <div className="relative bg-white border-4 border-black p-0 shadow-[8px_8px_0_#000] transform group-hover:-translate-y-1 group-hover:scale-[1.01] transition-all duration-300 overflow-hidden">
                                {/* Header Strip */}
                                <div className="bg-black text-white px-4 py-2 flex justify-between items-center border-b-4 border-black">
                                    <span className="font-bold uppercase tracking-widest text-sm">{match.competition}</span>
                                    <span className="font-mono text-xs text-[#EDBB00]">{new Date(match.date).toLocaleDateString()}</span>
                                </div>

                                <div className="p-6 relative">
                                    {/* Halftone BG */}
                                    <div className="absolute inset-0 opacity-10 comic-halftone pointer-events-none"></div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">

                                        {/* Matchup & Score */}
                                        <div className="flex-1">
                                            <div className="text-xs font-bold uppercase text-gray-400 mb-1">VS Enemy</div>
                                            <h4 className="text-4xl md:text-5xl font-black uppercase text-[#004D98] leading-none mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {match.opponent}
                                            </h4>
                                            <div className="inline-block bg-[#db0030] text-white border-3 border-black px-3 py-1 transform -rotate-2 group-hover:rotate-0 transition-transform">
                                                <span className="text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>{match.score}</span>
                                            </div>
                                        </div>

                                        {/* Comic Style Battle Stats */}
                                        <div className="w-full md:w-auto relative group-hover:scale-105 transition-transform duration-300">
                                            {/* decorative backdrop */}
                                            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 md:translate-x-2 md:translate-y-2"></div>

                                            <div className="relative bg-[#ffed02] border-3 border-black p-3 md:min-w-[200px] flex flex-col justify-between h-full">
                                                {/* Header */}
                                                <div className="absolute -top-3 -right-2 bg-[#db0030] text-white text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black transform rotate-2">
                                                    Intel
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Possession - The Anchor */}
                                                    <div className="bg-white border-2 border-black p-1 text-center shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                                                        <span className="block text-[8px] font-bold uppercase text-gray-500 leading-none mb-0.5">Possession</span>
                                                        <span className="text-xl font-black text-[#004d98]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                            {match.stats?.possession || '-'}%
                                                        </span>
                                                    </div>

                                                    {/* xG - The Impact */}
                                                    <div className="bg-white border-2 border-black p-1 text-center shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                                                        <span className="block text-[8px] font-bold uppercase text-gray-500 leading-none mb-0.5">xG</span>
                                                        <span className="text-xl font-black text-[#db0030]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                            {match.stats?.xG || '-'}
                                                        </span>
                                                    </div>

                                                    {/* Shots - Volume */}
                                                    <div className="bg-white border-2 border-black p-1 text-center shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                                                        <span className="block text-[8px] font-bold uppercase text-gray-500 leading-none mb-0.5">Shots</span>
                                                        <span className="text-xl font-black text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                            {match.stats?.totalShots || '-'}
                                                        </span>
                                                    </div>

                                                    {/* Big Chances - Danger */}
                                                    <div className="bg-white border-2 border-black p-1 text-center shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                                                        <span className="block text-[8px] font-bold uppercase text-gray-500 leading-none mb-0.5">Big Ch.</span>
                                                        <span className="text-xl font-black text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                            {match.stats?.bigChances || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scorers List (Propaganda) - Only if NOT a loss (double safety) */}
                                    {match.scorers && match.scorers.length > 0 && getMatchResult(match) !== 'L' && (
                                        <div className="mt-6 pt-4 border-t-2 border-black/10 relative z-10">
                                            <div className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                                                <User size={12} /> The Protagonists
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {match.scorers.filter(s => s.team === 'barca').map((scorer, i) => (
                                                    <span key={i} className="inline-block bg-black text-[#EDBB00] text-xs font-bold px-2 py-0.5 border border-black transform rotate-1">
                                                        {scorer.player} {scorer.minute}'
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 text-[10px] font-black uppercase text-black bg-[#EDBB00] px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Match Report →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 2. SUMMARY SIDEBAR (Right 1/3) - Clash of Titans Reduced */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-8">
                        {/* Summary Card */}
                        <div className="bg-[#A50044] border-4 border-black p-6 text-center shadow-[8px_8px_0_#000] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 comic-halftone pointer-events-none"></div>

                            <h4 className="text-3xl font-black uppercase text-white mb-6 relative z-10" style={{ fontFamily: 'var(--font-bangers)' }}>
                                Titan<br />Slayer
                            </h4>

                            <div className="bg-white border-3 border-black p-4 transform -rotate-2 mb-4 relative z-10">
                                <span className="block text-xs font-bold uppercase text-gray-500">Win Rate vs Elites</span>
                                <span className="text-6xl font-black text-[#004D98]" style={{ fontFamily: 'var(--font-bangers)' }}>{bigGameStats.winRate.toFixed(0)}%</span>
                            </div>

                            <div className="flex gap-2 justify-center relative z-10">
                                <div className="bg-green-500 text-white font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000] flex flex-col">
                                    <span className="text-2xl">{bigGameStats.record.wins}</span>
                                    <span className="text-[8px] uppercase">Wins</span>
                                </div>
                                <div className="bg-gray-200 text-black font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000] flex flex-col">
                                    <span className="text-2xl">{bigGameStats.record.draws}</span>
                                    <span className="text-[8px] uppercase">Draws</span>
                                </div>
                                <div className="bg-red-500 text-white font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000] flex flex-col">
                                    <span className="text-2xl">{bigGameStats.record.losses}</span>
                                    <span className="text-[8px] uppercase">Losses</span>
                                </div>
                            </div>

                            {/* BATTLE REPORT: Comic Style Revamp */}
                            <div className="mt-8 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 border-2 border-black px-3 py-1 z-20 transform -rotate-2 shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                                    <span className="text-xs font-black uppercase tracking-widest text-black">Battle Report</span>
                                </div>

                                <div className="bg-white border-3 border-black p-4 pt-6 shadow-[6px_6px_0_#000] relative">
                                    <div className="absolute inset-0 opacity-10 comic-halftone pointer-events-none"></div>

                                    {/* Row 1: The Damage (Goals) */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                                        <div className="bg-[#e5f9f6] border-2 border-black p-2 text-center transform -rotate-1 hover:rotate-0 transition-transform">
                                            <span className="block text-[9px] font-bold uppercase text-gray-500 mb-1">Goals For</span>
                                            <span className="text-4xl font-black text-[#00a651] leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {bigGameStats.goalsFor}
                                            </span>
                                        </div>
                                        <div className="bg-[#ffe5e5] border-2 border-black p-2 text-center transform rotate-1 hover:rotate-0 transition-transform">
                                            <span className="block text-[9px] font-bold uppercase text-gray-500 mb-1">Goals Against</span>
                                            <span className="text-4xl font-black text-[#ed1c24] leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {bigGameStats.goalsAgainst}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Row 2: The Tactics */}
                                    <div className="grid grid-cols-3 gap-2 relative z-10">
                                        {/* Clean Sheets */}
                                        <div className="flex flex-col items-center justify-center bg-gray-100 border-2 border-black p-1 shadow-[2px_2px_0_#000]">
                                            <span className="text-[8px] font-black uppercase text-gray-400">Clean Sheets</span>
                                            <span className="text-2xl font-black text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {bigGameStats.matches.filter(m => {
                                                    const parts = m.score.split('-').map(s => parseInt(s));
                                                    const conceded = m.isHome ? parts[1] : parts[0];
                                                    return conceded === 0;
                                                }).length}
                                            </span>
                                        </div>

                                        {/* Possession */}
                                        <div className="flex flex-col items-center justify-center bg-[#004D98] border-2 border-black p-1 shadow-[2px_2px_0_#000]">
                                            <span className="text-[8px] font-black uppercase text-white/80">Avg. Possession</span>
                                            <span className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {bigGameStats.matches.length > 0
                                                    ? Math.round(bigGameStats.matches.reduce((sum, m) => sum + (m.stats?.possession || 50), 0) / bigGameStats.matches.length)
                                                    : 0}%
                                            </span>
                                        </div>

                                        {/* Shots */}
                                        <div className="flex flex-col items-center justify-center bg-[#EDBB00] border-2 border-black p-1 shadow-[2px_2px_0_#000]">
                                            <span className="text-[8px] font-black uppercase text-black/70">Avg. Shots</span>
                                            <span className="text-2xl font-black text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {bigGameStats.matches.length > 0
                                                    ? (bigGameStats.matches.reduce((sum, m) => sum + (m.stats?.totalShots || 0), 0) / bigGameStats.matches.length).toFixed(1)
                                                    : 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
