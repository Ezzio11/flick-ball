import Link from 'next/link';
import { Target, Shield, Zap, Footprints, Check, X, Info, Trophy } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

export const metadata = {
    title: 'About FBI - FlickBall Index | Rating System 1.0',
    description: 'The methodology behind the 100% transparent, mathematically rigorous player rating system for Barcelona under Hansi Flick.',
};

export default function AboutFBIPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#a50044] to-[#004d98] relative">
            {/* Global Halftone Overlay */}
            <div className="absolute inset-0 comic-halftone opacity-20 pointer-events-none fixed"></div>

            {/* Hero Section */}
            <div className="relative border-b-8 border-black bg-[#ffed02] py-20">
                <div className="relative z-10 max-w-6xl mx-auto px-4">
                    <h1 className="text-7xl md:text-9xl font-black text-center text-[#004d98] mb-4 tracking-wider"
                        style={{
                            fontFamily: 'var(--font-bangers)',
                            textShadow: '4px 4px 0 #000',
                            WebkitTextStroke: '2px #000'
                        }}>
                        FBI
                    </h1>
                    <div className="block w-fit bg-black text-[#ffed02] px-6 py-2 transform -skew-x-12 border-2 border-white mx-auto mb-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                        <p className="text-3xl md:text-5xl font-black text-center tracking-widest transform skew-x-12"
                            style={{ fontFamily: 'var(--font-bangers)' }}>
                            FLICKBALL INDEX
                        </p>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-black font-bold max-w-3xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-comic)' }}>
                        The world's first <span className="text-[#a50044] bg-white px-1 border border-black">100% transparent</span>, mathematically rigorous player rating system.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
                {/* What is FBI? */}
                <section className="mb-16">
                    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0_#000] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Info size={120} color="black" />
                        </div>
                        <h2 className="text-5xl font-black mb-6 text-[#004d98] uppercase transform -rotate-1 inline-block border-b-4 border-[#ffed02]" style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #000' }}>
                            WHAT IS THE FBI?
                        </h2>
                        <div className="prose prose-lg max-w-none text-black font-medium leading-relaxed">
                            <p className="text-xl mb-4">
                                The <strong>FlickBall Index (FBI)</strong> is our custom player rating system designed specifically
                                for Barcelona under Hansi Flick. Unlike commercial apps ratings, <strong>FBI is
                                    100% transparent</strong> - every weight, every formula, every decision is documented and open.
                            </p>
                            <p className="text-xl mb-4">
                                <strong className="text-[#a50044] bg-[#ffed02] px-1 border border-black inline-block transform -skew-x-6">Why we built it:</strong> Traditional ratings measure
                                <em>individual accumulation</em>. If you get 3 assists, you get a 10—even if you lost the ball 6 times.
                                <br /><br />
                                In Flick's high-line system, losing the ball is fatal. <strong>FBI measures System Fit.</strong> We reward the high press and punish the specific risks that leave the team exposed.
                            </p>
                            <div className="bg-[#004d98] text-white p-6 border-4 border-black shadow-[6px_6px_0_#a50044] mt-6 transform rotate-1">
                                <p className="text-2xl font-black text-center uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>
                                    "Traditional ratings ignore tactical context. We don't."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Formula */}
                <section className="mb-16">
                    <div className="bg-black border-4 border-white p-8 shadow-[12px_12px_0_#a50044] relative">
                        <h2 className="text-5xl font-black mb-8 text-[#ffed02] text-center uppercase"
                            style={{
                                fontFamily: 'var(--font-bangers)',
                                textShadow: '4px 4px 0 #a50044',
                                WebkitTextStroke: '1px #a50044'
                            }}>
                            THE FORMULA (v1.0)
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            {/* Offensive */}
                            <div className="bg-[#1a1a1a] border-4 border-[#ffed02] p-6 shadow-[6px_6px_0_#fff]">
                                <div className="flex items-center gap-3 mb-4 border-b-2 border-white/20 pb-2">
                                    <Trophy className="text-[#ffed02]" size={32} strokeWidth={2.5} />
                                    <h3 className="text-3xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        OFFENSIVE
                                    </h3>
                                </div>
                                <ul className="text-white space-y-2 font-bold font-mono text-sm">
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Goals <span className="text-[#ffed02]">× 1.6</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Assists <span className="text-[#ffed02]">× 1.1</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> xG and xA <span className="text-[#ffed02]">× 0.8</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Key Chances <span className="text-[#ffed02]">× 0.5</span></li>
                                    <li className="flex items-center gap-2 text-red-400"><X size={16} className="text-red-500" /> Big Chances Missed <span className="text-red-400">× -0.3</span></li>
                                    <li className="flex items-center gap-2 text-red-400"><X size={16} className="text-red-500" /> Offsides <span className="text-red-400">× -0.15</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Penalties Won <span className="text-[#ffed02]">× 0.6</span></li>
                                </ul>
                            </div>

                            {/* Passing */}
                            <div className="bg-[#1a1a1a] border-4 border-[#ffed02] p-6 shadow-[6px_6px_0_#fff]">
                                <div className="flex items-center gap-3 mb-4 border-b-2 border-white/20 pb-2">
                                    <Target className="text-[#ffed02]" size={32} strokeWidth={2.5} />
                                    <h3 className="text-3xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        PASSING
                                    </h3>
                                </div>
                                <ul className="text-white space-y-2 font-bold font-mono text-sm">
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Accurate passes <span className="text-[#ffed02]">/90</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Progressive passes <span className="text-[#ffed02]">× 0.3</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Accurate crosses <span className="text-[#ffed02]">× 0.15-0.3</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Long balls <span className="text-[#ffed02]">× 0.1</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Corners <span className="text-[#ffed02]">× 0.05</span></li>
                                </ul>
                            </div>

                            {/* Defensive */}
                            <div className="bg-[#1a1a1a] border-4 border-[#ffed02] p-6 shadow-[6px_6px_0_#fff]">
                                <div className="flex items-center gap-3 mb-4 border-b-2 border-white/20 pb-2">
                                    <Shield className="text-[#ffed02]" size={32} strokeWidth={2.5} />
                                    <h3 className="text-3xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        DEFENSIVE
                                    </h3>
                                </div>
                                <ul className="text-white space-y-2 font-bold font-mono text-sm">
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Tackles <span className="text-[#ffed02]">× 0.3</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Interceptions <span className="text-[#ffed02]">× 0.5</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Recoveries <span className="text-[#ffed02]">× 0.4</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Duel win rate <span className="text-[#ffed02]">× 0.5</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Clearances <span className="text-[#ffed02]">× 0.25</span></li>
                                    <li className="flex items-center gap-2 text-red-400"><X size={16} className="text-red-500" /> Dribbled past <span className="text-red-400">× -0.25</span></li>
                                </ul>
                            </div>

                            {/* Retention */}
                            <div className="bg-[#1a1a1a] border-4 border-[#ffed02] p-6 shadow-[6px_6px_0_#fff]">
                                <div className="flex items-center gap-3 mb-4 border-b-2 border-white/20 pb-2">
                                    <Zap className="text-[#ffed02]" size={32} strokeWidth={2.5} />
                                    <h3 className="text-3xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-bangers)' }}>
                                        RETENTION
                                    </h3>
                                </div>
                                <ul className="text-white space-y-2 font-bold font-mono text-sm">
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Succ. dribbles <span className="text-[#ffed02]">× 0.4</span></li>
                                    <li className="flex items-center gap-2 text-red-400"><X size={16} className="text-red-500" /> Dispossessed <span className="text-red-400">× -0.3</span></li>
                                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> Touches in box <span className="text-[#ffed02]">× 0.15</span></li>
                                    <li className="flex items-center gap-2 text-red-400"><X size={16} className="text-red-500" /> Fouls committed <span className="text-red-400">× -0.1</span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#004d98] text-white p-4 border-2 border-white text-center font-bold font-mono">
                            + Position Weights • Match Context • Discipline Penalties
                        </div>
                    </div>
                </section>

                {/* Real Example */}
                <section className="mb-16">
                    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0_#000]">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#a50044] uppercase tracking-wide"
                            style={{ fontFamily: 'var(--font-bangers)', textShadow: '2px 2px 0 #000' }}>
                            REAL WORLD EXAMPLE: EL CLÁSICO 4-3
                        </h2>

                        <div className="overflow-x-auto mb-6">
                            <table className="w-full border-4 border-black">
                                <thead className="bg-[#004d98] text-white">
                                    <tr>
                                        <th className="border-2 border-black p-4 text-left font-black text-xl uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>Player</th>
                                        <th className="border-2 border-black p-4 text-center font-black text-xl uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>FotMob</th>
                                        <th className="border-2 border-black p-4 text-center font-black text-xl uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>SofaScore</th>
                                        <th className="border-2 border-black p-4 text-center font-black text-xl uppercase bg-[#ffed02] text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                                            FBI
                                        </th>
                                        <th className="border-2 border-black p-4 text-left font-black text-xl uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>Why?</th>
                                    </tr>
                                </thead>
                                <tbody className="text-black font-bold">
                                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                                        <td className="border-2 border-black p-4 text-lg">Raphinha</td>
                                        <td className="border-2 border-black p-4 text-center font-mono">9.0</td>
                                        <td className="border-2 border-black p-4 text-center font-mono">7.5</td>
                                        <td className="border-2 border-black p-4 text-center font-black text-2xl" style={{ color: '#004d98' }}>
                                            9.4
                                        </td>
                                        <td className="border-2 border-black p-4 text-sm leading-snug">
                                            2 goals <Check className="inline w-4 h-4 text-green-600" /> BUT <span className="bg-red-100 px-1 border border-red-200">3 big chances missed</span>
                                        </td>
                                    </tr>
                                    <tr className="bg-[#ffebf0] hover:bg-[#ffe0e9] transition-colors relative">
                                        <td className="border-2 border-black p-4 text-lg">Lamine</td>
                                        <td className="border-2 border-black p-4 text-center font-mono">8.9</td>
                                        <td className="border-2 border-black p-4 text-center font-mono">9.1</td>
                                        <td className="border-2 border-black p-4 text-center font-black text-2xl" style={{ color: '#a50044' }}>
                                            10.0 🏆
                                        </td>
                                        <td className="border-2 border-black p-4 text-sm leading-snug">
                                            <span className="text-[#a50044] font-black uppercase">PERFECT GAME.</span> 0 dispossessions, 0 offsides.
                                        </td>
                                    </tr>
                                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                                        <td className="border-2 border-black p-4 text-lg">Ferran</td>
                                        <td className="border-2 border-black p-4 text-center font-mono">9.2</td>
                                        <td className="border-2 border-black p-4 text-center font-mono">8.0</td>
                                        <td className="border-2 border-black p-4 text-center font-black text-2xl" style={{ color: '#004d98' }}>
                                            8.4
                                        </td>
                                        <td className="border-2 border-black p-4 text-sm leading-snug">
                                            3 assists (hattrick!) <Check className="inline w-4 h-4 text-green-600" /> BUT <span className="bg-red-100 px-1 border border-red-200">6 turnovers exposed our high line</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Why FBI is Better */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-[#004d98] border-4 border-black p-6 shadow-[8px_8px_0_#fff] transform hover:-translate-y-1 transition-transform">
                            <div className="mb-4 bg-white text-[#004d98] w-14 h-14 flex items-center justify-center border-2 border-black shadow-[4px_4px_0_#000]">
                                <Trophy size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase text-[#ffed02] text-shadow-sm" style={{ fontFamily: 'var(--font-bangers)' }}>
                                TRANSPARENT
                            </h3>
                            <p className="text-white font-medium leading-normal text-sm">
                                Every formula documented. No black boxes. You can verify every calculation yourself.
                            </p>
                        </div>

                        <div className="bg-[#a50044] border-4 border-black p-6 shadow-[8px_8px_0_#fff] transform hover:-translate-y-1 transition-transform">
                            <div className="mb-4 bg-white text-[#a50044] w-14 h-14 flex items-center justify-center border-2 border-black shadow-[4px_4px_0_#000]">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase text-[#ffed02] text-shadow-sm" style={{ fontFamily: 'var(--font-bangers)' }}>
                                POSITION FAIR
                            </h3>
                            <p className="text-white font-medium leading-normal text-sm">
                                Defenders aren't penalized for low assists. Weighted perfectly for each role.
                            </p>
                        </div>

                        <div className="bg-[#ffed02] border-4 border-black p-6 shadow-[8px_8px_0_#fff] transform hover:-translate-y-1 transition-transform">
                            <div className="mb-4 bg-black text-[#ffed02] w-14 h-14 flex items-center justify-center border-2 border-black shadow-[4px_4px_0_#000]">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase text-black text-shadow-sm" style={{ fontFamily: 'var(--font-bangers)' }}>
                                RUTHLESS
                            </h3>
                            <p className="text-black font-medium leading-normal text-sm">
                                We punish inefficiency. Goals don't hide poor reliability. We demand perfection.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <a href="documentation/FBI_FORMULA.md" target="_blank"
                            className="bg-[#ffed02] text-black text-2xl font-black px-8 py-4 border-4 border-black shadow-[8px_8px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase flex items-center gap-3"
                            style={{ fontFamily: 'var(--font-bangers)' }}>
                            <Info size={28} color="black" strokeWidth={3} />
                            Complete Formula
                        </a>
                        <a href="documentation/FBI_v1.0_VALIDATION.md" target="_blank"
                            className="bg-[#004d98] text-white text-2xl font-black px-8 py-4 border-4 border-black shadow-[8px_8px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase flex items-center gap-3"
                            style={{ fontFamily: 'var(--font-bangers)' }}>
                            <Check size={28} color="white" strokeWidth={3} />
                            Validation Proof
                        </a>
                    </div>
                </section>

                {/* Back to Home */}
                <div className="mt-16 text-center">
                    <BackButton href="/" label="BACK TO SQUAD" variant="dark" className="text-3xl px-12 py-4" />
                </div>
            </div>
        </div>
    );
}
