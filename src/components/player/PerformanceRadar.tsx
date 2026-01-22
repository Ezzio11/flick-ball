"use client";

import { useState, useMemo } from 'react';
import { AggregatedStats } from '@/lib/playerHelpers';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface PerformanceRadarProps {
    stats: AggregatedStats;
    position: string;
}

export type MetricSet = 'attacking' | 'creative' | 'defensive' | 'physical' | 'goalkeeper';

// Get metric sets available for a position
export const getAvailableSets = (position: string): MetricSet[] => {
    if (position === 'Goalkeeper') {
        return ['goalkeeper', 'physical'];
    }
    if (position === 'Defender') {
        return ['defensive', 'physical', 'creative'];
    }
    if (position === 'Midfielder') {
        return ['creative', 'attacking', 'defensive', 'physical'];
    }
    // Forward
    return ['attacking', 'creative', 'physical', 'defensive']; // Added defensive for high pressers
};

// Get default metric set for a position
export const getDefaultSet = (position: string): MetricSet => {
    switch (position) {
        case 'Goalkeeper': return 'goalkeeper';
        case 'Defender': return 'defensive';
        case 'Midfielder': return 'creative';
        case 'Forward': return 'attacking';
        default: return 'attacking';
    }
};

export const METRIC_SETS: { id: MetricSet; label: string; color: string }[] = [
    { id: 'attacking', label: 'Attacking', color: '#ef4444' },
    { id: 'creative', label: 'Playmaking', color: '#eab308' },
    { id: 'defensive', label: 'Defensive', color: '#3b82f6' },
    { id: 'physical', label: 'Physical', color: '#22c55e' },
    { id: 'goalkeeper', label: 'Goalkeeping', color: '#8b5cf6' },
];

const normalizePosition = (pos: string): string => {
    if (pos === 'GK') return 'Goalkeeper';
    if (['CB', 'RB', 'LB', 'RWB', 'LWB', 'DEF'].includes(pos)) return 'Defender';
    if (['CDM', 'CM', 'CAM', 'RM', 'LM', 'MID'].includes(pos)) return 'Midfielder';
    return 'Forward'; // Default for ST, RW, LW, FWD
};

interface PerformanceRadarProps {
    stats: AggregatedStats;
    position: string;
    activeSet?: MetricSet; // Now optional/controlled
}

