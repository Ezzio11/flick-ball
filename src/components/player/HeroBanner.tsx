"use client";

import Image from 'next/image';
import { useState } from 'react';
import { AggregatedStats } from '@/lib/playerHelpers';
import { cn } from '@/lib/utils';
import PerformanceRadar, { MetricSet, METRIC_SETS, getDefaultSet, getAvailableSets } from './PerformanceRadar';

interface HeroBannerProps {
    name: string;
    position: string;
    profileImage: string;
    stats: AggregatedStats;
}

export default function HeroBanner({ name, position, profileImage, stats }: HeroBannerProps) {
    const [imageError, setImageError] = useState(false);

    // Determine initial category based on position
    const effectivePosition = (['GK', 'Goalkeeper'].includes(position)) ? 'Goalkeeper' :
        (['CB', 'RB', 'LB', 'RWB', 'LWB', 'DEF', 'Defender'].includes(position)) ? 'Defender' :
            (['CDM', 'CM', 'CAM', 'RM', 'LM', 'MID', 'Midfielder'].includes(position)) ? 'Midfielder' :
                'Forward';

    const defaultCategory = getDefaultSet(effectivePosition);
    const [activeCategory, setActiveCategory] = useState<MetricSet>(defaultCategory);

    const availableCategories = getAvailableSets(effectivePosition);
    const filteredMetricSets = METRIC_SETS.filter(s => availableCategories.includes(s.id));

    // Stats configuration mapping
    const getStatsForCategory = (category: MetricSet) => {
        switch (category) {
            case 'attacking':
                return [
                    { label: 'Goals', value: stats.totalGoals, color: 'bg-red-100' },
                    { label: 'xG', value: stats.totalxG?.toFixed(2) || '0.00', color: 'bg-red-50' },
                    { label: 'Shots', value: stats.totalShots || 0, color: 'bg-orange-100' },
                    { label: 'Big Chances', value: stats.totalBigChances || 0, color: 'bg-yellow-100' }
                ];
            case 'creative':
                return [
                    { label: 'Assists', value: stats.totalAssists, color: 'bg-yellow-100' },
                    { label: 'xA', value: stats.totalxA?.toFixed(2) || '0.00', color: 'bg-yellow-50' },
                    { label: 'Key Passes', value: stats.totalKeyPasses || 0, color: 'bg-orange-100' },
                    { label: 'Chances', value: stats.totalChancesCreated || 0, color: 'bg-red-100' }
                ];
            case 'defensive':
                return [
                    { label: 'Tackles', value: stats.totalTackles || 0, color: 'bg-blue-100' },
                    { label: 'Interceptions', value: stats.totalInterceptions || 0, color: 'bg-blue-50' },
                    { label: 'Duels Won', value: stats.totalDuelsWon || 0, color: 'bg-indigo-100' },
                    { label: 'Recoveries', value: stats.totalRecoveries || 0, color: 'bg-indigo-50' }
                ];
            case 'physical':
                return [
                    { label: 'Distance (km)', value: stats.totalDistance ? (stats.totalDistance).toFixed(1) : '0', color: 'bg-green-100' },
                    { label: 'Top Speed', value: stats.avgTopSpeed ? stats.avgTopSpeed.toFixed(1) : '0', color: 'bg-green-50' },
                    { label: 'Duels', value: stats.totalDuelsWon || 0, color: 'bg-emerald-100' },
                    { label: 'Minutes', value: stats.totalMinutes, color: 'bg-emerald-50' }
                ];
            case 'goalkeeper':
                return [
                    { label: 'Clean Sheets', value: stats.totalCleanSheets || 0, color: 'bg-purple-100' },
                    { label: 'Saves', value: stats.totalSaves || 0, color: 'bg-purple-50' },
                    { label: 'Goals Agst', value: stats.totalGoalsConceded || 0, color: 'bg-pink-100' },
                    { label: 'Prevented', value: stats.avgGoalsPrevented?.toFixed(2) || '0.00', color: 'bg-pink-50' }
                ];
            default:
                return [];
        }
    };

    const currentStats = getStatsForCategory(activeCategory);

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
                    {/* Top: Category Selector & Stats */}
                    <div className="p-4 border-b-4 border-black">

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 mb-4 justify-center lg:justify-start">
                            {filteredMetricSets.map(set => (
                                <button
                                    key={set.id}
                                    onClick={() => setActiveCategory(set.id)}
                                    className={cn(
                                        "px-3 py-1 border-2 border-black text-xs font-bold uppercase transition-all transform hover:-translate-y-1",
                                        activeCategory === set.id ? "bg-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)]" : "bg-white text-black shadow-[2px_2px_0_#000]"
                                    )}
                                    style={{ fontFamily: 'var(--font-comic)' }}
                                >
                                    {set.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-3xl uppercase text-black leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>
                                {METRIC_SETS.find(s => s.id === activeCategory)?.label} Stats
                            </h2>
                            <span className="font-mono text-xs bg-black text-white px-2 py-1">FC BARCELONA</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            <StatBox label="Apps" value={stats.appearances} color="bg-gray-100" />

                            {currentStats.map((stat, idx) => (
                                <StatBox key={idx} label={stat.label} value={stat.value} color={stat.color} />
                            ))}

                            <StatBox label="FBI Rating" value={stats.avgRating.toFixed(1)} color="bg-green-100" helpLink="/about-fbi" />
                        </div>
                    </div>

                    {/* Bottom: Radar Chart */}
                    <div className="flex-grow p-4 bg-gray-50 flex items-center justify-center">
                        <PerformanceRadar stats={stats} position={position} activeSet={activeCategory} />
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
