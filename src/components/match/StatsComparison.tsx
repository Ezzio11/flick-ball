import { MatchData } from '@/lib/matchHelpers';
import { Trophy, Target, Activity, Shield, Footprints } from 'lucide-react';

interface StatsComparisonProps {
    match: MatchData;
}

export default function StatsComparison({ match }: StatsComparisonProps) {
    const stats = match.stats;

    // Estimate opponent stats (mock data for visual balance if missing)
    const opponentPossession = 100 - (stats.possession || 50);
    const opponentShots = Math.round((stats.totalShots || 10) * 0.7);

    // xG Handling
    const barcaXG = stats.xG ? parseFloat(stats.xG) : 1.5;
    const opponentXG = stats.xG ? Math.max(0.5, barcaXG * 0.6) : 0.8; // Mock logic for balance

    const comparisonStats = [
        {
            label: 'Possession',
            barca: stats.possession || 50,
            opponent: opponentPossession,
            format: (v: number) => `${v}%`,
            isPercentage: true,
            color: 'bg-[#004d98]',
            oppColor: 'bg-gray-400'
        },
        {
            label: 'Expected Goals (xG)',
            barca: barcaXG,
            opponent: opponentXG,
            format: (v: number) => v.toFixed(2),
            isPercentage: false,
            color: 'bg-red-600',
            oppColor: 'bg-red-300'
        },
        {
            label: 'Total Shots',
            barca: stats.totalShots || 0,
            opponent: opponentShots,
            format: (v: number) => v.toString(),
            color: 'bg-yellow-500',
            oppColor: 'bg-yellow-200'
        },
        {
            label: 'Pass Accuracy',
            barca: stats.accuratePasses?.percentage ? parseInt(stats.accuratePasses.percentage) : 0,
            opponent: 82, // Mock average
            format: (v: number) => `${v}%`,
            isPercentage: true,
            color: 'bg-green-600',
            oppColor: 'bg-green-300'
        },
    ];

    return (
        <div className="bg-white border-6 border-black shadow-[12px_12px_0_#000] mb-8 relative overflow-hidden">
            {/* Halftone BG Pattern */}
            <div className="absolute inset-0 comic-halftone opacity-5 pointer-events-none"></div>

            {/* Header */}
            <div className="bg-[#ffed02] border-b-4 border-black p-4 text-center transform -skew-y-1 relative z-10 -mt-1 -mx-1 w-[102%]">
                <h2 className="text-4xl font-black uppercase tracking-tight text-black transform skew-y-1" style={{ fontFamily: 'var(--font-bangers)' }}>
                    Tale of the Tape
                </h2>
            </div>

            <div className="p-8 pt-10">
                <div className="space-y-8">
                    {comparisonStats.map((stat, index) => {
                        const total = stat.barca + stat.opponent;
                        const barcaPercent = total > 0 ? (stat.barca / total) * 100 : 50;
                        const opponentPercent = total > 0 ? (stat.opponent / total) * 100 : 50;

                        return (
                            <div key={index} className="relative">
                                <div className="flex items-center gap-4">
                                    {/* Barca Val */}
                                    <div className="w-16 text-right">
                                        <span className="text-2xl font-black text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                                            {stat.format(stat.barca)}
                                        </span>
                                    </div>

                                    {/* The Bar */}
                                    <div className="flex-1 h-6 bg-gray-100 border-3 border-black p-0.5 flex relative transform -skew-x-12">

                                        {/* Dynamic Stat Label */}
                                        <div
                                            className="absolute -top-8 -translate-x-1/2 skew-x-12 bg-black text-white px-2 py-0.5 text-[12px] uppercase font-bold tracking-widest border border-white z-20 shadow-[2px_2px_0_rgba(0,0,0,0.2)] whitespace-nowrap transition-all duration-500"
                                            style={{ left: `${barcaPercent}%` }}
                                        >
                                            {stat.label}
                                        </div>

                                        <div
                                            className={`h-full ${stat.color} border-r-2 border-black relative transition-all duration-500`}
                                            style={{ width: `${barcaPercent}%` }}
                                        >
                                            {/* Striped texture for user's team */}
                                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.5) 5px, rgba(0,0,0,0.5) 7px)' }}></div>
                                        </div>
                                        <div
                                            className={`h-full ${stat.oppColor} transition-all duration-500`}
                                            style={{ width: `${opponentPercent}%` }}
                                        ></div>

                                        {/* VS Marker */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 bg-white border-2 border-black rounded-full w-6 h-6 flex items-center justify-center z-10 transition-all duration-500"
                                            style={{ left: `calc(${barcaPercent}% - 12px)` }}
                                        >
                                            <span className="text-[8px] font-black">VS</span>
                                        </div>
                                    </div>

                                    {/* Opponent Val */}
                                    <div className="w-16 text-left">
                                        <span className="text-2xl font-black text-gray-500" style={{ fontFamily: 'var(--font-bangers)' }}>
                                            {stat.format(stat.opponent)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
