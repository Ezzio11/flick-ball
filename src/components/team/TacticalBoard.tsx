'use client';

import { useState } from 'react';
import { FormationStats } from '@/lib/teamStatistics';

interface TacticalBoardProps {
    formations: FormationStats[];
}

export default function TacticalBoard({ formations }: TacticalBoardProps) {
    // Default to first formation or fallback
    const [activeFormationIndex, setActiveFormationIndex] = useState(0);

    // Ensure we have at least one valid formation to show
    const safeFormations = formations.length > 0 ? formations : [{ formation: '4-3-3', winRate: 0, played: 0, avgGoals: 0, won: 0 }];
    const activeStats = safeFormations[activeFormationIndex];
    const activeFormation = activeStats.formation;

    // Hardcoded positions for 4-2-3-1 vs 4-3-3
    // Using % coordinates for responsiveness
    // Top is GK (0%) or Attack (100%)? usually Top-Down: GK at Top or Bottom?
    // Let's do Bottom-Up: GK at Bottom (10%), Attackers at Top (90%)

    const getPositions = (formation: string) => {
        if (formation.includes('4-2-3-1')) {
            return [
                { x: 50, y: 10, label: 'GK' },
                { x: 15, y: 25, label: 'LB' }, { x: 38, y: 25, label: 'CB' }, { x: 62, y: 25, label: 'CB' }, { x: 85, y: 25, label: 'RB' },
                { x: 35, y: 42, label: 'CDM' }, { x: 65, y: 42, label: 'CDM' },
                { x: 15, y: 65, label: 'LW' }, { x: 50, y: 60, label: 'CAM' }, { x: 85, y: 65, label: 'RW' },
                { x: 50, y: 82, label: 'ST' }
            ];
        }
        // Default 4-3-3
        return [
            { x: 50, y: 10, label: 'GK' },
            { x: 15, y: 25, label: 'LB' }, { x: 38, y: 25, label: 'CB' }, { x: 62, y: 25, label: 'CB' }, { x: 85, y: 25, label: 'RB' },
            { x: 50, y: 40, label: 'CDM' },
            { x: 30, y: 55, label: 'CM' }, { x: 70, y: 55, label: 'CM' },
            { x: 15, y: 75, label: 'LW' }, { x: 85, y: 75, label: 'RW' },
            { x: 50, y: 82, label: 'ST' }
        ];
    };

    const positions = getPositions(activeFormation);

    return (
        <div className="comic-panel lg:col-span-1 bg-[#1a1a1a] p-1 relative border-4 border-black overflow-hidden h-[450px]">
            <h3 className="absolute top-4 left-4 text-3xl font-black uppercase text-white/90 z-20 drop-shadow-md" style={{ fontFamily: 'var(--font-bangers)' }}>
                Master Plan
            </h3>

            {/* Formation Toggles */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
                {safeFormations.slice(0, 3).map((form, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveFormationIndex(idx)}
                        className={`
                            px-3 py-1 text-sm font-black border-2 border-black transform transition-all 
                            ${activeFormationIndex === idx
                                ? 'bg-[#EDBB00] text-black scale-110 rotate-2'
                                : 'bg-white text-gray-400 hover:bg-gray-100 rotate-0'}
                        `}
                    >
                        {form.formation}
                    </button>
                ))}
            </div>

            {/* The Pitch */}
            <div className="w-full h-full relative bg-[#2a6b2e]">
                {/* Grass Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-300 to-transparent"></div>
                <div className="absolute inset-0 bg-[url('/patterns/halftone.svg')] opacity-10 mix-blend-overlay"></div>

                {/* Pitch Lines */}
                <div className="absolute inset-4 border-4 border-white/40 rounded-sm"></div>
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-white/40 rounded-full"></div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 border-4 border-b-0 border-white/40"></div>

                {/* Players */}
                {positions.map((pos, i) => (
                    <div
                        key={i}
                        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-[#A50044] rounded-full border-2 border-white shadow-[2px_2px_0_rgba(0,0,0,0.5)] flex items-center justify-center group cursor-pointer transition-all duration-500 ease-out"
                        style={{ left: `${pos.x}%`, bottom: `${pos.y}%` }}
                    >
                        <span className="text-[10px] font-black text-white">{pos.label}</span>
                        {/* Pulse effect */}
                        <div className="absolute inset-0 rounded-full bg-[#EDBB00] opacity-0 group-hover:opacity-50 animate-ping"></div>
                    </div>
                ))}
            </div>

            {/* Comic Caption Box Stats */}
            <div className="absolute bottom-4 left-4 bg-[#fefeeb] border-2 border-black transform -rotate-1 shadow-[4px_4px_0_rgba(0,0,0,1)] p-2 z-20 max-w-[200px]">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#EDBB00] rounded-full border-2 border-black flex items-center justify-center z-30">
                    <span className="text-black font-black text-xs">!</span>
                </div>
                <div className="text-xs font-bold uppercase text-black leading-tight mb-1">Tactical Analysis:</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#004D98]" style={{ fontFamily: 'var(--font-bangers)' }}>{Math.round(activeStats.winRate)}%</span>
                    <span className="text-sm font-bold uppercase text-gray-800">Win Rate</span>
                </div>
                <div className="text-[10px] bg-black text-white inline-block px-1 mt-1 font-bold uppercase transform skew-x-12">
                    Played: {activeStats.played}
                </div>
            </div>
        </div>
    );
}
