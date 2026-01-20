"use client";

import { Search } from 'lucide-react';

interface FilterBarProps {
    season: string;
    competition: string;
    onSeasonChange: (season: string) => void;
    onCompetitionChange: (competition: string) => void;
}

export default function FilterBar({ season, competition, onSeasonChange, onCompetitionChange }: FilterBarProps) {
    const seasons = ['All', '24/25', '25/26'];
    const competitions = ['All', 'La Liga', 'Champions League', 'Copa del Rey', 'Supercopa'];

    return (
        <div className="sticky top-1 z-40 transition-all duration-300 ease-out mb-2 md:mb-6">
            <div className="bg-[#ffed02] border-2 md:border-4 border-black shadow-[3px_3px_0_#000] md:shadow-[6px_6px_0_#000] p-2 md:p-4 rounded-lg">
                <div className="flex flex-row items-center gap-2 md:gap-4">
                    {/* Filter Icon/Label - Hidden text on mobile, just icon */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-black text-white flex items-center justify-center text-xl border-1 md:border-2 border-white transform -rotate-6">
                            <Search className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="hidden md:block">
                            <h3 className="text-xl font-bold uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>Filters</h3>
                        </div>
                    </div>

                    {/* Season Selector */}
                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-1 md:gap-2 flex-nowrap whitespace-nowrap">
                            {seasons.map(s => (
                                <button
                                    key={s}
                                    onClick={() => onSeasonChange(s)}
                                    className={`px-2 py-1 md:px-4 md:py-2 font-bold uppercase text-[10px] md:text-sm border-2 md:border-3 border-black transition-all transform active:scale-95 ${season === s
                                        ? 'bg-black text-[#ffed02] shadow-[1px_1px_0_#000] md:shadow-[2px_2px_0_#000]'
                                        : 'bg-white text-black shadow-[1px_1px_0_#000]'
                                        }`}
                                    style={{ fontFamily: 'var(--font-bangers)' }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Competition Selector */}
                    <div className="flex-1 overflow-x-auto scrollbar-hide border-l-2 border-black/10 pl-2 md:border-0 md:pl-0">
                        <div className="flex gap-1 md:gap-2 flex-nowrap whitespace-nowrap">
                            {competitions.map(c => (
                                <button
                                    key={c}
                                    onClick={() => onCompetitionChange(c)}
                                    className={`px-2 py-1 md:px-4 md:py-2 font-bold uppercase text-[10px] md:text-sm border-2 md:border-3 border-black transition-all transform active:scale-95 ${competition === c
                                        ? 'bg-[#004d98] text-white shadow-[1px_1px_0_#000] md:shadow-[2px_2px_0_#000]'
                                        : 'bg-white text-black shadow-[1px_1px_0_#000]'
                                        }`}
                                    style={{ fontFamily: 'var(--font-bangers)' }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
