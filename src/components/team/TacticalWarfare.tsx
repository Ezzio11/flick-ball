'use client';

import {
    FlickPressStats,
    DuelsStats,
    SetPieceStats
} from '@/lib/teamStatistics';

interface TacticalWarfareProps {
    pressing: FlickPressStats;
    duels: DuelsStats;
    setPieces: SetPieceStats;
}

import { Shield, Plane, AlertTriangle, Crosshair } from 'lucide-react';

export default function TacticalWarfare({ pressing, duels, setPieces }: TacticalWarfareProps) {
    return (
        <section className="relative w-full max-w-[1400px] mx-auto px-6 py-12">

            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-end justify-end gap-4 mb-16">
                <div className="bg-[#A50044] text-white font-black uppercase px-4 py-2 transform rotate-2 border-4 border-black shadow-[6px_6px_0_#000]">
                    WAR ROOM
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-bangers)', textShadow: '4px 4px 0 #A50044' }}>
                    TACTICAL WARFARE
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Panel 1: The Press (Pressure Cooker) */}
                <div className="group relative bg-[#0a0f1c] p-1 border-4 border-black box-border shadow-[8px_8px_0_#000]">
                    {/* Danger Warning Stripes */}
                    <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#EDBB00_10px,#EDBB00_20px)] z-20 border-b-2 border-black"></div>
                    <div className="absolute bottom-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#EDBB00_10px,#EDBB00_20px)] z-20 border-t-2 border-black"></div>

                    <div className="relative h-full pt-8 pb-8 px-6 flex flex-col bg-[#1a1a1a]">
                        <h3 className="text-4xl font-black uppercase text-white mb-6 text-center leading-none" style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #black' }}>
                            The Press
                        </h3>

                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {/* Gauge */}
                            <div className="w-48 h-24 bg-black rounded-t-full relative border-4 border-gray-600 overflow-hidden group-hover:bg-[#2a2a2a] transition-colors">
                                {/* Colored Zones */}
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 opacity-80"></div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full z-20 border-2 border-black"></div>
                                {/* Needle */}
                                <div className="absolute bottom-2 left-1/2 w-1 h-20 bg-black z-10 origin-bottom transform transition-all duration-1000 ease-out"
                                    style={{ transform: `translateX(-50%) rotate(${(pressing.intensityScore / 100) * 180 - 90}deg)` }}>
                                    <div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
                                </div>
                            </div>

                            <div className="bg-black text-red-500 border-2 border-red-500 px-3 py-1 mt-2 text-xl font-black font-mono shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                                {Math.round(pressing.intensityScore)} PSI
                            </div>
                        </div>

                        <div className="mt-6 space-y-2 font-mono text-xs">
                            <div className="flex justify-between text-gray-400 border-b border-gray-700 pb-1">
                                <span>OPP. BOX TOUCHES</span>
                                <span className="text-white font-bold">{Math.round(pressing.avgTouchesInOppBox)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400 border-b border-gray-700 pb-1">
                                <span>DEF. ACTIONS</span>
                                <span className="text-white font-bold">{Math.round(pressing.avgDefensiveActions)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 2: Duels (The Brawl) */}
                <div className="group relative bg-[#EDBB00] p-1 border-4 border-black box-border shadow-[8px_8px_0_#000]">
                    {/* Retro Comic Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('/patterns/comic-dots.svg')]"></div>

                    <div className="relative h-full p-6 flex flex-col items-center">
                        <div className="bg-black text-white px-4 py-1 transform -rotate-2 border-2 border-white mb-6 shadow-[4px_4px_0_#000]">
                            <h3 className="text-2xl font-black uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>Physicality</h3>
                        </div>

                        <div className="w-full h-full flex flex-col justify-center relative">
                            {/* VS Graphic */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                                <span className="text-[120px] font-black italic">VS</span>
                            </div>

                            <div className="flex justify-between items-center w-full z-10 mb-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0_#000]">
                                        <Shield className="text-black" size={32} />
                                    </div>
                                    <div className="bg-black text-white text-xs font-bold uppercase px-2 py-0.5">Ground</div>
                                    <div className="text-3xl font-black mt-1">{Math.round(duels.groundDuelsWonPct)}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0_#000]">
                                        <Plane className="text-black transform rotate-45" size={32} />
                                    </div>
                                    <div className="bg-black text-white text-xs font-bold uppercase px-2 py-0.5">Aerial</div>
                                    <div className="text-3xl font-black mt-1">{Math.round(duels.aerialDuelsWonPct)}%</div>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-black p-3 transform rotate-1 text-center shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                                <span className="block text-xs uppercase font-bold text-gray-400">Total Dominance</span>
                                <span className="block text-5xl font-black text-black leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>{Math.round(duels.totalDuelsWonPct)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 3: Set Pieces (Danger Zone) */}
                <div className="group relative bg-[#db0030] p-1 border-4 border-black box-border shadow-[8px_8px_0_#000]">
                    {/* Caution Stripes Background */}
                    <div className="absolute inset-0 bg-[#db0030] opacity-100" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                    }}></div>

                    <div className="relative h-full p-6 flex flex-col text-white">
                        <div className="absolute -top-3 -right-3 bg-yellow-400 text-black border-2 border-black p-2 rounded-full z-20">
                            <AlertTriangle size={24} strokeWidth={3} />
                        </div>

                        <h3 className="text-3xl font-black uppercase mb-8 text-left leading-none transform -skew-x-6" style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #000' }}>
                            Danger<br />Zone
                        </h3>

                        <div className="flex-1 flex flex-col justify-center gap-6">

                            {/* Threat Level */}
                            <div className="bg-black/20 border-l-4 border-yellow-400 p-4">
                                <span className="block text-xs font-bold uppercase mb-1 opacity-80">Threat Level</span>
                                <div className="flex gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-2 flex-1 ${i < setPieces.threatLevel / 2 ? 'bg-yellow-400' : 'bg-gray-800'}`}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Corners */}
                            <div className="bg-black/20 border-l-4 border-white p-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="block text-xs font-bold uppercase mb-1 opacity-80">Corners / 90</span>
                                        <span className="text-4xl font-black" style={{ fontFamily: 'var(--font-bangers)' }}>{setPieces.cornersPerGame.toFixed(1)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-bold uppercase mb-1 opacity-80">xG / Set</span>
                                        <span className="text-2xl font-black font-mono">{setPieces.xGSetPlayPerGame.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
