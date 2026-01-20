"use client";

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import BackButton from '@/components/ui/BackButton';
import { useRouter } from 'next/navigation';
import { getPlayerBySlug, aggregatePlayerStats, AggregatedStats, getAllPlayers } from '@/lib/playerHelpers';
import Footer from '@/components/layout/Footer';
import { Match } from '@/lib/teamStatistics';
import { Crown, ChevronDown } from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend
} from 'recharts';

type MetricSet = 'attacking' | 'creative' | 'defensive' | 'physical' | 'goalkeeper';

const METRIC_SETS: { id: MetricSet; label: string; color: string }[] = [
    { id: 'attacking', label: 'Attacking', color: '#ef4444' },
    { id: 'creative', label: 'Playmaking', color: '#eab308' },
    { id: 'defensive', label: 'Defensive', color: '#3b82f6' },
    { id: 'physical', label: 'Physical', color: '#22c55e' },
    { id: 'goalkeeper', label: 'Goalkeeping', color: '#8b5cf6' },
];

const STATS_CONFIG: Record<MetricSet, { label: string; key: keyof AggregatedStats; suffix?: string; inverted?: boolean }[]> = {
    attacking: [
        { label: 'Goals', key: 'totalGoals' },
        { label: 'Assists', key: 'totalAssists' },
        { label: 'Exp. Goals (xG)', key: 'totalxG' },
        { label: 'Shots', key: 'totalShots' },
        { label: 'Big Chances', key: 'totalBigChances' },
        { label: 'Dribbles Success', key: 'totalDribbles' },
    ],
    creative: [
        { label: 'Assists', key: 'totalAssists' },
        { label: 'Exp. Assists (xA)', key: 'totalxA' },
        { label: 'Key Passes', key: 'totalKeyPasses' },
        { label: 'Chances Created', key: 'totalChancesCreated' },
        { label: 'Pass Accuracy', key: 'avgPassAccuracy', suffix: '%' },
        { label: 'Crosses', key: 'totalCrosses' },
    ],
    defensive: [
        { label: 'Tackles Won', key: 'totalTackles' },
        { label: 'Interceptions', key: 'totalInterceptions' },
        { label: 'Recoveries', key: 'totalRecoveries' },
        { label: 'Blocks', key: 'totalBlocks' },
        { label: 'Clearances', key: 'totalClearances' },
        { label: 'Duels Won', key: 'totalDuelsWon' },
    ],
    physical: [
        { label: 'Distance Covered', key: 'totalDistance', suffix: 'km' },
        { label: 'Top Speed', key: 'avgTopSpeed', suffix: 'km/h' },
        { label: 'Duels Won', key: 'totalDuelsWon' },
        { label: 'Aerials Won', key: 'totalAerialsWon' },
        { label: 'Fouls Committed', key: 'totalFouls', inverted: true },
        { label: 'Yellow Cards', key: 'totalYellowCards', inverted: true },
    ],
    goalkeeper: [
        { label: 'Saves', key: 'totalSaves' },
        { label: 'Clean Sheets', key: 'totalCleanSheets' },
        { label: 'Goals Conceded', key: 'totalGoalsConceded', inverted: true },
        { label: 'Goals Prevented', key: 'avgGoalsPrevented' },
        { label: 'Pass Accuracy', key: 'avgPassAccuracy', suffix: '%' },
        { label: 'Long Balls', key: 'totalLongBalls' }, // Assuming this exists or falls back to 0
    ],
};

