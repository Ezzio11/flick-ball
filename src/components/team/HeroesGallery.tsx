import Link from 'next/link';
import Image from 'next/image';
import { Target, Brain, Zap } from 'lucide-react';
import { Player, AggregatedStats } from '@/lib/playerHelpers';

// Extend the Player type to include what we exposed in getAllPlayers
interface GalleryPlayer extends Player {
    slug: string;
    goals: number;
    assists: number;
    minutes?: number;
    stats?: AggregatedStats;
    avgRating: number;
}

interface HeroesGalleryProps {
    scorers: GalleryPlayer[];
    assisters: GalleryPlayer[];
    workhorses: GalleryPlayer[];
}

export default function HeroesGallery({ scorers, assisters, workhorses }: HeroesGalleryProps) {
    return (
        <section className="relative w-full max-w-[1400px] mx-auto px-6 py-12">

            {/* Section Header */}
            <div className="flex items-center justify-center gap-4 mb-16 relative">
                <div className="absolute inset-x-0 top-1/2 h-4 bg-[#A50044] -skew-y-2 z-0"></div>
                <h2 className="relative z-10 text-6xl md:text-8xl font-black text-white px-8 py-2 bg-[#004D98] transform -rotate-2 border-4 border-black shadow-[8px_8px_0_black]" style={{ fontFamily: 'var(--font-bangers)' }}>
                    HEROES GALLERY
                </h2>
            </div>

            {/* 1. SHARPSHOOTERS (Top Scorers) */}
            <HeroRow
                title="Sharpshooters"
                Icon={Target}
                color="#004D98"
                players={scorers}
                mainStatLabel="Goals"
                mainStatValue={(p) => p.goals}
                subStatLabel="Shots"
                subStatValue={(p) => p.stats?.totalShots || Math.round(p.goals * 3.4)} // Fallback estimation
                rankColor="bg-[#EDBB00]"
            />

            {/* 2. PLAYMAKERS (Top Assisters) */}
            <HeroRow
                title="Playmakers"
                Icon={Brain}
                color="#A50044"
                players={assisters}
                mainStatLabel="Assists"
                mainStatValue={(p) => p.assists}
                subStatLabel="Chances"
                subStatValue={(p) => p.stats?.totalChancesCreated || Math.round(p.assists * 4.2)} // Fallback estimation
                rankColor="bg-[#004D98]"
            />

            {/* 3. THE ENGINE ROOM (Workhorses/Minutes) */}
            <HeroRow
                title="The Engine Room"
                Icon={Zap}
                color="#1a1a1a"
                players={workhorses}
                mainStatLabel="Minutes"
                mainStatValue={(p) => p.minutes || 0}
                subStatLabel="Recoveries"
                subStatValue={(p) => p.stats?.totalRecoveries || Math.round((p.minutes || 0) / 12)} // Fallback estimation
                rankColor="bg-[#A50044]"
            />

        </section>
    );
}

function HeroRow({
    title,
    Icon,
    color,
    players,
    mainStatLabel,
    mainStatValue,
    subStatLabel,
    subStatValue,
    rankColor
}: {
    title: string;
    Icon: React.ElementType;
    color: string;
    players: GalleryPlayer[];
    mainStatLabel: string;
    mainStatValue: (p: GalleryPlayer) => number | string;
    subStatLabel: string;
    subStatValue: (p: GalleryPlayer) => number | string;
    rankColor: string;
}) {
    return (
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 ${rankColor} rounded-full border-3 border-black flex items-center justify-center text-xl shadow-[3px_3px_0_black]`}>
                    <Icon size={24} strokeWidth={3} className="text-white" />
                </div>
                <h3 className={`text-4xl font-black uppercase`} style={{ fontFamily: 'var(--font-bangers)', color: color }}>
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {players.slice(0, 5).map((player, idx) => (
                    <Link href={`/squad/${player.slug}`} key={player.slug} className="block group">
                        <div className="comic-panel bg-white p-0 relative border-3 border-black shadow-[6px_6px_0_black] group-hover:shadow-[10px_10px_0_black] group-hover:-translate-y-1 transition-all flex flex-col h-[320px]">
                            {/* Header */}
                            <div className="p-2 text-center border-b-3 border-black" style={{ backgroundColor: color }}>
                                <span className="text-white font-black uppercase tracking-widest text-xs truncate block font-mono">
                                    {player.name}
                                </span>
                            </div>

                            {/* Image Container */}
                            <div className="flex-1 relative bg-gray-100 overflow-hidden">
                                {/* Rank */}
                                <div className="absolute top-0 left-5 z-10 opacity-20 text-6xl font-black italic text-black">
                                    #{idx + 1}
                                </div>
                                <div className="absolute inset-0 opacity-10 comic-halftone pointer-events-none mix-blend-multiply"></div>

                                {/* Real Image */}
                                <Image
                                    src={`/images/players/${player.slug}-profile.webp`}
                                    alt={player.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                                {/* Main Stat (Overlay) */}
                                <div className="absolute bottom-2 right-5 text-right">
                                    <div className="text-[10px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] uppercase font-bold tracking-wider mb-[-5px]">{mainStatLabel}</div>
                                    <div className="text-5xl font-black text-white italic drop-shadow-[3px_3px_0_black]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        {mainStatValue(player)}
                                    </div>
                                </div>
                            </div>

                            {/* Footer (Sub Stat) */}
                            <div className="bg-yellow-400 p-2 flex justify-between items-center border-t-3 border-black h-12">
                                <span className="text-xs uppercase font-black text-black tracking-tight">{subStatLabel}</span>
                                <div className="font-mono font-bold text-sm bg-black text-white px-2 py-0.5 rounded transform -skew-x-12">
                                    {subStatValue(player)}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
