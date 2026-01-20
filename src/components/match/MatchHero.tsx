import { Calendar, MapPin, Trophy, Crown } from 'lucide-react';
import { MatchData, MatchResult } from '@/lib/matchHelpers';
import Image from 'next/image';

interface MatchHeroProps {
    match: MatchData;
    barcelonaGoals: number;
    opponentGoals: number;
    result: MatchResult;
    formattedDate: string;
}

// Match-specific configurations for atmosphere
const MATCH_CONFIGS: Record<string, {
    atmosphere: string;
    heroImage?: string;
    heroImageCredit?: { name: string; url: string };
    barcelonaPlayer?: string;
    opponentPlayer?: string;
    background: string;
    barcelonaPlayerCredit?: { name: string; url: string };
    opponentPlayerCredit?: { name: string; url: string };
    theme?: 'rain' | 'sunny' | 'night';
}> = {
    '4621537': { // Benfica 5-4 (rainy night away)
        atmosphere: 'Rainy Night in Lisbon',
        barcelonaPlayer: '/images/matches/raphinha-benfica.webp',
        background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.instagram.com/p/DFM5mcHABPz/?img_index=1' },
        theme: 'rain'
    },
    '4507097': { // Madrid 4-3 (sunny day at Companys)
        atmosphere: 'Sunny Day at Estadi Lluís Companys',
        barcelonaPlayer: '/images/matches/raphinha-madrid.webp',
        background: 'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%)',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.instagram.com/p/DJrJvs_CrFe/' },
        theme: 'sunny'
    },
    '4731604': { // Madrid 3-2 (night at Ramon)
        atmosphere: 'Night at Ramon Sánchez Pizjuan',
        barcelonaPlayer: '/images/matches/ferran-madrid.webp',
        background: 'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%)',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.instagram.com/p/DI7V6JRiBO-/' },
        theme: 'night'
    },
    '4506859': { // Madrid 4-0 (night at Bernabéu)
        atmosphere: 'Night at Santiago Bernabéu',
        barcelonaPlayer: '/images/matches/lewa-madrid.webp',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.threads.com/@farqaleitart/post/DBz0Y7WIOjx' },
        background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%)',
        theme: 'night'
    },
    '4582241': { // Super Cup 2025 vs Madrid (5-2)
        atmosphere: 'Supercopa Final in Jeddah',
        barcelonaPlayer: '/images/matches/lamine-super25.webp',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.instagram.com/p/DE3ZF0GNB6x/' },
        background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%)',
        theme: 'night'
    },
    '5039109': { // Super Cup 2026 vs Madrid (3-2)
        atmosphere: 'Supercopa Final in Jeddah',
        barcelonaPlayer: '/images/matches/raphinha-super26.webp',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.instagram.com/p/DTkFjBMDEMh/?img_index=2' },
        background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%)',
        theme: 'night'
    },
    '4621509': { // Bayern 4-1
        atmosphere: 'Champions League Night',
        background: 'linear-gradient(to bottom, #001F3F 0%, #003366 50%, #004d98 100%)',
        theme: 'night'
    },
    '4737569': { // Borussia Dortmund 4-0 (night at Montjuic)
        atmosphere: 'Night at Montjuic',
        barcelonaPlayer: '/images/matches/inigo-dortmund.webp',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.instagram.com/p/DH5XA9iAftx/?img_index=2' },
        background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%)',
        theme: 'night'
    },
    '4506777': { // Valladolid 7-0
        atmosphere: 'The Raphinha Show',
        barcelonaPlayer: '/images/matches/raphinha-valladolid.webp',
        barcelonaPlayerCredit: { name: '@farqaleitart', url: 'https://www.instagram.com/p/C_wfgA6I4wn/' },
        background: 'linear-gradient(to bottom, #0a0e27 0%, #004d98 100%)',
        theme: 'sunny'
    }
};

