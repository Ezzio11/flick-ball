"use client";

import { useState, useEffect } from 'react';
import { Calendar, Trophy, Star, TrendingUp, Grid, List, CircleDot, ArrowUpRight, ClipboardList, ArrowUp, ArrowDown } from 'lucide-react';
import FormTimeline from './FormTimeline';
import MatchDetailModal from './MatchDetailModal';

interface MatchTimelineProps {
    matches: any[];
    playerName: string;
    playerSlug?: string;
}

// Heatmap grouping logic
type HeatmapMode = 'opponents' | 'competitions' | 'venue';
type HeatmapMetric = 'rating' | 'goals_per_90' | 'key_actions' | 'goals' | 'assists';

export default function MatchTimeline({ matches, playerName, playerSlug }: MatchTimelineProps) {
    // View state
    const [viewMode, setViewMode] = useState<'timeline' | 'heatmap' | 'graph'>('timeline');

    // Timeline Filter state
    const [selectedOpponent, setSelectedOpponent] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal state
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

    // Handle back button / swipe to close modal
    useEffect(() => {
        const handlePopState = () => {
            // If back button is pressed, we close the modal
            setSelectedMatch(null);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const openMatchModal = (match: any) => {
        setSelectedMatch(match);
        // Push state so back button works
        window.history.pushState({ modalOpen: true }, '', window.location.href);
    };

    const closeMatchModal = () => {
        // If we close manually, we should go back to pop the state we pushed
        // Check if state is present to avoid double back?
        // Simpler approach: Just go back.
        window.history.back();
    };

    // Heatmap state
    const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('opponents');
    const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>('rating');

    // --- SHARED UTILS ---

    // Normalize competition names for display
    const normalizeCompetition = (comp: string) => {
        if (!comp || comp === 'Unknown') return 'Other';
        if (comp.toLowerCase().includes('champions league')) return 'Champions League';
        if (comp.toLowerCase().includes('laliga') || comp.toLowerCase() === 'la liga') return 'La Liga';
        if (comp.toLowerCase().includes('copa del rey')) return 'Copa del Rey';
        if (comp.toLowerCase().includes('supercopa') || comp.toLowerCase().includes('super cup')) return 'Supercopa de España';
        return comp;
    };

    // --- TIMELINE LOGIC ---

    // Get unique opponents with normalized names
    const opponents = ['all', ...Array.from(new Set(matches.map(m => m.opponent).filter(Boolean))).sort()];

    // Filter matches
    const filteredMatches = matches.filter(match => {
        const opponentMatch = selectedOpponent === 'all' || match.opponent === selectedOpponent;
        return opponentMatch;
    });

    // Sort matches
    const sortedMatches = [...filteredMatches].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Check if any filter is active
    const isFiltered = selectedOpponent !== 'all';

    // --- HEATMAP LOGIC ---

    const aggregateHeatmapData = () => {
        const sourceMatches = matches;

        const grouped: Record<string, any[]> = {};
        sourceMatches.forEach(match => {
            let key = '';
            if (heatmapMode === 'opponents') key = match.opponent || 'Unknown';
            else if (heatmapMode === 'competitions') key = normalizeCompetition(match.competition) || 'Other';
            else if (heatmapMode === 'venue') key = match.venue || 'N/A';

            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(match);
        });

        const data = Object.entries(grouped).map(([category, categoryMatches]) => {
            const totalMinutes = categoryMatches.reduce((sum, m) => sum + (m.minutes_played || 90), 0);
            const matchesCount = categoryMatches.length;
            const avgRating = categoryMatches.reduce((sum, m) => sum + (parseFloat(m.fbiRating || m.rating) || 0), 0) / matchesCount;
            const totalGoals = categoryMatches.reduce((sum, m) => sum + (m.goals || 0), 0);
            const totalAssists = categoryMatches.reduce((sum, m) => sum + (m.assists || 0), 0);
            const goalsPer90 = (totalGoals / totalMinutes) * 90;
            const keyActions = totalGoals + totalAssists;

            let value = 0;
            if (heatmapMetric === 'rating') value = avgRating;
            else if (heatmapMetric === 'goals_per_90') value = goalsPer90;
            else if (heatmapMetric === 'key_actions') value = keyActions;
            else if (heatmapMetric === 'goals') value = totalGoals;
            else if (heatmapMetric === 'assists') value = totalAssists;

            return { category, value, matches: matchesCount, goals: totalGoals, assists: totalAssists, avgRating, keyActions, rawMatches: categoryMatches };
        });

        return data.sort((a, b) => b.value - a.value);
    };

    const heatmapData = aggregateHeatmapData();
    const maxHeatmapValue = Math.max(...heatmapData.map(d => d.value), 1);

    const getHeatmapColor = (value: number) => {
        const intensity = Math.min(value / maxHeatmapValue, 1);
        if (intensity < 0.3) return { bg: 'bg-red-100', border: 'border-red-600', text: 'text-red-900' };
        if (intensity < 0.6) return { bg: 'bg-yellow-100', border: 'border-yellow-600', text: 'text-yellow-900' };
        return { bg: 'bg-green-100', border: 'border-green-600', text: 'text-green-900' };
    };

    const formatMetricValue = (val: number) => {
        if (heatmapMetric === 'rating') return val.toFixed(1);
        if (heatmapMetric === 'goals_per_90') return val.toFixed(2);
        return val.toFixed(0);
    };

    return (
        <div className="bg-white">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
                <div>

                    <div className="flex items-center gap-3 mt-1">
                        {/* View Toggle */}
                        <div className="flex bg-gray-200 border-2 border-black p-0.5 rounded-sm">
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`p-1 transition-all ${viewMode === 'timeline' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                title="List View"
                            >
                                <List size={14} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => setViewMode('heatmap')}
                                className={`p-1 transition-all ${viewMode === 'heatmap' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                title="Heatmap View"
                            >
                                <Grid size={14} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => setViewMode('graph')}
                                className={`p-1 transition-all ${viewMode === 'graph' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                title="Form Graph"
                            >
                                <TrendingUp size={14} strokeWidth={3} />
                            </button>
                        </div>

                        {viewMode === 'timeline' && (
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                {isFiltered
                                    ? `${sortedMatches.length} of ${matches.length} Appearances`
                                    : `${matches.length} Appearances`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Filters / Controls */}
                <div className="flex flex-wrap gap-2">
                    {viewMode === 'timeline' ? (
                        <>
                            {/* Opponent Filter Only */}
                            <select
                                value={selectedOpponent}
                                onChange={(e) => setSelectedOpponent(e.target.value)}
                                className="px-3 py-2 border-2 border-black bg-white text-black text-xs font-bold uppercase hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0_#000] max-w-[150px] truncate"
                            >
                                {opponents.map(opp => (
                                    <option key={opp} value={opp} className="bg-white">
                                        {opp === 'all' ? 'All Opponents' : opp}
                                    </option>
                                ))}
                            </select>

                            {/* Sort Toggle */}
                            <button
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="px-3 py-2 border-2 border-black bg-white text-black hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0_#000]"
                                title={sortOrder === 'desc' ? "Newest First" : "Oldest First"}
                            >
                                {sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            </button>
                        </>
                    ) : (
                        /* Heatmap Controls */
                        <>
                            <select
                                value={heatmapMode}
                                onChange={(e) => setHeatmapMode(e.target.value as HeatmapMode)}
                                className="px-3 py-2 border-2 border-black bg-yellow-300 text-black text-xs font-bold uppercase hover:bg-yellow-400 shadow-[2px_2px_0_#000]"
                            >
                                <option value="opponents">vs Opponents</option>
                                <option value="competitions">By Competition</option>
                                <option value="venue">Home/Away</option>
                            </select>

                            <select
                                value={heatmapMetric}
                                onChange={(e) => setHeatmapMetric(e.target.value as HeatmapMetric)}
                                className="px-3 py-2 border-2 border-black bg-blue-300 text-black text-xs font-bold uppercase hover:bg-blue-400 shadow-[2px_2px_0_#000]"
                            >
                                <option value="rating">Rating</option>
                                <option value="goals">Goals</option>
                                <option value="assists">Assists</option>
                                <option value="key_actions">G+A</option>
                                <option value="goals_per_90">Goals/90</option>
                            </select>
                        </>
                    )}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-0 max-h-[600px] overflow-y-auto custom-scrollbar border-2 border-black bg-slate-50 relative">

                {viewMode === 'timeline' ? (
                    // TIMELINE VIEW
                    sortedMatches.map((match, idx) => {
                        const score = match.result || "?-?";

                        return (
                            <div
                                key={idx}
                                onClick={() => openMatchModal(match)}
                                className="flex items-center justify-between p-4 border-b-2 border-dashed border-gray-400 hover:bg-yellow-100 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    {/* Date w/ Year */}
                                    <div className="text-xs text-gray-500 font-bold font-mono w-28 shrink-0 border-r-2 border-gray-300 pr-4">
                                        {new Date(match.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>

                                    {/* Opponent & Competition */}
                                    <div className="w-48">
                                        <div className="text-sm  text-black truncate text-lg leading-none" style={{ fontFamily: "var(--font-bangers)" }}>
                                            vs {match.opponent}
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold mt-0.5 bg-gray-200 inline-block px-1 rounded-sm">
                                            {match.competition}
                                        </div>
                                    </div>

                                    {/* Result Score */}
                                    <div className="w-20 text-center">
                                        <span className="text-lg font-black  px-2 py-1 bg-black text-white transform -skew-x-12 inline-block shadow-[2px_2px_0_rgba(0,0,0,0.2)]" style={{ fontFamily: "var(--font-bangers)" }}>
                                            {score}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6">
                                    {/* Player Avatar for Goals/Assists */}
                                    {(match.goals > 0 || match.assists > 0) && playerSlug && (
                                        <div className="hidden sm:block relative w-10 h-10 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.2)] mr-2">
                                            <img
                                                src={`/images/players/${playerSlug}-profile.webp`}
                                                alt={playerName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        {match.goals > 0 && (
                                            <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 border border-green-500 rounded-full" title="Goals">
                                                <CircleDot size={12} className="text-green-700" strokeWidth={3} />
                                                <span className="font-bold text-green-800">{match.goals}</span>
                                            </div>
                                        )}
                                        {match.assists > 0 && (
                                            <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 border border-blue-500 rounded-full" title="Assists">
                                                <ArrowUpRight size={12} className="text-blue-700" strokeWidth={3} />
                                                <span className="font-bold text-blue-800">{match.assists}</span>
                                            </div>
                                        )}

                                        {(match.fbiRating || (match.rating && parseFloat(match.rating) > 0)) && (
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 font-mono">
                                                        {(match.fbiRating && match.fbiRating > 0) ? "FBI" : "FOTMOB"}
                                                    </span>
                                                    <span className={`text-xl font-black font-header-main leading-none ${(match.fbiRating || parseFloat(match.rating)) >= 8.0 ? 'text-[#ffed02] drop-shadow-[1px_1px_0_#000] text-stroke-comic-sm' :
                                                        (match.fbiRating || parseFloat(match.rating)) >= 7.0 ? 'text-[#004d98]' : 'text-gray-500'
                                                        }`} style={{ fontFamily: "var(--font-bangers)" }}>
                                                        {((match.fbiRating && match.fbiRating > 0) ? match.fbiRating : parseFloat(match.rating)).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {match.potm && <Star size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />}
                                    </div>

                                </div>
                            </div>
                        );
                    })
                ) : viewMode === 'heatmap' ? (
                    // HEATMAP VIEW
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {heatmapData.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400 font-mono">No data available for this view</div>
                        ) : (
                            heatmapData.map((item, idx) => {
                                const colors = getHeatmapColor(item.value);
                                // Open the first match of the category for now as representative
                                const representativeMatch = item.rawMatches?.[0];

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (heatmapMode === 'opponents' && item.matches > 1) {
                                                setSelectedOpponent(item.category);
                                                setViewMode('timeline');
                                            } else {
                                                if (representativeMatch) openMatchModal(representativeMatch);
                                            }
                                        }}
                                        className={`${colors.bg} ${colors.border} border-3 p-3 shadow-[2px_2px_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.3)] transition-all cursor-pointer`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`text-sm font-bold uppercase truncate pr-2 ${colors.text}`} style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {item.category}
                                            </h4>
                                            <span className="text-[10px] font-mono bg-white/50 px-1 rounded border border-black/10">
                                                {item.matches}m
                                            </span>
                                        </div>

                                        <div className="flex items-baseline justify-between mb-3">
                                            <span className={`text-3xl font-black leading-none ${colors.text}`} style={{ fontFamily: 'var(--font-bangers)' }}>
                                                {formatMetricValue(item.value)}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-black/40">
                                                {heatmapMetric === 'key_actions' ? 'G+A' : heatmapMetric}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 text-[10px] font-mono border-t border-black/10 pt-2 text-black/70">
                                            <span className="flex items-center gap-0.5"><CircleDot size={10} /> {item.goals}</span>
                                            <span className="flex items-center gap-0.5"><ArrowUpRight size={10} /> {item.assists}</span>
                                            <span className="flex items-center gap-0.5"><Star size={10} fill="currentColor" /> {item.avgRating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    // GRAPH VIEW
                    <div className="p-4">
                        <FormTimeline matches={filteredMatches} playerName={playerName} minimal />
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedMatch && <MatchDetailModal match={selectedMatch} onClose={closeMatchModal} />}
        </div>
    );
}
