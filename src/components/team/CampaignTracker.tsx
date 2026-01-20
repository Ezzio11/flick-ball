'use client';

import {
    HomeAwayStats,
    FormationStats,
    TeamStatistics
} from '@/lib/teamStatistics';
import TacticalBoard from './TacticalBoard';

interface CampaignTrackerProps {
    homeAway: HomeAwayStats;
    formations: FormationStats[];
    stats: TeamStatistics;
}

export default function CampaignTracker({ homeAway, formations, stats }: CampaignTrackerProps) {
    return (
        <section className="relative w-full max-w-[1400px] mx-auto px-6 py-12">

            {/* Section Header */}
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-6xl md:text-8xl font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-bangers)' }}>
                    THE CAMPAIGN
                </h2>
                <div className="w-32 h-2 bg-[#EDBB00] mt-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Panel 1: Away Day Warriors (Split Panel) */}
                <div className="comic-panel lg:col-span-1 bg-white p-0 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#004D98] z-20" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>

                    {/* Home Section (Top) */}
                    <div className="flex-1 bg-[#004D98] p-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-40 bg-[url('/images/patterns/camp-nou-illustration.webp')] bg-cover bg-center mix-blend-soft-light filter contrast-125"></div>
                        <h3 className="text-2xl font-black uppercase text-white mb-2 relative z-10" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Fortress (Home)
                        </h3>
                        <div className="flex justify-between items-end text-white relative z-10">
                            <div>
                                <div className="text-4xl font-black">{homeAway.home.wins}W - {homeAway.home.draws}D</div>
                                <div className="text-xs uppercase font-bold opacity-70">Undefeated Count: {homeAway.home.wins + homeAway.home.draws}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-[#EDBB00]">{Math.round((homeAway.home.goalsFor / (homeAway.home.matches || 1)) * 10) / 10}</div>
                                <div className="text-[10px] uppercase font-bold opacity-70">Goals/Game</div>
                            </div>
                        </div>
                        {/* Artist Credit */}
                        <a
                            href="https://www.behance.net/gallery/146278819/Camp-Nou-illustration"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 left-6 text-[8px] text-white/30 hover:text-white uppercase font-bold z-20 transition-colors"
                        >
                            Art by Farqaleit
                        </a>
                    </div>

                    {/* Divider */}
                    <div className="h-2 bg-[#EDBB00] w-full relative z-20"></div>

                    {/* Away Section (Bottom) */}
                    <div className="flex-1 bg-[#A50044] p-6 relative">
                        <div className="absolute inset-0 opacity-40 bg-[url('/images/patterns/stadium-generic.webp')] bg-cover bg-center mix-blend-multiply filter contrast-125 grayscale-[30%]"></div>
                        <h3 className="text-2xl font-black uppercase text-white mb-2 relative z-10 text-right" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Conquerors (Away)
                        </h3>
                        <div className="flex justify-between items-end text-white relative z-10">
                            <div>
                                <div className="text-3xl font-black text-[#EDBB00]">{Math.round((homeAway.away.goalsFor / (homeAway.away.matches || 1)) * 10) / 10}</div>
                                <div className="text-[10px] uppercase font-bold opacity-70">Goals/Game</div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black">{homeAway.away.wins}W - {homeAway.away.draws}D</div>
                                <div className="text-xs uppercase font-bold opacity-70">Road Points</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 2: Master Plan (Tactical Board) */}
                <TacticalBoard formations={formations} />

                {/* Panel 3: Trophy Cabinet */}
                <div className="comic-panel lg:col-span-1 bg-[#1a1a1a] p-6 relative border-4 border-[#EDBB00]">
                    <h3 className="text-3xl font-black uppercase text-[#EDBB00] mb-6 text-center" style={{ fontFamily: 'var(--font-bangers)' }}>
                        The Quest
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {Object.entries(stats.byCompetition).map(([comp, compStats], idx) => {
                            if (compStats.matches === 0) return null;
                            // Filter out friendlies or specific low-relevance teams if mistaken for competitions
                            if (['Olympiacos', 'Friendly', 'Club Friendlies', 'Milan', 'Man City', 'Monaco'].some(c => comp.includes(c))) return null;
                            return (
                                <div key={idx} className="relative bg-white/10 backdrop-blur-sm p-3 border border-[#EDBB00]/30 rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-[#EDBB00] font-bold uppercase text-sm">{comp}</div>
                                            <div className="text-white text-xs opacity-70 font-mono">
                                                {compStats.wins}W - {compStats.draws}D - {compStats.losses}L
                                            </div>
                                        </div>
                                        <div className="text-white font-black text-xl">
                                            {Math.round(compStats.winRate * 100)}%
                                        </div>
                                    </div>
                                    {/* Mini Record Color Coded */}
                                    <div className="mt-2 flex gap-1">
                                        {(compStats.history || []).slice(-15).map((result, i) => {
                                            let color = 'bg-red-500';
                                            if (result === 'W') color = 'bg-green-500';
                                            else if (result === 'D') color = 'bg-yellow-500';

                                            return <div key={i} className={`h-2 flex-1 rounded-sm ${color}`}></div>
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}
