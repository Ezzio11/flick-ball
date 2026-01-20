import { MatchData } from '@/lib/matchHelpers';
import { Target, Activity, Shield, Zap, Footprints, AlertTriangle } from 'lucide-react';

interface TeamStatsGridProps {
    match: MatchData;
}

export default function TeamStatsGrid({ match }: TeamStatsGridProps) {
    const stats = match.stats;

    // Define categories with comic themes
    const categories = [
        {
            title: 'Attack', // Previous: Blitz
            icon: <Target className="w-5 h-5 text-red-600" />,
            color: 'red',
            stats: [
                { label: 'Total Shots', value: stats.totalShots, sub: 'Attempts' },
                { label: 'On Target', value: stats.shotsOnTarget, sub: 'Threats', highlight: true },
                { label: 'Big Chances', value: stats.bigChances, sub: 'Key Chances' },
                { label: 'Box Touches', value: stats.touchesInOppBox, sub: 'Pressure' },
            ]
        },
        {
            title: 'Midfield', // Previous: Engine Room
            icon: <Activity className="w-5 h-5 text-blue-600" />,
            color: 'blue',
            stats: [
                { label: 'Accurate Passes', value: stats.accuratePasses?.value },
                { label: 'Success Rate', value: stats.accuratePasses?.percentage, highlight: true },
                { label: 'Opp. Half Passes', value: stats.oppositionHalfPasses, sub: 'Progression' },
                { label: 'Long Balls', value: stats.accurateLongBalls?.value, sub: 'Direct Play' },
            ]
        },
        {
            title: 'Defense', // Previous: The Wall
            icon: <Shield className="w-5 h-5 text-green-600" />,
            color: 'green',
            stats: [
                { label: 'Tackles Won', value: stats.tackles, sub: 'Stops' },
                { label: 'Interceptions', value: stats.interceptions, sub: 'Reads', highlight: true },
                { label: 'Clearances', value: stats.clearances, sub: 'Safety' },
                { label: 'Keeper Saves', value: stats.keeperSaves, sub: 'Saves' },
            ]
        },
        {
            title: 'Physical', // Previous: Chaos
            icon: <Zap className="w-5 h-5 text-yellow-600" />,
            color: 'yellow',
            stats: [
                { label: 'Duels Won', value: stats.duelsWon, sub: 'Wins' },
                { label: 'Dribbles', value: stats.successfulDribbles?.value, sub: 'Take-ons' },
                { label: 'Fouls', value: stats.fouls, sub: 'Fouls' },
                { label: 'Corners', value: stats.corners, sub: 'Set Pieces' },
            ]
        }
    ];

    return (
        <div className="mb-8">
            <div className="mb-8 relative">
                <div className="flex justify-center mb-8">
                    <div className="bg-[#ffed02] border-4 border-black px-6 py-2 shadow-[8px_8px_0_#000] -rotate-2 transform hover:rotate-0 transition-transform cursor-default">
                        <h2 className="text-4xl font-black uppercase text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Battle Report
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="bg-white border-4 border-black p-0 shadow-[8px_8px_0_#000] relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            {/* Comic Panel Header */}
                            <div className={`p-4 border-b-4 border-black flex items-center gap-3 bg-${cat.color}-500`}>
                                <div className={`p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0_#000]`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                    {cat.title}
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="p-6 grid grid-cols-2 gap-4 relative">
                                {/* Halftone BG */}
                                <div className="absolute inset-0 comic-halftone opacity-5 pointer-events-none mix-blend-multiply"></div>

                                {cat.stats.map((stat, sIdx) => {
                                    if (stat.value === undefined || stat.value === null) return null;
                                    return (
                                        <div key={sIdx} className={`p-3 border-2 border-${cat.color}-200 bg-${cat.color}-50/30 ${stat.highlight ? `shadow-[4px_4px_0_#000] border-black bg-${cat.color}-100` : 'shadow-[2px_2px_0_#ddd]'}`}>
                                            <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">{stat.label}</div>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-3xl font-black leading-none text-${cat.color}-600 drop-shadow-sm`} style={{ fontFamily: 'var(--font-bangers)' }}>
                                                    {stat.value}
                                                </span>
                                                {stat.sub && (
                                                    <span className="text-[10px] font-mono text-gray-400 lowercase">{stat.sub}</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}