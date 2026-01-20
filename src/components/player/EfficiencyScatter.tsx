"use client";

import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts';

interface EfficiencyScatterProps {
    matches: any[];
    playerName: string;
    position: string;
}

type ChartMode = 'xg-goals' | 'threat-gen' | 'warrior-stats' | 'ball-carrying' | 'progression' | 'wall-mode';

const MODES = [
    { id: 'xg-goals', label: 'xG vs Goals', description: 'Finishing Efficiency' },
    { id: 'threat-gen', label: 'Threat Gen', description: 'xG vs xA (Complete Attack)' },
    { id: 'warrior-stats', label: 'Warrior Stats', description: 'Duels Won vs Recoveries' },
    { id: 'ball-carrying', label: 'Carrying', description: 'Dribbles vs Box Touches' },
    { id: 'progression', label: 'Progression', description: 'Final 3rd Passes vs Recoveries' },
    { id: 'wall-mode', label: 'The Wall', description: 'Saves vs Goals Prevented' },
] as const;

export default function EfficiencyScatter({ matches, playerName, position }: EfficiencyScatterProps) {
    const getDefaultMode = (): ChartMode => {
        const p = (position || 'FWD').toUpperCase();
        if (p === 'GK') return 'wall-mode';
        if (['CB', 'RB', 'LB', 'RWB', 'LWB', 'DEF'].includes(p)) return 'warrior-stats';
        if (['CDM', 'CM', 'MID'].includes(p)) return 'progression';
        // Wingers & Attackers
        return 'threat-gen';
    };

    const [mode, setMode] = useState<ChartMode>(getDefaultMode());

    const getData = () => {
        return matches
            .map((m, i) => {
                const base = {
                    opponent: m.opponent,
                    date: m.date,
                    rating: m.fbiRating || m.rating,
                    size: (m.fbiRating || m.rating) > 8 ? 150 : 80,
                };

                if (mode === 'xg-goals') {
                    return { ...base, x: m.expected_goals || 0, y: m.goals || 0, size: (m.goals || 0) > 0 ? 150 : 80 };
                }
                if (mode === 'threat-gen') {
                    return { ...base, x: m.expected_goals || 0, y: m.expected_assists || 0 };
                }
                if (mode === 'warrior-stats') {
                    return { ...base, x: m.duel_won || 0, y: m.recoveries || 0 };
                }
                if (mode === 'ball-carrying') {
                    return { ...base, x: m.dribbles_succeeded || 0, y: m.touches_opp_box || 0 };
                }
                if (mode === 'progression') {
                    return { ...base, x: m.passes_into_final_third || 0, y: m.recoveries || 0 };
                }
                if (mode === 'wall-mode') {
                    return { ...base, x: m.saves || 0, y: m.goals_prevented || 0 };
                }
                return { ...base, x: 0, y: 0 };
            })
            // Filter out 0/0 points for cleaner charts in specialized modes
            .filter(d => (d.x as number) > 0 || (d.y as number) > 0);
    };

    const data = getData();
    const currentMode = MODES.find(m => m.id === mode)!;

    // Calculate performance metrics
    const totalX = data.reduce((sum, d) => sum + (d.x as number), 0);
    const totalY = data.reduce((sum, d) => sum + (d.y as number), 0);

    // Only calculate overperformance for xG vs Goals
    const overperformance = mode === 'xg-goals' ? totalY - totalX : 0;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-black text-white p-3 border-2 border-white shadow-lg z-50">
                    <p className=" text-sm" style={{ fontFamily: "var(--font-bangers)" }}>vs {d.opponent}</p>
                    <p className="font-mono text-xs text-gray-400">{d.date}</p>
                    <div className="mt-2 space-y-1">
                        <p className="font-mono text-sm">
                            {mode === 'xg-goals' && `xG: ${d.x?.toFixed(2)} → Goals: ${d.y}`}
                            {mode === 'threat-gen' && `xG: ${d.x?.toFixed(2)} / xA: ${d.y?.toFixed(2)}`}
                            {mode === 'warrior-stats' && `Duels: ${d.x} / Recovs: ${d.y}`}
                            {mode === 'ball-carrying' && `Dribbles: ${d.x} / Box: ${d.y}`}
                            {mode === 'progression' && `Passes Final 3rd: ${d.x} / Recovs: ${d.y}`}
                            {mode === 'wall-mode' && `Saves: ${d.x} / Prev: ${d.y?.toFixed(2)}`}
                        </p>
                        <p className="font-mono text-xs text-yellow-400">Rating: {typeof d.rating === 'string' ? parseFloat(d.rating).toFixed(1) : d.rating?.toFixed(1)}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getAxisLabels = () => {
        switch (mode) {
            case 'xg-goals': return { x: 'Expected Goals', y: 'Goals' };
            case 'threat-gen': return { x: 'Expected Goals (xG)', y: 'Expected Assists (xA)' };
            case 'warrior-stats': return { x: 'Duels Won', y: 'Ball Recoveries' };
            case 'ball-carrying': return { x: 'Dribbles Completed', y: 'Touches in Box' };
            case 'progression': return { x: 'Passes into Final 3rd', y: 'Ball Recoveries' };
            case 'wall-mode': return { x: 'Saves', y: 'Goals Prevented' };
            default: return { x: 'X', y: 'Y' };
        }
    }

    const { x: xLabel, y: yLabel } = getAxisLabels();

    return (
        <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0_#000]">
            {/* Header */}
            <div className="bg-black text-white p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <span className=" text-xl uppercase tracking-widest text-yellow-400" style={{ fontFamily: "var(--font-bangers)" }}>Efficiency Chart</span>
                    <p className="font-mono text-[10px] text-white/60 mt-1">{currentMode.description}</p>
                </div>
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as ChartMode)}
                    className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold uppercase border-2 border-white cursor-pointer"
                >
                    {MODES.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                </select>
            </div>

            {/* Chart */}
            <div className="p-6 bg-[#fffdf5] border-2 border-black">
                <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name={xLabel}
                            tick={{ fill: '#000', fontSize: 11, fontWeight: 'bold' }}
                            axisLine={{ stroke: '#000', strokeWidth: 2 }}
                            label={{
                                value: xLabel,
                                position: 'bottom',
                                offset: 0,
                                style: { fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase' }
                            }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name={yLabel}
                            tick={{ fill: '#000', fontSize: 11, fontWeight: 'bold' }}
                            axisLine={{ stroke: '#000', strokeWidth: 2 }}
                            label={{
                                value: yLabel,
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase' }
                            }}
                        />
                        <ZAxis type="number" dataKey="size" range={[60, 200]} />
                        {mode === 'xg-goals' && (
                            <ReferenceLine
                                segment={[{ x: 0, y: 0 }, { x: 2, y: 2 }]}
                                stroke="#999"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter
                            data={data}
                            fill="#ef4444"
                            stroke="#000"
                            strokeWidth={2}
                        />
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs font-mono">
                    {mode === 'xg-goals' && (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 border border-black rounded-full"></div>
                                <span>Match Performance</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0 border-t-2 border-dashed border-gray-500"></div>
                                <span>Expected Line (y=x)</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-100 border-t-2 border-black p-3">
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="text-center px-4 py-2 border-2 border-black bg-white">
                        <p className="font-mono text-[10px] uppercase text-gray-500">Matches</p>
                        <p className=" text-2xl" style={{ fontFamily: "var(--font-bangers)" }}>{data.length}</p>
                    </div>
                    <div className="text-center px-4 py-2 border-2 border-black bg-white">
                        <p className="font-mono text-[10px] uppercase text-gray-500">
                            Avg. {xLabel}
                        </p>
                        <p className=" text-2xl" style={{ fontFamily: "var(--font-bangers)" }}>{(data.length ? totalX / data.length : 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center px-4 py-2 border-2 border-black bg-white">
                        <p className="font-mono text-[10px] uppercase text-gray-500">
                            Avg. {yLabel}
                        </p>
                        <p className=" text-2xl" style={{ fontFamily: "var(--font-bangers)" }}>{(data.length ? totalY / data.length : 0).toFixed(2)}</p>
                    </div>
                    {mode === 'xg-goals' && (
                        <div className={`text-center px-4 py-2 border-2 border-black ${overperformance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            <p className="font-mono text-[10px] uppercase text-gray-500">Over/Under</p>
                            <p className={`font-header-main text-2xl ${overperformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {overperformance >= 0 ? '+' : ''}{overperformance.toFixed(1)}
                            </p>
                        </div>
                    )}
                    <div className="text-center px-4 py-2 border-2 border-black bg-white">
                        <p className="font-mono text-[10px] uppercase text-gray-500">Correlation (r)</p>
                        <p className=" text-2xl" style={{ fontFamily: "var(--font-bangers)" }}>
                            {(() => {
                                const n = data.length;
                                if (n < 2) return "N/A";

                                const x = data.map(d => d.x as number);
                                const y = data.map(d => d.y as number);

                                const sumX = x.reduce((a, b) => a + b, 0);
                                const sumY = y.reduce((a, b) => a + b, 0);
                                const sumXY = x.reduce((a, b, i) => a + x[i] * y[i], 0);
                                const sumX2 = x.reduce((a, b) => a + b * b, 0);
                                const sumY2 = y.reduce((a, b) => a + b * b, 0);

                                const numerator = (n * sumXY) - (sumX * sumY);
                                const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

                                if (denominator === 0) return "0.00";
                                return (numerator / denominator).toFixed(2);
                            })()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
