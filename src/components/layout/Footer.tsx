import { format } from 'date-fns';
import Link from 'next/link';

export default function Footer() {
    return (
        <div className="bg-[#004d98] border-t-[6px] border-black p-4 md:p-6 relative">
            {/* Halftone Background */}
            <div className="absolute inset-0 comic-halftone opacity-10"></div>

            <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
                {/* Left - Branding */}
                <div className="text-center md:text-left">
                    <Link href="/" className="inline-block bg-[#ffed02] border-4 border-black px-3 py-2 mb-2 transform rotate-1 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-y-0.5 transition-all">
                        <span className="text-lg md:text-xl font-black text-[#004d98]" style={{ fontFamily: 'var(--font-bangers)' }}>FLICKBALL</span>
                    </Link>
                    <p className="text-xs md:text-sm opacity-90" style={{ fontFamily: 'var(--font-comic)' }}>Total football. Total domination.</p>
                </div>

                {/* Right - Credits */}
                <div className="text-center md:text-right text-xs md:text-sm space-y-1" style={{ fontFamily: 'var(--font-comic)' }}>
                    <div className="flex items-center gap-2 justify-center md:justify-end">
                        <span className="opacity-80">Designed by</span>{' '}
                        <a href="https://ezzio.me" target="_blank" rel="noopener noreferrer" className="font-bold text-[#ffed02] hover:text-white transition-colors underline">
                            Ezzio
                        </a>
                        <span className="text-white/30 mx-1">•</span>
                        <Link href="/about" className="font-bold text-[#ffed02] hover:text-white transition-colors underline">
                            About
                        </Link>
                        <span className="text-white/30 mx-1">•</span>
                        <Link href="/about-fbi" className="font-bold text-[#ffed02] hover:text-white transition-colors underline">
                            FBI
                        </Link>
                    </div>
                    <div>
                        <span className="opacity-80">Data sourced from</span>{' '}
                        <a href="https://www.fotmob.com" target="_blank" rel="noopener noreferrer" className="font-bold text-[#ffed02] hover:text-white transition-colors underline">
                            FotMob
                        </a>
                    </div>
                    <div className="text-xs opacity-70 pt-1">
                        © {format(new Date(), 'yyyy')} • Fan Project • Més que un club
                    </div>
                </div>
            </div>
        </div>
    );
}
