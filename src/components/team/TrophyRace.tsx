"use client";

import Image from 'next/image';
import { Trophy, Calendar, ArrowRight } from 'lucide-react';
import type { SeasonProjection, MatchPrediction } from '@/lib/monteCarloSimulator';

interface TrophyRaceProps {
    projection: SeasonProjection;
    currentPoints: number;
    isSimulating: boolean;
}

export default function VisionBanner({ projection, currentPoints, isSimulating }: TrophyRaceProps) {
    const titleProbability = projection.positionOdds.first;
    const upcomingMatches = projection.matchPredictions.slice(0, 5);

    return (
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-[#EDBB00]/30 group">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/flicktreble.webp"
                    alt="Vision"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1c] via-[#0a0f1c]/90 to-transparent"></div>
            </div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">

                {/* Left: The Vision */}
                <div className="flex-grow max-w-xl">
                    <div className="flex items-center gap-2 mb-2 text-[#EDBB00]">
                        <Trophy size={20} />
                        <span className="text-sm font-bold uppercase tracking-widest">The Ultimate Target</span>
                    </div>

                    <h3 className="text-5xl md:text-6xl font-black uppercase text-white leading-none mb-6 italic" style={{ fontFamily: 'var(--font-bangers)' }}>
                        LaLiga <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EDBB00] to-[#FDB931]">Glory</span>
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-2 flex justify-between text-sm font-bold uppercase text-white/80">
                        <span>Title Probability</span>
                        <span className="text-[#EDBB00]">{(titleProbability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-[#EDBB00] to-[#FDB931]"
                            style={{ width: `${titleProbability * 100}%` }}
                        ></div>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm font-medium leading-relaxed">
                        Based on Monte Carlo simulations of the remaining {upcomingMatches.length} matches.
                        Current trajectory puts us at <span className="text-white font-bold">{projection.totalPoints.mean.toFixed(0)} points</span>.
                    </p>
                </div>

                {/* Right: Next Step */}
                <div className="w-full md:w-auto bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg min-w-[300px]">
                    <h4 className="text-[#004D98] font-black uppercase text-xl mb-4 bg-white px-2 py-1 inline-block transform -skew-x-6">
                        Next Battle
                    </h4>

                    {upcomingMatches.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        {upcomingMatches[0].opponent}
                                    </div>
                                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                                        {upcomingMatches[0].isHome ? 'Home @ Camp Nou' : 'Away Fixture'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-[#EDBB00]">{(upcomingMatches[0].probWin * 100).toFixed(0)}%</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Win Prob</div>
                                </div>
                            </div>

                            <div className="flex gap-2 text-xs font-mono border-t border-white/10 pt-3 text-gray-400">
                                <Calendar size={14} />
                                <span>{new Date(upcomingMatches[0].date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Simulation Status */}
            {isSimulating && (
                <div className="absolute top-4 right-4 text-[#EDBB00] animate-pulse text-xs font-bold uppercase border border-[#EDBB00] px-3 py-1 rounded-full">
                    Updating Projections...
                </div>
            )}
        </div>
    );
}
