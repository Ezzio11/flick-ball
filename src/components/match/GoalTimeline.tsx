import { organizeScorersByTime } from '@/lib/matchHelpers';
import Link from 'next/link';

interface GoalTimelineProps {
    scorers: Array<{
        player: string;
        team: string;
        minute: number;
        assist?: string;
    }>;
    isHome: boolean;
    score: string;
}

export default function GoalTimeline({ scorers, isHome, score }: GoalTimelineProps) {
    const organizedScorers = organizeScorersByTime(scorers, isHome, score);

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] mb-8">
            <div className="bg-black text-white p-4">
                <h2 className="text-3xl font-black uppercase text-center" style={{ fontFamily: 'var(--font-bangers)' }}>
                    Goal Timeline
                </h2>
            </div>

            <div className="p-6 bg-[#fffdf5]">
                <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black transform -translate-x-1/2 hidden md:block"></div>

                    {/* Goals */}
                    <div className="space-y-8">
                        {organizedScorers.map((scorer, index) => {
                            const isBarca = scorer.isBarca;
                            const slugifiedPlayer = scorer.player
                                .toLowerCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "")
                                .replace(/\s+/g, '-');

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-center gap-4"
                                >
                                    {/* Barcelona Side */}
                                    {isBarca ? (
                                        <>
                                            <div className="flex-1 text-right">
                                                <div className="inline-block bg-[#004d98] border-3 border-black p-4 shadow-[4px_4px_0_#000] max-w-md">
                                                    <div className="flex items-center gap-3 justify-end">
                                                        <div>
                                                            <Link
                                                                href={`/squad/${slugifiedPlayer}`}
                                                                className="text-xl font-black text-[#ffed02] uppercase hover:underline block text-right"
                                                                style={{ fontFamily: 'var(--font-bangers)' }}
                                                            >
                                                                {scorer.player}
                                                            </Link>
                                                            {scorer.assist && (
                                                                <p className="text-sm text-white/80 font-mono mt-1 text-right">
                                                                    Assist: <Link
                                                                        href={`/squad/${scorer.assist.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`}
                                                                        className="hover:text-white hover:underline"
                                                                    >
                                                                        {scorer.assist}
                                                                    </Link>
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-white/60 font-mono mt-1 text-right">
                                                                {scorer.runningScore}
                                                            </p>
                                                        </div>
                                                        {/* PLAYER AVATAR */}
                                                        <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0_#000] flex-shrink-0 bg-white">
                                                            <img
                                                                src={`/images/players/${slugifiedPlayer}-profile.webp`}
                                                                alt={scorer.player}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="w-12 h-12 bg-[#ffed02] border-2 border-black flex items-center justify-center flex-shrink-0">
                                                            <span className="text-2xl font-black text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                                {scorer.minute}'
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Center Dot - ALWAYS VISIBLE */}
                                            <div className="flex-shrink-0 z-10">
                                                <div className="w-8 h-8 rounded-full border-4 border-black bg-[#ffed02]"></div>
                                            </div>
                                            <div className="flex-1"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1"></div>
                                            {/* Center Dot - ALWAYS VISIBLE */}
                                            <div className="flex-shrink-0 z-10">
                                                <div className="w-8 h-8 rounded-full border-4 border-black bg-red-500"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="inline-block bg-gray-700 border-3 border-black p-4 shadow-[4px_4px_0_#000] max-w-md">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-red-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                                                            <span className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                                {scorer.minute}'
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-white uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                                {scorer.player}
                                                            </h3>
                                                            {scorer.assist && (
                                                                <p className="text-sm text-white/80 font-mono mt-1">
                                                                    Assist: {scorer.assist}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-white/60 font-mono mt-1">
                                                                {scorer.runningScore}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
