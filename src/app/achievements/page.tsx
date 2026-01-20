"use client";

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import { Trophy, Star, Crown, Zap, TrendingUp, Shield, Target, Flame, Activity, Users } from 'lucide-react';

export default function AchievementsPage() {
    return (
        <div className="min-h-screen bg-[#fffdf5] text-black relative overflow-hidden flex flex-col">
            {/* Background Pattern: Halftone */}
            <div className="absolute inset-0 pointer-events-none fixed z-0 comic-halftone opacity-10"></div>

            <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 py-8 relative z-10">

                {/* Back Button */}
                <Link href="/" className="inline-block mb-8 comic-button px-6 py-2 text-xl font-bold uppercase transform -skew-x-10 shadow-[6px_6px_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 active:bg-black active:text-white transition-all border-3 border-black bg-white text-black">
                    ← Back Home
                </Link>

                {/* Hero Header */}
                <div className="text-center mb-16 relative">
                    <div className="inline-block relative">
                        <h1 className="text-7xl md:text-9xl font-black uppercase text-[#EDBB00] transform -rotate-2 drop-shadow-[8px_8px_0_#000]" style={{ fontFamily: 'var(--font-bangers)', WebkitTextStroke: '3px black' }}>
                            Hall of Glory
                        </h1>
                        <div className="absolute -top-6 -right-12 bg-[#db0030] text-white px-4 py-2 transform rotate-12 border-4 border-black shadow-[4px_4px_0_#000]">
                            <span className="text-2xl font-black uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>The Flick Era</span>
                        </div>
                    </div>
                    <p className="mt-4 text-xl font-bold uppercase tracking-widest text-gray-500">Established July 2024</p>
                </div>

                {/* 1. TROPHY CABINET */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-end">
                    {/* Supercopa */}
                    <div className="group relative">
                        <div className="relative z-10 transform group-hover:-translate-y-4 transition-transform duration-300">
                            <div className="aspect-square relative w-full max-w-[300px] mx-auto filter drop-shadow-[0_10px_0_rgba(0,0,0,0.2)]">
                                <Image
                                    src="/images/trophies/supercopa.webp"
                                    alt="Supercopa Trophy"
                                    fill
                                    sizes="(max-width: 768px) 150px, 300px"
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div className="bg-white border-4 border-black p-6 relative mt-[-40px] pt-12 text-center transform rotate-1 shadow-[8px_8px_0_#000]">
                            <h3 className="text-4xl font-black uppercase text-black mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>Supercopa</h3>
                            <div className="flex justify-center gap-2 mb-2">
                                <span className="bg-[#EDBB00] border-2 border-black px-2 font-bold text-xs shadow-[2px_2px_0_#000]">2025</span>
                                <span className="bg-[#EDBB00] border-2 border-black px-2 font-bold text-xs shadow-[2px_2px_0_#000]">2026</span>
                            </div>
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Back-to-Back Kings</p>
                        </div>
                    </div>

                    {/* La Liga (Centerpiece) */}
                    <div className="group relative md:-mt-12 order-first md:order-none">
                        <div className="absolute inset-0 bg-[#FFED02] opacity-0 group-hover:opacity-20 blur-xl transition-opacity rounded-full"></div>
                        <div className="relative z-20 transform scale-110 group-hover:scale-115 transition-transform duration-300">
                            <div className="aspect-square relative w-full max-w-[350px] mx-auto filter drop-shadow-[0_15px_0_rgba(0,0,0,0.3)]">
                                <Image
                                    src="/images/trophies/laliga.webp"
                                    alt="LaLiga Trophy"
                                    fill
                                    sizes="(max-width: 768px) 200px, 350px"
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div className="bg-gradient-to-b from-[#004d98] to-[#003366] border-4 border-black p-8 relative mt-[-50px] pt-16 text-center shadow-[12px_12px_0_#000] z-10 w-[110%] -ml-[5%]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#db0030] text-white border-3 border-black px-4 py-1 transform -rotate-2">
                                <span className="font-black uppercase tracking-widest">28th Title</span>
                            </div>
                            <h3 className="text-5xl font-black uppercase text-white mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>La Liga</h3>
                            <div className="flex justify-center gap-2 mb-4">
                                <span className="bg-white text-black border-2 border-black px-3 py-1 font-black text-sm shadow-[3px_3px_0_#000] transform -rotate-2">2024/25</span>
                            </div>
                            <p className="text-white/80 font-bold uppercase tracking-widest text-sm">German Engineering</p>
                            <div className="mt-2 text-xs text-[#FFED02] uppercase font-bold">First German Coach to Win on Debut</div>
                        </div>
                    </div>

                    {/* Copa del Rey */}
                    <div className="group relative">
                        <div className="relative z-10 transform group-hover:-translate-y-4 transition-transform duration-300">
                            <div className="aspect-square relative w-full max-w-[280px] mx-auto filter drop-shadow-[0_10px_0_rgba(0,0,0,0.2)]">
                                <Image
                                    src="/images/trophies/copa.webp"
                                    alt="Copa Trophy"
                                    fill
                                    sizes="(max-width: 768px) 100px, 150px"
                                    className="object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                        <div className="bg-white border-4 border-black p-6 relative mt-[-40px] pt-12 text-center transform -rotate-1 shadow-[8px_8px_0_#000]">
                            <h3 className="text-4xl font-black uppercase text-black mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>Copa del Rey</h3>
                            <div className="flex justify-center gap-2 mb-2">
                                <span className="bg-[#EDBB00] border-2 border-black px-2 font-bold text-xs shadow-[2px_2px_0_#000]">2024/25</span>
                            </div>
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">The Domestic Double</p>
                        </div>
                    </div>
                </div>

                {/* 2. EL CLASICO SMACKDOWN (Formerly The Madrid Protocol) */}
                <div className="mb-24">
                    <div className="bg-white border-[6px] border-black p-0 relative overflow-hidden shadow-[12px_12px_0_#000]">
                        <div className="bg-[#1a1a1a] p-4 border-b-4 border-black flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'var(--font-bangers)' }}>Clash of Titans</h2>
                            <div className="bg-[#EDBB00] px-3 py-1 border-2 border-white text-black font-bold uppercase text-xs">Rivalry Status: Dominated</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x-4 divide-black">
                            {/* Win Rate */}
                            <div className="p-8 text-center bg-[#f0f0f0]">
                                <div className="text-6xl font-black text-[#004d98] mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>83%</div>
                                <div className="text-sm font-bold uppercase text-black">Win Rate</div>
                                <div className="text-xs text-gray-600 mt-2">5 Wins in 6 Clásicos</div>
                            </div>
                            {/* The 0-4 */}
                            <Link href="/matches/4506859" className="p-8 text-center bg-[#db0030] text-white relative overflow-hidden group block hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer">
                                <div className="absolute inset-0 opacity-10 comic-halftone"></div>
                                <div className="relative z-10">
                                    <div className="text-6xl font-black mb-2 text-[#FFED02]" style={{ fontFamily: 'var(--font-bangers)' }}>0-4</div>
                                    <div className="text-sm font-bold uppercase">The Statement</div>
                                    <div className="text-xs text-white/80 mt-2">Bernabéu Silence (Oct 2024)</div>
                                    <div className="mt-2 text-[10px] uppercase font-bold border border-white/30 inline-block px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">View Match</div>
                                </div>
                            </Link>
                            {/* PPG */}
                            <div className="p-8 text-center bg-[#f0f0f0]">
                                <div className="text-6xl font-black text-black mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>2.5</div>
                                <div className="text-sm font-bold uppercase text-black">Points Per Game</div>
                                <div className="text-xs text-gray-600 mt-2">Best in 26 Years (Beat Pep)</div>
                            </div>
                            {/* Knockout Specialist */}
                            <div className="p-8 text-center bg-[#fff] relative">
                                <div className="text-6xl font-black text-black mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>2x</div>
                                <div className="text-sm font-bold uppercase text-black">Super Cup KOs</div>
                                <div className="text-xs text-gray-600 mt-2">Eliminated Madrid in '25 & '26</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. HEROES GALLERY (Formerly Heroes Reborn) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">

                    {/* LEWY */}
                    <Link href="/squad/robert-lewandowski" className="comic-panel bg-white p-6 border-4 border-black shadow-[8px_8px_0_#000] relative overflow-hidden group min-h-[300px] flex flex-col justify-between hover:scale-[1.02] active:scale-105 active:shadow-[4px_4px_0_#000] transition-all duration-200 cursor-pointer user-select-none touch-manipulation">
                        <div className="absolute top-2 right-2 z-10">
                            <Star className="text-[#EDBB00] fill-current" size={32} />
                        </div>
                        <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase transform -rotate-3">The Resurgence</div>

                        <div className="absolute bottom-[-10px] right-[-20px] w-[200px] h-[220px] z-0 opacity-90 mix-blend-normal grayscale group-hover:grayscale-0 group-active:grayscale-0 group-hover:scale-110 group-active:scale-110 transition-all duration-500">
                            <Image src="/images/players/robert-lewandowski-profile.webp" alt="Lewandowski" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-bottom" />
                        </div>

                        <h3 className="text-3xl font-black uppercase text-[#a50044] mb-4 mt-6 relative z-10 drop-shadow-md group-active:translate-x-1" style={{ fontFamily: 'var(--font-bangers)' }}>Lewandowski</h3>
                        <div className="space-y-4 relative z-10 w-2/3">
                            <div className="bg-gray-100/90 p-3 border-2 border-black backdrop-blur-sm">
                                <div className="text-2xl font-black text-black">27 Goals</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Club Top Scorer 24/25</div>
                            </div>
                            <div className="bg-gray-100/90 p-3 border-2 border-black backdrop-blur-sm">
                                <div className="text-2xl font-black text-black">100th</div>
                                <div className="text-xs uppercase font-bold text-gray-500">UCL & Barça Goal Milestone</div>
                            </div>
                        </div>
                    </Link>

                    {/* LAMINE */}
                    <Link href="/squad/lamine-yamal" className="comic-panel bg-black p-6 border-4 border-black shadow-[8px_8px_0_#000] relative overflow-hidden group min-h-[300px] flex flex-col justify-between hover:scale-[1.02] active:scale-105 active:shadow-[4px_4px_0_#000] transition-all duration-200 cursor-pointer user-select-none touch-manipulation">
                        <div className="absolute inset-0 comic-halftone opacity-20 bg-white"></div>
                        <div className="absolute top-2 left-2 z-10 bg-[#FFED02] text-black px-2 py-0.5 text-[10px] font-bold uppercase transform rotate-2">The Global Icon</div>

                        <div className="absolute bottom-[-10px] right-[-10px] w-[220px] h-[220px] z-0 grayscale group-hover:grayscale-0 group-active:grayscale-0 group-hover:rotate-3 group-active:rotate-3 transition-all duration-500">
                            <Image src="/images/players/lamine-yamal-profile.webp" alt="Lamine Yamal" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-bottom" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black uppercase text-[#FFED02] mb-4 mt-6 drop-shadow-md group-active:translate-x-1" style={{ fontFamily: 'var(--font-bangers)' }}>Lamine Yamal</h3>
                            <div className="space-y-4 w-2/3">
                                <div className="bg-[#004d98] p-3 border-2 border-white text-white shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                                    <div className="text-2xl font-black">80 G/A</div>
                                    <div className="text-xs uppercase font-bold opacity-70">By Age 18 (Unmatched)</div>
                                </div>
                                <div className="bg-[#004d98] p-3 border-2 border-white text-white shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                                    <div className="text-sm font-bold leading-tight">Youngest El Clásico Scorer</div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* RAPHINHA */}
                    <Link href="/squad/raphinha" className="comic-panel bg-white p-6 border-4 border-black shadow-[8px_8px_0_#000] relative overflow-hidden group min-h-[300px] flex flex-col justify-between hover:scale-[1.02] active:scale-105 active:shadow-[4px_4px_0_#000] transition-all duration-200 cursor-pointer user-select-none touch-manipulation">
                        <div className="absolute top-2 right-2 z-10">
                            <Flame className="text-[#db0030] fill-current" size={32} />
                        </div>

                        <div className="absolute bottom-[-20px] right-[-20px] w-[230px] h-[230px] z-0 opacity-90 mix-blend-normal grayscale group-hover:grayscale-0 group-active:grayscale-0 group-hover:scale-105 group-active:scale-105 transition-all duration-500">
                            <Image src="/images/players/raphinha-profile.webp" alt="Raphinha" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-bottom" />
                        </div>

                        <h3 className="text-3xl font-black uppercase text-black mb-4 mt-6 relative z-10 drop-shadow-md group-active:translate-x-1" style={{ fontFamily: 'var(--font-bangers)' }}>Raphinha</h3>
                        <div className="space-y-4 relative z-10 w-2/3">
                            <div className="bg-gray-100/90 p-3 border-2 border-black backdrop-blur-sm">
                                <div className="text-2xl font-black text-black">Hat-trick</div>
                                <div className="text-xs uppercase font-bold text-gray-500">vs Bayern (100th Appearance)</div>
                            </div>
                            <div className="bg-gray-100/90 p-3 border-2 border-black backdrop-blur-sm">
                                <div className="text-2xl font-black text-black">18 Goals</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Best Season (24/25)</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 4. TALES FROM THE DUGOUT (Formerly The Flick Files) */}
                <div className="bg-[#fff3c4] border-[6px] border-black p-8 relative overflow-hidden mb-24">
                    <div className="absolute inset-0 opacity-10 bg-[url('/patterns/comic-dots.png')] bg-repeat"></div>

                    <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                        <div className="md:w-1/3">
                            <div className="border-4 border-black bg-white p-4 transform -rotate-2 shadow-[4px_4px_0_#000] mb-6">
                                <h2 className="text-5xl font-black uppercase text-black leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>
                                    Epic<br />Chronicles
                                </h2>
                            </div>
                            <p className="font-bold text-sm uppercase mb-4 text-black">Master Plan</p>
                            <ul className="space-y-3 font-mono text-sm leading-relaxed text-black">
                                <li className="flex gap-2 items-center">
                                    <Shield size={16} /> <span>#1 Offside Trap in Europe</span>
                                </li>
                                <li className="flex gap-2 items-center">
                                    <Zap size={16} /> <span>60% Goals in Second Half</span>
                                </li>
                                <li className="flex gap-2 items-center">
                                    <Target size={16} /> <span>First team to 6,500 LaLiga Goals</span>
                                </li>
                            </ul>
                        </div>

                        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card: The Perfect Final */}
                            <div className="bg-white border-3 border-black p-5 shadow-[6px_6px_0_#000] transform rotate-1 hover:scale-[1.01] transition-transform">
                                <div className="flex justify-between items-start mb-3">
                                    <Crown className="text-[#EDBB00] fill-current" size={32} />
                                    <span className="text-4xl font-black text-black" style={{ fontFamily: 'var(--font-bangers)' }}>100%</span>
                                </div>
                                <h4 className="font-bold text-black uppercase text-md border-b-2 border-black/20 pb-2 mb-2">The "Perfect Final"</h4>
                                <p className="text-gray-600 text-xs font-mono">8 Consecutive Finals Won (Career). 3/3 at Barcelona.</p>
                            </div>

                            {/* Card: The Streak */}
                            <div className="bg-[#a50044] border-3 border-black p-5 shadow-[6px_6px_0_#000] transform -rotate-1 hover:scale-[1.01] transition-transform text-white">
                                <div className="flex justify-between items-start mb-3">
                                    <TrendingUp className="text-white" size={32} />
                                    <span className="text-4xl font-black text-[#FFED02]" style={{ fontFamily: 'var(--font-bangers)' }}>19</span>
                                </div>
                                <h4 className="font-bold text-white uppercase text-md border-b-2 border-white/20 pb-2 mb-2">Dream Team Reborn</h4>
                                <p className="text-white/80 text-xs font-mono">19-Game Unbeaten Run (Jan-Apr 2025). Matches Cruyff's 1993/94 Record.</p>
                            </div>

                            {/* Card: Contract */}
                            <div className="bg-[#004d98] border-3 border-black p-5 shadow-[6px_6px_0_#000] transform rotate-1 hover:scale-[1.01] transition-transform text-white">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="font-black text-2xl" style={{ fontFamily: 'var(--font-bangers)' }}>2027</div>
                                </div>
                                <h4 className="font-bold text-white uppercase text-md border-b-2 border-white/20 pb-2 mb-2">The Future</h4>
                                <p className="text-white/80 text-xs font-mono">Contract Renewed (May 2025). The Era Continues.</p>
                            </div>

                            {/* Card: Goals */}
                            <div className="bg-[#FFED02] border-3 border-black p-5 shadow-[6px_6px_0_#000] transform -rotate-1 hover:scale-[1.01] transition-transform text-black">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="font-black text-2xl" style={{ fontFamily: 'var(--font-bangers)' }}>6,500</div>
                                </div>
                                <h4 className="font-bold text-black uppercase text-md border-b-2 border-black/10 pb-2 mb-2">Historic Milestone</h4>
                                <p className="text-black/60 text-xs font-mono">First La Liga Club to Reach 6,500 Goals (Sept 2024).</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. FLICKI-FLACKA ENGINE (FULL THROTTLE) */}
                <div className="bg-[#1a1a1a] border-[8px] border-black p-8 relative overflow-hidden group mb-16">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '40px 40px' }}></div>

                    <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
                        {/* Title Section */}
                        <div className="md:col-span-5 text-center md:text-left">
                            <div className="inline-block bg-[#FFED02] text-black px-4 py-1 font-black uppercase text-lg transform -skew-x-12 border-2 border-black mb-4 shadow-[4px_4px_0_white]">
                                <Activity className="inline-block mr-2" size={20} />
                                Engine Room
                            </div>
                            <h2 className="text-6xl md:text-7xl font-black uppercase text-white leading-none mb-4" style={{ fontFamily: 'var(--font-bangers)' }}>
                                Flicki-<span className="text-[#a50044]">Flacka</span><br />
                                Overdrive
                            </h2>
                        </div>

                        {/* Stats Engine */}
                        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#2a2a2a] border-2 border-gray-600 p-4 relative overflow-hidden group-hover:border-[#FFED02] transition-colors">
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    <Zap size={48} className="text-[#FFED02]" />
                                </div>
                                <h4 className="text-gray-400 uppercase text-xs font-bold mb-1">Second Half Dominance</h4>
                                <div className="text-4xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>60%</div>
                                <p className="text-gray-500 text-xs">Of goals scored after halftime. Superior fitness levels.</p>
                            </div>

                            <div className="col-span-1 sm:col-span-2 bg-[#2a2a2a] border-4 border-gray-600 relative overflow-hidden group-hover:border-[#a50044] transition-colors flex flex-col md:flex-row min-h-[300px]">
                                <div className="absolute top-0 right-0 p-2 opacity-10 z-10">
                                    <TrendingUp size={120} className="text-[#a50044]" />
                                </div>

                                {/* Info Section */}
                                <div className="p-6 relative z-10 md:w-1/2 flex flex-col justify-center">
                                    <div className="inline-block bg-[#a50044] text-white px-3 py-1 text-xs font-bold uppercase mb-3 self-start transform -skew-x-12">
                                        Unsung Heroes
                                    </div>
                                    <h4 className="text-3xl font-black text-white uppercase leading-none mb-4" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        The <span className="text-[#FFED02]">Fitness</span><br />Architects
                                    </h4>
                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed font-mono">
                                        The masterminds behind the team's relentless 90-minute pressing intensity. Transforming the squad into physical monsters.
                                    </p>

                                    <div className="space-y-3">
                                        <div className="border-l-2 border-[#FFED02] pl-3">
                                            <div className="text-white font-bold uppercase text-sm">Julio Tous</div>
                                            <div className="text-gray-500 text-xs">Head of Strength & Conditioning</div>
                                        </div>
                                        <div className="border-l-2 border-[#a50044] pl-3">
                                            <div className="text-white font-bold uppercase text-sm">Pepe Conde</div>
                                            <div className="text-gray-500 text-xs">Fitness Coach / Field Work</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visuals */}
                                <div className="md:w-1/2 relative h-[300px] md:h-auto flex">
                                    <div className="w-1/2 relative h-full border-r-2 border-[#1a1a1a] group/tous grayscale hover:grayscale-0 transition-all duration-500">
                                        <Image
                                            src="/images/staff/julio-tous.webp"
                                            alt="Julio Tous"
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-cover object-top"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                                    </div>
                                    <div className="w-1/2 relative h-full group/conde grayscale hover:grayscale-0 transition-all duration-500">
                                        <Image
                                            src="/images/staff/pepe-conde.webp"
                                            alt="Pepe Conde"
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-cover object-top"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 sm:col-span-2 bg-[#a50044] text-white p-4 border-4 border-black shadow-[4px_4px_0_black] transform rotate-1">
                                <div className="flex items-center gap-4">
                                    <div className="bg-black text-[#FFED02] p-2 rounded-full border-2 border-white">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-xl" style={{ fontFamily: 'var(--font-bangers)' }}>The "Flick" Effect</h4>
                                        <p className="text-xs font-mono opacity-90">Verticality. Intensity. No sideways passing.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}
