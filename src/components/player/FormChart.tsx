"use client";

import { TrendDataPoint } from '@/lib/playerHelpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { Star, CircleDot, ArrowUpRight } from 'lucide-react';

interface FormChartProps {
    data: TrendDataPoint[];
    playerName: string;
    position: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_#000] p-3 min-w-[150px]">
                <p className="font-header-main text-lg border-b-2 border-black mb-2 pb-1">{label}</p>
                <div className="space-y-1 font-mono text-xs">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex justify-between items-center font-bold" style={{ color: entry.color || entry.fill }}>
                            <span className="flex items-center gap-1">
                                {entry.name === 'Avg Rating' && <Star size={12} fill="currentColor" />}
                                {['Goals', 'Saves', 'Tackles', 'Duels Won'].includes(entry.name) && <CircleDot size={12} />}
                                {['Assists', 'Conceded', 'Interceptions'].includes(entry.name) && <ArrowUpRight size={12} />}
                                {entry.name}:
                            </span>
                            <span>{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function FormChart({ data, playerName, position }: FormChartProps) {
    // ... (data aggregation logic remains same)
    // Aggregate data by month
    const monthlyData = data.reduce((acc, point) => {
        const date = new Date(point.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        if (!acc[monthKey]) {
            acc[monthKey] = {
                monthKey,
                displayMonth: monthLabel,
                goals: 0,
                assists: 0,

                // Extended
                saves: 0,
                conceded: 0,
                cleanSheets: 0,
                tackles: 0,
                interceptions: 0,
                duelsWon: 0,
                matches: 0,

                totalRating: 0
            };
        }

        acc[monthKey].goals += point.goals;
        acc[monthKey].assists += point.assists;
        acc[monthKey].saves += point.saves || 0;
        acc[monthKey].conceded += point.conceded || 0;
        acc[monthKey].cleanSheets += point.cleanSheet || 0;
        acc[monthKey].tackles += point.tackles || 0;
        acc[monthKey].interceptions += point.interceptions || 0;
        acc[monthKey].duelsWon += point.duelsWon || 0;

        acc[monthKey].totalRating += point.rating;
        acc[monthKey].matches += 1;

        return acc;
    }, {} as Record<string, {
        monthKey: string;
        displayMonth: string;
        goals: number;
        assists: number;
        saves: number;
        conceded: number;
        cleanSheets: number;
        tackles: number;
        interceptions: number;
        duelsWon: number;
        totalRating: number;
        matches: number
    }>);

    const formattedData = Object.values(monthlyData)
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        .map(month => ({
            displayDate: month.displayMonth,
            goals: month.goals,
            assists: month.assists,
            saves: month.saves,
            conceded: month.conceded,
            cleanSheets: month.cleanSheets,
            tackles: month.tackles,
            interceptions: month.interceptions,
            duelsWon: month.duelsWon,
            rating: month.matches > 0 ? parseFloat((month.totalRating / month.matches).toFixed(1)) : 0,
            matches: month.matches
        }));

    // Group Mapping
    const pos = position.toUpperCase();
    let chartConfig = {
        primary: { key: 'goals', label: 'Goals', color: '#a50044' },
        secondary: { key: 'assists', label: 'Assists', color: '#ffed02' }
    };

    if (pos === 'GK') {
        chartConfig = {
            primary: { key: 'saves', label: 'Saves', color: '#16a34a' }, // Green
            secondary: { key: 'conceded', label: 'Conceded', color: '#dc2626' } // Red
        };
    } else if (['CB', 'RB', 'LB', 'RWB', 'LWB', 'DEF'].includes(pos)) {
        chartConfig = {
            primary: { key: 'tackles', label: 'Tackles', color: '#2563eb' }, // Blue
            secondary: { key: 'interceptions', label: 'Interceptions', color: '#9333ea' } // Purple
        };
    } else if (['CDM', 'CM', 'CAM', 'RM', 'LM', 'MID'].includes(pos)) {
        chartConfig = {
            primary: { key: 'duelsWon', label: 'Duels Won', color: '#ea580c' }, // Orange
            secondary: { key: 'tackles', label: 'Tackles', color: '#2563eb' } // Blue
        };
    }
    // FWD stays Goals/Assists

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="displayDate"
                        stroke="#000"
                        tick={{ fill: '#000', fontSize: 11, fontWeight: 'bold' }}
                        angle={-25}
                        textAnchor="end"
                        height={70}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#000"
                        tick={{ fill: '#000', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#000"
                        tick={{ fill: '#000', fontSize: 11, fontWeight: 'bold' }}
                        domain={[0, 10]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '4 4' }} />
                    <Legend
                        wrapperStyle={{ color: '#000', paddingTop: 20, fontFamily: 'var(--font-header-main)', fontSize: '18px' }}
                        iconType="star"
                    />
                    <Bar yAxisId="left" dataKey={chartConfig.primary.key} fill={chartConfig.primary.color} name={chartConfig.primary.label} radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={2} />
                    <Bar yAxisId="left" dataKey={chartConfig.secondary.key} fill={chartConfig.secondary.color} name={chartConfig.secondary.label} radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={2} />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="rating"
                        stroke="#004d98"
                        strokeWidth={4}
                        dot={{ fill: '#004d98', r: 6, stroke: '#000', strokeWidth: 2 }}
                        activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }}
                        name="Avg Rating"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
