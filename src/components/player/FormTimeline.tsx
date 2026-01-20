"use client";

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface FormTimelineProps {
    matches: any[];
    playerName: string;
    minimal?: boolean;
}

type TimelineMetric = 'rating' | 'goals' | 'assists' | 'all';

const METRICS = [
    { id: 'all' as const, label: 'All Metrics' },
    { id: 'rating' as const, label: 'Rating' },
    { id: 'goals' as const, label: 'Goals' },
    { id: 'assists' as const, label: 'Assists' },
];

export default function FormTimeline({ matches, playerName, minimal = false }: FormTimelineProps) {
    const [metric, setMetric] = useState<TimelineMetric>('all');

    const sortedMatches = [...matches].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
    });

    const data = sortedMatches.map((m, idx) => ({
        index: idx + 1,
        date: m.date,
        opponent: m.opponent,
        rating: (m.fbiRating && m.fbiRating > 0) ? m.fbiRating : (parseFloat(m.rating) || 0),
        ratingSource: (m.fbiRating && m.fbiRating > 0) ? 'FBI' : 'FOTMOB',
        goals: m.goals || 0,
        assists: m.assists || 0,
        competition: m.competition || 'Domestic',
        result: m.result || 'N/A',
    }));

    const avgRating = data.reduce((sum, d) => sum + d.rating, 0) / data.length;
    const avgGoals = data.reduce((sum, d) => sum + d.goals, 0) / data.length;
    const avgAssists = data.reduce((sum, d) => sum + d.assists, 0) / data.length;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-black text-white p-3 border-2 border-yellow-400 shadow-lg max-w-xs">
                    <p className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-bangers)' }}>vs {d.opponent}</p>
                    <p className="font-mono text-[10px] text-gray-400 mb-2">{d.date ? format(parseISO(d.date), 'MMM d, yyyy') : 'Unknown'} • {d.competition}</p>
                    <div className="space-y-1 font-mono text-xs">
                        <p><span className="text-yellow-400">Rating ({d.ratingSource}):</span> {d.rating.toFixed(1)}</p>
                        <p><span className="text-red-400">Goals:</span> {d.goals}</p>
                        <p><span className="text-blue-400">Assists:</span> {d.assists}</p>
                        <p><span className="text-gray-400">Result:</span> {d.result}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={minimal ? "bg-white" : "bg-white border-4 border-black shadow-[8px_8px_0_#000]"}>
            {!minimal ? (
                <div className="bg-black text-white p-4 border-b-4 border-black">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl uppercase tracking-wider text-yellow-400" style={{ fontFamily: 'var(--font-bangers)' }}>Form Timeline</h2>
                            <p className="font-mono text-xs text-white/60 mt-1">{playerName} • Match Progression</p>
                        </div>
                        <div className="flex border-2 border-white">
                            {METRICS.map(m => (
                                <button key={m.id} onClick={() => setMetric(m.id)} className={`px-3 py-1 text-xs font-bold uppercase transition-colors ${metric === m.id ? 'bg-yellow-400 text-black' : 'bg-transparent text-white hover:bg-white/20'}`}>{m.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-end p-2 border-b-2 border-dashed border-gray-300">
                    <div className="flex border-2 border-black bg-black">
                        {METRICS.map(m => (
                            <button key={m.id} onClick={() => setMetric(m.id)} className={`px-2 py-1 text-[10px] font-bold uppercase transition-colors ${metric === m.id ? 'bg-yellow-400 text-black' : 'bg-transparent text-white hover:bg-white/20'}`}>{m.label}</button>
                        ))}
                    </div>
                </div>
            )}
            <div className={`p-6 bg-[#fffdf5] ${minimal ? '' : 'border-2 border-black'}`}>
                {data.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 font-mono">No match data available</div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                                <XAxis dataKey="index" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} label={{ value: 'Match Number', position: 'bottom', offset: 0, style: { fontSize: 11, fontFamily: 'monospace' } }} />
                                <YAxis tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} domain={metric === 'rating' ? [0, 10] : [0, 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="line" />
                                {(metric === 'all' || metric === 'rating') && (<Line type="monotone" dataKey="rating" stroke="#eab308" strokeWidth={metric === 'rating' ? 3 : 2} dot={{ fill: '#ffed02', strokeWidth: 2, r: 4 }} name="Rating" />)}
                                {(metric === 'all' || metric === 'goals') && (<Line type="monotone" dataKey="goals" stroke="#ef4444" strokeWidth={metric === 'goals' ? 3 : 2} dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }} name="Goals" />)}
                                {(metric === 'all' || metric === 'assists') && (<Line type="monotone" dataKey="assists" stroke="#3b82f6" strokeWidth={metric === 'assists' ? 3 : 2} dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} name="Assists" />)}
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-6 border-t-2 border-black pt-4">
                            <h3 className="text-sm uppercase font-bold mb-3 text-gray-700 flex items-center gap-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                                <Sparkles size={16} className="text-yellow-500" /> Standout Performances
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {data.filter(d => d.rating >= 8.5 || d.goals >= 2 || d.assists >= 2).slice(0, 6).map((d, idx) => (
                                    <div key={idx} className="bg-yellow-100 border-2 border-black p-2 shadow-[2px_2px_0_#000] hover:-translate-y-1 transition-transform">
                                        <p className="text-xs font-bold truncate" style={{ fontFamily: 'var(--font-bangers)' }}>vs {d.opponent}</p>
                                        <div className="flex justify-between text-[10px] font-mono mt-1">
                                            <span>Rating: {d.rating.toFixed(1)}</span>
                                            <span>{d.goals}G {d.assists}A</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {!minimal && (
                <div className="bg-gray-100 border-t-2 border-black p-3">
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="text-center px-4 py-2 border-2 border-black bg-white">
                            <p className="font-mono text-[10px] uppercase text-gray-500">Avg Rating</p>
                            <p className="text-2xl" style={{ fontFamily: 'var(--font-bangers)' }}>{avgRating.toFixed(2)}</p>
                        </div>
                        <div className="text-center px-4 py-2 border-2 border-black bg-white">
                            <p className="font-mono text-[10px] uppercase text-gray-500">Avg Goals/Match</p>
                            <p className="text-2xl" style={{ fontFamily: 'var(--font-bangers)' }}>{avgGoals.toFixed(2)}</p>
                        </div>
                        <div className="text-center px-4 py-2 border-2 border-black bg-white">
                            <p className="font-mono text-[10px] uppercase text-gray-500">Avg Assists/Match</p>
                            <p className="text-2xl" style={{ fontFamily: 'var(--font-bangers)' }}>{avgAssists.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
