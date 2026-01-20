'use client';

import {
    PossessionStats,
    XGStats,
    TeamStatistics
} from '@/lib/teamStatistics';

interface FlickiFlackaStatsProps {
    possession: PossessionStats;
    xG: XGStats;
    stats: TeamStatistics;
}

export default function FlickiFlackaStats({ possession, xG, stats }: FlickiFlackaStatsProps) {
    return (
        <section className="relative w-full max-w-[1400px] mx-auto px-6 py-12">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-12">
                <h2 className="text-6xl md:text-8xl font-black text-[#004D98] uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-bangers)', textShadow: '4px 4px 0 #000' }}>
                    FLICKI FLACKA
                </h2>
                <div className="bg-black text-[#EDBB00] font-bold uppercase px-3 py-1 transform -skew-x-12 mb-4 md:mb-2 border-2 border-[#EDBB00]">
                    Forget thousands of passes
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Panel 1: Possession (The Schematics) */}
                <div className="group relative bg-[#004D98] p-1 border-4 border-black box-border shadow-[8px_8px_0_#000]">
                    {/* Blueprint Grid BG */}
                    <div className="absolute inset-0 bg-[#004D98] opacity-100" style={{
                        backgroundImage: 'linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>

                    <div className="relative h-full border-2 border-white/30 p-6 flex flex-col">
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <span className="font-mono text-[10px] text-white uppercase border border-white px-1">FIG A.1</span>
                        </div>

                        <h3 className="text-3xl font-black uppercase text-white mb-6 text-center leading-none" style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #000' }}>
                            Possession Control
                        </h3>

                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {/* Technical Circles */}
                            <div className="relative w-56 h-56 flex items-center justify-center">
                                <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}></div>
                                <div className="absolute inset-4 border border-white/10 rounded-full"></div>
                                <div className="absolute inset-8 border border-white/10 rounded-full"></div>

                                {/* Data Circle */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="50%" cy="50%" r="40%"
                                        className="stroke-white/10 fill-none stroke-[8px]"
                                    />
                                    <circle
                                        cx="50%" cy="50%" r="40%"
                                        className="stroke-[#EDBB00] fill-none stroke-[8px] transition-all duration-1000"
                                        pathLength={100}
                                        strokeDasharray="100"
                                        strokeDashoffset={100 - possession.avgPossession}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-6xl font-black text-white" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        {Math.round(possession.avgPossession)}<span className="text-2xl">%</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-[#EDBB00] uppercase tracking-widest mt-[-5px]">Avg. Hold</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Stats */}
                        <div className="grid grid-cols-2 gap-2 mt-6 font-mono text-xs">
                            <div className="bg-black/20 border border-white/30 p-2">
                                <span className="block text-white/60 text-[9px] uppercase">Dictation Games</span>
                                <span className="block text-white font-bold text-lg">{possession.controlMatches}</span>
                            </div>
                            <div className="bg-black/20 border border-white/30 p-2">
                                <span className="block text-white/60 text-[9px] uppercase">Pass Acc.</span>
                                <span className="block text-white font-bold text-lg">{Math.round(stats.avgPassAccuracy)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 2: xG (The Energy Output) */}
                <div className="group relative bg-[#A50044] p-1 border-4 border-black box-border shadow-[8px_8px_0_#000]">
                    {/* Comic Dot BG */}
                    <div className="absolute inset-0 bg-[#A50044] opacity-100 comic-halftone"></div>

                    <div className="relative h-full bg-repeating-linear-gradient-45 from-transparent to-black/5 p-6 flex flex-col">
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <span className="font-mono text-[10px] text-white uppercase border border-white px-1">FIG B.2</span>
                        </div>

                        <h3 className="text-3xl font-black uppercase text-white mb-6 text-center leading-none" style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #000' }}>
                            Attack Efficiency
                        </h3>

                        <div className="flex-1 flex items-end justify-center gap-6 px-4 pb-4">
                            {/* Bar 1 */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="font-mono text-xs text-white/80 mb-2">{xG.avgXG.toFixed(2)}</span>
                                <div className="w-full bg-black/30 border-2 border-white relative h-32">
                                    <div className="absolute bottom-0 left-0 right-0 bg-white/20 h-full" style={{ height: '70%' }}>
                                        <div className="w-full h-[1px] bg-white absolute top-0"></div>
                                    </div>
                                </div>
                                <span className="mt-2 text-[10px] font-black uppercase bg-white text-[#A50044] px-2 py-0.5 transform -skew-x-12">Exp.</span>
                            </div>

                            {/* Bar 2 (Reality) */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="font-mono text-xl text-[#EDBB00] font-bold mb-2 animate-pulse">{xG.avgGoals.toFixed(2)}</span>
                                <div className="w-full bg-[#EDBB00] border-4 border-black relative h-48 shadow-[4px_4px_0_#000] -mt-4 z-10">
                                    <div className="absolute inset-0 bg-[url('/patterns/comic-dots.svg')] opacity-20"></div>
                                </div>
                                <span className="mt-2 text-sm font-black uppercase bg-black text-[#EDBB00] px-3 py-1 transform -skew-x-12 border-2 border-[#EDBB00] shadow-[2px_2px_0_#000]">Real</span>
                            </div>
                        </div>

                        <div className="mt-4 bg-black border-2 border-white p-2">
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-[10px] uppercase text-gray-400">Goals {'>'} xG</span>
                                <span className="font-mono text-lg font-bold text-[#00ff00]">+{xG.overperformance.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 3: Finishing (Target Acquired) */}
                <div className="group relative bg-white p-1 border-4 border-black box-border shadow-[8px_8px_0_#000]">
                    <div className="relative h-full p-6 flex flex-col overflow-hidden">

                        {/* Target Crosshairs Background - Purely CSS lines */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500"></div>
                            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-red-500"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-red-500 rounded-full"></div>
                        </div>

                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <span className="font-mono text-[10px] text-black uppercase border border-black px-1">FIG C.3</span>
                        </div>

                        <h3 className="text-3xl font-black uppercase text-black mb-6 text-center leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Scoring Record
                        </h3>

                        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                            <div className="bg-[#db0030] text-white p-4 border-4 border-black transform rotate-2 shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
                                <span className="block text-center text-xs font-bold uppercase tracking-widest mb-1 text-black/40">Goals / 90</span>
                                <span className="block text-center text-5xl font-black" style={{ fontFamily: 'var(--font-bangers)' }}>{stats.avgGoalsFor.toFixed(2)}</span>
                            </div>

                            <div className="mt-6 w-full">
                                <div className="bg-gray-100 border-2 border-dashed border-gray-400 p-2 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-gray-500">Total Goals</span>
                                    <span className="font-black text-xl text-black">{Math.round(stats.avgGoalsFor * stats.home.matches + stats.away.matches)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 w-full relative z-20">
                            <div className="bg-yellow-300 border-2 border-black p-2 text-center text-[10px] font-bold uppercase tracking-widest transform -rotate-1 shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                                Top Threat: {xG.bestFinishingGame.match.opponent}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}