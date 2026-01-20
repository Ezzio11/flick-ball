"use client";

import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllPlayers } from '@/lib/playerHelpers';
import { format } from 'date-fns';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/ui/BackButton';
import { Match } from '@/lib/teamStatistics';

export default function SquadContent({ matches }: { matches: Match[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const allPlayers = getAllPlayers(matches);

    // Filter players based on search
    const filteredPlayers = allPlayers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Map specific roles to broad categories for grouping
    const roleToCategory: Record<string, string> = {
        'ST': 'Forward', 'CF': 'Forward', 'LW': 'Forward', 'RW': 'Forward', 'Forward': 'Forward', 'Attacker': 'Forward',
        'CAM': 'Midfielder', 'CM': 'Midfielder', 'CDM': 'Midfielder', 'RM': 'Midfielder', 'LM': 'Midfielder', 'Midfielder': 'Midfielder',
        'CB': 'Defender', 'RB': 'Defender', 'LB': 'Defender', 'RWB': 'Defender', 'LWB': 'Defender', 'Defender': 'Defender',
        'GK': 'Goalkeeper', 'Goalkeeper': 'Goalkeeper'
    };

    // Group players by BROAD position category
    const positionOrder = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
    const playersByPosition = filteredPlayers.reduce((acc, player) => {
        const category = roleToCategory[player.position] || 'Midfielder'; // Fallback

        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(player);
        return acc;
    }, {} as Record<string, typeof allPlayers>);

    return (
        <div className="min-h-screen bg-[#e5e5f7] relative flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none fixed" style={{
                backgroundImage: 'radial-gradient(#444cf7 0.5px, transparent 0.5px), radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
            }}></div>

            <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 py-8 relative z-10">
                {/* Back Home Link */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <BackButton />

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96 transform rotate-1">
                        <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1"></div>
                        <input
                            type="text"
                            placeholder="SEARCH PLAYER..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="relative w-full border-3 border-black p-3  text-xl text-black uppercase placeholder:text-gray-400 focus:outline-none focus:bg-yellow-50 pl-10" style={{ fontFamily: "var(--font-bangers)" }}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <Search className="w-6 h-6 text-black/50" />
                        </div>
                    </div>
                </div>

                {/* Comic Issue Header - Hidden on Search */}
                {!searchTerm && (
                    <div className="comic-issue-header bg-white p-6 mb-12 transform -rotate-1 mx-auto max-w-5xl border-b-[8px] border-black">
                        <div className="flex flex-col md:flex-row items-center justify-between border-b-4 border-black pb-4 mb-4 gap-4">
                            <div className="flex flex-col text-center md:text-left">
                                <span className=" text-xl text-red-600 uppercase tracking-widest bg-yellow-300 px-2 transform -skew-x-12 inline-block w-fit" style={{ fontFamily: "var(--font-bangers)" }}>Marvelous</span>
                                <h1 className=" text-7xl md:text-9xl text-black uppercase leading-none drop-shadow-[5px_5px_0_rgba(0,0,0,0.2)]" style={{ fontFamily: "var(--font-bangers)" }}>
                                    SQUAD
                                </h1>
                            </div>
                            <div className="text-right flex flex-col items-center md:items-end">
                                <div className="bg-black text-white px-3 py-1  text-xl transform rotate-2 inline-block mb-1" style={{ fontFamily: "var(--font-bangers)" }}>
                                    ISS. #25/26
                                </div>
                                <p className=" font-bold text-sm" style={{ fontFamily: "var(--font-comic)" }}>Flick's Titans</p>
                                <p className=" text-xs text-gray-500 uppercase" style={{ fontFamily: "var(--font-comic)" }}>{format(new Date(), 'MMMM yyyy')}</p>
                            </div>
                        </div>
                        <p className=" text-lg md:text-xl font-bold text-center uppercase tracking-wider text-blue-900" style={{ fontFamily: "var(--font-comic)" }}>
                            "Total Football. Total Domination. The New Era begins now!"
                        </p>
                    </div>
                )}

                {/* Players grouped by position */}
                <div className="space-y-12">
                    {positionOrder.map(position => {
                        const players = playersByPosition[position];
                        if (!players || players.length === 0) return null;

                        return (
                            <div key={position}>
                                {/* Section Title */}
                                <div className="mb-6 relative inline-block">
                                    <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1"></div>
                                    <div className="relative bg-white border-3 border-black px-4 py-1">
                                        <h2 className="text-3xl  text-black uppercase tracking-tight" style={{ fontFamily: "var(--font-bangers)" }}>
                                            {position}s
                                        </h2>
                                    </div>
                                </div>

                                {/* Comic Grid - SMALLER CARDS */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {players.map((player, index) => (
                                        <PlayerCard key={player.id} player={player} index={index} category={position} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Integration */}
            <Footer />
        </div >
    );
}

// Player Card with mobile long-press support
function PlayerCard({ player, index, category }: { player: any; index: number; category: string }) {
    const [touchActive, setTouchActive] = useState(false);
    const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Color coding based on Specific Role
    const getPositionColor = (role: string) => {
        switch (role) {
            // Forwards (Reds)
            case 'ST':
            case 'Forward':
            case 'Attacker': return { bg: 'bg-[#A50044]', text: 'text-white' }; // Classic Barca Red
            case 'LW':
            case 'RW': return { bg: 'bg-[#DB005B]', text: 'text-white' }; // Brighter/Electric Red

            // Midfielders (Blues)
            case 'CAM': return { bg: 'bg-[#004D98]', text: 'text-white' }; // Classic Barca Blue
            case 'CM':
            case 'CDM':
            case 'Midfielder': return { bg: 'bg-[#003975]', text: 'text-white' }; // Deep Navy

            // Defenders (Yellows)
            case 'RB':
            case 'LB':
            case 'RWB':
            case 'LWB': return { bg: 'bg-[#EDBB00]', text: 'text-black' }; // Bright Yellow
            case 'CB':
            case 'Defender': return { bg: 'bg-[#C69C00]', text: 'text-black' }; // Darker Gold

            // GK
            case 'GK':
            case 'Goalkeeper': return { bg: 'bg-[#1a1a1a]', text: 'text-white' }; // Black

            default: return { bg: 'bg-gray-500', text: 'text-white' };
        }
    };

    const { bg: cardBg, text: textColor } = getPositionColor(player.position);

    const handleTouchStart = () => {
        const timeout = setTimeout(() => {
            setTouchActive(true);
        }, 150); // 150ms long-press
        setTouchTimeout(timeout);
    };

    const handleTouchEnd = () => {
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            setTouchTimeout(null);
        }
        setTouchActive(false);
    };

    return (
        <Link
            href={`/squad/${player.slug}`}
            className={`group block border-3 border-black ${cardBg} shadow-[4px_4px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 transition-all duration-300 ${touchActive ? 'shadow-[8px_8px_0_#000] -translate-y-1' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            <div className="relative w-full aspect-[3/4] overflow-hidden border-b-3 border-black bg-white">
                <Image
                    src={`/images/players/${player.slug}-profile.webp`}
                    alt={player.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    className={`object-cover object-top transition-all duration-500 ${touchActive ? 'grayscale-0 contrast-100 scale-105' : 'grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105'}`}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <div className="absolute inset-0 comic-halftone opacity-20 pointer-events-none mix-blend-multiply"></div>

                {/* Stats Badge on Hover/Touch */}
                <div className={`absolute bottom-0 left-0 right-0 bg-black/95 border-t-3 border-yellow-400 p-2 transition-transform duration-300 ${touchActive ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                    <div className="flex items-center justify-around gap-2">
                        <div className="text-center">
                            <p className="text-yellow-400 text-xs font-bold uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>Apps</p>
                            <p className="text-white text-lg font-black" style={{ fontFamily: 'var(--font-bangers)' }}>{player.appearances}</p>
                        </div>
                        <div className="w-px h-8 bg-yellow-400/30"></div>
                        <div className="text-center">
                            <p className="text-yellow-400 text-xs font-bold uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>FBI</p>
                            <p className="text-white text-lg font-black" style={{ fontFamily: 'var(--font-bangers)' }}>{player.avgRating.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 border-t-2 border-black bg-white relative h-20 flex flex-col justify-between">
                <h3 className=" text-lg text-black uppercase leading-none group-hover:text-[#004d98] transition-colors line-clamp-2" style={{ fontFamily: "var(--font-bangers)" }}>
                    {player.name}
                </h3>
                <div className="flex items-center justify-between mt-1">
                    <span className={`font-body font-bold text-[10px] uppercase ${cardBg} ${textColor} px-1.5 py-0.5 border border-black transform -skew-x-12 truncate max-w-[70%]`}>
                        {player.position}
                    </span>
                    <span className=" text-[10px] font-bold text-black/60" style={{ fontFamily: "var(--font-lemonada)" }}>
                        #FCB
                    </span>
                </div>
            </div>
        </Link>
    );
}
