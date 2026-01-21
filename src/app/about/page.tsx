"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeft, Github, Linkedin, ExternalLink, Sparkles, Zap, Heart, Globe, Home, Users, Swords, Cpu, Trophy, X, ZoomIn } from 'lucide-react';

const AboutPage = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; caption: string; alt: string } | null>(null);

    // Team Members
    const teamMembers = [
        {
            name: "Hansi Flick",
            role: "Head Coach",
            image: "/images/flick.webp",
            quote: "We don't just win. We dominate."
        },
        {
            name: "Xavi Hernandez",
            role: "The Architect",
            image: "/images/xavi.webp",
            quote: "The foundation was laid for this moment."
        }
    ];

    const journeyImages = [
        { src: '/images/about/raph-profile-clean.webp', caption: 'VOL 1: The Clean Look', alt: 'Early clean design' },
        { src: '/images/about/data-clean.webp', caption: 'VOL 2: Data Heavy', alt: 'Data visualization phase' },
        { src: '/images/about/sketchbook.webp', caption: 'VOL 3: The Sketchbook Turn', alt: 'Sketchbook aesthetic experiment' },
        { src: '/images/about/raph-profile-comic.webp', caption: 'VOL 4: The Final Style', alt: 'Final comic book style' },
    ];

    const techStack = [
        { name: 'Next.js 15', url: 'https://nextjs.org/', desc: 'The Engine' },
        { name: 'TypeScript', url: 'https://www.typescriptlang.org/', desc: 'Safety Protocols' },
        { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', desc: 'Super Suit' },
        { name: 'Recharts', url: 'https://recharts.org/', desc: 'Data Vis' },
    ];

    return (
        <main className="min-h-screen bg-slate-50 text-gray-900 relative overflow-hidden">
            {/* Global Halftone Overlay */}
            <div className="absolute inset-0 comic-halftone opacity-10 pointer-events-none fixed z-0"></div>

            {/* Navigation */}
            <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b-4 border-black z-40 shadow-[0_4px_0_rgba(0,0,0,0.1)]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-black hover:text-[#a50044] transition-colors font-black uppercase transform hover:-rotate-1 active:scale-95 active:rotate-0"
                        style={{ fontFamily: 'var(--font-bangers)' }}
                    >
                        <ArrowLeft size={24} strokeWidth={3} />
                        <span className="text-xl">Back to Home</span>
                    </Link>
                    <div className="hidden sm:block text-sm font-bold bg-[#ffed02] border-2 border-black px-3 py-1 transform rotate-1 shadow-[2px_2px_0_black]">
                        EST. 2026
                    </div>
                </div>
            </nav>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">

                {/* Hero: COMIC COVER STYLE */}
                <header className="text-center mb-20 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#a50044] blur-[100px] opacity-20 -z-10 rounded-full"></div>

                    <div className="inline-block bg-black text-white px-6 py-1 font-bold text-sm tracking-widest mb-4 transform -rotate-2 border-2 border-[#ffed02]">
                        ORIGIN STORY
                    </div>

                    <h1
                        className="text-6xl md:text-8xl font-black uppercase tracking-tight mb-6 leading-none text-[#004d98]"
                        style={{
                            fontFamily: 'var(--font-bangers)',
                            textShadow: '4px 4px 0px black'
                        }}
                    >
                        Why I Created <br />
                        <span className="text-[#a50044]">FlickBall</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-700 font-bold max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-comic)' }}>
                        The story of how a heartbreak turned into a coding obsession.
                    </p>
                </header>

                {/* CHAPTER 1: THE FALL (XAVI ERA) */}
                <section className="mb-24 grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 relative group">
                        <div className="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>
                        <div className="relative border-4 border-black bg-gray-200 aspect-[4/5] overflow-hidden grayscale active:grayscale-0 group-hover:grayscale-0 transition-all duration-300">
                            <Image
                                src="/images/xavi.webp"
                                alt="Xavi Hernandez"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-center font-bold text-sm uppercase">
                                The Legend who suffered
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-7 space-y-6 text-lg leading-relaxed md:pl-4" style={{ fontFamily: 'var(--font-comic)' }}>
                        <div className="inline-block bg-gray-200 text-gray-600 px-3 py-1 font-bold text-xs uppercase mb-2">
                            The Past
                        </div>
                        <h2 className="text-4xl font-black uppercase leading-none mb-4" style={{ fontFamily: 'var(--font-bangers)' }}>
                            We needed <span className="text-gray-400 decoration-4 line-through">Change</span> <span className="text-[#a50044]">Hope</span>
                        </h2>
                        <p>
                            I&apos;ve been supporting <strong>FC Barcelona</strong> since 2015. In 2021, things started to change. Not even the 8-2 loss VS Bayern could make me leave, but 2021? It felt like the team was going nowhere.
                        </p>
                        <p className="text-gray-500 italic">
                            Xavi was convinced what he achieved was as good as it gets given the club circumstances. It felt stuck.
                        </p>
                    </div>
                </section>

                {/* CHAPTER 2: THE RETURN (FLICK ERA) */}
                <section className="mb-24">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-2 bg-gradient-to-r from-transparent to-[#a50044]"></div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase text-[#a50044] transform -rotate-2"
                            style={{
                                fontFamily: 'var(--font-bangers)',
                                textShadow: '3px 3px 0 #000'
                            }}>
                            ENTER: FLICK
                        </h2>
                        <div className="flex-1 h-2 bg-gradient-to-l from-transparent to-[#a50044]"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 relative">
                            <div className="absolute inset-0 bg-[#ffed02] rounded-full blur-[60px] opacity-40"></div>
                            <div className="relative border-4 border-[#ffed02] shadow-[0_0_0_4px_black] transform rotate-2 hover:scale-105 transition-transform duration-300 aspect-square overflow-hidden bg-black">
                                <Image
                                    src="/images/flick.webp"
                                    alt="Hansi Flick"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-[#ffed02] font-black text-3xl uppercase italic" style={{ fontFamily: 'var(--font-bangers)' }}>
                                    "WE BALL."
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2 space-y-6 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-comic)' }}>
                            <p className="text-3xl font-black text-black leading-tight">
                                Same board. Same players. <br />
                                <span className="bg-[#ffed02] px-2 box-decoration-clone text-[#004d98]">New Era.</span>
                            </p>
                            <p>
                                Changing the relic of a formation that is 4-3-3 to <strong>4-2-3-1</strong>, making full use of the contrast in Lamine, Raphinha, and Pedri&apos;s abilities. And boom...
                            </p>
                            <p>
                                <strong>4-0 against Real Madrid.</strong> 4-1 against Bayern. Total domination is an understatement. This was the same Madrid side that humiliated us for 4 straight games with Xavi — and they had just added Mbappé.
                            </p>
                            <div className="bg-[#004d98] text-white p-6 border-4 border-black shadow-[8px_8px_0_#a50044] transform rotate-1 mt-4">
                                <p className="font-medium">
                                    Winning the domestic treble was nice. But nothing mattered more than seeing the team play with identity and intensity again.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 3: THE STYLE */}
                <section className="mb-24 bg-black p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffed02] rounded-full filter blur-[100px] opacity-10"></div>

                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-8 relative z-10" style={{ fontFamily: 'var(--font-bangers)' }}>
                        Why Comic Book Style?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 relative z-10 text-white">
                        <div className="opacity-50 blur-[1px] active:blur-none active:opacity-100 hover:blur-none hover:opacity-100 transition-all duration-300">
                            <h3 className="text-xl font-bold mb-2 uppercase text-gray-400">Attempt #1: Glassmorphism</h3>
                            <p className="font-mono text-sm leading-relaxed border-l-2 border-gray-600 pl-4">
                                I&apos;m a <strong>Statistics Major</strong>, so my first instinct was data purity. I went with the usual in sports analytics: minimalist, clean glassmorphism.
                                <br />
                                &gt; It looked good.
                                <br />
                                &gt; It looked safe.
                                <br />
                                &gt; <span className="text-red-500 font-bold">It looked boring.</span>
                            </p>
                        </div>

                        <div className="border-4 border-[#ffed02] p-6 bg-[#1a1a1a] shadow-[8px_8px_0_#ffed02] transform -rotate-1 hover:rotate-0 transition-transform">
                            <h3 className="text-xl font-black mb-2 uppercase text-[#ffed02]" style={{ fontFamily: 'var(--font-bangers)' }}>Attempt #2: The FlickVerse</h3>
                            <p className="leading-relaxed font-bold" style={{ fontFamily: 'var(--font-comic)' }}>
                                I decided to go in the complete opposite direction: a messy sketchbook aesthetic.
                                Use bold lines, vibrant colors, and dynamic layouts.
                                <br /><br />
                                This matches the team: <strong>Imperfect, messy, but alive.</strong>
                            </p>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 4: THE ALGORITHM (FBI) */}
                <section className="mb-24">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-2 bg-black"></div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase text-black" style={{ fontFamily: 'var(--font-bangers)' }}>
                            The <span className="text-[#a50044]">Index</span>
                        </h2>
                        <div className="flex-1 h-2 bg-black"></div>
                    </div>

                    <div className="bg-[#ffed02] border-4 border-black p-8 shadow-[12px_12px_0_black] relative overflow-hidden transform rotate-1">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={120} strokeWidth={1} className="text-black" />
                        </div>

                        <div className="relative z-10 grid md:grid-cols-12 gap-8">
                            <div className="md:col-span-8 space-y-4">
                                <h3 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                                    The SofaScore Paradox
                                </h3>
                                <div className="text-lg font-medium leading-relaxed space-y-4" style={{ fontFamily: 'var(--font-comic)' }}>
                                    <p>
                                        I&apos;ve been a big fan of <strong>SofaScore</strong> since 2018. They&apos;re actually one of the odd reasons I majored in statistics! But as an interpretability researcher, their &quot;black box&quot; algorithm always bothered me.
                                    </p>
                                    <p>
                                        It&apos;s their &quot;secret sauce,&quot; I get it. But it didn&apos;t sit right with me. I wanted to know <em>exactly</em> why a player got a 7.2 vs a 7.5.
                                    </p>

                                    <div className="bg-white border-2 border-black p-4 my-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                                        <h4 className="font-black uppercase text-sm mb-1 text-[#004d98]">The Solution: FBI (FlickBall Index)</h4>
                                        <p className="text-sm">
                                            A <strong>100% transparent</strong> rating system tailored to Hansi Flick&apos;s system. We weigh high pressing, carries into the final third, and positioning—not just the usual goals & assists.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-4 flex flex-col justify-center items-center text-center space-y-4 border-l-4 border-black/10 md:pl-8">
                                <div className="bg-white p-4 rounded-full border-4 border-black shadow-lg">
                                    <Heart className="text-[#a50044] fill-current" size={48} />
                                </div>
                                <Link
                                    href="/about-fbi"
                                    className="inline-block bg-black text-white px-6 py-3 font-black uppercase text-xl hover:scale-105 hover:bg-[#a50044] transition-all shadow-[6px_6px_0_white] hover:shadow-none translate-x-0 hover:translate-x-1 hover:translate-y-1 active:scale-95 active:translate-x-1 active:translate-y-1"
                                    style={{ fontFamily: 'var(--font-bangers)' }}
                                >
                                    Read the FBI Logic
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* EVOLUTION GALLERY */}
                <section className="mb-24">
                    <div className="flex items-center gap-4 mb-8 justify-center">
                        <div className="flex-1 h-2 bg-gray-200"></div>
                        <h2 className="text-3xl font-black uppercase text-gray-400" style={{ fontFamily: 'var(--font-bangers)' }}>
                            The Archives
                        </h2>
                        <div className="flex-1 h-2 bg-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {journeyImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className="group cursor-active focus:outline-none w-full text-left"
                            >
                                <div className="bg-white border-2 border-black aspect-[3/4] p-2 hover:-translate-y-2 transition-transform shadow-md hover:shadow-[4px_4px_0_black] active:scale-95 active:shadow-none active:translate-y-0 h-full flex flex-col">
                                    <div className="w-full relative flex-grow bg-gray-100 border border-gray-200 mb-2 overflow-hidden">
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <ZoomIn size={16} />
                                        </div>
                                    </div>
                                    <div className="h-auto mt-auto">
                                        <div className="bg-black text-white text-[10px] uppercase font-bold px-1 w-fit mb-1">
                                            ISSUE #{idx + 1}
                                        </div>
                                        <p className="font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-comic)' }}>
                                            {img.caption.split(':')[1]}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* TECH & AI */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_#004d98]">
                        <h2 className="text-3xl font-black uppercase mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-bangers)' }}>
                            <Zap className="text-[#ffed02] fill-current stroke-black" size={32} />
                            Tech Stack
                        </h2>
                        <div className="space-y-3">
                            {techStack.map((tech) => (
                                <a key={tech.name} href={tech.url} target="_blank" className="flex items-center justify-between group border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded active:bg-gray-100 active:scale-[0.99] transition-all">
                                    <span className="font-black text-gray-800 uppercase group-hover:text-[#a50044] transition-colors">{tech.name}</span>
                                    <span className="text-sm font-medium text-gray-500" style={{ fontFamily: 'var(--font-comic)' }}>{tech.desc}</span>
                                </a>
                            ))}
                        </div>
                    </section>

                    <section className="bg-gray-100 border-4 border-gray-300 p-6 border-dashed relative">
                        <div className="absolute -top-4 -right-4 bg-white border-2 border-black px-3 py-1 font-bold text-xs uppercase shadow-[2px_2px_0_black] rotate-3">
                            Honest Note
                        </div>
                        <h2 className="text-3xl font-black uppercase mb-4 text-gray-800" style={{ fontFamily: 'var(--font-bangers)' }}>
                            Co-Pilot
                        </h2>
                        <div className="space-y-4 text-sm font-medium text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-comic)' }}>
                            <p>
                                <Sparkles size={16} className="inline mr-1 text-[#a50044]" />
                                I used <strong>AI assistance (Gemini)</strong> throughout this project. It served as a tireless collaborator for code generation and debugging, and the comic book image filters.
                            </p>
                            <p>
                                That said, <strong>every decision was mine.</strong> The vision, the aesthetic choices, and the passion come from a human heart.
                            </p>
                        </div>
                    </section>
                </div>

                {/* SITE GUIDE */}
                <section className="mb-24">
                    <h2 className="text-4xl font-black uppercase text-center mb-12" style={{ fontFamily: 'var(--font-bangers)' }}>
                        Site Map
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: 'The Dashboard', url: '/', icon: Home, desc: 'Overview of current team status and recent matches.' },
                            { title: 'The Squad', url: '/team', icon: Users, desc: 'Player profiles, stats gallery, and team records.' },
                            { title: 'Comparisons', url: '/compare', icon: Swords, desc: 'Head-to-head player statistical analysis.' },
                            { title: 'The Index', url: '/about-fbi', icon: Cpu, desc: 'Explanation of the custom rating algorithm.' },
                            { title: 'Achievements', url: '/achievements', icon: Trophy, desc: 'Trophies, records, and milestones.' },
                        ].map((item) => (
                            <Link key={item.url} href={item.url} className="group block h-full active:scale-95 transition-transform">
                                <div className="bg-white border-3 border-black p-6 h-full shadow-[6px_6px_0_#000] group-hover:shadow-[2px_2px_0_#000] group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <div className="text-blue-600 mb-4 ">
                                        <item.icon size={32} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase text-[#004d98] mb-1 leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>{item.title}</h3>
                                    <p className="text-xs font-bold font-mono text-gray-500">{item.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                <footer className="text-center border-t-4 border-black pt-12">
                    <h3 className="text-4xl font-black uppercase mb-2 text-[#004d98]" style={{ fontFamily: 'var(--font-bangers)' }}>
                        Visca Barça
                    </h3>
                    <p className="text-gray-500 mb-8 font-bold max-w-lg mx-auto" style={{ fontFamily: 'var(--font-comic)' }}>
                        I hope this made you feel something. Because that&apos;s the goal. Not just to show stats, but to tell a story.
                        <br /><br />
                        Thank you, Hansi. And thank you for reading.
                    </p>

                    <div className="flex justify-center gap-6">
                        <a
                            href="https://ezzio.me"
                            target="_blank"
                            aria-label="Personal Website"
                            className="bg-[#a50044] text-white p-3 rounded-full hover:bg-[#800033] transition-all shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95"
                        >
                            <Globe size={24} />
                        </a>
                        <a href="https://github.com/Ezzio11" className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors active:scale-95">
                            <Github size={24} />
                        </a>
                        <a href="https://www.linkedin.com/in/ezzeldinahmed" className="bg-[#0077b5] text-white p-3 rounded-full hover:bg-[#006097] transition-colors active:scale-95">
                            <Linkedin size={24} />
                        </a>
                    </div>
                </footer>

            </article>

            {/* LIGHTBOX OVERLAY */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-[#ffed02] transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <div className="relative w-full h-[80vh] bg-white p-2 border-4 border-black rounded shadow-[0_0_50px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="mt-4 bg-black text-white px-4 py-2 font-bold uppercase tracking-widest border-2 border-[#ffed02]">
                            {selectedImage.caption}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AboutPage;
