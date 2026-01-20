"use client";

import { Users } from 'lucide-react';

interface ComparisonButtonProps {
    currentPlayer: string;
    onCompare: () => void;
    variant?: 'icon' | 'full';
    className?: string;
}

export default function ComparisonButton({
    currentPlayer,
    onCompare,
    variant = 'full',
    className = ''
}: ComparisonButtonProps) {
    return (
        <button
            onClick={onCompare}
            className={`group flex items-center gap-2 px-4 py-2 
                       bg-yellow-400 hover:bg-yellow-300 
                       border-3 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000]
                       transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none
                       transition-all duration-150 ${className}`}
            title={`Compare ${currentPlayer} with another player`}
        >
            <Users className="w-5 h-5 text-black" strokeWidth={2.5} />
            {variant === 'full' && (
                <span className=" text-sm text-black uppercase tracking-wide" style={{fontFamily: "var(--font-bangers)"}}>
                    Compare
                </span>
            )}
        </button>
    );
}
