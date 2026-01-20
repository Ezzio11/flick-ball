"use client";

import Link from 'next/link';
import type { Match } from '@/lib/teamStatistics';

interface BiggestWinsProps {
    topWins: Match[];
}

export default function BiggestWins({ topWins }: BiggestWinsProps) {
    if (!topWins || topWins.length === 0) return null;

    return (
        <div className="w-full mb-16">
            <div className="inline-block bg-[#db0030] text-white border-4 border-black px-4 py-1 transform -skew-x-12 mb-6 shadow-[4px_4px_0_#000]">
                <h3 className="text-2xl font-black uppercase">The 6+ Club</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topWins.map((match, idx) => (
                    <Link href={`/matches/${match.id}`} key={idx} className="block group cursor-pointer">
                        <div className="relative comic-panel bg-white p-4 transform transition-all duration-300 border-3 border-black group-hover:bg-[#FFED02] shadow-[4px_4px_0_#000]">
                            {/* Halftone BG */}
                            <div className="absolute inset-0 opacity-10 comic-halftone pointer-events-none"></div>

                            <div className="relative z-10 flex justify-between items-end gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                                        {new Date(match.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="text-xl font-black uppercase text-black leading-none break-words">
                                        vs {match.opponent}
                                    </div>
                                </div>
                                <div className="text-4xl font-black text-[#A50044] leading-none shrink-0" style={{ fontFamily: 'var(--font-bangers)' }}>
                                    {match.score}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
