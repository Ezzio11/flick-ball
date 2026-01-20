"use client";

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllPlayers } from '@/lib/playerHelpers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Match } from '@/lib/teamStatistics';

import { Zap } from 'lucide-react';

function CompareContent({ matches }: { matches: Match[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedSlug = searchParams.get('select');
    const allPlayers = getAllPlayers(matches).sort((a, b) => a.name.localeCompare(b.name));

    // Initialize with query param if present
    const [player1, setPlayer1] = useState(selectedSlug || '');
    const [player2, setPlayer2] = useState('');

    // Update state if query param changes (e.g. navigation)
    useEffect(() => {
        if (selectedSlug) {
            setPlayer1(selectedSlug);
        }
    }, [selectedSlug]);

    const handleCompare = () => {
        if (player1 && player2) {
            router.push(`/compare/${player1}/vs/${player2}`);
        }
    };

    return (
        <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 py-8 relative z-10">
            {/* Back Home Link */}
            <div className="mb-8">
                <Link href="/" className="comic-button px-6 py-2 text-xl font-bold uppercase transform -skew-x-10 shadow-[6px_6px_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 active:bg-black active:text-white transition-all bg-white text-black border-3 border-black">
                    ← Back Home
                </Link>
            </div>

            {/* Comic Header */}
            <div className="comic-issue-header bg-white p-8 mb-12 transform -rotate-1 mx-auto max-w-4xl border-b-[8px] border-black">
                <div className="text-center">
                    <span className="text-2xl text-red-600 uppercase tracking-widest bg-yellow-300 px-3 py-1 transform -skew-x-12 inline-block mb-4" style={{ fontFamily: "var(--font-bangers)" }}>
                        EPIC SHOWDOWN
                    </span>
                    <h1 className="text-5xl md:text-9xl text-black uppercase leading-none drop-shadow-[6px_6px_0_rgba(0,0,0,0.2)] mb-4" style={{ fontFamily: "var(--font-bangers)" }}>
                        PLAYER<br />COMPARISON
                    </h1>
                    <p className="text-xl font-bold uppercase tracking-wider text-blue-900 mt-4" style={{ fontFamily: "var(--font-comic)" }}>
                        "Choose Your Titans. Witness the Battle!"
                    </p>
                </div>
            </div>

            {/* Selection Grid */}
            <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Player 1 Selector */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2"></div>
                        <div className="relative bg-[#a50044] border-4 border-black p-6">
                            <h2 className="text-4xl text-white uppercase mb-4 text-center" style={{ fontFamily: "var(--font-bangers)" }}>
                                PLAYER 1
                            </h2>
                            <select
                                value={player1}
                                onChange={(e) => setPlayer1(e.target.value)}
                                className="w-full border-3 border-black p-4 text-2xl text-black uppercase bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400"
                                style={{ fontFamily: "var(--font-bangers)" }}
                            >
                                <option value="">SELECT PLAYER...</option>
                                {allPlayers.filter(p => p.slug !== player2).map(player => (
                                    <option key={player.id} value={player.slug}>
                                        {player.name}
                                    </option>
                                ))}
                            </select>
                            {player1 && (
                                <div className="mt-4 p-3 bg-black/20 border-2 border-white">
                                    <p className="text-white text-sm uppercase" style={{ fontFamily: "var(--font-comic)" }}>
                                        {allPlayers.find(p => p.slug === player1)?.position} • {allPlayers.find(p => p.slug === player1)?.appearances} Apps • FBI {allPlayers.find(p => p.slug === player1)?.avgRating.toFixed(1)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Player 2 Selector */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2"></div>
                        <div className="relative bg-[#004d98] border-4 border-black p-6">
                            <h2 className="text-4xl text-white uppercase mb-4 text-center" style={{ fontFamily: "var(--font-bangers)" }}>
                                PLAYER 2
                            </h2>
                            <select
                                value={player2}
                                onChange={(e) => setPlayer2(e.target.value)}
                                className="w-full border-3 border-black p-4 text-2xl text-black uppercase bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400"
                                style={{ fontFamily: "var(--font-bangers)" }}
                            >
                                <option value="">SELECT PLAYER...</option>
                                {allPlayers.filter(p => p.slug !== player1).map(player => (
                                    <option key={player.id} value={player.slug}>
                                        {player.name}
                                    </option>
                                ))}
                            </select>
                            {player2 && (
                                <div className="mt-4 p-3 bg-black/20 border-2 border-white">
                                    <p className="text-white text-sm uppercase" style={{ fontFamily: "var(--font-comic)" }}>
                                        {allPlayers.find(p => p.slug === player2)?.position} • {allPlayers.find(p => p.slug === player2)?.appearances} Apps • FBI {allPlayers.find(p => p.slug === player2)?.avgRating.toFixed(1)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Compare Button */}
                <div className="text-center">
                    <button
                        onClick={handleCompare}
                        disabled={!player1 || !player2}
                        className={`relative px-12 py-4 text-4xl font-bold uppercase transform transition-all border-4 border-black flex items-center justify-center gap-3 mx-auto
                            ${player1 && player2
                                ? 'bg-[#ffed02] text-black shadow-[8px_8px_0_#000] hover:shadow-[12px_12px_0_#000] hover:-translate-y-1 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 shadow-[4px_4px_0_#999] cursor-not-allowed opacity-50'
                            }`}
                        style={{ fontFamily: "var(--font-bangers)" }}
                    >
                        <Zap size={32} fill="currentColor" /> COMPARE! <Zap size={32} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ComparisonSelectionContent({ matches }: { matches: Match[] }) {
    return (
        <div className="min-h-screen bg-[#e5e5f7] relative flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none fixed" style={{
                backgroundImage: 'radial-gradient(#444cf7 0.5px, transparent 0.5px), radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
            }}></div>

            <Suspense fallback={<div className="text-center p-10 font-bold text-2xl" style={{ fontFamily: "var(--font-bangers)" }}>LOADING ARENA...</div>}>
                <CompareContent matches={matches} />
            </Suspense>

            <Footer />
        </div>
    );
}