export default function ComparisonContent({ params, matches }: { params: Promise<{ player1: string; player2: string }>, matches: Match[] }) {
    const { player1: player1Slug, player2: player2Slug } = use(params);
    const router = useRouter();
    // ... (rest of the component until return)

    /* Re-inserting component logic truncated for brevity: */
    /* Accessing contexts (allPlayers, player1, player2, stats1, stats2, etc.) */
    /* Re-inserting component logic truncated for brevity: */
    /* Accessing contexts (allPlayers, player1, player2, stats1, stats2, etc.) */
    const allPlayers = getAllPlayers(matches).sort((a, b) => a.name.localeCompare(b.name));
    const player1 = getPlayerBySlug(player1Slug, matches);
    const player2 = getPlayerBySlug(player2Slug, matches);

    // Default Metric Set Logic
    const getDefaultMetricSet = (p1Pos: string, p2Pos: string): MetricSet => {
        if (p1Pos === 'Goalkeeper' || p2Pos === 'Goalkeeper') return 'goalkeeper';
        if (p1Pos === 'Defender' && p2Pos === 'Defender') return 'defensive';
        if (p1Pos === 'Midfielder' || p2Pos === 'Midfielder') return 'creative';
        return 'attacking';
    };

    const [activeMetricSet, setActiveMetricSet] = useState<MetricSet>('attacking');

    useEffect(() => {
        if (player1 && player2) {
            setActiveMetricSet(getDefaultMetricSet(player1.position, player2.position));
        }
    }, [player1, player2]);

    if (!player1 || !player2) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-bangers)" }}>PLAYERS NOT FOUND</h1>
                    <BackButton href="/compare" label="Go back to comparison" variant="white" />
                </div>
            </div>
        );
    }
    const stats1 = aggregatePlayerStats(player1);
    const stats2 = aggregatePlayerStats(player2);
    // ... (norm, getChartData logic - simplified for replace)

    // --- Radar Chart Meta-Data Calculation ---
    const norm = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100));

    const getChartData = (set: MetricSet) => {
        const perGame = (stats: AggregatedStats, key: keyof AggregatedStats) => {
            const val = (stats[key] as number) || 0;
            return val / (stats.appearances || 1);
        };

        const p1 = stats1;
        const p2 = stats2;

        switch (set) {
            case 'attacking':
                return [
                    { subject: 'Goals', A: norm(perGame(p1, 'totalGoals'), 1.0), B: norm(perGame(p2, 'totalGoals'), 1.0), fullMark: 100 },
                    { subject: 'xG', A: norm(perGame(p1, 'totalxG'), 1.0), B: norm(perGame(p2, 'totalxG'), 1.0), fullMark: 100 },
                    { subject: 'Shots', A: norm(perGame(p1, 'totalShots'), 4.0), B: norm(perGame(p2, 'totalShots'), 4.0), fullMark: 100 },
                    { subject: 'Big Chances', A: norm(perGame(p1, 'totalBigChances'), 1.0), B: norm(perGame(p2, 'totalBigChances'), 1.0), fullMark: 100 },
                    { subject: 'Dribbles', A: norm(perGame(p1, 'totalDribbles'), 4.0), B: norm(perGame(p2, 'totalDribbles'), 4.0), fullMark: 100 },
                    { subject: 'Rating', A: norm(p1.avgRating, 10), B: norm(p2.avgRating, 10), fullMark: 100 },
                ];
            case 'creative':
                return [
                    { subject: 'Assists', A: norm(perGame(p1, 'totalAssists'), 0.5), B: norm(perGame(p2, 'totalAssists'), 0.5), fullMark: 100 },
                    { subject: 'xA', A: norm(perGame(p1, 'totalxA'), 0.5), B: norm(perGame(p2, 'totalxA'), 0.5), fullMark: 100 },
                    { subject: 'Key Passes', A: norm(perGame(p1, 'totalKeyPasses'), 3.0), B: norm(perGame(p2, 'totalKeyPasses'), 3.0), fullMark: 100 },
                    { subject: 'Chances', A: norm(perGame(p1, 'totalChancesCreated'), 4.0), B: norm(perGame(p2, 'totalChancesCreated'), 4.0), fullMark: 100 },
                    { subject: 'Crosses', A: norm(perGame(p1, 'totalCrosses'), 5.0), B: norm(perGame(p2, 'totalCrosses'), 5.0), fullMark: 100 },
                    { subject: 'Pass Acc', A: norm(p1.avgPassAccuracy || 0, 100), B: norm(p2.avgPassAccuracy || 0, 100), fullMark: 100 },
                ];
            case 'defensive':
                return [
                    { subject: 'Tackles', A: norm(perGame(p1, 'totalTackles'), 3.0), B: norm(perGame(p2, 'totalTackles'), 3.0), fullMark: 100 },
                    { subject: 'Interceptions', A: norm(perGame(p1, 'totalInterceptions'), 3.0), B: norm(perGame(p2, 'totalInterceptions'), 3.0), fullMark: 100 },
                    { subject: 'Recoveries', A: norm(perGame(p1, 'totalRecoveries'), 8.0), B: norm(perGame(p2, 'totalRecoveries'), 8.0), fullMark: 100 },
                    { subject: 'Blocks', A: norm(perGame(p1, 'totalBlocks'), 2.0), B: norm(perGame(p2, 'totalBlocks'), 2.0), fullMark: 100 },
                    { subject: 'Clearances', A: norm(perGame(p1, 'totalClearances'), 4.0), B: norm(perGame(p2, 'totalClearances'), 4.0), fullMark: 100 },
                    { subject: 'Duels Won', A: norm(perGame(p1, 'totalDuelsWon'), 8.0), B: norm(perGame(p2, 'totalDuelsWon'), 8.0), fullMark: 100 },
                ];
            case 'physical':
                return [
                    { subject: 'Minutes', A: norm(p1.totalMinutes, 3000), B: norm(p2.totalMinutes, 3000), fullMark: 100 },
                    { subject: 'Distance', A: norm(p1.totalDistance || 0, 300), B: norm(p2.totalDistance || 0, 300), fullMark: 100 },
                    { subject: 'Speed', A: norm(p1.avgTopSpeed || 0, 36), B: norm(p2.avgTopSpeed || 0, 36), fullMark: 100 },
                    { subject: 'Aerials', A: norm(perGame(p1, 'totalAerialsWon'), 4.0), B: norm(perGame(p2, 'totalAerialsWon'), 4.0), fullMark: 100 },
                    { subject: 'Fouls', A: 100 - norm(perGame(p1, 'totalFouls'), 2.0), B: 100 - norm(perGame(p2, 'totalFouls'), 2.0), fullMark: 100 }, // Less is better
                    { subject: 'Apps', A: norm(p1.appearances, 40), B: norm(p2.appearances, 40), fullMark: 100 },
                ];
            case 'goalkeeper':
                return [
                    { subject: 'Saves', A: norm(perGame(p1, 'totalSaves'), 5.0), B: norm(perGame(p2, 'totalSaves'), 5.0), fullMark: 100 },
                    { subject: 'Clean Sheets', A: norm(p1.totalCleanSheets || 0, 15), B: norm(p2.totalCleanSheets || 0, 15), fullMark: 100 },
                    { subject: 'Conceded', A: 100 - norm(perGame(p1, 'totalGoalsConceded'), 3.0), B: 100 - norm(perGame(p2, 'totalGoalsConceded'), 3.0), fullMark: 100 },
                    { subject: 'Prevention', A: norm(p1.avgGoalsPrevented || 0, 1.0), B: norm(p2.avgGoalsPrevented || 0, 1.0), fullMark: 100 },
                    { subject: 'Rating', A: norm(p1.avgRating, 10), B: norm(p2.avgRating, 10), fullMark: 100 },
                    { subject: 'Apps', A: norm(p1.appearances, 40), B: norm(p2.appearances, 40), fullMark: 100 },
                ];
        }
    };

    const chartData = getChartData(activeMetricSet);

    // Helper for table comparison
    const ComparisonRow = ({ label, val1, val2, suffix = '', inverted = false }: { label: string, val1: number, val2: number, suffix?: string, inverted?: boolean }) => {
        let p1Wins = val1 > val2;
        let p2Wins = val2 > val1;
        if (inverted) {
            p1Wins = val1 < val2;
            p2Wins = val2 < val1;
        }
        // Handle undefined/null gracefully
        const v1Display = val1 ?? 0;
        const v2Display = val2 ?? 0;

        return (
            <div className="grid grid-cols-3 border-b-2 border-black/10 last:border-0 hover:bg-white/50 transition-colors">
                <div className={`p-3 text-center font-bold text-lg border-r border-black/10 flex items-center justify-center gap-1 ${p1Wins ? 'text-[#a50044] bg-[#a50044]/10' : 'text-gray-600'}`} style={{ fontFamily: "var(--font-comic)" }}>
                    {v1Display.toFixed(suffix ? 1 : 0)}{suffix} {p1Wins && <Crown size={16} className="text-[#ffed02] fill-[#ffed02] stroke-black" />}
                </div>
                <div className="p-3 text-center text-sm font-bold uppercase tracking-wider flex items-center justify-center text-black/70" style={{ fontFamily: "var(--font-comic)" }}>
                    {label}
                </div>
                <div className={`p-3 text-center font-bold text-lg border-l border-black/10 flex items-center justify-center gap-1 ${p2Wins ? 'text-[#004d98] bg-[#004d98]/10' : 'text-gray-600'}`} style={{ fontFamily: "var(--font-comic)" }}>
                    {v2Display.toFixed(suffix ? 1 : 0)}{suffix} {p2Wins && <Crown size={16} className="text-[#ffed02] fill-[#ffed02] stroke-black" />}
                </div>
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-[#e5e5f7] relative flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none fixed" style={{
                backgroundImage: 'radial-gradient(#444cf7 0.5px, transparent 0.5px), radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
            }}></div>

            <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 py-8 relative z-10">

                {/* Nav */}
                <div className="mb-8">
                    <BackButton href="/compare" label="Back to Selection" />
                </div>

                {/* HEADER: PLAYER PROFILES */}
                <div className="grid md:grid-cols-2 gap-8 mb-8 items-end relative">

                    {/* VS BADGE (Absolute Center) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center">
                        <div className="relative transform rotate-6 hover:rotate-12 transition-transform duration-300">
                            <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1"></div>
                            <div className="relative bg-[#ffed02] border-4 border-black px-6 py-2 shadow-[4px_4px_0_#000]">
                                <span className="text-6xl font-black italic tracking-tighter" style={{ fontFamily: "var(--font-bangers)" }}>VS</span>
                            </div>
                        </div>
                    </div>

                    {/* PLAYER 1 CARD */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#a50044] transform -skew-x-6 rounded-xl shadow-[8px_8px_0_#000] border-4 border-black"></div>
                        <div className="relative p-6 flex flex-col items-center z-10">
                            {/* Image Container */}
                            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-4 rounded-full overflow-hidden border-4 border-black bg-white shadow-inner">
                                <Image
                                    src={`/images/players/${player1.slug}-profile.webp`}
                                    alt={player1.name}
                                    fill
                                    className="object-cover object-top hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="text-center relative w-full mb-2">
                                {/* Stylized Select Dropdown */}
                                <div className="relative inline-block w-full max-w-[300px]">
                                    <div className="relative bg-[#a50044] border-2 border-white/30 hover:border-white transition-colors">
                                        <select
                                            className="appearance-none bg-transparent w-full py-2 pl-4 pr-10 text-3xl text-white uppercase text-center font-bold focus:outline-none cursor-pointer"
                                            style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #000' }}
                                            value={player1.slug}
                                            onChange={(e) => router.push(`/compare/${e.target.value}/vs/${player2.slug}`)}
                                        >
                                            {allPlayers.filter(p => p.slug !== player2.slug).map(p => (
                                                <option key={p.id} value={p.slug} className="text-black bg-white font-sans text-lg">{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronDown className="text-white drop-shadow-md" size={24} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className="bg-black text-[#ffed02] px-3 py-1 text-sm font-bold uppercase transform -skew-x-12 border-2 border-white/20">
                                {player1.position}
                            </span>

                            {/* Key Stats Row */}
                            <div className="flex gap-4 mt-6 w-full justify-center">
                                <div className="text-center bg-black/20 p-2 rounded border border-white/20 flex-1">
                                    <div className="text-xs text-white/80 uppercase font-bold">Apps</div>
                                    <div className="text-2xl text-white font-bold" style={{ fontFamily: "var(--font-bangers)" }}>{stats1.appearances}</div>
                                </div>
                                <div className="text-center bg-white p-2 rounded border-2 border-black flex-1 transform scale-110 shadow-lg relative z-20">
                                    <div className="text-xs text-black/80 uppercase font-bold">FBI Rating</div>
                                    <div className="text-3xl text-[#a50044] font-bold leading-none" style={{ fontFamily: "var(--font-bangers)" }}>{stats1.avgRating.toFixed(1)}</div>
                                </div>
                                <div className="text-center bg-black/20 p-2 rounded border border-white/20 flex-1">
                                    <div className="text-xs text-white/80 uppercase font-bold">Goals</div>
                                    <div className="text-2xl text-white font-bold" style={{ fontFamily: "var(--font-bangers)" }}>{stats1.totalGoals}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PLAYER 2 CARD */}
                    <div className="relative group mt-8 md:mt-0">
                        <div className="absolute inset-0 bg-[#004d98] transform skew-x-6 rounded-xl shadow-[8px_8px_0_#000] border-4 border-black"></div>
                        <div className="relative p-6 flex flex-col items-center z-10">
                            {/* Image Container */}
                            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-4 rounded-full overflow-hidden border-4 border-black bg-white shadow-inner">
                                <Image
                                    src={`/images/players/${player2.slug}-profile.webp`}
                                    alt={player2.name}
                                    fill
                                    className="object-cover object-top hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="text-center relative w-full mb-2">
                                {/* Stylized Select Dropdown */}
                                <div className="relative inline-block w-full max-w-[300px]">
                                    <div className="relative bg-[#004d98] border-2 border-white/30 hover:border-white transition-colors">
                                        <select
                                            className="appearance-none bg-transparent w-full py-2 pl-4 pr-10 text-3xl text-white uppercase text-center font-bold focus:outline-none cursor-pointer"
                                            style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #000' }}
                                            value={player2.slug}
                                            onChange={(e) => router.push(`/compare/${player1.slug}/vs/${e.target.value}`)}
                                        >
                                            {allPlayers.filter(p => p.slug !== player1.slug).map(p => (
                                                <option key={p.id} value={p.slug} className="text-black bg-white font-sans text-lg">{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronDown className="text-white drop-shadow-md" size={24} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className="bg-black text-[#ffed02] px-3 py-1 text-sm font-bold uppercase transform -skew-x-12 border-2 border-white/20">
                                {player2.position}
                            </span>

                            {/* Key Stats Row */}
                            <div className="flex gap-4 mt-6 w-full justify-center">
                                <div className="text-center bg-black/20 p-2 rounded border border-white/20 flex-1">
                                    <div className="text-xs text-white/80 uppercase font-bold">Goals</div>
                                    <div className="text-2xl text-white font-bold" style={{ fontFamily: "var(--font-bangers)" }}>{stats2.totalGoals}</div>
                                </div>
                                <div className="text-center bg-white p-2 rounded border-2 border-black flex-1 transform scale-110 shadow-lg relative z-20">
                                    <div className="text-xs text-black/80 uppercase font-bold">FBI Rating</div>
                                    <div className="text-3xl text-[#004d98] font-bold leading-none" style={{ fontFamily: "var(--font-bangers)" }}>{stats2.avgRating.toFixed(1)}</div>
                                </div>
                                <div className="text-center bg-black/20 p-2 rounded border border-white/20 flex-1">
                                    <div className="text-xs text-white/80 uppercase font-bold">Apps</div>
                                    <div className="text-2xl text-white font-bold" style={{ fontFamily: "var(--font-bangers)" }}>{stats2.appearances}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* CHART SECTION (Left/Top) */}
                    <div className="lg:col-span-12 xl:col-span-5">
                        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_#999] h-full flex flex-col items-center">
                            <div className="w-full flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                                <h3 className="text-3xl uppercase" style={{ fontFamily: "var(--font-bangers)" }}>Skill Radar</h3>
                                <div className="flex gap-1">
                                    {METRIC_SETS.map(set => (
                                        <button
                                            key={set.id}
                                            onClick={() => setActiveMetricSet(set.id)}
                                            className={`p-1.5 rounded border-2 ${activeMetricSet === set.id ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
                                            title={set.label}
                                        >
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: set.color }}></div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                        <PolarGrid stroke="#e5e7eb" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 12, fontFamily: 'var(--font-comic)', fontWeight: 'bold' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name={player1.name}
                                            dataKey="A"
                                            stroke="#a50044"
                                            strokeWidth={3}
                                            fill="#a50044"
                                            fillOpacity={0.4}
                                        />
                                        <Radar
                                            name={player2.name}
                                            dataKey="B"
                                            stroke="#004d98"
                                            strokeWidth={3}
                                            fill="#004d98"
                                            fillOpacity={0.4}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'var(--font-comic)', fontSize: '14px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase text-gray-600">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: METRIC_SETS.find(s => s.id === activeMetricSet)?.color }}></div>
                                Showing: {METRIC_SETS.find(s => s.id === activeMetricSet)?.label} Stats
                            </div>
                        </div>
                    </div>

                    {/* STATS TABLE SECTION (Right/Bottom) */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000]">
                            <div className="bg-black text-white p-3 border-b-4 border-black flex justify-between items-center">
                                <h3 className="text-2xl uppercase tracking-wider" style={{ fontFamily: "var(--font-bangers)" }}>Detailed Analysis</h3>
                                <div className="text-xs font-mono opacity-70">DATA: OPTA/FOTMOB</div>
                            </div>

                            {/* Stats List */}
                            <div className="flex flex-col">
                                {/* Common Stats */}
                                <ComparisonRow label="FBI Rating" val1={stats1.avgRating} val2={stats2.avgRating} suffix="" />
                                <ComparisonRow label="Minutes Played" val1={stats1.totalMinutes} val2={stats2.totalMinutes} />
                                <ComparisonRow label="Apps" val1={stats1.appearances} val2={stats2.appearances} />

                                {/* Section Header */}
                                <div className="bg-gray-100 p-2 text-center text-xs font-bold uppercase tracking-widest text-gray-500 border-y border-black/10">
                                    {METRIC_SETS.find(s => s.id === activeMetricSet)?.label} Metrics
                                </div>

                                {/* Dynamic Stats */}
                                {STATS_CONFIG[activeMetricSet].map((stat, idx) => (
                                    <ComparisonRow
                                        key={stat.key + idx}
                                        label={stat.label}
                                        val1={stats1[stat.key] as number}
                                        val2={stats2[stat.key] as number}
                                        suffix={stat.suffix}
                                        inverted={stat.inverted}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
            <Footer />
        </div>
    );
}
