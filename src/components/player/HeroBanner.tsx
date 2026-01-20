"use client";

import Image from 'next/image';
import { useState } from 'react';
import { AggregatedStats } from '@/lib/playerHelpers';
import { cn } from '@/lib/utils';
import PerformanceRadar from './PerformanceRadar';

interface HeroBannerProps {
    name: string;
    position: string;
    profileImage: string;
    stats: AggregatedStats;
}

export default function HeroBanner({ name, position, profileImage, stats }: HeroBannerProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="relative w-full overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0_#000]">

            {/* Comic Header Strip */}
            <div className="bg-yellow-400 border-b-4 border-black p-2 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                    <span className="uppercase text-xl ml-2 tracking-wide" style={{ fontFamily: 'var(--font-bangers)' }}>PLAYER FILE</span>
                </div>
                <div className="font-mono font-bold text-xs uppercase bg-black text-white px-2 py-1 transform -rotate-1">
                    SEASON 24/25
                </div>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">

                {/* Left: Large Profile Image */}
                <div className="lg:col-span-5 relative bg-[#a50044] overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-black min-h-[350px]">
                    {/* Comic Burst Background - Inverted Magical Halftone */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle, #004d98 28%, transparent 29%), radial-gradient(circle, #004d98 28%, transparent 29%)',
                        backgroundPosition: '0 0, 7px 7px',
                        backgroundSize: '14px 14px',
                        maskImage: 'radial-gradient(circle at center, black 40%, rgba(0,0,0,0.4) 100%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0,0,0,0.4) 100%)'
                    }}></div>

                    {/* Profile Image - Large and Centered */}
                    <div className="absolute inset-0 flex items-end justify-center">
                        {!imageError ? (
                            <Image
                                src={profileImage}
                                alt={name}
                                width={400}
                                height={500}
                                className="object-contain object-bottom max-h-full w-auto drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                                priority
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-48 h-48 bg-gray-300 border-4 border-black flex items-center justify-center">
                                <span className="text-6xl text-gray-500" style={{ fontFamily: 'var(--font-bangers)' }}>{name.charAt(0)}</span>
                            </div>
                        )}
                    </div>

                    {/* Position Label - Comic Badge */}
                    <div className="absolute top-6 left-6 z-10">
                        <div className="bg-red-600 text-white border-4 border-black px-4 py-2 transform -rotate-3 hover:scale-110 transition-transform shadow-[4px_4px_0_#000]">
                            <span className="text-2xl uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>{position}</span>
                        </div>
                    </div>

                    {/* Name Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl text-white uppercase leading-none drop-shadow-[4px_4px_0_#000]" style={{ WebkitTextStroke: '2px black', fontFamily: 'var(--font-bangers)' }}>
                            {name}
                        </h1>
                    </div>
                </div>

                {/* Right: Stats + Radar Panel */}
                <div className="lg:col-span-7 bg-white flex flex-col">
                    {/* Top: Key Stats */}
                    <div className="p-6 border-b-4 border-black">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-3xl uppercase text-black leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>Season Stats</h2>
                            <span className="font-mono text-xs bg-black text-white px-2 py-1">FC BARCELONA</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            <StatBox label="Apps" value={stats.appearances} color="bg-blue-100" />

                            {/* Dynamic Stats based on Position */}
                            {(position === 'GK' || position === 'Goalkeeper') && (
                                <>
                                    <StatBox label="Clean Sheets" value={stats.totalCleanSheets || 0} color="bg-yellow-100" />
                                    <StatBox label="Saves" value={stats.totalSaves || 0} color="bg-red-100" />
                                </>
                            )}
                            {(position === 'DEF' || position === 'Defender' || position === 'CB' || position === 'RB' || position === 'LB') && (
                                <>
                                    <StatBox label="Tackles" value={stats.totalTackles || 0} color="bg-yellow-100" />
                                    <StatBox label="Duels Won" value={stats.totalDuelsWon || 0} color="bg-red-100" />
                                </>
                            )}
                            {(position === 'MID' || position === 'Midfielder' || position === 'CM' || position === 'CDM' || position === 'CAM') && (
                                <>
                                    <StatBox label="Assists" value={stats.totalAssists} color="bg-yellow-100" />
                                    <StatBox label="Chances" value={stats.totalChancesCreated || 0} color="bg-red-100" />
                                </>
                            )}
                            {(position === 'FWD' || position === 'Forward' || position === 'ST' || position === 'LW' || position === 'RW') && (
                                <>
                                    <StatBox label="Goals" value={stats.totalGoals} color="bg-red-100" />
                                    <StatBox label="Assists" value={stats.totalAssists} color="bg-yellow-100" />
                                </>
                            )}
                            {/* Fallback for unknown positions or simple default */}
                            {!['GK', 'Goalkeeper', 'DEF', 'Defender', 'CB', 'RB', 'LB', 'MID', 'Midfielder', 'CM', 'CDM', 'CAM', 'FWD', 'Forward', 'ST', 'LW', 'RW'].includes(position) && (
                                <>
                                    <StatBox label="Goals" value={stats.totalGoals} color="bg-red-100" />
                                    <StatBox label="Assists" value={stats.totalAssists} color="bg-yellow-100" />
                                </>
                            )}

                            <StatBox label="FBI Rating" value={stats.avgRating.toFixed(1)} color="bg-green-100" helpLink="/about-fbi" />
                        </div>
                    </div>

                    {/* Bottom: Radar Chart */}
                    <div className="flex-grow p-4 bg-gray-50">
                        <PerformanceRadar stats={stats} position={position} />
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

function StatBox({ label, value, color, highlight, helpLink }: { label: string; value: number | string; color: string; highlight?: boolean; helpLink?: string }) {
    return (
        <div className={cn(
            "border-3 border-black p-3 flex flex-col items-center justify-center relative hover:-translate-y-1 transition-transform",
            color,
            highlight ? "shadow-[4px_4px_0_#000]" : "shadow-[2px_2px_0_#000]"
        )}>
            <div className="flex items-center gap-1 mb-1">
                <span className="font-bold text-[10px] uppercase tracking-widest text-black/60" style={{ fontFamily: 'var(--font-comic)' }}>{label}</span>
                {helpLink && (
                    <Link href={helpLink} className="text-black/40 hover:text-black transition-colors">
                        <HelpCircle size={10} />
                    </Link>
                )}
            </div>
            <span className="text-3xl text-black leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>{value}</span>
        </div>
    );
}
