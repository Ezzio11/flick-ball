"use client";

import { useState, useMemo } from 'react';
import { AggregatedStats } from '@/lib/playerHelpers';
import { Zap } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    ComposedChart, Line, Cell
} from 'recharts';
import EfficiencyScatter from './EfficiencyScatter';

interface AdvancedChartsProps {
    stats: AggregatedStats;
    matches: any[];
    playerName: string;
    position: string;
}

export default function AdvancedCharts({ stats, matches, playerName, position }: AdvancedChartsProps) {
    const [activeTab, setActiveTab] = useState<ChartTab>('consistency');
    const [period, setPeriod] = useState<FilterPeriod>('all');

    const pos = (position || 'FWD').toUpperCase(); // Fallback
    const isGK = pos === 'GK';
    const isDEF = ['CB', 'RB', 'LB', 'RWB', 'LWB', 'DEF'].includes(pos);
    const isMID = ['CDM', 'CM', 'CAM', 'RM', 'LM', 'MID'].includes(pos);

    // Memoize Tabs to prevent recreation
    const TABS = useMemo((): { id: ChartTab; label: string; badge: string }[] => {
        const baseTabs: { id: ChartTab; label: string; badge: string }[] = [
            { id: 'impact', label: 'Win Impact', badge: 'RATING' },
        ];

        if (isGK) {
            return [
                { id: 'consistency', label: 'Reliability', badge: 'SCATTER' },
                ...baseTabs,
                { id: 'workrate', label: 'Saving', badge: 'SAVES' },
                { id: 'xg', label: 'Prevention', badge: 'GOALS PREV.' },
            ];
        } else if (isDEF) {
            return [
                { id: 'consistency', label: 'Activity', badge: 'SCATTER' },
                ...baseTabs,
                { id: 'workrate', label: 'Work Rate', badge: 'PHYSICAL' },
                { id: 'xg', label: 'Def. Action', badge: 'ACTION' },
            ];
        } else if (isMID) {
            return [
                { id: 'consistency', label: 'Control', badge: 'SCATTER' },
                ...baseTabs,
                { id: 'workrate', label: 'Work Rate', badge: 'PHYSICAL' },
                { id: 'xg', label: 'Creativity', badge: 'OPPORTUNITY' },
            ];
        } else {
            return [
                { id: 'consistency', label: 'Clinicality', badge: 'SCATTER' },
                ...baseTabs,
                { id: 'workrate', label: 'Work Rate', badge: 'PHYSICAL' },
                { id: 'xg', label: 'xG Perform.', badge: 'EXP. GOALS' },
            ];
        }
    }, [isGK, isDEF, isMID]);

    // Filter matches by period
    const filteredMatches = useMemo(() => {
        if (period === 'last5') return matches.slice(-5);
        if (period === 'last10') return matches.slice(-10);
        return matches;
    }, [matches, period]);

    // Helper: Calculate Win/Draw/Loss stats using enriched data
    const { avgRatingWins, avgRatingNotWins } = useMemo(() => {
        const wins = matches.filter(m => m.isWin !== undefined ? m.isWin : (m.goals_scored || 0) > (m.goals_conceded || 0));
        const notWins = matches.filter(m => m.isWin !== undefined ? !m.isWin : (m.goals_scored || 0) <= (m.goals_conceded || 0));

        const avgWin = wins.reduce((sum, m) => sum + (parseFloat(m.fbiRating) || 0), 0) / (wins.length || 1);
        const avgNotWin = notWins.reduce((sum, m) => sum + (parseFloat(m.fbiRating) || 0), 0) / (notWins.length || 1);

        return { avgRatingWins: avgWin, avgRatingNotWins: avgNotWin };
    }, [matches]);

    const renderChart = () => {
        switch (activeTab) {
            case 'consistency':
                return (
                    <div className="w-full">
                        <EfficiencyScatter
                            matches={filteredMatches}
                            playerName={playerName}
                            position={pos}
                        />
                    </div>
                );

            case 'impact':
                const impactData = [
                    { name: 'In Wins', rating: avgRatingWins.toFixed(2), fill: '#22c55e' },
                    { name: 'In Draws/Loss', rating: avgRatingNotWins.toFixed(2), fill: '#ef4444' },
                ];
                return (
                    <div className="h-[400px] w-full flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={impactData} barSize={80}>
                                <CartesianGrid stroke="#000" strokeDasharray="1 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 'bold', fontFamily: 'var(--font-bangers)', letterSpacing: '1px' }} />
                                <YAxis domain={[0, 10]} label={{ value: 'Avg FBI Rating', angle: -90, position: 'insideLeft', fontFamily: 'monospace' }} tick={{ fontFamily: 'monospace' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', borderRadius: '0px', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="rating" radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={3}>
                                    {impactData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-center font-bold font-mono mt-2 bg-black text-white px-4 py-1 inline-block -rotate-1 shadow-[4px_4px_0_#aaa]">
                            Impact Differential: <span className={avgRatingWins > avgRatingNotWins ? "text-green-400" : "text-red-400"}>
                                {(avgRatingWins - avgRatingNotWins).toFixed(2)}
                            </span>
                        </p>
                    </div>
                );

            case 'workrate':
                // Filter out matches with 0 distance (LaLiga matches often missing this data)
                if (isGK) {
                    // GK Workrate = SAVES (Green) and CONCEDED (Red)
                    const saveStats = filteredMatches.map((m, i) => ({
                        uniqueId: `${m.opponent.substring(0, 3).toUpperCase()}-${i}`,
                        opponent: m.opponent.substring(0, 3).toUpperCase(),
                        saves: m.saves || 0,
                        conceded: m.goals_conceded || 0,
                    })).slice(-10);

                    return (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={saveStats}>
                                    <CartesianGrid stroke="#000" strokeDasharray="1 3" />
                                    <XAxis dataKey="uniqueId" tickFormatter={(val) => val.split('-')[0]} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                                    <YAxis tick={{ fontFamily: 'monospace' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace' }} />
                                    <Legend wrapperStyle={{ fontFamily: 'var(--font-bangers)', textTransform: 'uppercase' }} />
                                    <Bar dataKey="saves" name="Saves" fill="#16a34a" stroke="#000" strokeWidth={2} />
                                    <Bar dataKey="conceded" name="Conceded" fill="#dc2626" stroke="#000" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                }

                // Default Workrate for Outfield
                const workData = filteredMatches
                    .filter(m => {
                        const dist = Number(m.physical_metrics_distance_covered);
                        return !isNaN(dist) && dist > 100; // Filter out 0 or tiny values
                    })
                    .map((m, i) => ({
                        uniqueId: `${m.opponent.substring(0, 3).toUpperCase()}-${i}`, // Unique key for Recharts
                        opponent: m.opponent.substring(0, 3).toUpperCase(), // Display label
                        distance: Number(m.physical_metrics_distance_covered || 0) / 1000,
                        sprints: m.physical_metrics_number_of_sprints || 0
                    }))
                    .slice(-10);

                if (workData.length === 0) {
                    return (
                        <div className="h-[400px] w-full flex flex-col items-center justify-center text-gray-500">
                            <p className="text-xl font-bold mb-2 font-bangers tracking-widest">NO DATA AVAILABLE</p>
                            <p className="text-sm font-mono text-center">Physical tracking data is currently<br />limited to European matches.</p>
                        </div>
                    );
                }

                return (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={workData}>
                                <CartesianGrid stroke="#000" strokeDasharray="1 3" />
                                <XAxis
                                    dataKey="uniqueId"
                                    scale="band"
                                    tickFormatter={(val) => val.split('-')[0]}
                                    tick={{ fontFamily: 'monospace', fontSize: 10 }}
                                />
                                <YAxis yAxisId="left" orientation="left" stroke="#004d98" label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', fontFamily: 'monospace' }} tick={{ fontFamily: 'monospace' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#ff0000" label={{ value: 'Sprints', angle: 90, position: 'insideRight', fontFamily: 'monospace' }} tick={{ fontFamily: 'monospace' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace' }}
                                />
                                <Legend wrapperStyle={{ fontFamily: 'var(--font-bangers)', textTransform: 'uppercase' }} />
                                <Bar yAxisId="left" dataKey="distance" name="Distance (km)" barSize={20} fill="#004d98" stroke="#000" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="sprints" name="Sprints" stroke="#ff0000" strokeWidth={3} dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: '#ff0000' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'xg':
                if (isGK) {
                    // GK Prevention: xGOT (Expected On Target) vs Conceded
                    const xgDataGK = filteredMatches.map((m, i) => ({
                        uniqueId: `${m.opponent.substring(0, 3).toUpperCase()}-${i}`,
                        opponent: m.opponent,
                        xGOT: m.expected_goals_on_target_variant || 0,
                        conceded: m.goals_conceded || 0,
                    })).slice(-10);

                    return (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={xgDataGK}>
                                    <CartesianGrid stroke="#000" strokeDasharray="1 3" />
                                    <XAxis dataKey="uniqueId" tickFormatter={(v) => v.split('-')[0]} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                                    <YAxis tick={{ fontFamily: 'monospace' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace' }} />
                                    <Legend wrapperStyle={{ fontFamily: 'var(--font-bangers)', textTransform: 'uppercase' }} />
                                    <Bar dataKey="xGOT" name="xGOT Faced" fill="#2563eb" stroke="#000" strokeWidth={2} />
                                    <Bar dataKey="conceded" name="Conceded" fill="#dc2626" stroke="#000" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                }

                // For Defenders: Def Actions
                if (isDEF) {
                    const defData = filteredMatches.map((m, i) => ({
                        uniqueId: `${m.opponent.substring(0, 3).toUpperCase()}-${i}`,
                        tackles: m['matchstats.headers.tackles'] || 0,
                        interceptions: m.interceptions || 0,
                        clearances: m.clearances || 0,
                    })).slice(-10);
                    return (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={defData}>
                                    <CartesianGrid stroke="#000" strokeDasharray="1 3" />
                                    <XAxis dataKey="uniqueId" tickFormatter={(v) => v.split('-')[0]} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                                    <YAxis tick={{ fontFamily: 'monospace' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace' }} />
                                    <Legend wrapperStyle={{ fontFamily: 'var(--font-bangers)', textTransform: 'uppercase' }} />
                                    <Bar dataKey="tackles" stackId="a" fill="#2563eb" name="Tackles" stroke="#000" strokeWidth={2} />
                                    <Bar dataKey="interceptions" stackId="a" fill="#9333ea" name="Int." stroke="#000" strokeWidth={2} />
                                    <Bar dataKey="clearances" stackId="a" fill="#16a34a" name="Clearances" stroke="#000" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                }

                // For Midfielders: Creativity (Key Passes, Assists, Big Chances)
                if (isMID) {
                    const creativeData = filteredMatches.map((m, i) => ({
                        uniqueId: `${m.opponent.substring(0, 3).toUpperCase()}-${i}`,
                        keyPasses: m.key_passes || m.chances_created || 0,
                        assists: m.assists || 0,
                        bigChances: m.big_chances_created || 0,
                    })).slice(-10);

                    return (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={creativeData}>
                                    <CartesianGrid stroke="#000" strokeDasharray="1 3" />
                                    <XAxis dataKey="uniqueId" tickFormatter={(v) => v.split('-')[0]} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                                    <YAxis tick={{ fontFamily: 'monospace' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace' }} />
                                    <Legend wrapperStyle={{ fontFamily: 'var(--font-bangers)', textTransform: 'uppercase' }} />
                                    <Bar dataKey="keyPasses" fill="#ea580c" name="Key Passes" stroke="#000" strokeWidth={2} />
                                    <Bar dataKey="assists" fill="#eab308" name="Assists" stroke="#000" strokeWidth={2} />
                                    <Bar dataKey="bigChances" fill="#8b5cf6" name="Big Chances" stroke="#000" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                }

                // Default xG / Goals for FWD
                const filteredXG = filteredMatches.reduce((sum, m) => sum + (m.expected_goals || 0), 0);
                const filteredGoals = filteredMatches.reduce((sum, m) => sum + (m.goals || 0), 0);
                const xgData = [
                    { name: 'Actual Goals', value: filteredGoals, fill: '#22c55e' },
                    { name: 'Expected (xG)', value: parseFloat(filteredXG.toFixed(2)), fill: '#eab308' },
                ];
                return (
                    <div className="h-[400px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={xgData} layout="vertical" barSize={60}>
                                <CartesianGrid stroke="#000" strokeDasharray="1 3" />
                                <XAxis type="number" tick={{ fontFamily: 'monospace' }} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontWeight: 'bold', fontFamily: 'var(--font-bangers)', letterSpacing: '1px' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace' }} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} stroke="#000" strokeWidth={3}>
                                    {xgData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            default:
                return <div className="h-40 flex items-center justify-center">Select a metric</div>;
        }
    };

    return (
        <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0_#000]">
            {/* Header */}
            <div className="bg-black text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[2px_2px_0_#000]" strokeWidth={2.5} />
                    <span className="text-2xl uppercase tracking-widest" style={{ fontFamily: "var(--font-bangers)" }}>Advanced Analytics</span>
                </div>

                {/* Advanced Controls */}
                <div className="flex items-center gap-2 bg-gray-900 p-1 rounded border border-gray-700">
                    <span className="text-xs font-mono text-gray-400 px-2">TIMEFRAME:</span>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as FilterPeriod)}
                        className="bg-black text-white text-xs font-bold uppercase border border-gray-600 px-2 py-1 outline-none focus:border-yellow-400"
                    >
                        <option value="all">Season to Date</option>
                        <option value="last10">Last 10 Matches</option>
                        <option value="last5">Last 5 Matches</option>
                    </select>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap border-b-4 border-black bg-gray-100">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[120px] py-4 px-2 text-center font-bold uppercase transition-all relative group
                            ${activeTab === tab.id
                                ? 'bg-[#ffed02] text-black border-r-2 border-black'
                                : 'bg-transparent text-gray-500 hover:bg-white hover:text-black border-r border-gray-300'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs px-2 py-0.5 border border-black transform group-hover:-rotate-2 transition-transform ${activeTab === tab.id ? 'bg-black text-white' : 'bg-gray-200'}`}>
                                {tab.badge}
                            </span>
                            <span className="text-sm tracking-tight">{tab.label}</span>
                        </div>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black translate-y-[2px]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Chart Canvas */}
            <div className="p-2 md:p-6 bg-white min-h-[300px] md:min-h-[450px]">
                {renderChart()}
            </div>

            {/* Chart Footer Analysis */}
            <div className="bg-gray-50 p-3 border-t-2 border-black flex justify-between items-center text-xs text-gray-500 font-mono uppercase">
                <span>Data Source: FotMob & FBI Engine</span>
                <span>Values updated live</span>
            </div>
        </div>
    );
}

// Types
type ChartTab = 'consistency' | 'impact' | 'workrate' | 'xg';
type FilterPeriod = 'all' | 'last5' | 'last10';
