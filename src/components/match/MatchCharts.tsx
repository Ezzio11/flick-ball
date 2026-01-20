"use client";

import { MatchData } from '@/lib/matchHelpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface MatchChartsProps {
    match: MatchData;
}

export default function MatchCharts({ match }: MatchChartsProps) {
    const stats = match.stats;

    // xG comparison (safe access)
    const xGData = [
        { name: 'Expected (xG)', value: parseFloat(stats.xG || '0'), fill: '#004d98' },
        { name: 'Actual Goals', value: match.score.split(' - ')[match.isHome ? 0 : 1] || 0, fill: '#ffed02' }
    ];

    // Shot distribution
    const shotData = [
        { name: 'On Target', value: stats.shotsOnTarget || 0, fill: '#22c55e' },
        { name: 'Off Target', value: stats.shotsOffTarget || 0, fill: '#ef4444' },
        { name: 'Blocked', value: stats.blockedShots || 0, fill: '#6b7280' }
    ];

    // Passing zones
    const passingData = [
        { zone: 'Own Half', passes: stats.ownHalfPasses || 0 },
        { zone: 'Opp Half', passes: stats.oppositionHalfPasses || 0 }
    ];

    // Duels breakdown
    const duelsData = [
        { name: 'Ground Won', value: stats.groundDuelsWon?.percentage ? parseInt(stats.groundDuelsWon.percentage) : 0, fill: '#004d98' },
        { name: 'Aerial Won', value: stats.aerialDuelsWon?.percentage ? parseInt(stats.aerialDuelsWon.percentage) : 0, fill: '#a50044' }
    ];

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] mb-8">
            <div className="bg-[#ffed02] text-black p-4 border-b-4 border-black">
                <h2 className="text-3xl font-black uppercase text-center" style={{ fontFamily: 'var(--font-bangers)' }}>
                    Match Analytics
                </h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* xG vs Actual Goals */}
                    <div className="bg-gray-50 border-3 border-black p-4">
                        <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                            xG vs Actual
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={xGData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 12 }}
                                />
                                <YAxis
                                    tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '2px solid #000',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <Bar dataKey="value" fill="#004d98">
                                    {xGData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000" strokeWidth={2} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-center mt-2 font-mono text-gray-600">
                            Performance vs Expectation
                        </p>
                    </div>

                    {/* Shot Distribution */}
                    <div className="bg-gray-50 border-3 border-black p-4">
                        <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Shot Breakdown
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={shotData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="#000"
                                    strokeWidth={2}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                >
                                    {shotData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '2px solid #000',
                                        fontFamily: 'monospace'
                                    }}
                                    formatter={(value: any) => {
                                        const val = Number(value);
                                        const total = shotData.reduce((acc, curr) => acc + (curr.value as number), 0);
                                        if (total === 0) return '0%';
                                        return `${((val / total) * 100).toFixed(1)}%`;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-center mt-2 font-mono text-gray-600">
                            Total: {stats.totalShots} shots
                        </p>
                    </div>

                    {/* Passing Zones */}
                    <div className="bg-gray-50 border-3 border-black p-4">
                        <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Passing Territory
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={passingData} layout="vertical">
                                <XAxis
                                    type="number"
                                    tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 12 }}
                                />
                                <YAxis
                                    dataKey="zone"
                                    type="category"
                                    width={80}
                                    tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '2px solid #000',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <Bar dataKey="passes" fill="#004d98" stroke="#000" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-center mt-2 font-mono text-gray-600">
                            Pass Accuracy: {stats.accuratePasses?.percentage}
                        </p>
                    </div>

                    {/* Duels Success */}
                    <div className="bg-gray-50 border-3 border-black p-4">
                        <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Duels Success %
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={duelsData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '2px solid #000',
                                        fontFamily: 'monospace'
                                    }}
                                    formatter={(value) => `${value}%`}
                                />
                                <Bar dataKey="value" fill="#004d98">
                                    {duelsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000" strokeWidth={2} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-center mt-2 font-mono text-gray-600">
                            Total Duels: {stats.duelsWon || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