export default function MatchHero({ match, barcelonaGoals, opponentGoals, result, formattedDate }: MatchHeroProps) {
    const config = MATCH_CONFIGS[match.id] || {
        atmosphere: 'Match Day',
        background: 'linear-gradient(to bottom, #004d98 0%, #0066cc 100%)'
    };

    return (
        <div className="bg-white border-6 border-black shadow-[12px_12px_0_#000] mb-8 overflow-hidden">
            {/* Top Bar with Comic Flair */}
            <div className="bg-black text-white p-3 flex justify-between items-center relative overflow-hidden">
                {/* Speed lines background */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 12px)',
                }}></div>
                <span className="text-sm font-mono uppercase relative z-10">{match.competition} • {match.season}</span>
                <span className="text-sm font-mono relative z-10">{formattedDate}</span>
            </div>

            {/* Hero Image Section (if available - shown separately) */}
            {config.heroImage && (
                <div className="relative h-[300px] md:h-[400px] overflow-hidden border-b-4 border-black">
                    <Image
                        src={config.heroImage}
                        alt="Match Hero"
                        fill
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                    {/* Halftone overlay */}
                    <div className="absolute inset-0 comic-halftone opacity-20 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    {config.heroImageCredit && (
                        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[10px] text-white/60 z-10">
                            Art by <a href={config.heroImageCredit.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{config.heroImageCredit.name}</a>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="bg-black/90 border-3 border-white p-4 inline-block shadow-[6px_6px_0_rgba(255,237,2,0.8)]">
                            <p className="text-xs text-white/60 uppercase mb-1">{config.atmosphere}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>
                                {match.opponent}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Hero Content - Centerpiece Player Layout */}
            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

                    {/* LEFT COLUMN: BARCELONA STATS */}
                    <div className="relative p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px] border-r-4 border-black overflow-hidden bg-gradient-to-br from-[#a50044] to-[#7a0033]">
                        {/* Halftone / Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, black 10px, black 12px)',
                        }}></div>

                        {/* Content */}
                        <div className="text-center relative z-10 w-full">
                            <div className="text-sm font-mono text-white/80 uppercase mb-2 bg-black/50 px-3 py-1 inline-block border border-white/30 transform -skew-x-12">
                                {match.isHome ? 'HOME' : 'AWAY'}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-[#ffed02] uppercase leading-none mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                Barcelona
                            </h2>
                            <div className="text-8xl md:text-9xl font-black text-white drop-shadow-[5px_5px_0_rgba(0,0,0,1)]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                {barcelonaGoals}
                            </div>
                        </div>
                    </div>

                    {/* CENTER COLUMN: THE HERO IMAGE + RESULT */}
                    <div className="relative h-[300px] md:h-auto min-h-[400px] border-r-4 border-black overflow-hidden bg-black group">
                        {/* The Hero Image */}
                        {config.barcelonaPlayer ? (
                            <>
                                <Image
                                    src={config.barcelonaPlayer}
                                    alt="Match Hero"
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 comic-halftone opacity-20 mix-blend-multiply pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                                {config.barcelonaPlayerCredit && (
                                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[10px] text-white/60 z-10 border border-white/20">
                                        Art: <a href={config.barcelonaPlayerCredit.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{config.barcelonaPlayerCredit.name}</a>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-[#0a0f1c] flex flex-col items-center justify-center overflow-hidden">
                                {(() => {
                                    // Deterministic rotation based on match ID to avoid hydration mismatch
                                    const variant = parseInt(String(match.id || '0'), 10) % 3;

                                    // VARIANT 1: CLASSIFIED (The Noir Look)
                                    if (variant === 0) return (
                                        <>
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1f3a_0%,#000_100%)]"></div>
                                            <div className="absolute inset-0 opacity-20 comic-halftone"></div>
                                            <div className="absolute inset-0" style={{
                                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)'
                                            }}></div>
                                            <div className="relative z-10 text-center transform -rotate-6">
                                                <div className="text-8xl font-black text-[#A50044] mix-blend-screen opacity-50" style={{ fontFamily: 'var(--font-bangers)' }}>FLICK</div>
                                                <div className="text-8xl font-black text-[#004D98] mix-blend-screen opacity-50 -mt-8 ml-8" style={{ fontFamily: 'var(--font-bangers)' }}>BALL</div>
                                            </div>
                                        </>
                                    );

                                    // VARIANT 2: SIGNAL LOST (The Glitch Look)
                                    if (variant === 1) return (
                                        <>
                                            <div className="absolute inset-0 bg-black"></div>
                                            <div className="absolute inset-0 opacity-30" style={{
                                                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #333 2px, #333 4px)'
                                            }}></div>
                                            <div className="absolute inset-0 opacity-20 animate-pulse bg-white mix-blend-overlay"></div>
                                            <div className="relative z-10 text-center border-4 border-white p-4">
                                                <div className="text-6xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-bangers)', textShadow: '4px 0 #ff00ff, -4px 0 #00ffff' }}>
                                                    SIGNAL<br />LOST
                                                </div>
                                                <div className="text-xs font-mono text-white/70 uppercase">Reconnecting Satellite...</div>
                                            </div>
                                        </>
                                    );

                                    // VARIANT 3: THE VAULT (The Warning Look)
                                    return (
                                        <>
                                            <div className="absolute inset-0 bg-[#EDBB00]"></div>
                                            <div className="absolute inset-0 opacity-10 comic-halftone"></div>
                                            {/* Hazard Stripes */}
                                            <div className="absolute top-0 w-full h-8 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)] opacity-20"></div>
                                            <div className="absolute bottom-0 w-full h-8 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)] opacity-20"></div>

                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="border-4 border-black p-4 bg-white transform rotate-3 shadow-[8px_8px_0_#000]">
                                                    <div className="text-5xl font-black text-black uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>
                                                        ARCHIVE<br />SEALED
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: OPPONENT STATS */}
                    <div className="relative p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px] bg-[#1a1f2e] overflow-hidden">
                        {/* Opponent-specific background hints could go here, currently generic dark */}
                        <div className="absolute inset-0 bg-gradient-to-bl from-[#2a2f4a] to-[#0a0e27]"></div>

                        {/* Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '10px 10px'
                        }}></div>

                        {/* Content */}
                        <div className="text-center relative z-10 w-full">
                            <div className="text-sm font-mono text-white/80 uppercase mb-2 bg-black/50 px-3 py-1 inline-block border border-white/30 transform skew-x-12">
                                {match.isHome ? 'AWAY' : 'HOME'}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-none mb-4 drop-shadow-[3px_3px_0_rgba(0,0,0,1)]" style={{ fontFamily: 'var(--font-bangers)' }}>
                                {match.opponent}
                            </h2>
                            <div className={`text-8xl md:text-9xl font-black drop-shadow-[5px_5px_0_rgba(0,0,0,1)] ${opponentGoals > barcelonaGoals ? 'text-green-500' : 'text-[#ff4444]'}`} style={{ fontFamily: 'var(--font-bangers)' }}>
                                {opponentGoals}
                            </div>
                        </div>

                        {/* Comic action lines for opponent side */}
                        <div className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none opacity-20">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 12px)',
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formation & Venue with Comic Styling */}
            <div className="bg-gray-100 border-t-4 border-black p-4 flex flex-wrap justify-center gap-4 text-sm font-mono relative overflow-hidden">
                {/* Comic pattern background */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 10px)',
                }}></div>

                {match.formation && (
                    <div className="flex items-center gap-2 relative z-10">
                        <span className="text-black uppercase font-bold">Formation:</span>
                        <span className="font-bold bg-white border-3 border-black px-3 py-1 text-black shadow-[2px_2px_0_#000]">{match.formation}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 relative z-10">
                    <span className="text-black uppercase font-bold">Venue:</span>
                    <span className="font-bold text-black bg-white px-3 py-1 border-3 border-black shadow-[2px_2px_0_#000]">{match.isHome ? 'Home' : `Away`}</span>
                </div>
                {match.stats.possession && (
                    <div className="flex items-center gap-2 relative z-10">
                        <span className="text-black uppercase font-bold">Possession:</span>
                        <span className="font-bold text-[#004d98] bg-white px-3 py-1 border-3 border-black shadow-[2px_2px_0_#000]">{match.stats.possession}%</span>
                    </div>
                )}
                {match.stats.xG && (
                    <div className="flex items-center gap-2 relative z-10">
                        <span className="text-black uppercase font-bold">xG:</span>
                        <span className="font-bold text-[#004d98] bg-white px-3 py-1 border-3 border-black shadow-[2px_2px_0_#000]">{parseFloat(match.stats.xG).toFixed(2)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
