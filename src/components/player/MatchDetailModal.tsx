"use client";

import { useState, useEffect } from 'react';
import { X, Trophy, Calendar, MapPin, Gauge, Shield, Activity, Footprints, ChartBar, Info, Calculator, ChevronDown, ChevronUp, Goal, ArrowUpRight, Crosshair, Target, ArrowRightLeft, Key, Fingerprint, Swords, RefreshCcw, Magnet, AlertTriangle, Ban } from 'lucide-react';

interface MatchDetailModalProps {
    match: any;
    onClose: () => void;
}

// Helper: Reconstruct the math for display
// NOTE: These weights must match src/lib/fbi-rating.ts
const POSITION_WEIGHTS: Record<string, any> = {
    GK: { offensive: 0.2, passing: 0.3, defensive: 1.0, retention: 0.2 },
    DEF: { offensive: 0.4, passing: 0.6, defensive: 1.0, retention: 0.5 },
    MID: { offensive: 0.7, passing: 1.0, defensive: 0.6, retention: 0.8 },
    FWD: { offensive: 1.0, passing: 0.6, defensive: 0.5, retention: 1.0 },
    // Defaults if unknown
    Unknown: { offensive: 0.7, passing: 1.0, defensive: 0.6, retention: 0.8 }
};

export default function MatchDetailModal({ match, onClose }: MatchDetailModalProps) {
    const [showMath, setShowMath] = useState(false);

    // Scroll Lock & Escape Key
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!match) return null;

    // Helper to calculate percentage for progress bars
    const getPercentage = (val: number, max: number = 10) => Math.min(100, Math.max(0, (val / max) * 100));

    // Determine colors based on rating
    const getRatingColor = (rating: number) => {
        if (rating >= 8.5) return 'text-green-600';
        if (rating >= 7.0) return 'text-[#004d98]';
        if (rating >= 6.0) return 'text-yellow-600';
        return 'text-red-600';
    };

    const pos = match.fbiBreakdown?.position || 'MID';
    const weights = POSITION_WEIGHTS[pos] || POSITION_WEIGHTS['MID'];

    // Use exact context factors from the FBI calculation
    const difficultyStart = match.fbiBreakdown?.contextFactors?.difficulty || 1.0;
    const rawResultMod = match.fbiBreakdown?.contextFactors?.resultMod || 0;
    const resultMod = 1 + rawResultMod;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full h-full md:h-auto md:max-w-5xl md:max-h-[90vh] overflow-y-auto md:overflow-hidden border-none md:border-[6px] border-black shadow-none md:shadow-[16px_16px_0_#000] relative animate-in zoom-in-95 duration-200 flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute inset-0 bg-[url('/patterns/noise.svg')] opacity-5 pointer-events-none z-0"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black text-white hover:bg-red-600 transition-colors border-2 border-white shadow-[4px_4px_0_rgba(0,0,0,0.5)] rounded-full md:rounded-none"
                >
                    <X size={24} />
                </button>


                {/* LEFT PANEL: THE VERDICT (Mobile Top / Desktop Left) */}
                <div className="w-full md:w-1/3 bg-[#ffed02] border-b-4 md:border-b-0 md:border-r-4 border-black p-8 flex flex-col relative overflow-hidden shrink-0">
                    {/* Halftone BG Pattern */}
                    <div className="absolute inset-0 comic-halftone opacity-10 pointer-events-none"></div>

                    {/* Mission Header */}
                    <div className="relative z-10 mb-8 border-b-4 border-black pb-4">
                        <h2 className="text-5xl uppercase leading-[0.9] text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" style={{ fontFamily: 'var(--font-bangers)' }}>
                            vs<br />{match.opponent}
                        </h2>
                    </div>

                    {/* Rating Circle */}
                    <div className="relative z-10 flex-grow flex flex-col justify-center items-center py-6">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Starburst BG */}
                            <div className="absolute inset-0 bg-white border-4 border-black rotate-3 shadow-[8px_8px_0_rgba(0,0,0,1)]"></div>
                            <div className="absolute inset-0 bg-black rotate-6 opacity-10"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold tracking-widest mb-1">FBI Rating</span>
                                <span className={`text-8xl leading-none font-black ${getRatingColor(match.fbiRating)}`} style={{ fontFamily: 'var(--font-bangers)' }}>
                                    {match.fbiBreakdown.final.toFixed(1)}
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Meta Data */}
                    <div className="relative z-10 mt-auto pt-6 border-t-4 border-black space-y-2 font-mono text-xs font-bold">
                        <div className="flex items-center gap-2">
                            <Trophy size={14} /> {match.competition}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} /> {new Date(match.date).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-full md:w-2/3 bg-white p-6 md:p-8 md:overflow-y-auto">

                    {/* Header with Toggles */}
                    <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-2">
                        <h3 className="text-3xl uppercase inline-block pr-6" style={{ fontFamily: 'var(--font-bangers)' }}>
                            {showMath ? "The Algorithm" : "Tactical Analysis"}
                        </h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg border-2 border-black/10">
                            <button
                                onClick={() => setShowMath(false)}
                                className={`px-3 py-1 text-xs font-bold uppercase rounded ${!showMath ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}
                            >
                                Stats
                            </button>
                            <button
                                onClick={() => setShowMath(true)}
                                className={`px-3 py-1 text-xs font-bold uppercase rounded ${showMath ? 'bg-[#ffed02] text-black border border-black shadow-md' : 'text-gray-400 hover:text-black'}`}
                            >
                                Formula
                            </button>
                        </div>
                    </div>

                    {!showMath ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* OFFENSIVE PANEL */}
                            <ComicPanel
                                title="Offensive Threat"
                                score={match.fbiBreakdown.offensive}
                                color="red"
                                icon={<Gauge size={18} />}
                                stats={[
                                    { label: 'Goals', value: match.goals, icon: <Goal size={14} className="text-black" /> },
                                    { label: 'Assists', value: match.assists, icon: <ArrowUpRight size={14} className="text-black" /> },
                                    { label: 'xG', value: match.expected_goals, highlight: true, icon: <Crosshair size={14} className="text-black" /> },
                                    { label: 'Shots', value: match.total_shots, icon: <Target size={14} className="text-black" /> },
                                ]}
                            />

                            {/* PASSING PANEL */}
                            <ComicPanel
                                title="Playmaking & Flow"
                                score={match.fbiBreakdown.passing}
                                color="blue"
                                icon={<Activity size={18} />}
                                stats={[
                                    { label: 'Passes', value: match.accurate_passes, icon: <ArrowRightLeft size={14} className="text-black" /> },
                                    { label: 'xA', value: match.expected_assists, highlight: true, icon: <Crosshair size={14} className="text-black" /> },
                                    { label: 'Key Passes', value: match.chances_created, icon: <Key size={14} className="text-black" /> },
                                    { label: 'Touches', value: match.touches, icon: <Fingerprint size={14} className="text-black" /> },
                                ]}
                            />

                            {/* DEFENSIVE PANEL */}
                            <ComicPanel
                                title="Defensive Work"
                                score={match.fbiBreakdown.defensive}
                                color="green"
                                icon={<Shield size={18} />}
                                stats={[
                                    { label: 'Tackles', value: match['matchstats.headers.tackles'], icon: <Footprints size={14} className="text-black" /> }, // Note: check key
                                    { label: 'Duels Won', value: match.duel_won, icon: <Swords size={14} className="text-black" /> },
                                    { label: 'Recoveries', value: match.recoveries, icon: <RefreshCcw size={14} className="text-black" /> },
                                    { label: 'Interceptions', value: match.interceptions, icon: <Magnet size={14} className="text-black" /> },
                                ]}
                            />

                            {/* RETENTION PANEL */}
                            <ComicPanel
                                title="Ball Retention"
                                score={match.fbiBreakdown.retention}
                                color="yellow"
                                icon={<Footprints size={18} />}
                                stats={[
                                    { label: 'Dispossessed', value: match.dispossessed, icon: <AlertTriangle size={14} className="text-black" /> },
                                    { label: 'Turnovers', value: match.turnovers, icon: <Ban size={14} className="text-black" /> },
                                ]}
                            />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-yellow-50 p-6 border-2 border-black rotate-1 shadow-[8px_8px_0_rgba(0,0,0,0.1)] font-sans text-sm relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 border-2 border-black font-bold uppercase text-[10px] tracking-widest">
                                    The Math
                                </div>

                                <h4 className="font-bold border-b-2 border-black/10 pb-2 mb-4 uppercase text-gray-500 text-xs">
                                    Weighted Algorithm ({pos})
                                </h4>

                                {/* Top Level Equation */}
                                <div className="mb-6 bg-white p-4 border border-black/10 rounded-lg">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-wider">Step 1: Raw Performance</div>
                                    <div className="flex flex-wrap items-center gap-2 text-lg font-bold font-mono text-gray-400">
                                        <span className="text-red-500">({match.fbiBreakdown.offensive} × {weights.offensive})</span>
                                        <span>+</span>
                                        <span className="text-blue-500">({match.fbiBreakdown.passing} × {weights.passing})</span>
                                        <span>+</span>
                                        <span className="text-green-500">({match.fbiBreakdown.defensive} × {weights.defensive})</span>
                                        <span>+</span>
                                        <span className="text-yellow-600">({match.fbiBreakdown.retention} × {weights.retention})</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-500">RAW SCORE</span>
                                        <span className="text-xl font-bold font-mono">{match.fbiBreakdown.raw.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Step 2: Context */}
                                <div className="mb-6 bg-white p-4 border border-black/10 rounded-lg">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-wider">Step 2: Context Boost</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                        <div className="flex justify-between"><span>Opponent Difficulty:</span> <span className="font-mono font-bold text-black" title="Based on Tier">x{difficultyStart.toFixed(1)}</span></div>
                                        <div className="flex justify-between"><span>Match Result:</span> <span className="font-mono font-bold text-black" title="Win/Loss">x{resultMod.toFixed(1)}</span></div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-500">CONTEXT ADJUSTED</span>
                                        <span className="text-xl font-bold font-mono">{match.fbiBreakdown.contextAdjusted?.toFixed(2) || "???"}</span>
                                    </div>
                                </div>

                                {/* Step 3: Normalization */}
                                <div className="bg-[#004d98] text-white p-4 border border-black shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                                    <div className="text-[10px] text-blue-200 uppercase font-bold mb-1 tracking-wider">Step 3: Final Normalization</div>
                                    <p className="text-[10px] mb-2 leading-tight opacity-80">
                                        The score is mapped to a bell curve (mean ~6.5) and capped at 10.0.
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-black uppercase tracking-widest">Final Rating</span>
                                        <span className="text-3xl font-black font-mono text-[#ffed02]">{match.fbiBreakdown.final.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// Sub-component for a comic panel section
function ComicPanel({ title, score, color, icon, stats }: { title: string, score: number, color: string, icon: React.ReactNode, stats: { label: string, value: any, icon?: React.ReactNode, highlight?: boolean }[] }) {
    const colorClasses: Record<string, string> = {
        red: 'bg-red-50 border-red-200 text-red-700 bar-red',
        blue: 'bg-blue-50 border-blue-200 text-blue-700 bar-blue',
        green: 'bg-green-50 border-green-200 text-green-700 bar-green',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 bar-yellow',
    };

    const barColors: Record<string, string> = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
    };

    const baseClass = colorClasses[color] || colorClasses.red;
    const barColor = barColors[color] || 'bg-gray-500';

    // Filter out undefined stats
    const validStats = stats.filter(s => s.value !== undefined && s.value !== null);

    return (
        <div className={`p-4 border-l-4 ${baseClass.split(' ')[1]} ${baseClass.split(' ')[0]} relative`}>
            {/* Header: Title + Score Bar */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-bold uppercase">
                    {icon}
                    <span>{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black">{score.toFixed(1)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white rounded-full overflow-hidden border border-black/10 mb-4 w-full">
                <div className={`h-full ${barColor}`} style={{ width: `${Math.min(100, (score / 5) * 100)}%` }}></div>
            </div>

            {/* Micro Stats Grid */}
            <div className="flex flex-wrap gap-3">
                {validStats.map((stat, idx) => (
                    <div key={idx} className={`text-xs px-2 py-1 rounded border ${stat.highlight ? 'bg-white border-black shadow-[2px_2px_0_rgba(0,0,0,0.1)]' : 'border-transparent text-gray-600'}`}>
                        <span className="uppercase font-bold text-[10px] opacity-70 mr-1">{stat.label}</span>
                        <span className="font-mono font-black text-sm text-black">
                            {stat.icon} {typeof stat.value === 'number' && !Number.isInteger(stat.value) ? stat.value.toFixed(2) : stat.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
