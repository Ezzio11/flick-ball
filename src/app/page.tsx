"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { Shirt, BarChart3 } from "lucide-react";
import { useState } from "react";

// Standardized Comic Panel Component with Touch Support
function ComicPanel({
  href,
  className = "",
  children,
  bgClass = "bg-white",
  baseShadow = "md",
  diagonal = ""
}: {
  href: string,
  className?: string,
  children: React.ReactNode,
  bgClass?: string,
  baseShadow?: string, // Legacy prop, we'll standardize inside
  diagonal?: string
}) {
  const [touchActive, setTouchActive] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    const timeout = setTimeout(() => {
      setTouchActive(true);
    }, 150); // 150ms delay for mobile hover emulation
    setTouchTimeout(timeout);
  };

  const handleTouchEnd = () => {
    if (touchTimeout) clearTimeout(touchTimeout);
    setTouchTimeout(null);
    setTouchActive(false);
  };

  // Standard styling enforcement
  const border = "border-[6px] border-black";

  return (
    <Link
      href={href}
      className={`
                relative overflow-hidden group cursor-pointer transition-all duration-300
                block outline-none transform-gpu
                ${border}
                ${className}
                ${diagonal}
                ${touchActive ? 'scale-[1.02]' : 'hover:scale-[1.02]'}
            `}
      style={{ backfaceVisibility: 'hidden', WebkitFontSmoothing: 'subpixel-antialiased' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >

      <div className={`contents ${touchActive ? 'force-hover' : ''}`}>
        {children}
      </div>

      {/* 
                Hack: Tailwind 'group-hover' doesn't trigger on custom class safely without config.
                But we can abuse the fact that we are scaling the parent.
             */}
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#db0030] relative overflow-hidden">

      {/* GLOBAL BACKGROUND: Halftone Overlay on Red */}
      <div className="absolute inset-0 z-0 comic-halftone opacity-20"></div>

      {/* COMIC BOOK PAGE - Full Integration */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-3 py-3 flex flex-col gap-3">

        {/* ======= HEADER PANEL (Top Comic Panel) ======= */}
        <div className="bg-[#ffed02] border-[6px] border-black p-4 md:px-8 md:py-4 diagonal-slice-right relative overflow-visible z-30">
          {/* Radial Halftone Background */}
          <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              maskImage: 'radial-gradient(circle at center, black, transparent)'
            }}></div>
          </div>

          {/* CENTER: Trophy Room Sticker (Absolute Overlay) */}
          <Link href="/achievements" className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transform rotate-3 hover:rotate-1 hover:scale-105 transition-all duration-300 cursor-pointer">
            <Image
              src="/images/trophy-stamp.webp"
              alt="Trophy Room"
              width={190}
              height={100}
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">

            {/* LEFT: FLICKBALL Logo - Comic Burst style */}
            <Link href="/" className="group relative z-20 scale-100 hover:scale-105 transition-transform duration-300 shrink-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[250%] z-[-1] animate-pulse-slow">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <path fill="#fff" stroke="black" strokeWidth="3" d="M100,10 L120,60 L170,50 L140,90 L180,130 L130,140 L150,190 L100,160 L50,190 L70,140 L20,130 L60,90 L30,50 L80,60 Z" />
                </svg>
              </div>
              <div className="transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                <span className="text-5xl md:text-6xl font-black text-[#004d98] uppercase tracking-tighter text-stroke-comic-sm" style={{ fontFamily: 'var(--font-bangers)' }}>
                  FlickBall
                </span>
              </div>
            </Link>

            {/* MOBILE ONLY: Trophy Room Sticker (Between Logo and Nav) */}
            <Link href="/achievements" className="md:hidden relative z-20 transform rotate-2 hover:scale-105 transition-transform my-1">
              <Image
                src="/images/trophy-stamp.webp"
                alt="Trophy Room"
                width={140}
                height={74}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </Link>


            {/* RIGHT: Navigation Links (2x2 Grid) */}
            <nav className="grid grid-cols-2 gap-3 relative z-20 mr-8 md:mr-12">
              {[
                { label: 'Home', href: '/' },
                { label: 'Squad', href: '/squad' },
                { label: 'Team', href: '/team' },
                { label: 'About', href: '/about' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn-comic-red px-6 py-1.5 text-xl text-center relative overflow-hidden group"
                >
                  <span className="relative z-10">{link.label}</span>
                  <div className="absolute inset-0 comic-halftone opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity mix-blend-multiply"></div>
                </Link>
              ))}
            </nav>

          </div>
        </div>

        {/* ======= ALTERNATING MOMENT/PLAYER GRID ======= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">

          {/* PANEL 1: Madrid 3-2 */}
          <ComicPanel href="/matches/4731604"
            className="md:col-span-2 min-h-[250px] md:min-h-[350px] bg-black"
            diagonal="diagonal-cut-bottom-right"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/madrid3-2.webp"
                alt="Madrid 3-2"
                fill
                sizes="(max-width: 768px) 95vw, 66vw"
                priority
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            {/* SFX: !GOL! */}
            <div className="absolute top-4 right-8 transform rotate-6 z-30">
              <span className="text-6xl md:text-8xl text-[#ffed02] text-stroke-comic tracking-wider" style={{ fontFamily: 'var(--font-bangers)' }}>¡GOL!</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#004d98] border-3 border-black p-3 shadow-[4px_4px_0_#000] z-20 max-w-fit transform -rotate-1">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>¡CAMPEONES!</h2>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/80 px-2 py-1 border border-white/50 z-20">
              <p className="text-xs text-white font-bold" style={{ fontFamily: 'var(--font-comic)' }}>Click for Match Details →</p>
            </div>
          </ComicPanel>

          {/* Panel 2 - SQUAD Link */}
          <ComicPanel href="/squad"
            className="min-h-[250px] md:min-h-[350px] bg-gradient-to-br from-[#a50044] to-[#8a003a] transform -rotate-1 hover:rotate-0"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 drop-shadow-md flex justify-center"><Shirt strokeWidth={1.5} size={96} className="text-white fill-white/20" /></div>
                <h2 className="text-4xl md:text-5xl font-black text-[#ffed02] uppercase leading-none mb-2 text-shadow-sm" style={{ fontFamily: 'var(--font-bangers)' }}>The Squad</h2>
                <p className="text-sm font-mono text-white/80 uppercase">Meet the Heroes →</p>
              </div>
            </div>
            <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none group-hover:opacity-20 transition-opacity"></div>
          </ComicPanel>

          {/* Panel 3 - Team Analysis Link */}
          <ComicPanel href="/team"
            className="min-h-[250px] md:min-h-[350px] bg-gradient-to-br from-[#ffed02] to-[#ffd500] transform rotate-1 hover:rotate-0"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 flex justify-center"><BarChart3 strokeWidth={2} size={96} className="text-[#004d98] fill-[#004d98]/10" /></div>
                <h2 className="text-4xl md:text-5xl font-black text-[#004d98] uppercase leading-none mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>Team Stats</h2>
                <p className="text-sm font-mono text-black/60 uppercase">Click to Analyze →</p>
              </div>
            </div>
            <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none group-hover:opacity-20 transition-opacity"></div>
          </ComicPanel>

          {/* PANEL 4: Pedri */}
          <ComicPanel href="/squad/pedri"
            className="min-h-[250px] md:min-h-[350px] bg-black"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/pedri.webp"
                alt="Pedri"
                fill
                sizes="(max-width: 768px) 95vw, 33vw"
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            <div className="absolute bottom-4 right-4 bg-[#a50044] border-3 border-black p-2 shadow-[4px_4px_0_#000] z-20 transform rotate-2">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>Pedri "Potter"</h2>
            </div>
          </ComicPanel>

          {/* PANEL 5: Bayern 4-1 */}
          <ComicPanel href="/matches/4621509"
            className="min-h-[250px] md:min-h-[350px] bg-black"
            diagonal="diagonal-cut-top-left"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/bayern4-1.webp"
                alt="Bayern 4-1"
                fill
                sizes="(max-width: 768px) 95vw, 33vw"
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            {/* SFX: BOOM! */}
            <div className="absolute bottom-16 right-4 transform -rotate-12 z-30 group-hover:scale-125 transition-transform">
              <span className="text-5xl md:text-7xl text-[#f8012d] text-stroke-comic" style={{ fontFamily: 'var(--font-bangers)' }}>BOOM!</span>
            </div>
            <div className="absolute top-4 left-4 bg-[#ffed02] border-3 border-black p-2 shadow-[4px_4px_0_#000] z-20 transform -rotate-2">
              <h2 className="text-xl md:text-2xl font-black text-[#004d98] uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>Triumph</h2>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/80 px-2 py-1 border border-white/50">
              <p className="text-xs text-white font-bold" style={{ fontFamily: 'var(--font-comic)' }}>Click for Match Details →</p>
            </div>
          </ComicPanel>

          {/* PANEL 6: Raphinha */}
          <ComicPanel href="/squad/raphinha"
            className="min-h-[250px] md:min-h-[350px] bg-black"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/raphinha.webp"
                alt="Raphinha"
                fill
                sizes="(max-width: 768px) 95vw, 33vw"
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            <div className="absolute bottom-4 left-4 bg-[#edbb00] border-3 border-black p-2 shadow-[4px_4px_0_#000] z-20 transform rotate-1">
              <h2 className="text-xl md:text-2xl font-black text-[#004d98] uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>¡MI CAPITAN!</h2>
            </div>
          </ComicPanel>

          {/* PANEL 7: Madrid 4-0 */}
          <ComicPanel href="/matches/4506859"
            className="min-h-[250px] md:min-h-[350px] bg-black"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/lewa.webp"
                alt="Madrid 4-0 Barcelona"
                fill
                sizes="(max-width: 768px) 95vw, 33vw"
                quality={60}
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            {/* SFX: CRACK! */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-12 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-5xl md:text-6xl text-white text-stroke-comic" style={{ fontFamily: 'var(--font-bangers)' }}>CRACK!</span>
            </div>
            <div className="absolute top-4 right-4 bg-[#a50044] border-3 border-black p-2 shadow-[4px_4px_0_#000] z-20 transform rotate-3">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>Aura.</h2>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/80 px-2 py-1 border border-white/50 transform -rotate-1">
              <p className="text-sm text-[#ffed02] font-bold" style={{ fontFamily: 'var(--font-comic)' }}>Click for Match Details →</p>
            </div>
          </ComicPanel>

          {/* PANEL 8: Lamine */}
          <ComicPanel href="/squad/lamine-yamal"
            className="min-h-[250px] md:min-h-[350px] md:row-span-2 bg-black"
            diagonal="diagonal-cut-bottom-left"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/lamineking.webp"
                alt="Lamine Yamal"
                fill
                sizes="(max-width: 768px) 95vw, 33vw"
                quality={60}
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            <div className="absolute bottom-6 left-6 bg-[#ffed02] border-3 border-black p-3 shadow-[6px_6px_0_#000] z-20 transform -rotate-2">
              <h2 className="text-3xl md:text-4xl font-black text-[#004d98] uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>King.</h2>
            </div>
          </ComicPanel>

          {/* PANEL 9: Madrid 4-3 */}
          <ComicPanel href="/matches/4507097"
            className="md:col-span-2 min-h-[250px] md:min-h-[350px] bg-black"
            diagonal="diagonal-cut-top-right"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/madrid4-3.webp"
                alt="Madrid 4-3"
                fill
                sizes="(max-width: 768px) 95vw, 66vw"
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            {/* SFX: SWOOSH! */}
            <div className="absolute top-8 left-4 transform -rotate-6 z-30">
              <span className="text-5xl text-white text-stroke-comic" style={{ fontFamily: 'var(--font-bangers)' }}>SWOOSH!</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#edbb00]/90 border-3 border-black p-4 shadow-[5px_5px_0_#000] z-20 transform rotate-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h2 className="text-3xl font-black text-[#004d98] uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>GLORY!</h2>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/80 px-2 py-1 border border-white/50 transform -rotate-2 z-20">
              <p className="text-xs text-white font-bold uppercase" style={{ fontFamily: 'var(--font-comic)' }}>Match Details →</p>
            </div>
          </ComicPanel>

          {/* PANEL 10: Juan */}
          <ComicPanel href="/squad/joan-garcia"
            className="min-h-[250px] md:min-h-[350px] bg-black"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/juan.webp"
                alt="Pau Cubarsí"
                fill
                sizes="(max-width: 768px) 95vw, 33vw"
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            <div className="absolute bottom-4 left-4 bg-[#a50044] border-3 border-black p-2 shadow-[4px_4px_0_#000] z-20 transform rotate-1">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>JUAN.</h2>
            </div>
          </ComicPanel>

          {/* PANEL 11: Benfica 5-4 */}
          <ComicPanel href="/matches/4621537"
            className="md:col-span-2 min-h-[250px] md:min-h-[350px] bg-black"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/benfica5-4.webp"
                alt="Benfica 5-4"
                fill
                sizes="(max-width: 768px) 95vw, 66vw"
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 comic-halftone opacity-10 mix-blend-multiply pointer-events-none"></div>
            </div>
            <div className="absolute top-6 right-6 bg-[#ffed02] border-3 border-black p-3 shadow-[6px_6px_0_#000] z-20 transform rotate-2 max-w-[200px] text-center">
              <h2 className="text-xl md:text-2xl font-black text-[#004d98] uppercase leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>Epic Comeback</h2>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/80 px-2 py-1 border border-white/50 z-20">
              <p className="text-xs text-white font-bold" style={{ fontFamily: 'var(--font-comic)' }}>Click for Match Details →</p>
            </div>
          </ComicPanel>

        </div>

        {/* ======= FOOTER PANEL ======= */}
        <Footer />

      </div>
    </main>
  );
}
