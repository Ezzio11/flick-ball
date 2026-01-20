"use client";

import { Search } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
    showSearch?: boolean;
}

export default function Navbar({ searchTerm = '', onSearchChange, showSearch = false }: NavbarProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <Link href="/squad" className="comic-button px-6 py-2 text-xl font-bold uppercase transform -skew-x-10 shadow-[6px_6px_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 active:bg-black active:text-white transition-all bg-white text-black border-3 border-black">
                ← Back to Squad
            </Link>

            {/* Search Bar */}
            {showSearch && onSearchChange && (
                <div className="relative w-full md:w-96 transform rotate-1">
                    <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1"></div>
                    <input
                        type="text"
                        placeholder="SEARCH PLAYER..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="relative w-full border-3 border-black p-3 text-xl text-black uppercase placeholder:text-gray-400 focus:outline-none focus:bg-yellow-50 pl-10"
                        style={{ fontFamily: 'var(--font-bangers)' }}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="w-6 h-6 text-black/50" />
                    </div>
                </div>
            )}
        </div>
    );
}