export default function PerformanceRadar({ stats, position, activeSet }: PerformanceRadarProps) {
    // Normalize position from specific role (e.g. "GK") to category (e.g. "Goalkeeper")
    const effectivePosition = useMemo(() => normalizePosition(position), [position]);

    // Internal state only used if prop is not provided (backwards compatibility/safety)
    const defaultSet = useMemo(() => getDefaultSet(effectivePosition), [effectivePosition]);
    const [internalSet, setInternalSet] = useState<MetricSet>(defaultSet);

    const minutesPer90 = stats.totalMinutes / 90;
    const per90 = (val: number | undefined) => (minutesPer90 > 0 && val ? val / minutesPer90 : 0);

    // Different metric sets for different analysis views
    const getRadarData = (set: MetricSet) => {
        switch (set) {
            case 'attacking':
                return [
                    { metric: 'Goals', value: Math.min(per90(stats.totalGoals) * 100, 100), raw: stats.totalGoals },
                    { metric: 'xG', value: Math.min(per90(stats.totalxG) * 100, 100), raw: stats.totalxG?.toFixed(2) },
                    { metric: 'Shots', value: stats.totalShots ? Math.min(per90(stats.totalShots) * 25, 100) : 0, raw: stats.totalShots },
                    { metric: 'Big Chances', value: stats.totalBigChances ? Math.min(per90(stats.totalBigChances) * 50, 100) : 0, raw: stats.totalBigChances },
                    { metric: 'Dribbles', value: stats.totalDribbles ? Math.min(per90(stats.totalDribbles) * 20, 100) : 0, raw: stats.totalDribbles },
                    { metric: 'Rating', value: (stats.avgRating / 10) * 100, raw: stats.avgRating.toFixed(2) },
                ];
            case 'creative':
                return [
                    { metric: 'Assists', value: Math.min(per90(stats.totalAssists) * 100, 100), raw: stats.totalAssists },
                    { metric: 'xA', value: Math.min(per90(stats.totalxA) * 100, 100), raw: stats.totalxA?.toFixed(2) },
                    { metric: 'Key Passes', value: stats.totalKeyPasses ? Math.min(per90(stats.totalKeyPasses) * 25, 100) : 0, raw: stats.totalKeyPasses },
                    { metric: 'Chances', value: stats.totalChancesCreated ? Math.min(per90(stats.totalChancesCreated) * 33, 100) : 0, raw: stats.totalChancesCreated },
                    { metric: 'Crosses', value: stats.totalCrosses ? Math.min(per90(stats.totalCrosses) * 20, 100) : 0, raw: stats.totalCrosses },
                    { metric: 'Passes', value: stats.totalPasses ? Math.min(per90(stats.totalPasses) * 2, 100) : 0, raw: stats.totalPasses },
                ];
            case 'defensive':
                return [
                    { metric: 'Tackles', value: stats.totalTackles ? Math.min(per90(stats.totalTackles) * 33, 100) : 0, raw: stats.totalTackles },
                    { metric: 'Interceptions', value: stats.totalInterceptions ? Math.min(per90(stats.totalInterceptions) * 50, 100) : 0, raw: stats.totalInterceptions },
                    { metric: 'Recoveries', value: stats.totalRecoveries ? Math.min(per90(stats.totalRecoveries) * 10, 100) : 0, raw: stats.totalRecoveries },
                    { metric: 'Blocks', value: stats.totalBlocks ? Math.min(per90(stats.totalBlocks) * 50, 100) : 0, raw: stats.totalBlocks },
                    { metric: 'Clearances', value: stats.totalClearances ? Math.min(per90(stats.totalClearances) * 25, 100) : 0, raw: stats.totalClearances },
                    { metric: 'Duels Won', value: stats.totalDuelsWon ? Math.min(per90(stats.totalDuelsWon) * 15, 100) : 0, raw: stats.totalDuelsWon },
                ];
            case 'physical':
                return [
                    { metric: 'Minutes', value: Math.min((stats.totalMinutes / 5000) * 100, 100), raw: stats.totalMinutes },
                    { metric: 'Distance', value: stats.totalDistance ? Math.min((stats.totalDistance / 500) * 100, 100) : 0, raw: stats.totalDistance?.toFixed(1) },
                    { metric: 'Top Speed', value: stats.avgTopSpeed ? Math.min((stats.avgTopSpeed / 35) * 100, 100) : 0, raw: stats.avgTopSpeed?.toFixed(1) },
                    { metric: 'Aerials', value: stats.totalAerialsWon ? Math.min(per90(stats.totalAerialsWon) * 25, 100) : 0, raw: stats.totalAerialsWon },
                    { metric: 'Fouls', value: stats.totalFouls ? Math.min(100 - per90(stats.totalFouls) * 50, 100) : 100, raw: stats.totalFouls },
                    { metric: 'Apps', value: Math.min((stats.appearances / 80) * 100, 100), raw: stats.appearances },
                ];
            case 'goalkeeper':
                return [
                    { metric: 'Saves', value: stats.totalSaves ? Math.min(per90(stats.totalSaves) * 25, 100) : 0, raw: stats.totalSaves },
                    { metric: 'Clean Sheets', value: Math.min((stats.totalCleanSheets || 0) / (stats.appearances || 1) * 100, 100), raw: stats.totalCleanSheets },
                    { metric: 'Goals Conceded', value: Math.min(100 - per90(stats.totalGoalsConceded || 0) * 50, 100), raw: stats.totalGoalsConceded },
                    { metric: 'Goals Prevented', value: stats.avgGoalsPrevented ? Math.min(stats.avgGoalsPrevented * 50 + 50, 100) : 50, raw: stats.avgGoalsPrevented?.toFixed(2) },
                    { metric: 'Rating', value: (stats.avgRating / 10) * 100, raw: stats.avgRating.toFixed(2) },
                    { metric: 'Apps', value: Math.min((stats.appearances / 40) * 100, 100), raw: stats.appearances },
                ];
            default:
                return [];
        }
    };

    const currentActiveSet = activeSet || internalSet;
    const currentSet = METRIC_SETS.find(s => s.id === currentActiveSet)!;
    const radarData = getRadarData(currentActiveSet);
    const filteredMetricSets = METRIC_SETS.filter(s => getAvailableSets(effectivePosition).includes(s.id));

    // Custom tooltip for hover
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-black text-white px-3 py-2 border-2 border-white shadow-lg">
                    <p className=" text-sm" style={{ fontFamily: "var(--font-bangers)" }}>{data.metric}</p>
                    <p className="font-mono text-lg font-bold">{data.raw || '0'}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            {/* Dropdown Selector - Only show if NO external control is active to avoid double controls */}
            {!activeSet && (
                <div className="mb-4 flex justify-center">
                    <select
                        value={currentActiveSet}
                        onChange={(e) => setInternalSet(e.target.value as MetricSet)}
                        className="px-4 py-2 border-3 border-black bg-white text-black text-sm font-bold uppercase hover:bg-yellow-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_#000] cursor-pointer"
                    >
                        {filteredMetricSets.map(set => (
                            <option key={set.id} value={set.id} className="bg-white">
                                {set.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Radar Chart */}
            <ResponsiveContainer width="100%" height={280} className="hidden md:block">
                <RadarChart data={radarData}>
                    <PolarGrid stroke="#000" strokeWidth={1} strokeDasharray="4 4" />
                    <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#000', fontSize: 11, fontWeight: 'bold', fontFamily: 'Bangers, sans-serif' }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#666', fontSize: 9 }}
                        axisLine={false}
                    />
                    <Radar
                        name={position}
                        dataKey="value"
                        stroke="#000"
                        strokeWidth={2}
                        fill={currentSet.color}
                        fillOpacity={0.5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
            {/* Mobile Radar (Smaller Font/Size) */}
            <ResponsiveContainer width="100%" height={220} className="block md:hidden">
                <RadarChart data={radarData} outerRadius={70}>
                    <PolarGrid stroke="#000" strokeWidth={1} strokeDasharray="4 4" />
                    <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#000', fontSize: 9, fontWeight: 'bold', fontFamily: 'Bangers, sans-serif' }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name={position}
                        dataKey="value"
                        stroke="#000"
                        strokeWidth={2}
                        fill={currentSet.color}
                        fillOpacity={0.5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>

            {/* Legend / Color Indicator */}
            <div className="mt-2 flex justify-center">
                <div
                    className="px-3 py-1 border-2 border-black text-xs font-bold uppercase"
                    style={{ backgroundColor: currentSet.color, color: currentActiveSet === 'creative' ? '#000' : '#fff' }}
                >
                    {currentSet.label} Metrics
                </div>
            </div>
        </div>
    );
}
