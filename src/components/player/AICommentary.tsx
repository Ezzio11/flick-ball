"use client";

import { useState, useEffect } from 'react';
import { AggregatedStats } from '@/lib/playerHelpers';

interface AICommentaryProps {
    playerName: string;
    position: string;
    stats: AggregatedStats;
}

export default function AICommentary({ playerName, position, stats }: AICommentaryProps) {
    const [commentary, setCommentary] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Create a simple hash of the stats object to ensure cache invalidation on updates
        const statsHash = JSON.stringify(stats).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const CACHE_KEY = `commentary_${playerName}_${position}_${statsHash}`;

        const fetchCommentary = async () => {
            // Check cache first
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                setCommentary(cached);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(false);

            const isGoalkeeper = position === 'Goalkeeper' || position === 'GK';

            const isDefender = ['Defender', 'CB', 'RB', 'LB', 'RWB', 'LWB', 'WB'].includes(position) || position.includes('Back');

            // Position-aware prompt
            const prompt = isGoalkeeper
                ? `
Analyze ${playerName} (Goalkeeper) in Hansi Flick's Barcelona this season.

Key Goalkeeper Stats:
- Appearances: ${stats.appearances}
- Clean Sheets: ${stats.totalCleanSheets || 0}
- Saves: ${stats.totalSaves || 0}
- Goals Conceded: ${stats.totalGoalsConceded || 0}
- Average Rating: ${stats.avgRating?.toFixed(2) || 'N/A'}
- Minutes Played: ${stats.totalMinutes}
- Pass Accuracy: ${stats.avgPassAccuracy?.toFixed(1) || 'N/A'}%
- Recoveries: ${stats.totalRecoveries || 0}

How does this goalkeeper function within Flick's high-pressing, possession-based system? Focus on shot-stopping, distribution, and sweeping.
                `.trim()
                : `
Analyze ${playerName} (${position}) in Hansi Flick's Barcelona this season.

Key Stats:
- Appearances: ${stats.appearances}
- Goals: ${stats.totalGoals}
- Assists: ${stats.totalAssists}
- Average Rating: ${stats.avgRating?.toFixed(2) || 'N/A'}
- Minutes Played: ${stats.totalMinutes}
${stats.totalxG ? `- xG: ${stats.totalxG.toFixed(2)}` : ''}
${stats.totalxA ? `- xA: ${stats.totalxA.toFixed(2)}` : ''}
${isDefender ? `- Tackles: ${stats.totalTackles || 0}` : ''}
${isDefender ? `- Interceptions: ${stats.totalInterceptions || 0}` : ''}
${!isDefender ? (stats.totalChancesCreated ? `- Chances Created: ${stats.totalChancesCreated}` : '') : ''}
${!isDefender ? (stats.totalDribbles ? `- Successful Dribbles: ${stats.totalDribbles}` : '') : ''}
${stats.totalRecoveries ? `- Ball Recoveries: ${stats.totalRecoveries}` : ''}

How does this ${position.toLowerCase()} function within Flick's high-pressing, vertical system?
                `.trim();

            try {
                const res = await fetch('/api/commentary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                if (!res.ok) throw new Error('API Error');

                const data = await res.json();
                const result = data.commentary || 'No analysis available.';
                setCommentary(result);
                localStorage.setItem(CACHE_KEY, result); // Cache result
            } catch (e) {
                console.error('Commentary fetch failed:', e);
                setError(true);
                setCommentary('Analysis unavailable. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCommentary();
    }, [playerName, position, stats]);

    // Split into sentences for truncation
    const sentences = commentary.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    const preview = sentences.slice(0, 2).join(' ');
    const hasMore = sentences.length > 2;

    return (
        <div className="relative">
            {/* Speech Bubble Container */}
            <div className="relative bg-white border-4 border-black p-6 shadow-[8px_8px_0_#000] rounded-lg">
                {/* Header - Comic styled, no emoji */}
                <div className="flex items-center gap-3 mb-4 border-b-4 border-black pb-3">
                    <div className="w-10 h-10 bg-yellow-400 border-3 border-black flex items-center justify-center rounded-full">
                        <span className=" text-lg text-black" style={{ fontFamily: "var(--font-bangers)" }}>AI</span>
                    </div>
                    <h3 className=" text-2xl uppercase" style={{ fontFamily: "var(--font-bangers)" }}>Tactical Analysis</h3>
                </div>

                {/* Content */}
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <div className="w-12 h-12 border-4 border-black border-t-yellow-400 rounded-full animate-spin"></div>
                            <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">Analyzing...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-center py-8">
                            <div className="w-10 h-10 bg-red-600 border-3 border-black flex items-center justify-center rounded-full">
                                <span className=" text-xl text-white" style={{ fontFamily: "var(--font-bangers)" }}>!</span>
                            </div>
                            <p className="font-mono text-sm text-red-600 uppercase">{commentary}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className=" text-sm text-gray-800 leading-relaxed" style={{ fontFamily: "var(--font-comic)" }}>
                                {expanded ? commentary : preview}
                                {!expanded && hasMore && '...'}
                            </p>

                            {hasMore && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="font-mono text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                >
                                    {expanded ? '← Show less' : 'Read more →'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300">
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest text-center">
                        AI-Generated Analysis
                    </p>
                </div>
            </div>

            {/* Speech Bubble Tail */}
            <div className="absolute -bottom-4 left-8 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[20px] border-t-black">
            </div>
            <div className="absolute -bottom-2 left-[34px] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white">
            </div>
        </div>
    );
}
